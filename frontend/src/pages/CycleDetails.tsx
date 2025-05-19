import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar,
  ArrowLeft,
  Ear,
  FileText,
  PlusCircle,
  BarChart3,
  ListPlus,
  Syringe,
  History,
  Users
} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Table, TableHeader, TableBody, TableHead, TableRow, TableCell} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Cycle, WeeklyCycleRecord, Sheep } from '@/types';
import { useForm } from 'react-hook-form';
import {toast} from "@/hooks/use-toast.ts";
import {Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Label, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui";

// Mock data for a specific cycle
const mockCycle: Cycle = {
  id: "c1",
  name: "دورة شتاء 2025",
  startDate: new Date(2025, 2, 15),
  endDate: undefined,
  sheepIds: ["s1", "s2", "s3", "s4", "s5"],
  initialMaleCount: 3,
  initialFemaleCount: 2,
  status: "active",
  notes: "تُركز هذه الدورة على برنامج تربية الحملان الربيعي. تتكون المجموعة من حملان صغيرة تُربى لإنتاج الحليب ولحوم الماشية. تُعدّ المراقبة الأسبوعية للأعلاف والحليب والعلاجات الطبية ضرورية لتحقيق نمو مثالي.",
};

const cycleInjections = [
  { injectName: 'تسمم غذائي' , doseNum: 1, givenDate: new Date()},
  { injectName: 'تسمم غذائي' , doseNum: 1, givenDate: new Date()},
  { injectName: 'تسمم غذائي' , doseNum: 1, givenDate: new Date()},
  { injectName: 'تسمم غذائي' , doseNum: 1, givenDate: new Date()},
  { injectName: 'تسمم غذائي' , doseNum: 1, givenDate: new Date()},
]

// Mock weekly records
const mockWeeklyRecords: WeeklyCycleRecord[] = [
  {
    id: "wr1",
    cycleId: "c1",
    weekStartDate: new Date(2025, 2, 15),
    feedQuantity: 45.5,
    milkQuantity: 32.8,
    vitaminsGiven: ["B12", "D3"],
    syringesGiven: 5,
    notes: "الأسبوع الأول جيد الأغنام تفاعلت مع النظام الجديد",
  },
  {
    id: "wr2",
    cycleId: "c1",
    weekStartDate: new Date(2025, 2, 22),
    feedQuantity: 48.2,
    milkQuantity: 36.7,
    vitaminsGiven: ["B12", "D3", "Iron"],
    syringesGiven: 0,
    notes: "Increased feed slightly, milk production improving",
  },
  {
    id: "wr3",
    cycleId: "c1",
    weekStartDate: new Date(2025, 3, 1),
    feedQuantity: 50.0,
    milkQuantity: 39.2,
    vitaminsGiven: ["B12", "D3"],
    syringesGiven: 2,
    notes: "Two sheep needed routine injections",
  },
];

// Mock sheep data
const mockSheep: Sheep[] = [
  {
    id: "s1",
    sheepNumber: "SH-2023-001",
    origin: "farm-produced",
    birthDate: new Date(2023, 5, 15),
    sex: "female",
    isPregnant: false,
    status: "healthy",
    createdAt: new Date(2023, 5, 15),
    updatedAt: new Date(2025, 2, 10),
  },
  {
    id: "s2",
    sheepNumber: "SH-2023-002",
    origin: "farm-produced",
    birthDate: new Date(2023, 5, 15),
    sex: "female",
    isPregnant: false,
    status: "healthy",
    createdAt: new Date(2023, 5, 15),
    updatedAt: new Date(2025, 2, 10),
  },
  {
    id: "s3",
    sheepNumber: "SH-2023-005",
    origin: "bought",
    birthDate: new Date(2023, 3, 10),
    sex: "male",
    isPregnant: false,
    status: "healthy",
    createdAt: new Date(2023, 6, 20),
    updatedAt: new Date(2025, 2, 10),
  },
  {
    id: "s4",
    sheepNumber: "SH-2023-008",
    origin: "bought",
    birthDate: new Date(2023, 3, 12),
    sex: "male",
    isPregnant: false,
    status: "healthy",
    createdAt: new Date(2023, 6, 20),
    updatedAt: new Date(2025, 2, 10),
  },
  {
    id: "s5",
    sheepNumber: "SH-2023-009",
    origin: "bought",
    birthDate: new Date(2023, 3, 12),
    sex: "male",
    isPregnant: false,
    status: "healthy",
    createdAt: new Date(2023, 6, 20),
    updatedAt: new Date(2025, 2, 10),
  },
];

const vitamins = [
  {id: 1 ,name: 'vitamin B'},
  {id: 2 ,name: 'vitamin C'},
  {id: 3 ,name: 'vitamin D'},
  {id: 4 ,name: 'vitamin S'},
]


interface AddInject {
  injectName: string;
  dose: number;
  notes: string;
}

interface AddReport {
  startDate: string;
  endDate: string;
  feedAmount: number;
  milkAmount: number;
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

interface FormValues {
  vitaminAmounts: {
    [vitaminId: number]: number;
  };
}

const CycleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [addInjectDialog,setAddInjectDialog] = useState(false);
  const [addReportDialog,setAddReportDialog] = useState(false);
  const [selectedVitamins, setSelectedVitamins] = useState<number[]>([]);
  const [useTodayDate, setUseTodayDate] = useState(true);
  const [dueDate, setDueDate] = useState("");
  const [deleteReportDialog,setDeleteReportDialog] = useState(false);
  const [endReportDialog,setEndReportDialog] = useState(false);


  // Format date to a readable string
  const formatDate = (date?: Date) => {
    if (!date) return 'Ongoing';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Format week date range
  const formatWeekRange = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const startFormatted = startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endFormatted = endDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  // Calculate statistics
  const totalFeed = mockWeeklyRecords.reduce((sum, record) => sum + record.feedQuantity, 0);
  const totalMilk = mockWeeklyRecords.reduce((sum, record) => sum + record.milkQuantity, 0);
  const totalSyringes = mockWeeklyRecords.reduce((sum, record) => sum + record.syringesGiven, 0);


  const form = useForm<AddInject>({
    defaultValues : {injectName: '',dose: 1  ,notes: ''}
  })

  const reportForm = useForm<AddReport>({
    defaultValues : {startDate: new Date().toISOString().split('T')[0],endDate: new Date().toISOString().split('T')[0],feedAmount: 0,milkAmount: 0,vitaminAmounts: {},notes: ''}
  })

  const endCycleForm = useForm<EndCycle>({
    defaultValues : {sellNumber: 0,diedNumber: 0,totalKilos: 0,priceOfKilo: 0,addToStock: 0,endDate: new Date().toISOString().split('T')[0],notes: ''}
  })


  const handleSubmitInject = (data: AddInject) => {
    toast({title: "الحقنة أضيفت", description: ` .تم إضافة الحقنة بنجاح`});
    setAddInjectDialog(false);
    form.reset();
  };

  const handleSubmitReport = (data: AddReport) => {
    toast({title: "التقرير أضيفت", description: ` .تم إضافة التقرير بنجاح`});
    setAddReportDialog(false);
    reportForm.reset();
  };

  const handleSubmitEndCycle = (data: EndCycle) => {
    toast({description: ` .تم إنهاء الدورة بنجاح`});
    setAddReportDialog(false);
    reportForm.reset();
  };


  const handleVitaminSelection = (id: number, checked: boolean) => {
    setSelectedVitamins((prev) =>
        checked ? [...prev, id] : prev.filter((vid) => vid !== id)
    );
  };

  // Count vitamins
  const vitaminCounts: Record<string, number> = mockWeeklyRecords.reduce((acc, record) => {
    record.vitaminsGiven.forEach(vitamin => {
      acc[vitamin] = (acc[vitamin] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Button variant="ghost" className="mb-6 pl-0 flex items-center gap-2" onClick={() => navigate('/cycles')}>
        <ArrowLeft size={16} />
       الرجوع إلى الدورات
      </Button>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{mockCycle.name}</h1>
            <Badge variant={mockCycle.status === 'active' ? 'default' : 'secondary'}>
              {mockCycle.status === 'active' ? 'Active' : 'Completed'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Started: {formatDate(mockCycle.startDate)}</span>
            </div>
            {mockCycle.endDate && (
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Ended: {formatDate(mockCycle.endDate)}</span>
              </div>
            )}
          </div>
        </div>
        {
          activeTab === 'overview' && (
                <div className="flex gap-3">
                  {mockCycle.status === 'active' && (
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>إستهلاك العلف الكلي</CardDescription>
                <CardTitle className="text-2xl"><span style={{opacity:0}}>kg</span> {totalFeed.toFixed(1)} kg</CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>إستهلاك الحليب الكلي</CardDescription>
                <CardTitle className="text-2xl"> <span style={{opacity:0}}>kg</span> {totalMilk.toFixed(1)} L</CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>عدد الأغنام الكلي</CardDescription>
                <CardTitle className="text-2xl">{mockCycle.initialMaleCount + mockCycle.initialFemaleCount}</CardTitle>
                <div className="text-xs text-muted-foreground mt-1">
                  {mockCycle.initialMaleCount} male, {mockCycle.initialFemaleCount} female
                </div>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>إستهلاك الفيتامينات الكلي</CardDescription>
                <CardTitle className="text-2xl">{totalSyringes}</CardTitle>
              </CardHeader>
            </Card>
          </div>


        <div className={'flex gap-6'}>
          <Card dir={'rtl'} style={{width:'50%'}}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span>تاريخ الطعومات</span>
              </CardTitle>
              <CardDescription style={{fontWeight:'bold'}}>سجل الطعومات الكامل للطعومات التي تم اعطاؤها</CardDescription>
            </CardHeader>
            <CardContent>
              {cycleInjections.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead style={{textAlign:"start"}}>اسم الطعم</TableHead>
                        <TableHead style={{textAlign:"start"}}>التاريخ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cycleInjections.map((event) => (
                          <TableRow key={event.injectName}>
                            <TableCell>
                              تسمم غذائي
                            </TableCell>
                            <TableCell>{event.givenDate.toLocaleDateString()}</TableCell>

                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>No medical history available for this sheep.</p>
                  </div>
              )}
            </CardContent>
          </Card>

          {
            mockCycle.status === 'active' ? (
                    <Card dir={'rtl'} style={{width:'50%'}}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2">
                          <span>الطعومات القادمة</span>
                        </CardTitle>
                        <CardDescription style={{fontWeight:'bold'}}>سجل الطعومات الكامل للطعومات القادمة</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {cycleInjections.length > 0 ? (
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead style={{textAlign:"start"}}>اسم الطعم</TableHead>
                                  <TableHead style={{textAlign:"start"}}>التاريخ</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {cycleInjections.map((event) => (
                                    <TableRow key={event.injectName}>
                                      <TableCell>
                                        تسمم غذائي
                                      </TableCell>
                                      <TableCell>{event.givenDate.toLocaleDateString()}</TableCell>

                                    </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <History className="mx-auto h-12 w-12 opacity-20 mb-2" />
                              <p>No medical history available for this sheep.</p>
                            </div>
                        )}
                      </CardContent>
                    </Card>

              ):
                <Card dir={'rtl'} style={{width:'50%'}}>
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
                                <TableHead style={{textAlign:"start"}}>تاريخ النهاية</TableHead>


                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              <TableRow>
                                <TableCell>البيع</TableCell>
                                <TableCell>20</TableCell>
                                <TableCell>130</TableCell>
                                <TableCell>35</TableCell>
                                <TableCell>20/11/2003</TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>النفوق</TableCell>
                                <TableCell>20</TableCell>
                                <TableCell>130</TableCell>
                                <TableCell>35</TableCell>
                                <TableCell>20/11/2003</TableCell>
                              </TableRow>

                              <TableRow>
                                <TableCell>إضافة للمخزون</TableCell>
                                <TableCell>20</TableCell>
                                <TableCell>130</TableCell>
                                <TableCell>35</TableCell>
                                <TableCell>20/11/2003</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                      ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <History className="mx-auto h-12 w-12 opacity-20 mb-2" />
                            <p>No medical history available for this sheep.</p>
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
              <p>{mockCycle.notes || "No notes available for this cycle."}</p>
            </CardContent>
          </Card>

        </TabsContent>
        
        <TabsContent value="weekly">
          <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold opacity-0">Weekly Records</h3>
              {mockCycle.status === 'active' && (
                <Button className="gap-2" onClick={()=>{setAddReportDialog(true)}}>
                  <PlusCircle size={16} />
                  <span>إضافة تقرير</span>
                </Button>
              )}
            </div>
            
            {mockWeeklyRecords.map((record) => (
              <Card key={record.id} dir={'rtl'}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">التقرير 2/ 11 - 2 /12</CardTitle>
                      <CardDescription>التقرير رقم 1</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">كمية العلف</p>
                      <p className="font-medium"><span className={`opacity-0`}>L</span> {record.feedQuantity} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">كمية الحليب</p>
                      <p className="font-medium"><span className={`opacity-0`}>L</span>  {record.milkQuantity} L</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الفيتامينات المعطاة</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {record.vitaminsGiven.map(vitamin => (
                          <Badge key={vitamin} variant="secondary" className="text-xs">
                            {vitamin}
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
          </div>

          <div className={'flex gap-2 mt-6'} dir={'rtl'}>
            <Button className="gap-2" onClick={()=>{setDeleteReportDialog(true)}}>
              <span>حذف الدورة</span>
            </Button>

            <Button className="gap-2" onClick={()=>{setEndReportDialog(true)}}>
              <span>إنهاء الدورة</span>
            </Button>
          </div>

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

          <Form {...form} >
            <form onSubmit={form.handleSubmit(handleSubmitInject)} className="space-y-4"  dir={'rtl'}>
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div style={{width:'45%'}}>
                    <Label htmlFor="sheep-gender">اسم الطعم</Label>
                    <div className={'mt-2'}>
                      <Select defaultValue="all" dir={'rtl'}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="all">الكل</SelectItem>
                            <SelectItem value="sells">المبيوعات</SelectItem>
                            <SelectItem value="died">النفوق</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                  </div>
                  <FormField control={form.control} name="dose"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>رقم الدورة</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال رقم الدورة الجديدة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                </div>


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
                            <Label htmlFor="due-date">تاريخ التطعيم</Label>
                            <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}/>
                          </div>
                      )
                  }
                </div>

                <FormField control={form.control} name="notes" render={({ field }) => (
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
                  إضافة الطعم
                </Button>

                <Button type="button" variant="outline" onClick={() => {setAddInjectDialog(false);form.reset()}}>
                  الغاء
                </Button>

              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
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
                  <FormField control={reportForm.control} name="milkAmount"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>كمية الحليب</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال كمية الحليب المستهلكة'} {...field} />
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
                  {vitamins.map((vitamin) => {
                    const isSelected = selectedVitamins.includes(vitamin.id);
                    return (
                        <div key={vitamin.id} className="flex items-start gap-2 w-full">
                          {/* Checkbox & Label */}
                          <div className="pt-1">
                            <Checkbox
                                id={`vitamin-${vitamin.id}`}
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                    handleVitaminSelection(vitamin.id, checked === true)
                                }
                            />
                          </div>

                          {/* Vitamin Info & Input */}
                          <div className="flex-1 space-y-1">
                            <label
                                htmlFor={`vitamin-${vitamin.id}`}
                                className="text-sm font-medium leading-none cursor-pointer"
                            >
                              {vitamin.name}
                            </label>

                            {isSelected && (
                                <div className="mt-1">
                                  <label className="text-xs text-muted-foreground">الكمية</label>
                                  <Input
                                      type="number"
                                      min="0"
                                      className="h-8 mt-1"
                                      {...reportForm.register(`vitaminAmounts.${vitamin.id}`, {
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
                  إضافة الطعم
                </Button>

                <Button type="button" variant="outline" onClick={() => {setAddReportDialog(false);reportForm.reset()}}>
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
            <form onSubmit={reportForm.handleSubmit(handleSubmitReport)} className="space-y-4"  dir={'rtl'}>
              <p className="text-red-600 font-semibold pb-5 pt-3" dir={'rtl'}>هل أنت متأكد أنك تريد حذف هذه الدورة؟ هذا الإجراء لا يمكن التراجع عنه.</p>
              <DialogFooter>
                <Button type="submit">
                  حذف
                </Button>
                <Button type="button" variant="outline" onClick={() => {setAddReportDialog(false);reportForm.reset()}}>
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
                <Button type="submit" onClick={()=> {setEndReportDialog(false);endCycleForm.reset()}}>
                  إضافة الطعم
                </Button>

                <Button type="button" variant="outline" onClick={() => {setAddReportDialog(false);reportForm.reset()}}>
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
