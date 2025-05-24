import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

// Cache for generated barcodes in the current session
const generatedBarcodes = new Set<string>();

/**
 * Generates a unique barcode string for inventory items
 * 
 * @param prefix - Optional prefix to add to the barcode (default: 'INV')
 * @param productId - Optional product ID to include in the barcode
 * @param boxNumber - Optional box number to include in the barcode
 * @returns A unique barcode string
 */
export const generateBarcodeString = async (prefix: string = 'INV', productId?: string, boxNumber?: number): Promise<string> => {
  // Clean and normalize the prefix
  const cleanPrefix = (prefix || 'INV').substring(0, 3).toUpperCase();
  
  // Clean and normalize the product ID
  const productPrefix = productId ? 
    productId.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6) : 
    '';
  
  // Generate a timestamp component for uniqueness (base36 for shorter representation)
  const timestamp = Date.now().toString(36).toUpperCase();
  
  // Generate a random component
  const random = uuidv4().replace(/-/g, '').substring(0, 8);
  
  // Include box number if provided
  const boxSuffix = boxNumber ? `-${boxNumber.toString().padStart(3, '0')}` : '';
  
  // Construct the barcode with format PREFIX-PRODUCTID-TIMESTAMP-RANDOM
  return `${cleanPrefix}-${productPrefix}-${timestamp}-${random}${boxSuffix}`.toUpperCase();
};

/**
 * Generates a unique barcode and verifies it doesn't exist in the database
 * 
 * @param prefix - Optional prefix to add to the barcode (default: 'INV')
 * @param productId - Optional product ID to include in the barcode
 * @param boxNumber - Optional box number to include in the barcode
 * @returns A unique barcode string
 */
export const generateUniqueBarcode = async (
  prefix: string = 'INV',
  productId?: string,
  boxNumber?: number
): Promise<string> => {
  const MAX_ATTEMPTS = 5;
  let attempts = 0;
  
  while (attempts < MAX_ATTEMPTS) {
    try {
      // Generate a new barcode
      const barcode = await generateBarcodeString(prefix, productId, boxNumber);
      
      // Check if we've already generated this barcode in the current session
      if (generatedBarcodes.has(barcode)) {
        console.warn('Duplicate barcode generated in current session, retrying...');
        attempts++;
        // Add small delay before retrying
        await new Promise(resolve => setTimeout(resolve, 10));
        continue;
      }
      
      // Skip database check if we're in development mode without backend
      if (process.env.NODE_ENV === 'development' && !supabase) {
        generatedBarcodes.add(barcode);
        return barcode;
      }
      
      try {
        // Check stock_in_details table first
        const { count: detailsCount } = await supabase
          .from('stock_in_details')
          .select('barcode', { count: 'exact', head: true })
          .eq('barcode', barcode);
          
        if (detailsCount === 0) {
          // Also check inventory table
          const { count: inventoryCount } = await supabase
            .from('inventory')
            .select('barcode', { count: 'exact', head: true })
            .eq('barcode', barcode);
            
          if (inventoryCount === 0) {
            // Barcode is unique in both tables, add to cache and return
            generatedBarcodes.add(barcode);
            return barcode;
          }
        }
      } catch (dbError) {
        // If there's a database error, we'll still generate a unique barcode
        // Just log it but continue with the process
        console.warn('Database check failed:', dbError);
        // Use in-memory cache as fallback
        generatedBarcodes.add(barcode);
        return barcode;
      }
      
      attempts++;
      console.warn('Duplicate barcode found in database, retrying...');
      // Add small delay before retrying
      await new Promise(resolve => setTimeout(resolve, 50 * attempts));
    } catch (error) {
      console.error('Error generating unique barcode:', error);
      attempts++;
      // Add small delay before retrying
      await new Promise(resolve => setTimeout(resolve, 50 * attempts));
    }
  }
  
  // If we've exhausted all attempts, fall back to a UUID-based barcode
  // with timestamp to ensure uniqueness
  const fallbackBarcode = `${prefix}-${Date.now().toString(36)}-${uuidv4().replace(/-/g, '')}`.toUpperCase();
  generatedBarcodes.add(fallbackBarcode);
  return fallbackBarcode;
};

/**
 * Format a barcode for display - adds hyphens for readability if they don't exist
 * 
 * @param barcode - The barcode to format
 * @returns Formatted barcode string
 */
export const formatBarcodeForDisplay = (barcode: string): string => {
  if (!barcode) return '';
  
  // If the barcode already has hyphens, return as is
  if (barcode.includes('-')) {
    return barcode;
  }
  
  // Otherwise, add hyphens every 4 characters for readability
  return barcode.match(/.{1,4}/g)?.join('-') || barcode;
};