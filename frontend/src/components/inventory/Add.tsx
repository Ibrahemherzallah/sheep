import React, {useEffect, useState} from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from "@/hooks/use-toast.ts";


export const RetroactiveModal = ({ isOpen, onClose }) => {
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [formData, setFormData] = useState({
        month: '',
        year: '',
        category: 'income', // or 'outcome'
        items: [] // Each item: { itemId, name, quantity, price }
    });


    const [formState, setFormState] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();

        const body = {
            month: formData.month,
            year: formData.year,
            resources: formState.items
                .filter(i => i.quantity > 0 || i.price > 0)
                .map(i => ({
                    itemId: i.itemId,
                    category: i.category,
                    price: i.price,
                    quantity: i.quantity
                }))
        };

        try {
            const res = await fetch('https://thesheep.top/api/inventory/finance/retroactive', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (res.ok) {
                toast({
                    title: 'نجاح',
                    description: 'تمت الإضافة بنجاح',
                    variant: 'success'
                });
                onClose();
            } else {
                toast({
                    title: 'خطأ',
                    description: data.message || 'فشل في الإضافة',
                    variant: 'destructive'
                });
            }
        } catch (err) {
            toast({
                title: 'خطأ في الخادم',
                description: 'حدث خطأ أثناء الاتصال بالخادم',
                variant: 'destructive'
            });
        }
    };
    useEffect(() => {
        if (isOpen) {
            fetchInventories();
        }
    }, [isOpen]);

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...formState.items];
        updatedItems[index][field] = field === 'quantity' ? parseInt(value) : parseFloat(value);
        setFormState(prev => ({
            ...prev,
            items: updatedItems
        }));
    };
    const fetchInventories = async () => {
        const res = await fetch('https://thesheep.top/api/inventory');
        const data = await res.json();
        setFormState(prev => ({
            ...prev,
            items: data.map(item => ({
                itemId: item._id,
                name: item.type,
                category: item.category,
                quantity: 0,
                price: 0
            }))
        }));
    };
    console.log("The form state is : " , formState)
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle style={{ textAlign: 'right' }}>إضافة بأثر رجعي</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2" dir="rtl">
                    {/* Month and Year Inputs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="month">الشهر</Label>
                            <Input
                                id="month"
                                type="number"
                                min="1"
                                max="12"
                                value={formData.month}
                                onChange={(e) => setFormData(prev => ({ ...prev, month: e.target.value }))}
                                placeholder="مثال: 7"
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="year">السنة</Label>
                            <Input
                                id="year"
                                type="number"
                                value={formData.year}
                                onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
                                placeholder="مثال: 2025"
                                required
                            />
                        </div>
                    </div>

                    {/* Inventory Items */}
                    <div className="space-y-4">
                        {formState?.items?.map((item, index) => (
                            <div key={item.itemId} className="border p-3 rounded-md shadow-sm">
                                <Label className="block mb-2">{item.name}</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    <Input
                                        type="number"
                                        placeholder="الكمية"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        min="0"
                                    />
                                    <Input
                                        type="number"
                                        placeholder="السعر"
                                        value={item.price}
                                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                        min="0"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <DialogFooter className="pt-4">
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
