import {useEffect, useState} from "react";
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const milkFormSchema = z.object({
  productionLiters: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Production must be a positive number",
  }),
  soldLiters: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Sold liters must be a positive number",
  }),
  pricePerLiter: z.string().refine(val => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Price must be a positive number",
  }),
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Please enter a valid date",
  }),
});

type MilkFormValues = z.infer<typeof milkFormSchema>;


export default function Milk() {
  const [isLoading, setIsLoading] = useState(false);
  const [milkData, setMilkData] = useState([]);
  const [milkSummary, setMilkSummary] = useState([]);

  const token = localStorage.getItem("token");
  const form = useForm<MilkFormValues>({
    resolver: zodResolver(milkFormSchema),
    defaultValues: {
      productionLiters: "",
      soldLiters: "",
      pricePerLiter: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  async function onSubmit(data: MilkFormValues) {
    setIsLoading(true);
    try {
      const response = await fetch('https://thesheep.top/api/milk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          date: data.date,
          production: data.productionLiters,
          sold: data.soldLiters,
          price: data.pricePerLiter,
        }),
      });

      if (!response.ok) throw new Error('Failed to add milk record');

      const result = await response.json();
      console.log("Milk production added:", result);
      toast.success("تم إضافة تسجيل الحليب بنجاح");

      // Optional: reset form
      form.reset();
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الإضافة");
    } finally {
      setIsLoading(false);
    }
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // 1st day of current month
  const collectTotalProduction = milkData.reduce((accumulator,element) => {
    return accumulator + element?.production;
  }, 0);
  const collectTotalPrice = milkData.reduce((accumulator,element) => {
    return accumulator + element?.price * element?.sold;
  }, 0);
  const collectTotalSold = milkData.reduce((accumulator,element) => {
    return accumulator + element?.production;
  }, 0);
  const collectTotalPriceAvg = milkData.reduce((accumulator,element) => {
    return collectTotalPrice / milkData.length;
  }, 0);

  useEffect(() => {
    const fetchMilk = async () => {
      const res = await fetch('https://thesheep.top/api/milk');
      const data = await res.json();
      setMilkData(data);
    };
    const fetchMilkSummary = async () => {
      const res = await fetch("https://thesheep.top/api/milk/summary");
      const data = await res.json();
      setMilkSummary(data);
    };
    fetchMilkSummary();
    fetchMilk();
  }, []);

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3" >
        {/*<MilkIcon className="h-8 w-8" />*/}
        إنتاج الحليب والمبيعات
      </h1>
      
      <div className="grid gap-8 md:grid-cols-2 mt-10">
        <Card dir={'rtl'}>
          <CardHeader>
            <CardTitle>أضف تسجيل حليب جديد</CardTitle>
            <CardDescription>
              ادخل انتاج ومبيعات الحليب لليوم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="date" render={({ field }) => (
                    <FormItem>
                      <FormLabel>التاريخ</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="productionLiters" render={({ field }) => (
                    <FormItem>
                      <FormLabel>الإنتاج (باللتر)</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="soldLiters" render={({ field }) => (
                    <FormItem>
                      <FormLabel>المباع (باللتر)</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="pricePerLiter" render={({ field }) => (
                    <FormItem>
                      <FormLabel>سعر اللتر</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={
                  isLoading ||
                  !form.watch("date") ||
                  !form.watch("productionLiters") ||
                  !form.watch("soldLiters") ||
                  !form.watch("pricePerLiter")
                }>
                  {isLoading ? "جار الإضافة..." : "إضافة تسجيل"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card dir={'rtl'}>
          <CardHeader>
            <CardTitle>إحصائيات الحليب</CardTitle>
            <CardDescription>
              نظرة شاملة حول إنتاجك للحليب ومبيعاته
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">الإنتاج الإجمالي</div>
                <div className="text-2xl font-bold"><span className={'opacity-0'}>L</span> {collectTotalProduction} L</div>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">البيع الإجمالي</div>
                <div className="text-2xl font-bold"><span className={'opacity-0'}>L</span>{collectTotalSold} L</div>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">الإيرادات الإجمالية</div>
                <div className="text-2xl font-bold">₪{collectTotalPrice?.toFixed(2)}</div>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">معدل السعر</div>
                <div className="text-2xl font-bold">₪{collectTotalPriceAvg?.toFixed(2)}/L</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8" dir={'rtl'}>
        <CardHeader>
          <CardTitle>تسجيلات الحليب</CardTitle>
          <CardDescription>
            تاريخ انتاج الحليب والمبيعات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 text-right">الإيرادات</th>
                  <th className="py-3 px-2 text-right">الإنتاج (L)</th>
                  <th className="py-3 px-2 text-right">المباع (L)</th>
                  <th className="py-3 px-2 text-right">السعر/L</th>
                  <th className="py-3 px-2 text-right">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {milkData.map((record) => (
                  <tr key={record._id} className="border-b">
                    <td className="py-3 px-2">₪{(record?.price * record?.sold).toFixed(2)}</td>
                    <td className="py-3 px-2">{record?.production} L</td>
                    <td className="py-3 px-2">{record?.sold} L</td>
                    <td className="py-3 px-2">₪{record?.price.toFixed(2)}</td>
                    <td className="py-3 px-2">
                      {new Date(record?.date).toISOString().split('T')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-10" dir="rtl">
        <CardHeader>
          <CardTitle>ملخص سنوي وشهري لإنتاج الحليب</CardTitle>
          <CardDescription>عرض تفصيلي لإجمالي الإنتاج والمبيعات لكل شهر</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-right">السنة</th>
                <th className="py-2 px-4 text-right">الشهر</th>
                <th className="py-2 px-4 text-right">الإنتاج (L)</th>
                <th className="py-2 px-4 text-right">المباع (L)</th>
                <th className="py-2 px-4 text-right">الإيرادات (₪)</th>
              </tr>
              </thead>
              <tbody>
              {milkSummary.map(({ _id, totalProduction, totalSold, totalRevenue }) => (
                  <tr key={`${_id.year}-${_id.month}`} className="border-b">
                    <td className="py-2 px-4">{_id.year}</td>
                    <td className="py-2 px-4">{_id.month}</td>
                    <td className="py-2 px-4">{totalProduction.toFixed(2)}</td>
                    <td className="py-2 px-4">{totalSold.toFixed(2)}</td>
                    <td className="py-2 px-4">₪{totalRevenue.toFixed(2)}</td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
