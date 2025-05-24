import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer, Search } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useBatchItems, useProcessedBatchDetails } from '@/hooks/useProcessedBatches';
import BarcodePrinter from '@/components/barcode/BarcodePrinter';
import BarcodeInventoryTable from '@/components/barcode/BarcodeInventoryTable';
import { toast } from '@/hooks/use-toast';

const BarcodeInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { batchId } = useParams<{ batchId: string }>();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedBarcodes, setSelectedBarcodes] = useState<string[]>([]);
  const [showPrinter, setShowPrinter] = useState<boolean>(false);
  
  const { 
    data: batchDetails, 
    isLoading: isLoadingDetails 
  } = useProcessedBatchDetails(batchId || null);
  
  const { 
    data: batchItems, 
    isLoading: isLoadingItems 
  } = useBatchItems(batchId || null);

  // Reset selected barcodes when batch changes
  useEffect(() => {
    setSelectedBarcodes([]);
  }, [batchId]);

  const filteredBatchItems = batchItems?.filter(item => 
    item.barcode.includes(searchTerm) || 
    (item.color && item.color.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.size && item.size.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelectBarcode = (barcode: string) => {
    setSelectedBarcodes(prev => 
      prev.includes(barcode) 
        ? prev.filter(b => b !== barcode) 
        : [...prev, barcode]
    );
  };

  const handleSelectAll = () => {
    if (batchItems && batchItems.length > 0) {
      if (selectedBarcodes.length === batchItems.length) {
        setSelectedBarcodes([]);
      } else {
        setSelectedBarcodes(batchItems.map(item => item.barcode));
      }
    }
  };

  const handlePrintSelected = () => {
    if (selectedBarcodes.length === 0) {
      toast({
        title: "No barcodes selected",
        description: "Please select at least one barcode to print.",
        variant: "destructive"
      });
      return;
    }
    setShowPrinter(true);
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title={`Batch Barcodes: ${batchDetails?.product.name || 'Loading...'}`}
        description={`View and print barcodes for batch ${batchId?.slice(0, 8) || ''}`}
      />
      
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/manager/inventory/batches')}
          className="flex items-center gap-2 hover-lift"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Batches
        </Button>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search barcodes, colors, sizes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 min-w-[250px]"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrintSelected}
            disabled={selectedBarcodes.length === 0}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Print Selected ({selectedBarcodes.length})
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Batch Barcodes</CardTitle>
          <CardDescription>
            {isLoadingDetails ? 'Loading batch details...' : 
              `${batchDetails?.product.name || 'Unknown Product'} - ${batchItems?.length || 0} items`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingItems ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <BarcodeInventoryTable 
              batchItems={filteredBatchItems || []}
              selectedBarcodes={selectedBarcodes}
              onSelectBarcode={handleSelectBarcode}
            />
          )}
        </CardContent>
      </Card>
      
      {showPrinter && (
        <BarcodePrinter 
          barcodes={selectedBarcodes}
          open={showPrinter}
          onOpenChange={setShowPrinter}
          batchItems={batchItems || []}
        />
      )}
    </div>
  );
};

export default BarcodeInventoryPage;
