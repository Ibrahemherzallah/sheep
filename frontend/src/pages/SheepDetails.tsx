
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Baby,
  Calendar,
  Edit,
  FileText,
  Heart,
  History,
  LineChart, Plus,
  Syringe,
  Tag, Users
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle, Checkbox,
  Dialog,
  DialogContent,
  DialogDescription, DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel, FormMessage, Input,
  Separator,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger, toast,
} from '@/components/ui';
import {useForm} from "react-hook-form";

// Mock data - in a real app, this would come from an API
const sheepData = [
  { id: '1001', number: '1001', status: 'healthy', sex: 'female', origin: 'farm-produced', birthDate: '2023-01-15', isPregnant: true, pregnantSince: '2024-04-10', expectedBirthDate: '2024-09-07', milkProductionCapacity: 2.5, notes: 'صحة جيدة وحليب كثيف وممتاز' },
  { id: '1002', number: '1002', status: 'healthy', sex: 'female', origin: 'farm-produced', birthDate: '2023-02-10', isPregnant: false, milkProductionCapacity: 1.8, notes: 'Average production, had illness in February' },
  { id: '1003', number: '1003', status: 'sick', sex: 'male', origin: 'bought', birthDate: '2023-01-05', isPregnant: false, notes: 'Currently treating for respiratory infection' },
  { id: '1004', number: '1004', status: 'giving-birth-soon', sex: 'female', origin: 'bought', birthDate: '2022-11-20', isPregnant: true, pregnantSince: '2024-03-20', expectedBirthDate: '2024-08-17', milkProductionCapacity: 3.2, notes: 'High producer, second pregnancy' },
  { id: '1005', number: '1005', status: 'healthy', sex: 'male', origin: 'farm-produced', birthDate: '2022-12-05', isPregnant: false, notes: 'Strong breeding male' },
  { id: '1006', number: '1006', status: 'healthy', sex: 'female', origin: 'bought', birthDate: '2023-03-14', isPregnant: false, milkProductionCapacity: 2.1, notes: 'First-time mother last year' },
];

const medicalHistory = [
  { id: 'm1', sheepId: '1001', type: 'routine-injection', date: '2024-01-15', description: 'Semi-annual routine injection', notes: 'No adverse reactions' },
  { id: 'm2', sheepId: '1001', type: 'vitamin', date: '2024-02-20', vitaminId: 'v1', vitaminName: 'Vitamin B Complex', notes: 'Administered during weekly check' },
  { id: 'm3', sheepId: '1001', type: 'disease', date: '2024-03-05', diseaseId: 'd1', diseaseName: 'Mild fever', notes: 'Observed lethargy, treated immediately' },
  { id: 'm4', sheepId: '1001', type: 'medication', date: '2024-03-05', medicineId: 'med1', medicineName: 'Antibiotics', notes: 'For fever treatment' },
];

const birthRecords = [
  { id: 'b1', motherId: '1001', date: '2023-09-15', childrenCount: 2, maleCount: 1, femaleCount: 1, childIds: ['1010', '1011'], notes: 'Normal delivery, no complications' },
  { id: 'b2', motherId: '1004', date: '2023-08-20', childrenCount: 3, maleCount: 1, femaleCount: 2, childIds: ['1012', '1013', '1014'], notes: 'Difficult birth, required assistance' },
];

