import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Baby, Skull, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import * as React from "react";
import { useForm } from 'react-hook-form';

interface BirthsOverviewProps {
    totalBirths: number;
    totalDeaths: number;
    totalBirthMales: number;
    totalBirthFeMales: number;
    totalDeadMales: number;
    totalDeathsFeMales: number;
    trahSummary: object;
}

interface AddDeathsFormValues {
    males: number;
    females: number;
    notes?: string;
    date: string;
}

const BirthsOverview = ({
                            totalBirths,
                            totalDeaths,
                            totalDeadMales,
                            totalDeathsFeMales,
                            totalBirthMales,
                            totalBirthFeMales,
                            trahSummary
                        }: BirthsOverviewProps) => {

    const netChange = totalBirths - totalDeaths;
    const netChangeMales = totalBirthMales - totalDeadMales;
    const netChangeFeMales = totalBirthFeMales - totalDeathsFeMales;

    const [modalOpen, setModalOpen] = React.useState(false);

    const deathsForm = useForm<AddDeathsFormValues>({
        defaultValues: {
            males: 0,
            females: 0,
            notes: '',
            date: new Date().toISOString().split("T")[0] // default today
        }
    });

    const handleAddDeaths = async (values: AddDeathsFormValues) => {
        try {
            const response = await fetch("https://thesheep.top/api/died-labors/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    males: values.males,
                    females: values.females,
                    notes: values.notes,
                    date: values.date // <-- SEND DATE
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to add death record");
            }

            const data = await response.json();
            console.log("Death record added:", data);

            deathsForm.reset();
            setModalOpen(false);

        } catch (error) {
            console.error("Error adding death record:", error);
            alert("حدث خطأ أثناء إضافة النفوق");
        }
    };

    return (
        <div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card dir="rtl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">عدد الولادات الكلي</CardTitle>
                        <Baby className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{totalBirths}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {totalBirthMales} ذكر ,{totalBirthFeMales} أنثى
                        </div>
                    </CardContent>
                </Card>

                <Card dir="rtl" className="relative">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">عدد النفوق الكلي</CardTitle>
                        <Skull className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className={'flex justify-between'}>
                            <div>
                                <div className="text-2xl font-bold text-foreground">{totalDeaths}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {totalDeadMales} ذكر ,{totalDeathsFeMales} أنثى
                                </div>
                            </div>
                            <Button
                                onClick={() => setModalOpen(true)}
                                size="sm"
                                variant="outline"
                                className="flex items-center gap-2 mt-4 "
                            >
                                <Plus className="w-1 h-1" />
                            </Button>
                        </div>
                        {/* Button INSIDE the card now */}

                    </CardContent>
                </Card>

                <Card dir="rtl" className="relative">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">عدد الطراح الكلي</CardTitle>
                        <Skull className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>

                    <CardContent>
                        <div className={'flex justify-between'}>
                            <div>
                                <div className="text-2xl font-bold text-foreground">{trahSummary?.totalRecords}</div>
                                <div className="text-xs text-muted-foreground mt-1">
                                    {trahSummary?.totalMale} ذكر ,{trahSummary?.totalFemale} أنثى
                                </div>
                            </div>
                        </div>
                        {/* Button INSIDE the card now */}

                    </CardContent>
                </Card>

                <Card dir="rtl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
                        <CardTitle className="text-sm font-medium">العدد الصافي</CardTitle>
                        <div className={`h-4 w-4 rounded-full ${netChange >= 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">
                            {netChange >= 0 ? '+' : ''}{netChange}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                            {netChangeMales} ذكر ,{netChangeFeMales} أنثى
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Deaths Modal */}
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader style={{ textAlign: 'end' }}>
                        <DialogTitle>أضف معلومات النفوق</DialogTitle>
                    </DialogHeader>

                    <Form {...deathsForm}>
                        <form onSubmit={deathsForm.handleSubmit(handleAddDeaths)} className="space-y-4" dir="rtl">
                            <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
                                <div className="flex justify-between gap-2">
                                    <FormField control={deathsForm.control} name="males" render={({ field }) => (
                                        <FormItem style={{ width: '45%' }}>
                                            <FormLabel>عدد الذكور</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="أدخل عدد الذكور" min={0} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={deathsForm.control} name="females" render={({ field }) => (
                                        <FormItem style={{ width: '45%' }}>
                                            <FormLabel>عدد الإناث</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="أدخل عدد الإناث" min={0} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <FormField
                                    control={deathsForm.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>تاريخ النفوق</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={deathsForm.control} name="notes" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>ملاحظات</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="أي ملاحظات إضافية..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <DialogFooter>
                                <Button type="submit" disabled={!deathsForm.watch('males') || !deathsForm.watch('females')}>
                                    احفظ
                                </Button>
                                <Button type="button" variant="outline" onClick={() => { setModalOpen(false); deathsForm.reset(); }}>
                                    إلغاء
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BirthsOverview;
