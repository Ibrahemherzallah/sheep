import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Button } from "@/components/ui/button"; // assuming you have a button component
import axios from 'axios';
import { toast } from "@/hooks/use-toast"; // make sure this is at the top

interface MonthlySummaryProps {
    type: 'sheep' | 'cycles';
}

interface SummaryData {
    [key: string]: {
        expenses: number;
        sales: number;
    };
}

export const MonthlySummary: React.FC<MonthlySummaryProps> = ({ type }) => {
    const [summaryData, setSummaryData] = useState<SummaryData>({});
    const [selectedMonth, setSelectedMonth] = useState('');

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await axios.get('https://thesheep.top/api/summary/monthly-summary');
                setSummaryData(res.data);

                const firstMonth = Object.keys(res.data)[0];
                if (firstMonth) setSelectedMonth(firstMonth);
            } catch (err) {
                console.error('Error fetching monthly summary', err);
            }
        };

        fetchSummary();
    }, []);

    if (!selectedMonth || !summaryData[selectedMonth]) return null;

    // const currentData = summaryData[selectedMonth];
    // const profit = currentData.sales - currentData.expenses;

    const currentData = summaryData[selectedMonth] || {
        expenses: 0,
        sales: 0,
        expenseDetails: [],
        salesDetails: [],
    }

    const profit = currentData.sales - currentData.expenses;


    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    التقرير الشهري - {type === 'sheep' ? 'أغنام' : 'الدورات'}
                </CardTitle>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="اختر الشهر" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.keys(summaryData)
                            .sort((a, b) => {
                                const [aYear, aMonth] = a.split('-').map(Number);
                                const [bYear, bMonth] = b.split('-').map(Number);
                                if (aYear !== bYear) return bYear - aYear;
                                return bMonth - aMonth;
                            })
                            .map((month) => (
                                <SelectItem key={month} value={month}>
                                    {month}
                                </SelectItem>
                            ))}
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            المنصرفات الكلية
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                            ₪{currentData.expenses.toFixed(2)}
                        </div>
                        <ul className="text-sm text-muted-foreground list-disc pr-4">
                            {currentData.expenseDetails.map((item: any, idx: number) => (
                                <li key={idx}>{item.name} - ₪{item.price}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            المبيعات الكلية
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                            ₪{currentData.sales.toFixed(2)}
                        </div>
                        <ul className="text-sm text-muted-foreground list-disc pr-4">
                            {currentData.salesDetails.map((item: any, idx: number) => (
                                <li key={idx}>{item.name} - ₪{item.price}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex items-center justify-between" dir="rtl">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4" />
                            الإجمالي
                        </div>
                        <div className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₪{Math.abs(profit).toFixed(2)} {profit < 0 ? 'خسارة' : 'ربح'}
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="destructive"
                            className="mt-5 w-full"
                            onClick={async () => {
                                if (!selectedMonth) return;

                                const [year, month] = selectedMonth.split('-');

                                const confirmed = window.confirm("هل أنت متأكد أنك تريد حذف هذا الشهر؟");
                                if (!confirmed) return;

                                try {
                                    const url = `https://thesheep.top/api/inventory/delete-month?month=${month}&year=${year}`;
                                    const res = await fetch(url, {
                                        method: 'DELETE',
                                    });

                                    if (!res.ok) {
                                        throw new Error(`HTTP error! Status: ${res.status}`);
                                    }

                                    toast({
                                        title: "تم الحذف",
                                        description: "تم حذف السجلات بنجاح لهذا الشهر.",
                                        // variant: "success", // or simply omit this if "success" is default
                                    });

                                    const newSummary = { ...summaryData };
                                    delete newSummary[selectedMonth];
                                    setSummaryData(newSummary);
                                    setSelectedMonth(Object.keys(newSummary)[0] || '');
                                } catch (error) {
                                    console.error('Error deleting records:', error);
                                    toast({
                                        title: "خطأ أثناء الحذف",
                                        description: "حدث خطأ أثناء محاولة حذف السجلات.",
                                        variant: "destructive",
                                    });
                                }
                            }}
                        >
                            حذف هذا الشهر
                        </Button>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};
