import {useEffect, useState} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {Calendar, ArrowLeft, Ear, FileText, PlusCircle, BarChart3, ListPlus, Syringe, History, Users, Heart} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Table, TableHeader, TableBody, TableHead, TableRow, TableCell} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useForm } from 'react-hook-form';
import {toast} from "@/hooks/use-toast.ts";
import {Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Label, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui";
import {Combobox} from "@/components/ui/combobox.tsx";
import * as React from "react";
import { formatDate } from "../utils/dateUtils";


const cycleInjections = [
  { injectName: 'تسمم غذائي' , doseNum: 1, givenDate: new Date()},
  { injectName: 'تسمم غذائي' , doseNum: 1, givenDate: new Date()},
  { injectName: 'تسمم غذائي' , doseNum: 1, givenDate: new Date()},
  { injectName: 'تسمم غذائي' , doseNum: 1, givenDate: new Date()},
  { injectName: 'تسمم غذائي' , doseNum: 1, givenDate: new Date()},
]

// Mock sheep data

const vitamins = [
  {id: 1 ,name: 'vitamin B'},
  {id: 2 ,name: 'vitamin C'},
  {id: 3 ,name: 'vitamin D'},
  {id: 4 ,name: 'vitamin S'},
]


interface AddInject {
  injectId: string;   // selected injection from combobox
  dose: number;
  notes: string;
  date: string;
}
interface AddReport {
  startDate: string;
  endDate: string;
  feedAmount: number;
  priceOfFeed: number;
  milkAmount: number;
  priceOfMilk: number;
  strawAmount: number;
  priceOfStraw: number;
  vitaminAmounts: Record<string, number>;
  notes: string;
}
interface EndCycle {
  sellNumber: number;
  diedNumber: number;
  totalKilos: number;
  priceOfKilo: number;
  addToStock: number;
  endDate: string;
  notes: string;
}
export interface InjectionEntry {
  injection: string; // ObjectId as string
  hasRepetition: boolean;
  appliedDates: string[]; // ISO date strings
}
export interface Cycle {
  _id: string;
  name: string;
  number: number;
  startDate: string; // ISO string
  endDate?: string;
  expectedEndDate: string;
  numOfMale: number;
  numOfFemale: number;
  status: string;
  numOfSell?: number;
  totalKilos?: number;
  priceOfKilo?: number;
  numOfDied?: number;
  numOfStock?: number;
  reports: string[]; // ObjectId references
  notes?: string;
  injections: InjectionEntry[];
}



const CycleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [addInjectDialog,setAddInjectDialog] = useState(false);
  const [addReportDialog,setAddReportDialog] = useState(false);
  const [selectedVitamins, setSelectedVitamins] = useState<number[]>([]);
  const [useTodayDate, setUseTodayDate] = useState(true);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);
  const [deleteReportDialog,setDeleteReportDialog] = useState(false);
  const [endReportDialog,setEndReportDialog] = useState(false);
  const [cycleData, setCycleData] = useState<Cycle | null>(null);
  const [allVitamins, setAllVitamins] = useState<number[]>([]);
  const [allInjections,setAllInjections] = useState([]);
  const [selectedInjection, setSelectedInjection] = useState("");
  const [injectionTypes,setInjectionTypes] = useState([]);
  const [nextTask,setNextTask] = useState([]);
  const [allReports, setAllReports] = useState([]);
  const [loading,setLoading] = useState(true);
  const filteredVitamins = allVitamins?.filter(vitamin => vitamin.type === "Vitamins" && vitamin.section === "cycle")
  const token = localStorage.getItem("token");

  console.log("Tha filteredVitamins  is : " , filteredVitamins);

  const form = useForm<AddInject>({
    defaultValues: {
      injectId: '',
      dose: 1,
      notes: '',
      date: '',
    }
  });

  const reportForm = useForm<AddReport>({
    defaultValues : {
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      feedAmount: 0,
      priceOfFeed: 0,
      milkAmount: 0,
      priceOfMilk: 0,
      strawAmount: 0,
      priceOfStraw: 0,
      vitaminAmounts: {},
      notes: ''
    }
  })

  const endCycleForm = useForm<EndCycle>({
    defaultValues : {sellNumber: 0,diedNumber: 0,totalKilos: 0,priceOfKilo: 0,addToStock: 0,endDate: new Date().toISOString().split('T')[0],notes: ''}
  })


  const handleSubmitInject = async (data: AddInject) => {
    try {
      const payload = {
        cycleId: id,
        injectionTypeId: selectedInjection,
        numOfInject: data.dose || 1,
        injectDate: useTodayDate ? new Date().toISOString() : new Date(dueDate).toISOString(),
        notes: data.notes,
      };
      console.log("The payload us : ", payload);
      const response = await fetch('https://thesheep.top/api/cycle/cycle-injections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل في إضافة الحقنة');
      }

      toast({
        title: "الحقنة أضيفت",
        description: `تمت إضافة الحقنة وربطها بالدورة بنجاح`,
      });

      setAddInjectDialog(false);
      form.reset();
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message || "حدث خطأ أثناء الإرسال",
        variant: "destructive",
      });
    }
  };
  const handleSubmitReport = async (data: AddReport) => {

    try {
      const vitaminEntries =
          typeof data.vitaminAmounts === "object" && data.vitaminAmounts !== null
              ? Object.entries(data.vitaminAmounts)
              : [];

      // ✅ Only include vitamins that are actually selected
      const formattedVitamins = vitaminEntries
          .filter(([vitaminId]) => selectedVitamins.includes(vitaminId))
          .map(([vitamin, amount]) => ({
            vitamin,
            amount: Number(amount),
          }));


      const response = await fetch("https://thesheep.top/api/cycle/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          cycleId: id,
          startDate: data.startDate,
          endDate: data.endDate,
          numOfFeed: data.feedAmount,
          numOfMilk: data.milkAmount,
          strawAmount: data.strawAmount,
          priceOfFeed: data.priceOfFeed,
          priceOfMilk: data.priceOfMilk,
          priceOfStraw: data.priceOfStraw,
          vitamins: formattedVitamins,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "فشل في إرسال التقرير");
      }

      toast({ title: "تم الإضافة", description: "تمت إضافة التقرير بنجاح" });
      setAddReportDialog(false);
      reportForm.reset();
    } catch (error: any) {
      console.error("Failed to submit report:", error);
      toast({ title: "خطأ", description: error.message || "فشل في إرسال التقرير" });
    }
  };
  const handleSubmitEndCycle = async (data: EndCycle) => {
    // Use today's date or manually entered date
    const finalEndDate = useTodayDate
        ? new Date().toISOString().split("T")[0]
        : dueDate;

    // Construct request payload
    const payload = {
      cycleId: id, // Make sure this is available
      numOfSell: data.sellNumber,
      totalKilos: data.totalKilos,
      priceOfKilo: data.priceOfKilo,
      numOfDied: data.diedNumber,
      numOfStock: data.addToStock,
      endDate: finalEndDate,
    };

    try {
      const response = await fetch("https://thesheep.top/api/cycle/cycle-end", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "حدث شيء خاطئ");
      }

      toast({ description: `تم إنهاء الدورة بنجاح` });
      setEndReportDialog(false);
      endCycleForm.reset();
    } catch (err) {
      console.error(err);
      toast({ description: "حدث خطأ أثناء إنهاء الدورة", variant: "destructive" });
    }
  };
  const handleDeleteCycle = async () => {
    try {
      const response = await fetch(`https://thesheep.top/api/cycle/${id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'حدث شيء خاطئ');
      }

      toast({ description: '✅ تم حذف الدورة بنجاح' });
      setDeleteReportDialog(false);
      // Optional: refresh data or redirect user
    } catch (error) {
      console.error('Delete error:', error);
      toast({ description: '❌ فشل في حذف الدورة' });
    }
  };


  const handleVitaminSelection = (id: number, checked: boolean) => {
    setSelectedVitamins((prev) =>
        checked ? [...prev, id] : prev.filter((vid) => vid !== id)
    );
  };
  const watch = reportForm.watch();

// Basic checks
  const isFeedValid = !!watch.feedAmount && Number(watch.feedAmount) >= 0;
  // const isMilkValid = !!watch.milkAmount && Number(watch.milkAmount) > 0 || ;

// Check if every selected vitamin has a non-zero amount
  const areSelectedVitaminsValid = selectedVitamins.every((vitaminId) => {
    const amount = watch.vitaminAmounts?.[vitaminId];
    return amount !== undefined && Number(amount) > 0;
  });

// Final button state
  const isFormValid = isFeedValid && areSelectedVitaminsValid;


  const totalVitaminAmount = cycleData?.reports?.reduce((sum, report) => {
    return sum + report.vitamins.reduce((vitaminSum, v) => vitaminSum + (v.amount || 0), 0);
  }, 0);

  const vitaminTypesSet = new Set(
      cycleData?.reports?.flatMap(report => report.vitamins.map(v => v.vitamin))
  );

  const numberOfVitaminTypes = vitaminTypesSet.size;



  useEffect(() => {
    const fetchAllInitialData = async () => {
      try {
        const [
          cycleRes,
          vitaminsRes,
          injectionsRes,
          injectionTypesRes,
          nextTaskRes
        ] = await Promise.all([
          fetch(`https://thesheep.top/api/cycle/${id}`),
          fetch(`https://thesheep.top/api/stock`),
          fetch(`https://thesheep.top/api/stock/category/Injection`),
          fetch(`https://thesheep.top/api/sheep/${id}/injection-history`),
          fetch(`https://thesheep.top/api/tasks/next-injection-cycle/${id}`)
        ]);

        const cycleData = await cycleRes.json();
        const vitaminsData = await vitaminsRes.json();
        const injectionsData = await injectionsRes.json();
        const injectionTypesData = await injectionTypesRes.json();
        const nextTaskData = await nextTaskRes.json();

        // Filter injections to only include those with section: 'sheep'
        const sheepInjections = injectionsData.filter(inj => inj.section === 'sheep');

        setCycleData(cycleData);
        setAllVitamins(vitaminsData);
        setAllInjections(sheepInjections);
        setInjectionTypes(injectionTypesData.injectionTypes || []);
        setNextTask(nextTaskData);

      } catch (err) {
        console.error("Error loading initial data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllInitialData();
  }, []);
  useEffect(() => {
    if (activeTab === 'weekly') {
      const fetchReport = async () => {
        setLoading(true); // start loading before fetch
        try {
          const response = await fetch(`https://thesheep.top/api/cycle/reports/${id}`);
          const data = await response.json();
          setAllReports(data);
        } catch (error) {
          console.error('Failed to fetch reports:', error);
        } finally {
          setLoading(false); // stop loading when done
        }
      };

      fetchReport();
    }
  }, [activeTab, id]);
  const selectedInjectionObj = allInjections?.find(
      (inj) => inj._id === selectedInjection
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Button variant="ghost" className="mb-6 pl-0 flex items-center gap-2" onClick={() => navigate('/cycles')}>
        <ArrowLeft size={16} />
       الرجوع إلى الدورات
      </Button>
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{cycleData?.name}</h1>
            <Badge variant={cycleData?.status === 'active' ? 'default' : 'secondary'}>
              {cycleData?.status}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>بدأت : {formatDate(cycleData?.startDate)}</span>
            </div>
            {cycleData?.endDate && (
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>إنتهت : {formatDate(cycleData?.endDate)}</span>
              </div>
            )}
          </div>
        </div>
        {
          activeTab === 'overview' && (
                <div className="flex gap-3">
                  {cycleData?.status === 'نشطة' && (
                      <Button className="gap-2" onClick={()=> { setAddInjectDialog(true) } }>
                        <Syringe className="mr-1" size={16} />
                        <span>إضافة حقنة</span>
                      </Button>
                  )}
                </div>
            )
        }

      </div>
      <Tabs defaultValue="overview" className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="weekly">التقرير الأسبوعي</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" dir={'rtl'}>
          {loading ? (
              <div className="text-center py-10">جاري التحميل ...</div>
          ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>إستهلاك العلف الكلي</CardDescription>
                      <CardTitle className="text-2xl">
                        {cycleData?.reports?.reduce((sum, report) => sum + (report.numOfFeed || 0), 0)} kg
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>إستهلاك الحليب الكلي</CardDescription>
                      <CardTitle className="text-2xl">
                        {cycleData?.reports?.reduce((sum, report) => sum + (report.numOfMilk || 0), 0)} L
                      </CardTitle>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>عدد الأغنام الكلي</CardDescription>
                      <CardTitle className="text-2xl">{cycleData?.numOfFemale + cycleData?.numOfMale}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-1">
                        {cycleData?.numOfMale}ذكر ,   {cycleData?.numOfFemale} أنثى
                      </div>
                    </CardHeader>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>إستهلاك الفيتامينات الكلي</CardDescription>
                      <CardTitle> {totalVitaminAmount}</CardTitle>
                      <div className="text-xs text-muted-foreground mt-1">
                        {numberOfVitaminTypes}  أنواع مختلفة
                      </div>
                    </CardHeader>
                  </Card>
                </div>

                <div className={cycleData.status === 'نشطة' ? '' : 'flex justify-between' }>
                  <Card dir={'rtl'} style={{width : cycleData.status === 'نشطة' ? '' : '49%'}} >
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Heart size={18} />
                        <span>الطعومات</span>
                      </CardTitle>
                      <CardDescription style={{fontWeight:'bold'}}>سجل الطعومات الفائتة والقادمة لهذه النعجة</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {cycleData?.injectionCases?.length > 0 ? (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead style={{textAlign:"start"}}>اسم الطعم</TableHead>
                                <TableHead style={{textAlign:"start"}}>تاريخ الاعطاء</TableHead>
                                <TableHead style={{textAlign:"start"}}>الجرعة</TableHead>
                                <TableHead style={{textAlign:"start"}}>الملاحظات</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {injectionTypes.map((type) => {
                                // Find injection for this cycle with this type

                                const givenInjection = cycleData?.injectionCases
                                    ?.slice() // create a shallow copy to avoid mutating the original array
                                    .reverse()
                                    .find(
                                        inj => inj.injectionType?._id === type._id || inj.injectionType === type._id
                                    );

                                return (
                                    <TableRow key={type._id}>
                                      <TableCell>{type.name}</TableCell>
                                      <TableCell>
                                        {givenInjection?.injectDate
                                            ? formatDate(givenInjection.injectDate)
                                            : 'لم يتم إعطاؤه'}
                                      </TableCell>
                                      <TableCell>
                                        {givenInjection?.numOfInject === 1
                                            ? 'جرعة أولى'
                                            : givenInjection?.numOfInject === 2
                                                ? 'جرعة ثانية'
                                                : '—'}
                                      </TableCell>
                                      <TableCell>{givenInjection?.notes || '—'}</TableCell>
                                    </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                      ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <History className="mx-auto h-12 w-12 opacity-20 mb-2" />
                            <p>لا يوجد تسجيلات طبية ماحة لهذه النعجة</p>
                          </div>
                      )}
                    </CardContent>
                  </Card>
                  {
                    cycleData.status === 'نشطة' ? (
                            nextTask &&
                            <Card className="my-6">
                              <CardHeader className="pb-2" dir="rtl">
                                <CardTitle className="text-lg">الحقن القادمة</CardTitle>
                              </CardHeader>
                              <CardContent className="pt-4 space-y-4">
                                {Array.isArray(nextTask) && nextTask.length > 0 ? (
                                    nextTask.map((task) => (
                                        <div key={task._id} className="flex justify-between items-center" dir="rtl">
                                          <div>
                                            <p className="text-sm font-medium">{task.title}</p>
                                            <p className="text-muted-foreground">
                                              خلال {Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} يوم
                                            </p>
                                          </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center">لا توجد مهام قادمة</p>
                                )}
                              </CardContent>
                            </Card>              ):
                        <Card dir={'rtl'} style={{width : cycleData.status === 'نشطة' ? '' : '49%'}} >
                          <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                              <span>مخرجات الدورة </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            {
                              cycleInjections.length > 0 ? (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead style={{textAlign:"start"}}>مخرجات الدورة</TableHead>
                                        <TableHead style={{textAlign:"start"}}>العدد</TableHead>
                                        <TableHead style={{textAlign:"start"}}>عدد الكيلوات</TableHead>
                                        <TableHead style={{textAlign:"start"}}>سعر الكيلو</TableHead>
                                        <TableHead style={{textAlign:"start"}}>الإيرادات</TableHead>


                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      <TableRow>
                                        <TableCell>البيع</TableCell>
                                        <TableCell>{cycleData?.numOfSell}</TableCell>
                                        <TableCell>{cycleData?.totalKilos}</TableCell>
                                        <TableCell> {cycleData?.priceOfKilo} ₪</TableCell>
                                        <TableCell> { cycleData?.priceOfKilo * cycleData?.totalKilos } ₪</TableCell>
                                      </TableRow>

                                      <TableRow>
                                        <TableCell>النفوق</TableCell>
                                        <TableCell>{cycleData?.numOfDied}</TableCell>
                                      </TableRow>

                                      <TableRow>
                                        <TableCell>إضافة للمخزون</TableCell>
                                        <TableCell>{cycleData?.numOfStock}</TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                              ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    <History className="mx-auto h-12 w-12 opacity-20 mb-2" />
                                    <p>لا يوجد تسجيلات طبية ماحة لهذه النعجة</p>
                                  </div>
                              )}
                          </CardContent>
                        </Card>
                  }
                </div>
                <Card className="my-6">
                  <CardHeader>
                    <CardTitle>ملاحظات الدورة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{cycleData.notes || "لا يوجد ملاحظات على هذه الدورة."}</p>
                  </CardContent>
                </Card>


              </>
          )}
        </TabsContent>
        <TabsContent value="weekly">
          <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold opacity-0">التسجيلات الأسبوعية</h3>
              {cycleData?.status === 'نشطة' && (
                <Button className="gap-2" onClick={()=>{setAddReportDialog(true)}}>
                  <PlusCircle size={16} />
                  <span>إضافة تقرير</span>
                </Button>
              )}
            </div>
            {
              loading ? (
                <div className="text-center py-10">جاري التحميل ...</div>
            ) : (
                allReports.length > 0 ?
                  (
                      <>
                        {allReports.map((record) => (
                            <Card key={record.id} dir="rtl">
                              <CardHeader>
                                <div className="flex justify-between items-start">
                                  <div>
                                    <CardTitle className="text-lg">
                                      التقرير {formatDate(record.startDate)} - {formatDate(record.endDate)}
                                    </CardTitle>
                                    <CardDescription> التقرير رقم {record.order}</CardDescription>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">كمية العلف</p>
                                    <p className="font-medium">{record.numOfFeed} kg</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">كمية الحليب</p>
                                    <p className="font-medium">{record.numOfMilk} L</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">كمية القش</p>
                                    <p className="font-medium">{record.strawAmount} kg</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">الفيتامينات المعطاة</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {record.vitamins.map((vitamin) => (
                                          <Badge key={vitamin?.vitamin?._id} variant="secondary" className="text-xs">
                                            {vitamin?.vitamin?.name} - {vitamin?.amount}
                                          </Badge>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                {record.notes && (
                                    <div className="mt-4 pt-4 border-t">
                                      <p className="text-sm text-muted-foreground mb-1">الملاحظات</p>
                                      <p>{record.notes}</p>
                                    </div>
                                )}
                              </CardContent>
                            </Card>
                        ))}
                      </>
                  ) :
                  (
                      <Card dir="rtl" className="text-center py-10">
                        <CardHeader>
                          <CardTitle className="text-lg">لا يوجد تقارير لهذه الدورة</CardTitle>
                          <CardDescription className="text-muted-foreground mt-2">
                            لم يتم إضافة أي تقارير بعد. يرجى الرجوع لاحقًا أو إضافة تقرير جديد.
                          </CardDescription>
                        </CardHeader>
                      </Card>
                  )
            )}
          </div>
          {
            loading ? ''
              : <div className={'flex gap-2 mt-6'} dir={'rtl'}>
                <Button className="gap-2" onClick={()=>{setDeleteReportDialog(true)}}>
                  <span>حذف الدورة</span>
                </Button>
                  {
                    cycleData?.status === 'نشطة' && (
                          <Button className="gap-2" onClick={()=>{setEndReportDialog(true)}}>
                            <span>إنهاء الدورة</span>
                          </Button>
                      )
                  }

              </div>
          }

        </TabsContent>
      </Tabs>
      {/*   Add Inject Dialog   */}
      <Dialog open={addInjectDialog} onOpenChange={setAddInjectDialog}>
        <DialogContent className="sm:max-w-[600px]" >
          <DialogHeader style={{textAlign: "end"}}>
            <DialogTitle>إضافة طعم جديد</DialogTitle>
            <DialogDescription>
              أضف طعم جيديد للدورة
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitInject)} className="space-y-4" dir="rtl">
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {/* 🧪 Injection Type */}
                  <div className="space-y-1" style={{ width: '45%' }}>
                    <Label htmlFor="injection-type">نوع الطعم</Label>
                    <Combobox
                        value={selectedInjection}
                        onChange={setSelectedInjection}
                        options={allInjections.map((inj) => ({
                          label: inj.name,
                          value: inj._id,
                        }))}
                        placeholder="ابحث واختر نوع الطعم"
                        dir="rtl"
                    />
                  </div>

                  {/* 💉 Dose */}
                  <FormField control={form.control} name="dose" render={({ field }) => (
                      <FormItem style={{ width: '45%' }}>
                        <FormLabel>الجرعة</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )} />
                </div>

                {/* 📅 Date Selector */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                        id={`use-today-date`}
                        checked={useTodayDate}
                        onCheckedChange={() => setUseTodayDate(!useTodayDate)}
                    />
                    <Label htmlFor={`use-today-date`} className="flex-grow cursor-pointer">
                      &nbsp; إستخدام تاريخ اليوم
                    </Label>
                  </div>

                  {!useTodayDate && (
                      <div className="space-y-2">
                        <Label htmlFor="due-date">تاريخ التطعيم</Label>
                        <Input
                            id="due-date"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                      </div>
                  )}
                </div>

                {/* 📝 Notes */}
                <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>الملاحظات</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder=" أي ملاحظات إضافية ..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )} />
              </div>

              <DialogFooter>
                <Button
                    type="submit"
                    disabled={!selectedInjection || (!useTodayDate && !dueDate) || selectedInjectionObj.reputation === '6m' && !form.watch('dose') }
                >
                  إضافة الطعم
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAddInjectDialog(false);
                      form.reset();
                      setSelectedInjection('');
                      setDueDate('');
                      setUseTodayDate(true);
                    }}
                >
                  الغاء
                </Button>
              </DialogFooter>
            </form>
          </Form>        </DialogContent>
      </Dialog>
      {/*   Add Report Dialog   */}
      <Dialog open={addReportDialog} onOpenChange={setAddReportDialog}>
        <DialogContent className="sm:max-w-[600px]" >
          <DialogHeader style={{textAlign: "end"}}>
            <DialogTitle>إضافة تقرير جديد</DialogTitle>
            <DialogDescription>
              أضف تقرير جيديد للدورة
            </DialogDescription>
          </DialogHeader>

          <Form {...reportForm} >
            <form onSubmit={reportForm.handleSubmit(handleSubmitReport)} className="space-y-4"  dir={'rtl'}>
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">

                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <FormField control={reportForm.control} name="startDate" render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>تاريخ البداية</FormLabel>
                        <FormControl>
                          <Input type="date" placeholder={'الرجاء إدخال رقم الدورة الجديدة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                  <FormField control={reportForm.control} name="endDate"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>تاريخ النهاية</FormLabel>
                        <FormControl>
                          <Input type="date" placeholder={'الرجاء إدخال رقم الدورة الجديدة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                </div>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <FormField control={reportForm.control} name="feedAmount"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>كمية العلف</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال كمية العلف المستهلكة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                  <FormField control={reportForm.control} name="priceOfFeed"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>سعر العلف</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال كمية العلف المستهلكة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                </div>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <FormField control={reportForm.control} name="milkAmount"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>كمية الحليب</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال كمية الحليب المستهلكة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                  <FormField control={reportForm.control} name="priceOfMilk"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>سعر الحليب</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال كمية الحليب المستهلكة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                </div>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <FormField control={reportForm.control} name="strawAmount"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>كمية القش</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال كمية القش المستخدمة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                  <FormField control={reportForm.control} name="priceOfStraw"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>سعر القش</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال سعر القش'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                </div>

                {/* 🐑 Multi-selector */}
                <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Syringe size={16} />
                  حدد الفيتامينات المستخدمة
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-3 max-h-[500px] overflow-y-auto">
                  {filteredVitamins?.map((vitamin) => {
                    const isSelected = selectedVitamins.includes(vitamin._id);
                    return (
                        <div key={vitamin._id} className="flex items-start gap-2 w-full">
                          {/* Checkbox & Label */}
                          <div className="pt-1">
                            <Checkbox
                                id={`vitamin-${vitamin._id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                    handleVitaminSelection(vitamin._id, checked === true)
                                }
                            />
                          </div>

                          {/* Vitamin Info & Input */}
                          <div className="flex-1 space-y-1">
                            <label htmlFor={`vitamin-${vitamin?._id}`} className="text-sm font-medium leading-none cursor-pointer">
                              {vitamin?.name}
                            </label>
                            {isSelected && (
                                <div className="mt-1">
                                  <label className="text-xs text-muted-foreground">الكمية</label>
                                  <Input
                                      type="number"
                                      min="0"
                                      className="h-8 mt-1"
                                      {...reportForm.register(`vitaminAmounts.${vitamin._id}`, {
                                        valueAsNumber: true,
                                        min: 0,
                                      })}
                                  />
                                </div>
                            )}
                          </div>
                        </div>
                    );
                  })}

                  {vitamins.length === 0 && (
                      <p className="text-sm text-muted-foreground col-span-full">
                        لا توجد فيتامينات متاحة.
                      </p>
                  )}
                </div>

                <FormField control={reportForm.control} name="notes" render={({ field }) => (
                    <FormItem >
                      <FormLabel>الملاحظات</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder=" أي ملاحظات اضافية ..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
              </div>

              <DialogFooter>
                <Button type="submit">
                  إضافة التقرير
                </Button>

                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAddReportDialog(false);
                      setSelectedVitamins([]);
                      reportForm.reset();
                    }}
                >
                  الغاء
                </Button>

              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/*   Delete Report Dialog   */}
      <Dialog open={deleteReportDialog} onOpenChange={setDeleteReportDialog}>
        <DialogContent className="sm:max-w-[600px]" >
          <DialogHeader style={{textAlign: "end"}}>
            <DialogTitle>حذف الدورة</DialogTitle>
          </DialogHeader>

          <Form {...reportForm} >
            <form onSubmit={reportForm.handleSubmit(handleDeleteCycle)} className="space-y-4"  dir={'rtl'}>
              <p className="text-red-600 font-semibold pb-5 pt-3" dir={'rtl'}>هل أنت متأكد أنك تريد حذف هذه الدورة؟ هذا الإجراء لا يمكن التراجع عنه.</p>
              <DialogFooter>
                <Button type="submit">
                  حذف
                </Button>
                <Button type="button" variant="outline" onClick={()=>{setDeleteReportDialog(false)}}>
                  الغاء
                </Button>

              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/*   End Report Dialog   */}
      <Dialog open={endReportDialog} onOpenChange={setEndReportDialog}>
        <DialogContent className="sm:max-w-[600px]" >
          <DialogHeader style={{textAlign: "end"}}>
            <DialogTitle>إنهاء الدورة</DialogTitle>
          </DialogHeader>

          <Form {...endCycleForm} >
            <form onSubmit={endCycleForm.handleSubmit(handleSubmitEndCycle)} className="space-y-4"  dir={'rtl'}>
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">

                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <FormField control={endCycleForm.control} name="sellNumber"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>البيع</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'أدخل عدد الأغنام المباعة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                  <FormField control={endCycleForm.control} name="diedNumber"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>النفوق</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'أدخل عدد الأغنام النافقة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                </div>

                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <FormField control={endCycleForm.control} name="totalKilos"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>عدد الكيلو الكلي</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'أدخل وزن الأغنام المباعة من الدورة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                  <FormField control={endCycleForm.control} name="addToStock"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>إضافة الى المخزون</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'أدخل عدد الأغنام المضافة للمخزون'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                </div>


                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <FormField control={endCycleForm.control} name="priceOfKilo"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>سعر الكيلو</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'أدخل سعر الكيلو'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`use-today-date`}  checked={useTodayDate} onCheckedChange={(e) => setUseTodayDate(!useTodayDate)}/>
                      <Label htmlFor={`use-today-date`} className="flex-grow cursor-pointer">
                        &nbsp; إستخدام تاريخ اليوم
                      </Label>
                    </div>
                    {
                        !useTodayDate && (
                            <div className="space-y-2">
                              <Label htmlFor="due-date">تاريخ نهاية الدورة</Label>
                              <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}/>
                            </div>
                        )
                    }
                  </div>
                </div>

                <FormField control={endCycleForm.control} name="notes" render={({ field }) => (
                    <FormItem >
                      <FormLabel>الملاحظات</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder=" أي ملاحظات اضافية ..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
              </div>

              <DialogFooter>
                <Button type="submit"
                        disabled={
                            !endCycleForm.watch("sellNumber") ||
                            !endCycleForm.watch("diedNumber") ||
                            !endCycleForm.watch("totalKilos") ||
                            !endCycleForm.watch("addToStock") ||
                            !endCycleForm.watch("priceOfKilo")}>
                  إنهاء الدورة
                </Button>

                <Button type="button" variant="outline" onClick={() => {setEndReportDialog(false);reportForm.reset()}}>
                  الغاء
                </Button>

              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default CycleDetails;
