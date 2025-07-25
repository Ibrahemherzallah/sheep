import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Calendar, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Sale {
    id: string;
    item: string;
    price: number;
    date: Date;
    quantity: number;
    sheepId?: string;
    cycleId?: string;
}
interface SalesListProps {
    type: 'sheep' | 'cycles';
    sales: Sale[];
    onDelete: (id: string) => void;
    onAdd: (data: { quantity: number; price: number }) => void;
}

export const SalesList: React.FC<SalesListProps> = ({ type, sales, onDelete, onAdd }) => {
    const [openAddDialog, setOpenAddDialog] = React.useState(false);
    const [quantity, setQuantity] = React.useState<number>(0);
    const [price, setPrice] = React.useState<number>(0);
    const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);

    const totalSales = sales.reduce((sum, sale) => sum + sale.price, 0);

    const handleAdd = async () => {
        console.log("TEST quantity" , quantity);
        console.log("TEST price" , price);
        console.log("TEST selectedItemId" , selectedItemId);

        if (!quantity || !price || !selectedItemId) return;
        try {
            const response = await fetch('http://localhost:3030/api/inventory/sales/add', {
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

    console.log("sales is : " , sales)

    return (
        <div className="space-y-4">
            {/* Header with Total and Add Button */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                    Total:{' '}
                    <span className="text-lg font-semibold text-green-600">
                        ${totalSales.toFixed(2)}
                    </span>
                </p>
            </div>

            {/* Sales List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {sales.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        لم يتم تسجيل أي مبيعات حتى الآن
                    </p>
                ) : (
                    sales.map((sale) => (
                        <Card key={sale.id} className="p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-sm">{sale.type || sale.item}</h4>
                                        <p className="text-xs text-muted-foreground font-light">
                                            الكمية: {sale.quantity}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {format(new Date(sale.date || sale?.createdAt), 'MMM dd, yyyy')}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                <span className="font-semibold text-green-600">
                                    ${sale.price.toFixed(2)}
                                </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0"
                                        disabled={sale.type === "حليب" || sale.type === "بيع أغنام" }
                                        onClick={() => {
                                            setSelectedItemId(sale._id);
                                            setOpenAddDialog(true);
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

            {/* Add Sale Dialog */}
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
