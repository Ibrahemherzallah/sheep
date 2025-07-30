import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

interface YearlySummaryProps {
    type: 'sheep' | 'cycles';
}

interface YearData {
    year: number;
    expenses: number;
    sales: number;
}

export const YearlySummary: React.FC<YearlySummaryProps> = ({ type }) => {
    const [yearlySummary, setYearlySummary] = useState<Record<string, { expenses: number; sales: number }>>({});
    const [selectedYear, setSelectedYear] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('https://thesheep.top/api/summary/yearly-summary');
                const data = await res.json();

                setYearlySummary(data);

                const years = Object.keys(data);
                const latestYear = years[years.length - 1]; // Pick the latest year
                setSelectedYear(latestYear);
            } catch (err) {
                console.error('Error fetching summary data:', err);
            }
        };

        fetchData();
    }, [type]);

    const currentData = yearlySummary[selectedYear];
    const previousYear = (parseInt(selectedYear) - 1).toString();
    const previousData = yearlySummary[previousYear];
    console.log(":The current data is : ", currentData);
    if (!currentData) return null;

    const profit = currentData.sales - currentData.expenses;
    const profitMargin = ((profit / currentData.sales) * 100).toFixed(1);

    const years = Object.keys(yearlySummary).sort((a, b) => parseInt(b) - parseInt(a));

    let salesGrowth = 0;
    let expensesGrowth = 0;

    if (previousData) {
        salesGrowth = ((currentData.sales - previousData.sales) / previousData.sales) * 100;
        expensesGrowth = ((currentData.expenses - previousData.expenses) / previousData.expenses) * 100;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    التقرير السنوي - {type === 'sheep' ? 'أغنام' : 'الدورات'}
                </CardTitle>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-full">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {years.map((year) => (
                            <SelectItem key={year} value={year}>
                                {year}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    {/* Expenses */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingDown className="h-4 w-4 text-red-500" />
                            المنصرفات الكلية
                        </div>
                        <div className="text-2xl font-bold text-red-600">₪{currentData.expenses.toFixed(2)}</div>
                        {previousData && (
                            <div className={`text-xs ${expensesGrowth > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {expensesGrowth > 0 ? '+' : ''}
                                {expensesGrowth.toFixed(1)}% vs {previousYear}
                            </div>
                        )}
                    </div>

                    {/* Sales */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                             المبيعات الكلية
                        </div>
                        <div className="text-2xl font-bold text-green-600">₪{currentData.sales.toFixed(2)}</div>
                        {previousData && (
                            <div className={`text-xs ${salesGrowth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {salesGrowth > 0 ? '+' : ''}
                                {salesGrowth.toFixed(1)}% vs {previousYear}
                            </div>
                        )}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="flex items-center justify-between" dir="rtl">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">الربح الإجمالي</div>
                        <div className={`text-xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₪{Math.abs(profit).toFixed(2)} {profit < 0 ? 'خسارة' : 'ربح'}
                        </div>
                    </div>
                </div>

                <div className="text-xs text-muted-foreground" dir="rtl">
                    <p className="font-medium mb-1">الحسابات الرئيسية :</p>
                    <div className="grid grid-cols-2 gap-2">
                        <div>متوسط النفقات الشهرية: ₪{(currentData.expenses / 12).toFixed(2)}</div>
                        <div>متوسط المبيعات الشهرية: ₪{(currentData.sales / 12).toFixed(2)}</div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
