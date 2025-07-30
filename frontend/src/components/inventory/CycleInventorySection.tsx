import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { AddExpenseDialog } from './AddExpenseDialog';
import { AddSaleDialog } from './AddSaleDialog';
import { format } from 'date-fns';
import {Dialog, DialogContent, DialogHeader, DialogTitle, Input} from "@/components/ui";

interface Expense {
    id: string;
    item: string;
    price: number;
    date: Date;
    category: string;
    sheepId?: string;
    cycleId?: string;
}
interface Sale {
    id: string;
    item: string;
    price: number;
    date: Date;
    category: string;
    sheepId?: string;
    cycleId?: string;
}
interface Cycle {
    id: string;
    name: string;
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'completed';
}
interface CycleInventorySectionProps {
    expenses: Expense[];
    sales: Sale[];
    cycles: Cycle[];
    onAddExpense: (expense: Omit<Expense, 'id'>) => void;
    onAddSale: (sale: Omit<Sale, 'id'>) => void;
    onDeleteExpense: (id: string) => void;
    onDeleteSale: (id: string) => void;
}


export const CycleInventorySection: React.FC<CycleInventorySectionProps> = ({expenses, sales, cycles, onAddExpense, onAddSale, onDeleteExpense, onDeleteSale
}) => {
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddSale, setShowAddSale] = useState(false);
    const [selectedCycleId, setSelectedCycleId] = useState<string>('');
    const [selectedItemId, setSelectedItemId] = useState<string>('');
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [quantity, setQuantity] = React.useState<number>(0);
    const [price, setPrice] = React.useState<number>(0);
    const [itemType,setItemType] = useState('');

    const handleAdd = async () => {
        console.log("TEST quantity" , quantity);
        console.log("TEST price" , price);
        console.log("TEST selectedItemId" , selectedItemId);
        const endPoint = itemType === "expense" ? 'https://thesheep.top/api/inventory/sales-cycle/add' : 'https://thesheep.top/api/inventory/expense-cycle/add'
        if (!selectedItemId) return;
        try {
            const response = await fetch(endPoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    selectedItemId,
                    quantity,
                    price,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add sale');
            }


        } catch (err) {
            console.error('Error adding sale:', err);
        }
        setOpenAddDialog(false);
        setQuantity(0);
        setPrice(0);
        setSelectedItemId(null);
    };




    const toArabicNumbers = (str) =>
        str.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);

    console.log("The cycles is : ",cycles)
    const getCycleExpenses = (cycleId: string) =>
        expenses.filter(expense => expense.cycleId === cycleId);
    const getCycleSales = (cycleId: string) =>
        sales.filter(sale => sale.cycleId === cycleId);
    const getCycleTotals = (cycleId: string) => {
        const cycleExpenses = getCycleExpenses(cycleId);
        const cycleSales = getCycleSales(cycleId);
        const totalExpenses = cycleExpenses.reduce((sum, expense) => sum + expense.price, 0);
        const totalSales = cycleSales.reduce((sum, sale) => sum + sale.price, 0);
        const profit = totalSales - totalExpenses;

        return { totalExpenses, totalSales, profit };
    };

    const handleAddExpense = (cycleId: string) => {
        setSelectedCycleId(cycleId);
        setShowAddExpense(true);
    };

    const handleAddSale = (cycleId: string) => {
        setSelectedCycleId(cycleId);
        setShowAddSale(true);
    };

    const getTotalExpenses = (expenses) => {
        return expenses.reduce((total, item) => total + item.price, 0);
    };

    const getTotalSales = (sales) => {
        return sales.reduce((total, item) => total + item.price, 0);
    };

    return (
        <div className="space-y-6">
            {cycles?.map((cycle) => {
                console.log("the cycle is : ", cycle)
                // const { totalExpenses, totalSales, profit } = getCycleTotals(cycle?.cycle?._id);
                const totalExpenses = getTotalExpenses(cycle?.outcome);
                const totalSales = getTotalSales(cycle?.income);
                return (
                    <Card key={cycle?.cycle?._id} className="border-2">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-bold">الدورة رقم {cycle?.cycle?.number}</CardTitle>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>
                                                بدأت :
                                                    {
                                                        cycle?.cycle?.startDate
                                                          ? toArabicNumbers(format(new Date(cycle?.cycle?.startDate), 'yyyy/MM/dd'))
                                                          : '—'
                                                    }
                                            </span>
                                        </div>
                                        {cycle?.cycle?.endDate && (
                                            <div>
                                                انتهت :
                                                {
                                                    cycle?.cycle?.endDate
                                                        ? toArabicNumbers(format(new Date(cycle?.cycle?.endDate), 'yyyy/MM/dd'))
                                                        : '—'
                                                }
                                            </div>
                                        )}
                                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                                            cycle?.cycle?.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {cycle?.cycle?.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                                            <TrendingDown className="h-5 w-5 text-red-500" />
                                            المنصرفات
                                        </CardTitle>
                                        <Button onClick={() => handleAddExpense(cycle?.cycle?._id)} size="sm" variant="outline">
                                            <Plus className="h-4 w-4 mr-2" />
                                            إضافة منصرفات
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4">
                                            <p className="text-sm text-muted-foreground">
                                                Total: <span className="text-lg font-semibold text-red-600">${totalExpenses.toFixed(2)}</span>
                                            </p>
                                        </div>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {cycle?.outcome.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    لا يوجد تسجيلات منصرفات إلى الان
                                                </p>
                                            ) : (
                                                cycle?.outcome?.map((expense) => (
                                                    <Card key={expense?._id} className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-medium text-sm">{expense?.type}</h4>
                                                                    <p className="text-xs text-muted-foreground font-light">
                                                                        الكمية: {expense.quantity}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-red-600">
                                                                  ${expense?.price.toFixed(2)}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => {
                                                                        setSelectedItemId(expense._id);
                                                                        setItemType('sale')
                                                                        setOpenAddDialog(true)
                                                                    }}>
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                                            <TrendingUp className="h-5 w-5 text-red-500" />
                                            المدخلات
                                        </CardTitle>
                                        <Button onClick={() => handleAddSale(cycle?.cycle?._id)} size="sm" variant="outline">
                                            <Plus className="h-4 w-4 mr-2" />
                                            إضافة مدخلات
                                        </Button>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="mb-4">
                                            <p className="text-sm text-muted-foreground">
                                                Total: <span className="text-lg font-semibold text-red-600">${totalSales.toFixed(2)}</span>
                                            </p>
                                        </div>
                                        <div className="space-y-2 max-h-64 overflow-y-auto">
                                            {cycle?.income.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">
                                                    لا يوجد تسجيلات مدخلات إلى الان
                                                </p>
                                            ) : (
                                                cycle?.income?.map((sale) => (
                                                    <Card key={sale?._id} className="p-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h4 className="font-medium text-sm">{sale?.type}</h4>
                                                                    <p className="text-xs text-muted-foreground font-light">
                                                                        الكمية: {sale.quantity}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-semibold text-red-600">
                                                                  ${sale?.price.toFixed(2)}
                                                                </span>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-8 w-8 p-0"
                                                                    onClick={() => {
                                                                        setSelectedItemId(sale._id);
                                                                        setItemType('expense')
                                                                        setOpenAddDialog(true)
                                                                    }}>
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </Card>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            <AddExpenseDialog
                isOpen={showAddExpense}
                onClose={() => setShowAddExpense(false)}
                type="cycles"
                onAdd={null}
                cycle={selectedCycleId}
            />

            <AddSaleDialog
                isOpen={showAddSale}
                onClose={() => setShowAddSale(false)}
                type="cycles"
                onAdd={null}
                cycle={selectedCycleId}
            />



            <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle style={{textAlign:'right'}}>اضافة كميات</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Input
                            type="number"
                            placeholder="الكمية"
                            value={quantity || ''}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                        />
                        <Input
                            type="number"
                            placeholder="المبلغ"
                            value={price || ''}
                            onChange={(e) => setPrice(parseFloat(e.target.value))}
                        />
                        <Button onClick={handleAdd} className="w-full">
                            التأكيد
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>



        </div>
    );
};