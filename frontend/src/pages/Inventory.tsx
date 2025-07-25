import React, {useEffect, useState} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { InventorySection } from '@/components/inventory/InventorySection';
import { MonthlySummary } from '@/components/inventory/MonthlySummary';
import { YearlySummary } from '@/components/inventory/YearlySummary';


interface Expense {
    id: string;
    item: string;
    price: number;
    date: Date;
    quantity: number;
    sheepId?: string;
    cycleId?: string;
}

interface Sale {
    id: string;
    item: string;
    price: number;
    date: Date;
    quantity: number;
    sheepId?: string;
    cycleId?: string;
}


const Inventory = () => {
    const [activeTab, setActiveTab] = useState('sheep');
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [sales, setSales] = useState<Sale[]>([]);
    const [inventory, setInventory] = useState([]); // inventory data from backend
    const [loading, setLoading] = useState(false);  // loading state
    const [error, setError] = useState<string | null>(null); // error handling


    const addExpense = (expenseData: Omit<Expense, 'id'>) => {
        const newExpense: Expense = {
            ...expenseData,
            id: Date.now().toString()
        };
        setExpenses(prev => [...prev, newExpense]);
    };

    const addSale = (saleData: Omit<Sale, 'id'>) => {
        const newSale: Sale = {
            ...saleData,
            id: Date.now().toString()
        };
        setSales(prev => [...prev, newSale]);
    };

    const deleteExpense = (id: string) => {
        setExpenses(prev => prev.filter(expense => expense.id !== id));
    };

    const deleteSale = (id: string) => {
        setSales(prev => prev.filter(sale => sale.id !== id));
    };

    useEffect(() => {
        const fetchInventory = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await fetch("http://localhost:3030/api/inventory");
                if (!response.ok) {
                    throw new Error("Failed to fetch inventory data");
                }
                const data = await response.json();
                const incomeItems = data.filter((item: any) => item.category === "income");
                const outcomeItems = data.filter((item: any) => item.category === "outcome");
                setSales(incomeItems); // Set filtered items to sales
                setExpenses(outcomeItems);
            } catch (err: any) {
                setError(err.message || "Something went wrong");
            } finally {
                setLoading(false);
            }
        };

        if (activeTab === "sheep") {
            fetchInventory();
        }
    }, [activeTab]);

    console.log("The sales is : ", sales)
    console.log("The expenses is : ", expenses)

    return (
        <>
            {loading && <p className="text-gray-500">Loading inventory...</p>}
            {error && <p className="text-red-600">Error: {error}</p>}
            {!loading && !error &&
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="m-2">
                        <h1 className="text-3xl font-bold">جرد المخزون</h1>
                        <p className="text-muted-foreground">تتبع النفقات والمبيعات للأغنام والدورات</p>
                    </div>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mx-3 space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="sheep">جرد الاغنام</TabsTrigger>
                        <TabsTrigger value="cycles">جرد الدورات</TabsTrigger>
                    </TabsList>

                    <TabsContent value="sheep" className="space-y-6">
                        <InventorySection
                            type="sheep"
                            expenses={expenses}
                            sales={sales}
                            onAddExpense={addExpense}
                            onAddSale={addSale}
                            onDeleteExpense={deleteExpense}
                            onDeleteSale={deleteSale}
                        />
                    </TabsContent>

                    <TabsContent value="cycles" className="space-y-6">
                        <InventorySection
                            type="cycles"
                            expenses={expenses}
                            sales={sales}
                            onAddExpense={addExpense}
                            onAddSale={addSale}
                            onDeleteExpense={deleteExpense}
                            onDeleteSale={deleteSale}
                        />
                    </TabsContent>
                </Tabs>

                <div className="grid gap-6 md:grid-cols-2">
                    <MonthlySummary type={activeTab as 'sheep' | 'cycles'} />
                    <YearlySummary type={activeTab as 'sheep' | 'cycles'} />
                </div>
            </div>
            }

        </>
    );
};

export default Inventory;