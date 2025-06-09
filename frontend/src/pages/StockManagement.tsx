import {useEffect, useState} from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import StockTable from '@/components/stock/StockTable';
import AddStockItemDialog from '@/components/stock/AddStockItemDialog';
import { StockCategory } from '@/types';
import {toast} from "@/hooks/use-toast.ts";

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



const StockManagement = () => {

  const [allStockItems, setAllStockItems] = useState([]);
  const [stockType, setStockType] = useState<'sheep' | 'cycle'>('sheep');
  const cycleStockData = [
    {
      category: 'الأدوية',
      items: allStockItems.filter(item => item.type === 'Medicine' && item.section === stockType),
    },
    {
      category: 'الطعومات',
      items: allStockItems.filter(item => item.type === 'Injection' && item.section === stockType),
    },
    {
      category: 'الفيتامينات',
      items: allStockItems.filter(item => item.type === 'Vitamins' && item.section === stockType),
    },
    {
      category: 'العلف',
      items: allStockItems.filter(item => item.type === 'Feed' && item.section === stockType),
    },
    {
      category: 'القش',
      items: allStockItems.filter(item => item.type === 'Straw' && item.section === stockType),
    }
  ];

  const [stockData, setStockData] = useState({sheep: sheepStockData, cycle: cycleStockData});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleAddItem = async (newItem: any) => {
    try {
      const response = await fetch('http://localhost:3030/api/stock/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newItem.itemType,
          name: newItem.name,
          price: newItem.price || 0,
          reputation: newItem.reputation || '',
          quantity: newItem.quantity,
          section: stockType,
          unit: newItem.unit,
          notes: newItem.notes || "",
        }),
      });

      const result = await response.json(); // 👈 get the JSON response

      if (!response.ok) {
        throw new Error(result.error || 'فشل في إضافة العنصر إلى المخزون');
      }

      const createdItem = result;

      toast({
        title: "Success",
        description: "تمت إضافة العنصر بنجاح ✅",
      });

      const category = stockData[stockType].find(
          cat => cat.category.toLowerCase() === newItem.itemType
      );

      if (category) {
        const updatedCategory = {
          ...category,
          items: [...category.items, {
            id: `${stockType[0]}${Date.now()}`,
            ...createdItem,
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

    } catch (error: any) {
      console.error('Error adding item:', error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة العنصر ❌",
      });
    }
  };
  const handleAddQuantity = async (newItem: any) => {
    try {
      const response = await fetch('http://localhost:3030/api/stock/add-quantity', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: newItem.itemId,
          quantity: Number(newItem.quantity),
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في تحديث الكمية');
      }

      const updatedItem = await response.json();
      toast({
        title: "Success",
        description: "تمت إضافة الكمية بنجاح ✅",
      });

      // Optionally update frontend state or refresh stock data here
      console.log("Updated Item: ", updatedItem);
      setIsAddDialogOpen(false);

    } catch (err: any) {
      console.error('Error updating quantity:', err);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إضافة الكمية ❌",
      });
    }
  };
  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        const response = await fetch('http://localhost:3030/api/stock');
        const data = await response.json();
        setAllStockItems(data);
      } catch (error) {
        console.error('Failed to fetch stock items:', error);
      }
    };
    fetchStockItems();
  }, []);
  console.log("The cycleStockData : ",  cycleStockData);


  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة المخزون</h1>
          <p className="text-muted-foreground mt-1">
            إدارة مخزون الأغنام والدورة لديك
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus size={16} />
          <span>اضافة منتجات للمخزون</span>
        </Button>
      </div>

      <Tabs defaultValue="sheep" className="mb-6" onValueChange={(value) => setStockType(value as 'sheep' | 'cycle')}>

        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="sheep">مخزون الأغنام</TabsTrigger>
          <TabsTrigger value="cycle">مخزون الدورات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sheep">
          {cycleStockData.map((category) => (
            <Card key={category.category} className="mb-6" dir={'rtl'}>
              <CardHeader className="pb-3">
                <CardTitle>{category.category}</CardTitle>
              </CardHeader>
              <CardContent>
                <StockTable items={category.items} />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="cycle" dir={'rtl'}>
          {cycleStockData.map((category) => (
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
        onAddQuantity={handleAddQuantity}
      />
    </div>
  );
};

export default StockManagement;
