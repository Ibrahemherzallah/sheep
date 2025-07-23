import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { ExpensesList } from './ExpensesList';
import { SalesList } from './SalesList';
import { AddExpenseDialog } from './AddExpenseDialog';
import { AddSaleDialog } from './AddSaleDialog';

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

interface InventorySectionProps {
    type: 'sheep' | 'cycles';
    expenses: Expense[];
    sales: Sale[];
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    onAddSale: (sale: Omit<Sale, 'id'>) => void;
    onDeleteExpense: (id: string) => void;
    onDeleteSale: (id: string) => void;
}

export const InventorySection: React.FC<InventorySectionProps> = ({
    type,
    expenses,
    sales,
    onAddExpense,
    onAddSale,
    onDeleteExpense,
    onDeleteSale
}) => {
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddSale, setShowAddSale] = useState(false);

    const onDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذه العملية؟')) return;

        try {
            const response = await fetch(`http://localhost:3030/api/inventory/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('فشل في حذف العملية');
            }

            // Re-fetch data after deletion
            // fetchSales(); // or setState logic if you're updating locally
            // fetchInventory();
        } catch (err) {
            console.error('حدث خطأ أثناء الحذف:', err);
        }
    };



    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <TrendingDown className="h-5 w-5 text-red-500" />
                            المنصرفات
                        </CardTitle>
                        <Button
                            onClick={() => setShowAddExpense(true)}
                            size="sm"
                            variant="outline"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            إضافة منصرفات
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ExpensesList type={type} expenses={expenses} onDelete={onDelete} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            المبيعات
                        </CardTitle>
                        <Button
                            onClick={() => setShowAddSale(true)}
                            size="sm"
                            variant="outline"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            إضافة مبيعات
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <SalesList type={type} sales={sales} onDelete={onDelete}/>
                    </CardContent>
                </Card>
            </div>

            <AddExpenseDialog
                isOpen={showAddExpense}
                onClose={() => setShowAddExpense(false)}
                type={type}
                onAdd={onAddExpense}
            />

            <AddSaleDialog
                isOpen={showAddSale}
                onClose={() => setShowAddSale(false)}
                type={type}
                onAdd={onAddSale}
            />
        </div>
    );
};