import { BirthRecord } from '@/pages/Births';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import * as React from "react";

interface YearlyData {
    year: number;
    births: number;
    deaths: number;
    net: number;
}

interface BirthsYearlySummaryProps {
    records: YearlyData[]; // already aggregated yearly data
}

const BirthsYearlySummary = ({ records }: BirthsYearlySummaryProps) => {
    console.log("Yearly Summary Records:", records);

    // Sort newest year first
    const sortedData = [...records].sort((a, b) => b.year - a.year);

    if (sortedData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>الملخص السنوي</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        لا يوجد تسجيلات
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card dir="rtl">
            <CardHeader>
                <CardTitle>الملخص السنوي</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-right">السنة</TableHead>
                            <TableHead className="text-right">الولادات</TableHead>
                            <TableHead className="text-right">النفوق</TableHead>
                            <TableHead className="text-right">الطراح</TableHead>
                            <TableHead className="text-right">الصافي</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {sortedData.map((data) => (
                            <TableRow key={data.year}>
                                <TableCell className="font-medium">{data.year}</TableCell>
                                <TableCell className="text-right text-green-600">
                                    {data.maleBorn + data.femaleBorn}
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {data.maleBorn} ذكر ,{data.femaleBorn} أنثى
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-red-600">
                                    {Number(data.deaths)}
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {data.maleDied} ذكر ,{data.femaleDied} أنثى
                                    </div>
                                </TableCell>
                                <TableCell className="text-right text-red-600">
                                    {data.maleTrah + data.femaleTrah}
                                    <div className="text-xs text-muted-foreground mt-1">
                                        {data.maleTrah} ذكر ,{data.femaleTrah} أنثى
                                    </div>
                                </TableCell>
                                <TableCell
                                    className={`text-right font-semibold ${
                                        data.net >= 0 ? "text-green-600" : "text-red-600"
                                    }`}
                                >
                                    {data.net >= 0 ? "+" : ""}
                                    {Number(data.net)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default BirthsYearlySummary;