const SheepDetails = () => {
  const [editSheep, setEditSheep] = useState(false);
  const [disposalModal, setDisposalModal] = useState(false);
  const [milkAmountModal, setMilkAmountModal] = useState(false)
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find the sheep with the matching ID
  const sheep = sheepData.find(s => s.id === id);
  
  // Find medical events for this sheep
  const sheepMedicalHistory = medicalHistory.filter(record => record.sheepId === id);
  
  // Find birth records for this sheep (if female)
  const sheepBirthRecords = sheep?.sex === 'female' ? birthRecords.filter(record => record.motherId === id) : [];
  
  if (!sheep) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Sheep Not Found</h2>
        <p>The sheep with ID {id} could not be found.</p>
        <Button asChild className="mt-4">
          <Link to="/sheep">Back to Sheep Management</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Healthy</span>;
      case 'sick':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Sick</span>;
      case 'giving-birth-soon':
        return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Birth Soon</span>;
      default:
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Healthy</span>;
    }
  };



  interface BirthFormData { sex: string; sheepNumber: number; birthDetails: Record<string, { maleCount: number, femaleCount: number }>;birthDate: string;notes: string;}
  const handleSubmitEdit = (data: BirthFormData) => {
    toast({title: "تم التعديل", description: `تم تعديل النعجة بنجاح`});
    setEditSheep(false);
    form.reset();
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const form = useForm<BirthFormData>({
    defaultValues: {birthDetails: {}, sex: '', birthDate: new Date().toISOString().split('T')[0], notes: '', sheepNumber:0},
  });



  interface DisposalFormData { sheepId: string; sellPrice: number; }
  const handleSubmitDisposal = () => {
      // handle based on tab
      if (tab === "death") {
        // handle death logic
      } else if (tab === "sale") {
        // handle sale with values.sellPrice
      } else if (tab === "delete") {
        // handle delete
      }
    toast({title: "تم التصريف بنجاح"});
    setDisposalModal(false);
    disposalForm.reset();
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const disposalForm = useForm<DisposalFormData>({
    defaultValues: {sheepId: '' , sellPrice: 0}
  });



  interface MilkFormData { milkProduceDate: string; milkStopDate: string; milkAmount: number; notes: string }
  const handleSubmitMilkAmount = () => {
    toast({title: "تم إضافة الحليب بنجاح"});
    setMilkAmountModal(false);
    disposalForm.reset();
  };
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const milkForm = useForm<MilkFormData>({
    defaultValues: {milkProduceDate: '' ,milkStopDate: '' , milkAmount: 0 , notes: ''}
  });




  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [tab, setTab] = useState("death") // Tabs: death | sale | delete



  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="outline" asChild className="mb-2">
            <Link to="/sheep" className="inline-flex items-center gap-1">
              <ArrowLeft size={16} />
              <span>الرجوع إلى إدارة الأغنام</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight"> النعجة {sheep.number}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setEditSheep(true)} variant="outline" className="gap-1">
            <Baby size={18} />
            <span>تعديل معلومات النعجة</span>
          </Button>
        </div>
      </div>

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="medical">التاريخ الطبي</TabsTrigger>
          <TabsTrigger value="injection">الطعومات</TabsTrigger>
          <TabsTrigger value="births">الولادات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir={'rtl'}>
            <Card dir={'rtl'}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                  <span>المعلومات العامة</span>
                  {getStatusBadge(sheep.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">رقم النعجة</p>
                    <p className="flex items-center gap-1.5">
                      <Tag size={14} className="text-muted-foreground" />
                      <span>{sheep.number}</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">الجنس</p>
                    <p>{sheep.sex === 'male' ? 'ذكر' : 'أنثى'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">المصدر</p>
                    <p>{sheep.origin === 'farm-produced' ? 'إنتاج المزرعة' : 'شراء'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">الملاحظات</p>
                    <p className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span>{sheep.notes}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {sheep.isPregnant && (
              <Card className="border-purple-200" dir={'rtl'}>
                <CardHeader className="pb-2 bg-purple-50 rounded-t-lg">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Baby size={18} />
                    <span>حالة الحمل</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">حامل منذ</p>
                    <p>{sheep.pregnantSince || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">التاريخ المتوقع للولادة</p>
                    <p className="font-medium">{sheep.expectedBirthDate || 'N/A'}</p>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-muted-foreground">باقي 98 يوم للولادة</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {sheep.sex === 'female' && (
              <Card dir={'rtl'}>
                <div className="flex items-center justify-between">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">إنتاج الحليب</CardTitle>
                  </CardHeader>
                  <Button style={{margin: '1rem'}} onClick={() => setMilkAmountModal(true)}>
                    إدخال انتاج الحليب
                  </Button>
                </div>

                <CardContent className="pt-4">

                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">كمية الحليب بعدد اخر عملية ولادة</p>
                      <div className="flex items-end">
                        <span className="text-2xl font-bold">{sheep.milkProductionCapacity || 0}</span>
                        <span className="text-sm text-muted-foreground ml-1 mb-1">لتر/يوم</span>
                      </div>
                      {sheep.isPregnant && (
                          <p className="text-xs text-muted-foreground mt-1">الانتاج متوقف بسبب الحمل</p>
                      )}
                    </div>
                    <div>
                      <p>تاريخ البداية</p>
                      <p className="text-xs text-muted-foreground">12-2-2029</p>
                      <p>تاريخ التنشيف</p>
                      <p className="text-xs text-muted-foreground">12-2-2029</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="md:col-span-2" dir={'rtl'}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FileText size={16} />
                  <span>الملاحظات</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>{sheep.notes || 'No notes available for this sheep.'}</p>
              </CardContent>
            </Card>
            <Button asChild onClick={() => setDisposalModal(true)} style={{cursor:'pointer', width:'25%'}}>
              <span>تصريف</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card dir={'rtl'}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Heart size={18} />
                <span>التاريخ الطبي</span>
              </CardTitle>
              <CardDescription style={{fontWeight:'bold'}}>السجل الطبي الكامل للنعجة يشمل الأدوية والعلاجات</CardDescription>
            </CardHeader>
            <CardContent>
              {sheepMedicalHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{textAlign:"start"}}>التاريخ</TableHead>
                      <TableHead style={{textAlign:"start"}}>نوع العلاج</TableHead>
                      <TableHead style={{textAlign:"start"}}>التفاصيل</TableHead>
                      <TableHead style={{textAlign:"start"}}>الملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sheepMedicalHistory.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.date}</TableCell>
                        <TableCell>
                          تسمم غذائي
                        </TableCell>
                        <TableCell>
                         جرعة اولى
                        </TableCell>
                        <TableCell>تم العلاج من المرة الاولى</TableCell>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir={'rtl'}>
            <Card dir={'rtl'}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">الحالة الصحية الحالية</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {getStatusBadge(sheep.status)}
                    </p>
                    <p className="text-muted-foreground mt-1">أخر تحديث : اليوم</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="injection" className="space-y-4">
          <Card dir={'rtl'}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Heart size={18} />
                <span>الطعومات</span>
              </CardTitle>
              <CardDescription style={{fontWeight:'bold'}}>سجل الطعومات الفائتة والقادمة لهذه النعجة</CardDescription>
            </CardHeader>
            <CardContent>
              {sheepMedicalHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead style={{textAlign:"start"}}>اسم الطعم</TableHead>
                        <TableHead style={{textAlign:"start"}}>الوصف</TableHead>
                        <TableHead style={{textAlign:"start"}}>التكرار</TableHead>
                        <TableHead style={{textAlign:"start"}}>الحالة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sheepMedicalHistory.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>تسمم غذائي</TableCell>
                            <TableCell>
                              دواء مرة واحدة كل سنة
                            </TableCell>
                            <TableCell>
                              سنوي
                            </TableCell>
                            <TableCell>
                              تم
                            </TableCell>
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
          <Card>
            <CardHeader className="pb-2" dir={'rtl'}>
              <CardTitle className="text-lg">الحقنة القادمة </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center" dir={'rtl'}>
                <div>
                  <p className="text-sm font-medium">تسمم غذائي</p>
                  <p className="text-muted-foreground">خلال 45 يوم</p>
                </div>
                <Button variant="outline" size="sm">الإعطاء</Button>
              </div>
            </CardContent>
          </Card>

        </TabsContent>
        <TabsContent value="births" className="space-y-4" dir={'rtl'}>
          {sheep.sex === 'male' ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Birth records are only available for female sheep.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby size={18} />
                    <span>حالات الولادة</span>
                  </CardTitle>
                  <CardDescription>تاريخ لجميع حالات الولادة لهذه النعجة</CardDescription>
                </CardHeader>
                <CardContent>
                  {sheepBirthRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{textAlign:'start'}}>التاريخ</TableHead>
                          <TableHead style={{textAlign:'start'}}>عدد الاولاد</TableHead>
                          <TableHead style={{textAlign:'start'}}>كمية الحليب</TableHead>
                          <TableHead style={{textAlign:'start'}}>الذكور</TableHead>
                          <TableHead style={{textAlign:'start'}}>الإناث</TableHead>
                          <TableHead style={{textAlign:'start'}}>الملاحظات</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sheepBirthRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.childrenCount}</TableCell>
                            <TableCell>{record.maleCount} L</TableCell>
                            <TableCell>{record.femaleCount}</TableCell>
                            <TableCell>5</TableCell>
                            <TableCell>ملاحظات ملاحظات ملاحظات</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Baby className="mx-auto h-12 w-12 opacity-20 mb-2" />
                      <p>No birth records available for this sheep.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {sheep.isPregnant && (
                <Card className="border-purple-200">
                  <CardHeader className="bg-purple-50">
                    <CardTitle>الولادات القادمة</CardTitle>
                    <CardDescription>تفاصيل توقع الولادة</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">التاريخ المتوقع</p>
                        <p className="font-medium">{sheep.expectedBirthDate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">الأيام الباقية</p>
                        <p className="font-medium">تقريبا 98 يوم</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>


      </Tabs>

      {/* Edit Sheep Modal */}
      <Dialog open={editSheep} onOpenChange={setEditSheep}>
        <DialogContent className="sm:max-w-[600px]" >
          <DialogHeader style={{textAlign:'end'}}>
            <DialogTitle>تعديل معلومات النعجة</DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitEdit)} className="space-y-4" dir={'rtl'}>
              <div className="space-y-4 py-2 max-h-[400px]  overflow-y-auto pr-2">
                  <div className="flex justify-between">
                      <FormField control={form.control} name="sheepNumber" render={({ field }) => (
                          <FormItem>
                              <FormLabel>الرقم</FormLabel>
                              <FormControl>
                                  <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}/>
                      <FormField control={form.control} name="sex" render={({ field }) => (
                          <FormItem>
                              <FormLabel>الجنس</FormLabel>
                              <FormControl>
                                  <Input {...field} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}/>
                  </div>

                  <div>
                </div>
                <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أي ملاحظات إضافية .." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}
                />
              </div>

              <DialogFooter>
                <Button type="submit">
                  احفظ التعديلات
                </Button>
                <Button type="button" variant="outline" onClick={() => {setEditSheep(false);form.reset();}}>
                  الغاء
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Disposal Sheep Modal */}
      <Dialog open={disposalModal} onOpenChange={setDisposalModal}>
        <DialogContent className="sm:max-w-[600px]" >
          <DialogHeader style={{textAlign: 'end'}}>
            <DialogTitle >تصريف النعجة</DialogTitle>
            <DialogDescription>
              اختار طريقة التصريف
            </DialogDescription>
          </DialogHeader>

          <Form {...disposalForm}>
            <form onSubmit={disposalForm.handleSubmit(handleSubmitDisposal)} className="space-y-4">
              <Tabs value={tab} onValueChange={setTab} className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="sale">بيع</TabsTrigger>
                  <TabsTrigger value="death">موت</TabsTrigger>
                  <TabsTrigger value="delete">حذف</TabsTrigger>
                </TabsList>
                <div className="py-4 space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  <TabsContent value="death">
                    <p className="text-red-600 font-semibold pb-5 pt-3" dir={'rtl'}>هل أنت متأكد أنك تريد تسجيل النعجة كمُتوفاة؟</p>
                  </TabsContent>
                  <TabsContent value="delete">
                    <p className="text-red-600 font-semibold pb-5 pt-3" dir={'rtl'}>هل أنت متأكد أنك تريد حذف هذه النعجة؟ هذا الإجراء لا يمكن التراجع عنه.</p>
                  </TabsContent>
                  <TabsContent value="sale" dir={'rtl'} className={'pb-5 pt-3'}>
                    <FormField control={disposalForm.control} name="sellPrice" render={({ field }) => (
                        <FormItem>
                          <FormLabel>سعر البيع</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}/>
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {setDisposalModal(false);disposalForm.reset();setTab("death")}}>
                  إلغاء
                </Button>
                <Button type="submit" onClick={disposalForm.handleSubmit(handleSubmitDisposal)}>
                  تأكيد
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Enter the milk production */}
      <Dialog open={milkAmountModal} onOpenChange={setMilkAmountModal} >
        <DialogContent className="sm:max-w-[600px]" dir={'rtl'}>
          <DialogHeader style={{textAlign: "start"}}>
            <DialogTitle>كمية الحليب</DialogTitle>
            <DialogDescription>
              أدخل كمية الحليب للنعجة
            </DialogDescription>
          </DialogHeader>

          <Form {...milkForm}>
            <form onSubmit={milkForm.handleSubmit(handleSubmitMilkAmount)} className="space-y-4" >


              <div className="space-y-4 py-2 max-h-[400px]  overflow-y-auto pr-2">
                <div className="flex justify-between">
                  <FormField control={milkForm.control}  name="milkProduceDate" render={({ field }) => (
                      <FormItem style={{width:'40%'}}>
                        <FormLabel>تاريخ الإعطاء</FormLabel>
                        <FormControl>
                          <Input type={"date"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                  <FormField control={milkForm.control}  name="milkStopDate" render={({ field }) => (
                      <FormItem style={{width:'40%'}}>
                        <FormLabel>تاريخ التنشيف</FormLabel>
                        <FormControl>
                          <Input type={"date"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                </div>

                <FormField control={milkForm.control} name="milkAmount" render={({ field }) => (
                    <FormItem>
                      <FormLabel>كمية الحليب</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أدخل كمية الحليب" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
                <FormField control={milkForm.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>ملاحظات</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="أي ملاحظات إضافية .." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}/>
              </div>



              <DialogFooter>
                <Button type="submit" onClick={milkForm.handleSubmit(handleSubmitMilkAmount)}>
                  تأكيد
                </Button>
                <Button type="button" variant="outline" onClick={() => {setDisposalModal(false);disposalForm.reset();setTab("death")}}>
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

export default SheepDetails;
