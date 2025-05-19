
import { useState } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Milk as MilkIcon } from "lucide-react";
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

type MilkRecord = {
  id: string;
  date: string;
  productionLiters: number;
  soldLiters: number;
  pricePerLiter: number;
  revenue: number;
};

export default function Milk() {
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<MilkRecord[]>([
    {
      id: "1",
      date: "2025-05-10",
      productionLiters: 150,
      soldLiters: 140,
      pricePerLiter: 1.2,
      revenue: 168,
    },
    {
      id: "2",
      date: "2025-05-09",
      productionLiters: 165,
      soldLiters: 155,
      pricePerLiter: 1.2,
      revenue: 186,
    },
  ]);

  const form = useForm<MilkFormValues>({
    resolver: zodResolver(milkFormSchema),
    defaultValues: {
      productionLiters: "",
      soldLiters: "",
      pricePerLiter: "",
      date: new Date().toISOString().split('T')[0],
    },
  });

  function onSubmit(data: MilkFormValues) {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const newRecord: MilkRecord = {
        id: Date.now().toString(),
        date: data.date,
        productionLiters: Number(data.productionLiters),
        soldLiters: Number(data.soldLiters),
        pricePerLiter: Number(data.pricePerLiter),
        revenue: Number(data.soldLiters) * Number(data.pricePerLiter),
      };
      
      setRecords(prev => [newRecord, ...prev]);
      form.reset({
        productionLiters: "",
        soldLiters: "",
        pricePerLiter: "",
        date: new Date().toISOString().split('T')[0],
      });
      
      toast.success("Milk record added successfully!");
      setIsLoading(false);
    }, 1000);
  }

  const totalProduction = records.reduce((sum, record) => sum + record.productionLiters, 0);
  const totalSales = records.reduce((sum, record) => sum + record.soldLiters, 0);
  const totalRevenue = records.reduce((sum, record) => sum + record.revenue, 0);
  const averagePrice = records.reduce((sum, record) => sum + record.pricePerLiter, 0) / records.length;

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <MilkIcon className="h-8 w-8" />
        Milk Production & Sales
      </h1>
      
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Milk Record</CardTitle>
            <CardDescription>
              Enter today's milk production and sales data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="productionLiters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Production (Liters)</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="soldLiters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sold (Liters)</FormLabel>
                      <FormControl>
                        <Input placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="pricePerLiter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Liter</FormLabel>
                      <FormControl>
                        <Input placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Adding..." : "Add Record"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Milk Statistics</CardTitle>
            <CardDescription>
              Overview of your milk production and sales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Production</div>
                <div className="text-2xl font-bold">{totalProduction} L</div>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Sold</div>
                <div className="text-2xl font-bold">{totalSales} L</div>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
              </div>
              <div className="bg-secondary/30 p-4 rounded-lg">
                <div className="text-sm text-muted-foreground">Average Price</div>
                <div className="text-2xl font-bold">${averagePrice.toFixed(2)}/L</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Milk Records</CardTitle>
          <CardDescription>
            History of milk production and sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 text-left">Date</th>
                  <th className="py-3 px-2 text-left">Production (L)</th>
                  <th className="py-3 px-2 text-left">Sold (L)</th>
                  <th className="py-3 px-2 text-left">Price/L</th>
                  <th className="py-3 px-2 text-left">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="border-b">
                    <td className="py-3 px-2">{record.date}</td>
                    <td className="py-3 px-2">{record.productionLiters} L</td>
                    <td className="py-3 px-2">{record.soldLiters} L</td>
                    <td className="py-3 px-2">${record.pricePerLiter.toFixed(2)}</td>
                    <td className="py-3 px-2">${record.revenue.toFixed(2)}</td>
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
