// @ts-nocheck
// Edge Function for processing stock-in requests
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@9.0.0';

// Add Deno types
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
};

// Enable debug logging in development
const DEBUG = true;

const logger = {
  log(...args: any[]) { console.log(...args); },
  error(...args: any[]) { console.error(...args); },
  debug(...args: any[]) { if (DEBUG) console.debug(...args); },
  warn(...args: any[]) { console.warn(...args); }
};

// Define CORS headers with explicit options for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400'
};

// Define types for the payload
interface BatchData {
  id?: string;
  warehouse_id: string;
  location_id: string;
  boxCount: number;
  quantityPerBox: number;
  color?: string;
  size?: string;
}

interface StockInProcessPayload {
  run_id: string;
  stock_in_id: string;
  user_id: string;
  product_id: string;
  batches: BatchData[];
}

// Check if a barcode already exists in the database
async function barcodeExists(supabase: any, barcode: string): Promise<boolean> {
  try {
    // Check inventory table
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('inventory')
      .select('id')
      .eq('barcode', barcode)
      .limit(1);
      
    if (inventoryError) {
      logger.error('Error checking inventory for barcode:', inventoryError);
      return false; // Assume it doesn't exist on error
    }
    
    if (inventoryItems && inventoryItems.length > 0) {
      return true;
    }
    
    // Also check stock_in_details table
    const { data: stockInDetails, error: stockInError } = await supabase
      .from('stock_in_details')
      .select('id')
      .eq('barcode', barcode)
      .limit(1);
      
    if (stockInError) {
      logger.error('Error checking stock_in_details for barcode:', stockInError);
      return false; // Assume it doesn't exist on error
    }
    
    return stockInDetails && stockInDetails.length > 0;
  } catch (error) {
    logger.error('Error in barcodeExists:', error);
    return false; // Assume it doesn't exist on error
  }
}

// Generate a unique batch barcode base
async function generateUniqueBatchBarcodeBase(supabase: any): Promise<string> {
  for (let i = 0; i < 5; i++) { // Try up to 5 times
    const uuid = uuidv4();
    
    // Check if any barcode with this base already exists in inventory
    const { data: inventoryData, error: invError } = await supabase
      .from('inventory')
      .select('id')
      .like('barcode', `${uuid}-%`)
      .limit(1);
      
    if (invError) {
      logger.error('Error checking batch barcode base in inventory:', invError);
      continue; // Try another UUID
    }
    
    // Also check stock_in_details table
    const { data: detailsData, error: detError } = await supabase
      .from('stock_in_details')
      .select('id')
      .like('barcode', `${uuid}-%`)
      .limit(1);
      
    if (detError) {
      logger.error('Error checking batch barcode base in stock_in_details:', detError);
      continue; // Try another UUID
    }
    
    // If barcode base doesn't exist in either table, it's unique
    if ((!inventoryData || inventoryData.length === 0) && 
        (!detailsData || detailsData.length === 0)) {
      logger.debug(`Generated unique batch barcode base: ${uuid}`);
      return uuid;
    }
    
    logger.debug(`Batch barcode base ${uuid} already exists, trying again`);
  }
  
  // If all attempts fail, use timestamp to ensure uniqueness
  const timestamp = Date.now();
  const fallbackBase = `${uuidv4()}-${timestamp}`;
  logger.debug(`Using fallback batch barcode base: ${fallbackBase}`);
  return fallbackBase;
}

