import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';
import {Dialog, DialogContent, DialogHeader, DialogTitle, Input} from "@/components/ui";

interface Expense {
    _id: string;
    type: string;         // renamed from `item`
    price: number;
    date?: Date | string;
    quantity: number;
    category?: string;
}

interface ExpensesListProps {
    expenses: Expense[];
    onDelete: (id: string) => void;
    onAdd: () => void; // handler to show add dialog
}

export const ExpensesList: React.FC<ExpensesListProps> = ({ expenses, onDelete, onAdd }) => {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.price, 0);
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [quantity, setQuantity] = React.useState<number>(0);
    const [price, setPrice] = React.useState<number>(0);
    const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

    const handleAdd = async () => {

        if (!price || !selectedItemId) return;
        try {
            const response = await fetch('https://thesheep.top/api/inventory/expense/add', {
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

            // Optional: parse response if needed
            // const data = await response.json();

        } catch (err) {
            console.error('Error adding sale:', err);
        }
        // onAdd({ quantity, price }); // Ensure itemId is handled in parent
        setOpenAddDialog(false);
        setQuantity(0);
        setPrice(0);
        setSelectedItemId(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Total:{' '}
                    <span className="text-lg font-semibold text-red-600">
                        ${totalExpenses.toFixed(2)}
                    </span>
                </p>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
                {expenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        لم يتم تسجيل أي نفقات حتى الآن
                    </p>
                ) : (
                    expenses.map((expense) => (
                        <Card key={expense._id} className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-sm">{expense.type || expense.item}</h4>
                                        <p className="text-xs text-muted-foreground font-light">
                                            الكمية: {expense.quantity}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(expense.date || expense?.updatedAt), 'MMM dd, yyyy')}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-red-600">
                                    ${expense.price.toFixed(2)}
                                  </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        onClick={() => {
                                            setSelectedItemId(expense._id);
                                            setOpenAddDialog(true)
                                        }}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

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
