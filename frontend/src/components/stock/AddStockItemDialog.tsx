import {useEffect, useState} from 'react';
import { useForm } from 'react-hook-form';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui';
import {TabsList} from "@/components/ui";
import * as React from "react";

interface StockItem {
    id: string;
    itemType: string;
    itemId?: string;
    name: string;
    quantity: number;
    unit: string;
    lastUpdated: Date;
    notes?: string;
}
interface StockCategory {
    category: string;
    items: StockItem[];
}
interface AddStockItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (values: any) => void;
  stockType: 'sheep' | 'cycle';
}
interface AddStockItemDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (values: any) => void;
    onAddQuantity: (values: any) => void;
    stockType: 'sheep' | 'cycle';
    sheepStockData: StockCategory[];
}

const AddStockItemDialog: React.FC<AddStockItemDialogProps> = ({open, onOpenChange, onAdd, onAddQuantity, stockType}) => {

    const form = useForm({
        defaultValues: {
            itemType: "",
            name: "",
            quantity: 0,
            unit: "",
            notes: "",
        },
    });
    const existingForm = useForm({
        defaultValues: {
            category: "",
            itemId: "",
            quantity: 0,
        },
    });

    const [activeTab, setActiveTab] = useState('new');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

console.log("stockType is :" , stockType )

    useEffect(() => {
        if (!selectedCategory) return;

        const fetchItems = async () => {
            try {
                const response = await fetch(`http://localhost:3030/api/stock/category/${selectedCategory}`);
                const data = await response.json();
                console.log("data is :" , data);
                const filteredData = data.filter(item => item.section === stockType)
                console.log("The filtered data is : ", filteredData)
                setSelectedItems(filteredData);
            } catch (err) {
                console.error("Error fetching stock items:", err);
            }
        };

        fetchItems();
    }, [selectedCategory]);



    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader style={{textAlign:'end'}}>
                    <DialogTitle>إضافة الى مخزون  {stockType === 'sheep' ? 'الأغنام' : 'الدورات'}</DialogTitle>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                    <TabsList className={'grid grid-cols-2'}>
                        <TabsTrigger value="new">إضافة عناصر جديدة</TabsTrigger>
                        <TabsTrigger value="existing">إضافة كميات</TabsTrigger>
                    </TabsList>

                    {/* Add New Item */}
                    <TabsContent value="new" dir={'rtl'}>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onAdd)} className="space-y-4 mt-4">
                                <FormField control={form.control} name="itemType" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>نوع المنتج</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} dir={'rtl'}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر نوع المنتج" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="Medicine">دواء</SelectItem>
                                                    <SelectItem value="Injection">طعم</SelectItem>
                                                    <SelectItem value="Vitamins">فيتامين</SelectItem>
                                                    <SelectItem value="Feed">علف</SelectItem>
                                                    <SelectItem value="Straw">قش</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>إسم المنتج</FormLabel>
                                            <FormControl>
                                                <Input placeholder="أدخل اسم المنتج" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField control={form.control} name="quantity" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الكمية</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="أدخل الكمية"
                                                    {...field}
                                                    onChange={e => field.onChange(e.target.valueAsNumber)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField control={form.control} name="unit" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الوحدة</FormLabel>
                                            <FormControl>
                                                <Input placeholder="مثل.. علبة,جرعة,كيلو" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField control={form.control} name="notes" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الملاحظات (إختياري)</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="ادخل أي ملاحظات إضافية" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <DialogFooter>
                                    <Button type="submit" disabled={
                                        !form.watch("name") ||
                                        !(form.watch("quantity") || form.watch("quantity") == 0) ||
                                        !form.watch("unit")
                                    }>إضافة العنصر</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    {/* Add Quantity to Existing */}
                    <TabsContent value="existing" dir={'rtl'}>
                        <Form {...existingForm}>
                            <form onSubmit={existingForm.handleSubmit(onAddQuantity)} className="space-y-4 mt-4">
                                <FormField control={existingForm.control} name="category" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>نوع المنتج</FormLabel>
                                        <Select
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                setSelectedCategory(value); // track selected category
                                            }}
                                            defaultValue={field.value}
                                            dir="rtl"
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="اختر نوع المنتج" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Medicine">دواء</SelectItem>
                                                <SelectItem value="Injection">طعم</SelectItem>
                                                <SelectItem value="Vitamins">فيتامين</SelectItem>
                                                <SelectItem value="Feed">علف</SelectItem>
                                                <SelectItem value="Straw">قش</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={existingForm.control} name="itemId" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>المنتج</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value} dir={'rtl'}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="اختر المنتج" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {selectedItems.map(item => (
                                                        <SelectItem key={item._id} value={item._id}>
                                                            {item.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                <FormField control={existingForm.control} name="quantity" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>الكمية</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    placeholder="أدخل الكمية"
                                                    {...field}
                                                    onChange={e => field.onChange(e.target.valueAsNumber)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>

                                <DialogFooter>
                                    <Button type="submit" disabled={
                                        !existingForm.watch('category') ||
                                        !existingForm.watch('itemId')||
                                        !existingForm.watch('quantity')
                                    }>إضافة الكمية</Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default AddStockItemDialog;
