import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { addInventory } from '@/utils/api'; // adjust path as needed


interface Sale {
    id: string;
    item: string;
    price: number;
    date: Date;
    quantity: number;
    sheepId?: string;
    cycleId?: string;
}
interface AddSaleDialogProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'sheep' | 'cycles';
    onAdd: (sale: Omit<Sale, 'id'>) => void;
}

export const AddSaleDialog: React.FC<AddSaleDialogProps> = ({ isOpen, onClose, type, onAdd }) => {

    const [formData, setFormData] = useState({
        item: '',
        price: '',
        quantity: 0,
        date: new Date(),
        targetId: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const saleData = {
            item: formData.item,
            price: parseFloat(formData.price),
            quantity: formData.quantity,
            section: type === 'sheep' ? 'sheep' : 'cycle',
            result: 'income',
            date: formData.date,
        };

        try {
            await addInventory(saleData);
            onAdd({
                item: formData.item,
                price: saleData.price,
                date: formData.date,
                quantity: formData.quantity,
                ...(type === 'sheep' ? { sheepId: formData.targetId || 'general' } : { cycleId: formData.targetId || 'general' })
            });
            onClose();
            setFormData({ item: '', price: '', quantity: 0, date: new Date(), targetId: '' });
        } catch (error) {
            console.error(error);
            alert('فشل في الإضافة!');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle style={{textAlign:'right'}}>إضافة مبيعات جديدة</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2" dir={'rtl'}>
                            <Label htmlFor="price"> المبلغ (₪)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="space-y-2" dir={'rtl'}>
                            <Label htmlFor="item">إسم المنتج</Label>
                            <Input
                                id="item"
                                value={formData.item}
                                onChange={(e) => setFormData(prev => ({ ...prev, item: e.target.value }))}
                                placeholder="أدخل اسم المنتج"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2" dir={'rtl'}>
                        <Label htmlFor="quantity">الكمية</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                            }
                            placeholder="أدخل الكمية"
                            required
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            إلغاء
                        </Button>
                        <Button type="submit">إضافة</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};