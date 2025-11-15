import {useEffect, useState} from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BirthsOverview from '@/components/births/BirthsOverview';
import BirthsMonthlySummary from '@/components/births/BirthsMonthlySummary';
import BirthsYearlySummary from '@/components/births/BirthsYearlySummary';

export interface BirthRecord {
    id: string;
    date: Date;
    type: 'birth' | 'death';
    sheepId: string;
    sheepNumber: string;
    notes?: string;
}

const Births = () => {

    const [totalBirths, setTotalBirths] = useState(0);
    const [totalBirthMales, setTotalBirthMales] = useState(0);
    const [totalBirthFeMales, setTotalBirthFeMales] = useState(0);

    const [totalDeaths, setTotalDeaths] = useState(0);
    const [totalDeadMales, setTotalDeadMales] = useState(0);
    const [totalDeadFemales, setTotalDeadFemales] = useState(0);

    const [monthlySummary, setMonthlySummary] = useState([]);
    const [yearlySummary, setYearlySummary] = useState([]);
    const [trahSummary, setTrahSummary] = useState({});

    useEffect(() => {
        const fetchBirthsAndDeaths = async () => {
            try {
                // Fetch total born lambs
                const bornRes = await fetch("https://thesheep.top/api/pregnancies/total-born");
                const bornData = await bornRes.json();

                setTotalBirthMales(bornData.totalMaleLambs);
                setTotalBirthFeMales(bornData.totalFemaleLambs);
                setTotalBirths(bornData.totalMaleLambs + bornData.totalFemaleLambs);

                // Fetch total dead lambs
                const deadRes = await fetch("https://thesheep.top/api/pregnancies/total-dead");
                const deadData = await deadRes.json();

                setTotalDeadMales(deadData.totalDeadMale);
                setTotalDeadFemales(deadData.totalDeadFemale);
                setTotalDeaths(deadData.totalDeaths);

            } catch (error) {
                console.error("Error fetching births/deaths:", error);
            }
        };
        const fetchSummaries = async () => {
            try {
                const monthlyRes = await fetch("https://thesheep.top/api/pregnancies/summary/monthly");
                const monthlyData = await monthlyRes.json();
                setMonthlySummary(monthlyData);

                const yearlyRes = await fetch("https://thesheep.top/api/pregnancies/summary/yearly");
                const yearlyData = await yearlyRes.json();
                setYearlySummary(yearlyData);

            } catch (err) {
                console.error("Error fetching summaries:", err);
            }
        };
        const fetchTrahSummaries = async () => {
            try {
                const res = await fetch("https://thesheep.top/api/trah/totals");
                const data = await res.json();
                setTrahSummary(data);
            } catch (err) {
                console.error("Error fetching summaries:", err);
            }
        };
        fetchTrahSummaries()
        fetchSummaries();
        fetchBirthsAndDeaths();
    }, []);


    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">ولادات الخراف</h1>
                <p className="text-muted-foreground mt-1">
                    تتبع مواليد ووفيات الخراف من خلال ملخصات شهرية وسنوية
                </p>
            </div>

            <BirthsOverview totalBirths={totalBirths} trahSummary={trahSummary} totalDeaths={totalDeaths} totalBirthMales={totalBirthMales} totalBirthFeMales={totalBirthFeMales} totalDeathsFeMales={totalDeadFemales} totalDeadMales={totalDeadMales}/>

            <Card dir={'rtl'}>
                <CardHeader>
                    <CardTitle>ملخص السجلات</CardTitle>
                    <CardDescription>عرض المواليد والوفيات حسب الشهر أو السنة</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="monthly" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="monthly">شهري</TabsTrigger>
                            <TabsTrigger value="yearly">سنوي</TabsTrigger>
                        </TabsList>
                        <TabsContent value="monthly" className="space-y-4">
                            <BirthsMonthlySummary records={monthlySummary} />
                        </TabsContent>
                        <TabsContent value="yearly" className="space-y-4">
                            <BirthsYearlySummary records={yearlySummary} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default Births;