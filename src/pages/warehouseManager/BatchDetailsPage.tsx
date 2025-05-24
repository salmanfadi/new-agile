import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAuth } from '@/context/AuthContext';
import { useBatchStockIn, BatchType } from '@/hooks/useBatchStockIn'; 
import { BatchForm } from '@/components/warehouse/BatchForm';
import { useStockInData } from '@/hooks/useStockInData';
import { toast } from '@/hooks/use-toast';
import { BackButton } from '@/components/warehouse/BackButton';
import { StockInRequestDetails } from '@/components/warehouse/StockInRequestDetails';
import { BatchList } from '@/components/warehouse/BatchList';
import { BatchStockInLoading } from '@/components/warehouse/BatchStockInLoading';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { ProcessedBatch } from '@/types/batchStockIn';

interface BatchDetailsPageProps {
  adminMode?: boolean;
}

const BatchDetailsPage: React.FC<BatchDetailsPageProps> = ({ adminMode = false }) => {
  const { stockInId } = useParams<{ stockInId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stockInData, isLoadingStockIn } = useStockInData(stockInId);
  const queryClient = useQueryClient();

  const [source, setSource] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [remainingBoxes, setRemainingBoxes] = useState<number>(0);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  const [processedBatchId, setProcessedBatchId] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  
  // Log stockInData to debug
  useEffect(() => {
    console.log("StockInData loaded:", stockInData);
  }, [stockInData]);
  
  const handleGoBack = () => {
    if (adminMode) {
      navigate('/admin/stock-in');
    } else {
      navigate('/manager/stock-in');
    }
  };

  const {
    batches,
    addBatch,
    editBatch,
    deleteBatch,
    editingIndex,
    setEditingIndex,
    submitStockIn,
    isSubmitting,
    isProcessing,
    isSuccess,
    barcodeErrors,
    resetBatches
  } = useBatchStockIn(user?.id || '');

  // Subscribe to processed batches to get the batch ID when it's created
  useEffect(() => {
    if (isSubmitting || isProcessing) {
      const channel = supabase
        .channel('processed-batch-creation')
        .on('postgres_changes', 
          { event: 'INSERT', schema: 'public', table: 'processed_batches' },
          (payload) => {
            console.log('New processed batch created:', payload);
            if (payload.new && payload.new.stock_in_id === stockInId) {
              setProcessedBatchId(payload.new.id);
              console.log(`Setting processed batch ID: ${payload.new.id}`);
            }
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isSubmitting, isProcessing, stockInId]);

  // Navigate to batches overview page after successful submission
  useEffect(() => {
    if (isSuccess && !isProcessing && !isSubmitting && !isNavigating) {
      setIsNavigating(true);
      queryClient.invalidateQueries({ queryKey: ['inventory-data'] });
      queryClient.invalidateQueries({ queryKey: ['stock-in-requests'] });
      queryClient.invalidateQueries({ queryKey: ['processed-batches'] });
      queryClient.invalidateQueries({ queryKey: ['stock-in-batches', stockInId] });
      
      // Show success message
      if (barcodeErrors && barcodeErrors.length > 0) {
        toast({
          title: 'Batch Processed with Warnings',
          description: 'There were some issues with barcode processing. Please continue to the next step.',
          // Change 'warning' to 'default' with a customized description to indicate warning
          variant: 'default',
        });
      } else {
        toast({
          title: 'Batch Processed Successfully',
          description: 'All batches have been processed and ready for barcode assignment.',
          variant: 'default',
        });
      }
      
      // Wait a moment to show the success message before navigating
      setTimeout(() => {
        // Reset batches before navigating
        resetBatches();
        
        // Navigate to barcode assignment page instead of batch overview
        const path = barcodeErrors && barcodeErrors.length > 0
          ? `${adminMode ? '/admin' : '/manager'}/stock-in/${stockInId}/barcode-assignment`
          : `${adminMode ? '/admin' : '/manager'}/stock-in/batches/${stockInId}`;
        
        console.log(`Navigating to: ${path}`);
        navigate(path, { 
          state: { 
            fromBatchProcessing: true,
            batchId: processedBatchId,
            hasErrors: barcodeErrors && barcodeErrors.length > 0
          }
        });
      }, 500);
    }
  }, [isSuccess, isProcessing, isSubmitting, queryClient, navigate, adminMode, stockInId, processedBatchId, resetBatches, isNavigating, barcodeErrors]);

  // Populate form with stockInData when it's loaded and initialize remaining boxes
  useEffect(() => {
    if (stockInData) {
      console.log("Setting source and notes from stockInData", stockInData);
      setSource(stockInData.source || '');
      setNotes(stockInData.notes || '');
      
      // Initialize remaining boxes from stock in data with safety check
      const totalBoxes = stockInData.boxes || 0;
      const batchBoxesCount = batches.reduce((sum, batch) => sum + (batch?.boxes_count || 0), 0);
      setRemainingBoxes(totalBoxes - batchBoxesCount);
    }
  }, [stockInData, batches]);

  // Custom batch add function that validates against remaining boxes
  const handleAddBatch = (formData: any) => {
    // Prevent adding new batches when we're submitting
    if (isSubmitting || isProcessing || formSubmitted) {
      return;
    }

    // If editing, we need to account for the current batch's boxes
    const currentEditingBoxes = editingIndex !== null ? batches[editingIndex].boxes_count : 0;
    const effectiveNewBoxes = editingIndex !== null 
      ? formData.boxes_count - currentEditingBoxes 
      : formData.boxes_count;

    // Check if adding this batch would exceed the remaining boxes
    if (effectiveNewBoxes > remainingBoxes && editingIndex === null) {
      toast({
        title: 'Box count exceeds limit',
        description: `You can only add ${remainingBoxes} more boxes. Please adjust the quantity.`,
        variant: 'destructive'
      });
      return;
    }

    // Proceed with adding the batch
    addBatch(formData);
  };

  const handleBatchSubmission = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event propagation
    
    if (!user) return;
    if (batches.length === 0) {
      toast({
        title: 'No batches added',
        description: 'Please add at least one batch before submitting',
        variant: 'destructive'
      });
      return;
    }

    setFormSubmitted(true);

    // Fixed type handling for productId
    let productId: string;
    
    // First check if stockInData exists and has a product with an id
    if (stockInData?.product && 'id' in stockInData.product && stockInData.product.id) {
      productId = stockInData.product.id;
    } else if (batches.length > 0 && batches[0].product_id) {
      // Fallback to the first batch's product id
      productId = batches[0].product_id;
    } else {
      // Ultimate fallback (shouldn't happen due to the check above, but TypeScript needs this)
      console.error("No product ID found in either stockInData or batches");
      toast({
        title: 'Error',
        description: 'Could not determine product ID for batch submission',
        variant: 'destructive'
      });
      return;
    }
    
    console.log("Submitting with product ID:", productId);
    
    // Ensure each batch has the required properties
    const processedBatches = batches.map(batch => ({
      ...batch,
      quantity_per_box: batch.quantity_per_box || 1, // Default to 1 if not specified
      created_by: user.id // Ensure created_by is set
    }));
    
    submitStockIn({
      stockInId,
      productId,
      source,
      notes,
      submittedBy: user.id,
      batches: processedBatches
    });
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <BackButton 
          onClick={handleGoBack} 
          className="hover-lift" 
        />
      </div>
      
      <PageHeader 
        title="Process Stock In Request"
        description="Process the stock-in request with multiple batches"
      />
      
      {isLoadingStockIn ? (
        <BatchStockInLoading />
      ) : (
        <div className="space-y-6">
          <StockInRequestDetails
            stockInData={stockInData}
            source={source}
            setSource={setSource}
            notes={notes}
            setNotes={setNotes}
            remainingBoxes={remainingBoxes}
            isSubmitting={isSubmitting}
            isProcessing={isProcessing}
            stockInId={stockInId}
          />
          
          {(isSubmitting || isProcessing) && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertTitle className="flex items-center gap-2">
                <span className="inline-block h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                Processing batches...
              </AlertTitle>
              <AlertDescription>
                Please wait while we process your batches. This may take a moment.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              {remainingBoxes === 0 ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700 text-center">
                  All boxes for this stock-in request have been processed.
                </div>
              ) : (
                <BatchForm 
                  onAddBatch={handleAddBatch} 
                  isSubmitting={isSubmitting || isProcessing || formSubmitted}
                  editingBatch={editingIndex !== null ? batches[editingIndex] : undefined}
                  onCancel={editingIndex !== null ? () => setEditingIndex(null) : undefined}
                  maxBoxes={remainingBoxes + (editingIndex !== null ? batches[editingIndex].boxes_count : 0)}
                  stockInData={stockInData}
                />
              )}
            </div>
            
            <div className="space-y-4">
              <BatchList 
                batches={batches.map(batch => ({
                  ...batch,
                  quantity_per_box: batch.quantity_per_box || 1,
                  created_by: user?.id || '',
                  warehouse_id: batch.warehouse_id, 
                  location_id: batch.location_id
                }) as ProcessedBatch)}
                editBatch={editBatch}
                deleteBatch={deleteBatch}
                handleBatchSubmission={handleBatchSubmission}
                isSubmitting={isSubmitting}
                isProcessing={isProcessing}
                formSubmitted={formSubmitted}
                barcodeValidationErrors={barcodeErrors}
                remainingBoxes={remainingBoxes}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BatchDetailsPage;