// Generate a unique box barcode within a batch
async function generateUniqueBoxBarcode(supabase: any, batchBase: string, boxNumber: number): Promise<string> {
  const boxNumberStr = boxNumber.toString().padStart(3, '0');
  const barcode = `${batchBase}-${boxNumberStr}`;
  
  const exists = await barcodeExists(supabase, barcode);
  if (!exists) {
    return barcode;
  }
  
  // If it exists, add timestamp for uniqueness
  const timestamp = Date.now();
  const newBarcode = `${batchBase}-${timestamp}-${boxNumberStr}`;
  
  // Double check the new barcode
  const newExists = await barcodeExists(supabase, newBarcode);
  if (!newExists) {
    return newBarcode;
  }
  
  // Last resort, add random component
  return `${batchBase}-${timestamp}-${Math.random().toString(36).substring(2, 8)}-${boxNumberStr}`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }
  
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      // Create client with Auth context of the user that called the function
      { 
        global: { 
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the request payload
    const payload: StockInProcessPayload = await req.json();
    
    // Validate payload
    if (!payload.stock_in_id || !payload.user_id || !payload.product_id || !payload.batches || !Array.isArray(payload.batches)) {
      logger.error('Invalid payload:', payload);
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    logger.log(`Processing stock-in request ${payload.stock_in_id} for user ${payload.user_id}`);
    
    // Create a batch record to track all items processed in this run
    const batchId = uuidv4();
    
    const { data: newBatch, error: batchError } = await supabaseClient
      .from('processed_batches')
      .insert({
        id: batchId,
        batch_number: uuidv4(), // Generate a unique batch number
        stock_in_id: payload.stock_in_id,
        product_id: payload.product_id,
        processed_by: payload.user_id,
        processed_at: new Date().toISOString(),
        status: 'processing',
        quantity_processed: payload.batches.reduce((sum, batch) => sum + (batch.boxCount * batch.quantityPerBox), 0),
        total_boxes: payload.batches.reduce((count, batch) => count + batch.boxCount, 0),
        total_quantity: payload.batches.reduce((sum, batch) => sum + (batch.boxCount * batch.quantityPerBox), 0),
        warehouse_id: payload.batches[0]?.warehouse_id || null,
        location_id: payload.batches[0]?.location_id || null
      })
      .select()
      .single();
      
    if (batchError) {
      logger.error('Error creating processed batch:', batchError);
      throw batchError;
    }
    
    // Process batches
    const processedBatches: any[] = [];
    const batchIds = [batchId];
    
    for (const batch of payload.batches) {
      // Generate a unique barcode base for this batch
      const batchBarcodeBase = await generateUniqueBatchBarcodeBase(supabaseClient);
      logger.debug(`Using batch barcode base ${batchBarcodeBase} for batch`);
      
      const processedBoxes: any[] = [];
      
      // Process boxes sequentially to avoid race conditions
      for (let boxIndex = 0; boxIndex < batch.boxCount; boxIndex++) {
        const boxNumber = boxIndex + 1;
        const boxBarcode = await generateUniqueBoxBarcode(supabaseClient, batchBarcodeBase, boxNumber);
        
        try {
          logger.debug(`Processing box ${boxNumber} with barcode ${boxBarcode}`);
          
          // Create new inventory item
          const { data: newItem, error: createError } = await supabaseClient
            .from('inventory')
            .insert({
              barcode: boxBarcode,
              product_id: payload.product_id,
              warehouse_id: batch.warehouse_id,
              location_id: batch.location_id,
              quantity: batch.quantityPerBox,
              status: 'in_stock',
              batch_id: batchId.toString(),
              stock_in_id: payload.stock_in_id,
              last_updated_by: payload.user_id,
              color: batch.color || '',
              size: batch.size || ''
            })
            .select()
            .single();

          if (createError) {
            logger.error(`Error creating inventory item for box ${boxNumber}:`, createError);
            throw createError;
          }
          
          const inventoryId = newItem.id;

          // Create stock_in_detail record
          const { data: detail, error: detailError } = await supabaseClient
            .from('stock_in_details')
            .insert({
              stock_in_id: payload.stock_in_id,
              product_id: payload.product_id,
              barcode: boxBarcode,
              quantity: batch.quantityPerBox,
              status: 'completed', // Using valid enum value: pending, processing, completed, failed
              processed_at: new Date().toISOString(),
              batch_number: batchId, // Use batchId as batch_number
              color: batch.color || '',
              size: batch.size || '',
              warehouse_id: batch.warehouse_id,
              location_id: batch.location_id
            })
            .select()
            .single();

          if (detailError) {
            logger.error(`Error creating stock_in_detail for box ${boxNumber}:`, detailError);
            throw detailError;
          }
          
          // Add entry to batch_items
          const { error: batchItemError } = await supabaseClient
            .from('batch_items')
            .insert({
              batch_id: batchId,
              barcode: boxBarcode,
              quantity: batch.quantityPerBox,
              color: batch.color || '',
              size: batch.size || '',
              warehouse_id: batch.warehouse_id,
              location_id: batch.location_id,
              status: 'processed'
            });
            
          if (batchItemError) {
            logger.error(`Error creating batch item for box ${boxNumber}:`, batchItemError);
            throw batchItemError;
          }
          
          processedBoxes.push({
            barcode: boxBarcode,
            inventory_id: inventoryId,
            box_number: boxNumber
          });
          
          logger.debug(`Successfully processed box ${boxNumber} with barcode ${boxBarcode}`);
        } catch (error) {
          logger.error(`Error processing box ${boxNumber}:`, error);
          throw error;
        }
      }
      
      processedBatches.push({
        batch_barcode_base: batchBarcodeBase,
        boxes: processedBoxes
      });
    }
    
    // Update the processed batch status to completed
    const { error: updateError } = await supabaseClient
      .from('processed_batches')
      .update({ status: 'completed' })
      .eq('id', batchId);
      
    if (updateError) {
      logger.error('Error updating processed batch status:', updateError);
      throw updateError;
    }
    
    // Update the stock_in status to completed
    const { error: stockInUpdateError } = await supabaseClient
      .from('stock_in')
      .update({ status: 'completed' })
      .eq('id', payload.stock_in_id);
      
    if (stockInUpdateError) {
      logger.error('Error updating stock_in status:', stockInUpdateError);
      throw stockInUpdateError;
    }
    
    logger.log(`Successfully processed stock-in request ${payload.stock_in_id}`);
    
    // Return the processed batches
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Stock-in processed successfully',
        data: {
          batch_id: batchId,
          processed_batches: processedBatches
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    logger.error('Error processing stock-in:', error);
    
    let errorPayload: any = null;
    try {
      // Try to get the payload from the request, but don't throw if it fails
      errorPayload = await req.clone().json();
    } catch (e) {
      logger.error('Could not parse request payload for error handling:', e);
    }
    
    // Try to update the stock_in status to rejected if we have the stock_in_id
    if (errorPayload && errorPayload.stock_in_id) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
          { 
            global: { 
              headers: { Authorization: req.headers.get('Authorization')! },
            },
          }
        );
        
        await supabaseClient
          .from('stock_in')
          .update({ 
            status: 'rejected',
            rejection_reason: error instanceof Error ? error.message : 'Processing failed'
          })
          .eq('id', errorPayload.stock_in_id);
      } catch (updateError) {
        logger.error('Error updating stock_in status to rejected:', updateError);
      }
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: DEBUG ? (error instanceof Error ? error.stack : JSON.stringify(error)) : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      },
    );
  }
});
