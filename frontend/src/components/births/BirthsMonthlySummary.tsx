import { BirthRecord } from '@/pages/Births';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as React from "react";

interface BirthsMonthlySummaryProps {
    records: BirthRecord[];
}

interface MonthlyData {
    month: string;
    births: number;
    deaths: number;
    net: number;
}


const BirthsMonthlySummary = ({ records }: BirthsMonthlySummaryProps) => {
    // Group records by month
    const monthlyData: { [key: string]: MonthlyData } = {};
    const MONTHS_AR = [
        "يناير","فبراير","مارس","أبريل","مايو","يونيو",
        "يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"
    ];

    const sortedData = records.map(r => ({
        month: MONTHS_AR[r.month - 1],
        births: r.births,
        deaths: r.deaths,
        maleBorn: r.maleBorn,
        femaleBorn: r.femaleBorn,
        maleDied: r.maleDied,
        femaleDied: r.femaleDied,
        net: r.net
    }));

    if (sortedData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>الملخص الشهري</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">لا يوجد تسجيلات</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card dir={'rtl'}>
            <CardHeader>
                <CardTitle>الملخص الشهري</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">الشهر</TableHead>
                            <TableHead className="text-right">الولادات</TableHead>
                            <TableHead className="text-right">النفوق</TableHead>
                            <TableHead className="text-right">الصافي</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedData.map((data, index) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium">{data.month}</TableCell>
                                <TableCell className="text-right text-green-600">
                                    {data.births}
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {data.maleBorn} ذكر ,{data.femaleBorn} أنثى
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-red-600">
                                    {data.deaths}
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {data.maleDied} ذكر ,{data.femaleDied} أنثى
                                    </div>
                                </TableCell>
                                <TableCell className={`text-right font-semibold ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {data.net >= 0 ? '+' : ''}{data.net}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default BirthsMonthlySummary;