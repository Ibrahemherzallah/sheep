
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import StockTable from '@/components/stock/StockTable';
import AddStockItemDialog from '@/components/stock/AddStockItemDialog';
import { StockCategory } from '@/types';

// Mock data for stock items
const sheepStockData: StockCategory[] = [
  {
    category: 'Medicine',
    items: [
      { id: 's1', itemType: 'medicine', itemId: 'm1', name: 'Penicillin', quantity: 20, unit: 'bottles', lastUpdated: new Date(), notes: 'For sheep only' },
      { id: 's2', itemType: 'medicine', itemId: 'm2', name: 'Ivermectin', quantity: 15, unit: 'bottles', lastUpdated: new Date() }
    ]
  },
  {
    category: 'Injections',
    items: [
      { id: 's3', itemType: 'injection', itemId: 'i1', name: 'Clostridial Vaccine', quantity: 30, unit: 'doses', lastUpdated: new Date() },
      { id: 's4', itemType: 'injection', itemId: 'i2', name: 'Foot Rot Vaccine', quantity: 25, unit: 'doses', lastUpdated: new Date() }
    ]
  },
  {
    category: 'Vitamins',
    items: [
      { id: 's5', itemType: 'vitamin', itemId: 'v1', name: 'Vitamin A', quantity: 10, unit: 'bottles', lastUpdated: new Date() },
      { id: 's6', itemType: 'vitamin', itemId: 'v2', name: 'Vitamin B Complex', quantity: 5, unit: 'bottles', lastUpdated: new Date() }
    ]
  },
  {
    category: 'Feed',
    items: [
      { id: 's7', itemType: 'feed', name: 'Sheep Feed', quantity: 500, unit: 'kg', lastUpdated: new Date() }
    ]
  },
  {
    category: 'Straw',
    items: [
      { id: 's8', itemType: 'straw', name: 'Bedding Straw', quantity: 200, unit: 'bales', lastUpdated: new Date() }
    ]
  }
];

const cycleStockData: StockCategory[] = [
  {
    category: 'Medicine',
    items: [
      { id: 'c1', itemType: 'medicine', itemId: 'm1', name: 'Penicillin', quantity: 10, unit: 'bottles', lastUpdated: new Date(), notes: 'For cycle #1' },
      { id: 'c2', itemType: 'medicine', itemId: 'm3', name: 'Tetracycline', quantity: 8, unit: 'bottles', lastUpdated: new Date() }
    ]
  },
  {
    category: 'Injections',
    items: [
      { id: 'c3', itemType: 'injection', itemId: 'i3', name: 'Q Fever Vaccine', quantity: 15, unit: 'doses', lastUpdated: new Date() }
    ]
  },
  {
    category: 'Vitamins',
    items: [
      { id: 'c4', itemType: 'vitamin', itemId: 'v3', name: 'Vitamin D', quantity: 5, unit: 'bottles', lastUpdated: new Date() }
    ]
  },
  {
    category: 'Feed',
    items: [
      { id: 'c5', itemType: 'feed', name: 'Cycle Feed', quantity: 300, unit: 'kg', lastUpdated: new Date() }
    ]
  },
  {
    category: 'Straw',
    items: [
      { id: 'c6', itemType: 'straw', name: 'Cycle Bedding Straw', quantity: 100, unit: 'bales', lastUpdated: new Date() }
    ]
  }
];

const StockManagement = () => {
  const [stockType, setStockType] = useState<'sheep' | 'cycle'>('sheep');
  const [stockData, setStockData] = useState({
    sheep: sheepStockData,
    cycle: cycleStockData
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddItem = (newItem: any) => {
    const category = stockData[stockType].find(
      cat => cat.category.toLowerCase() === newItem.itemType
    );
    
    if (category) {
      const updatedCategory = {
        ...category,
        items: [...category.items, { 
          id: `${stockType[0]}${Date.now()}`, 
          ...newItem,
          lastUpdated: new Date()
        }]
      };
      
      const updatedCategories = stockData[stockType].map(cat => 
        cat.category === category.category ? updatedCategory : cat
      );
      
      setStockData({
        ...stockData,
        [stockType]: updatedCategories
      });
    }
    
    setIsAddDialogOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Stock Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your sheep and cycle inventory
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          <span>Add Stock Item</span>
        </Button>
      </div>

      <Tabs defaultValue="sheep" className="mb-6" onValueChange={(value) => setStockType(value as 'sheep' | 'cycle')}>
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="sheep">Sheep Stock</TabsTrigger>
          <TabsTrigger value="cycle">Cycle Stock</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sheep">
          {stockData.sheep.map((category) => (
            <Card key={category.category} className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <StockTable items={category.items} />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="cycle">
          {stockData.cycle.map((category) => (
            <Card key={category.category} className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <StockTable items={category.items} />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <AddStockItemDialog 
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={handleAddItem}
        stockType={stockType}
      />
    </div>
  );
};

export default StockManagement;
