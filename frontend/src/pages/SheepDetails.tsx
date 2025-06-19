import {useEffect, useState} from 'react';
import { useParams, Link } from 'react-router-dom';
import {ArrowLeft, Baby, Calendar, Edit, FileText, Heart, History, LineChart, Plus, Syringe, Tag, Users} from 'lucide-react';
import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Input, Separator, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger, toast,} from '@/components/ui';
import {useForm} from "react-hook-form";
import { formatDate } from "../utils/dateUtils";



const SheepDetails = () => {
  const [editSheep, setEditSheep] = useState(false);
  const [disposalModal, setDisposalModal] = useState(false);
  const [milkAmountModal, setMilkAmountModal] = useState(false)
  const [changeMilkAmountModal, setChangeMilkAmountModal] = useState(false)
  const [endMilkDateModal, setEndMilkDateModal] = useState(false)

  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [allSheep,setAllSheep] = useState([]);
  const [tab, setTab] = useState("death") // Tabs: death | sale | delete
  const [loading, setLoading] = useState(true);
  const [injectionTypes,setInjectionTypes] = useState([]);
  const [sheepInjections,setSheepInjections] = useState([]);
  const [nextTask,setNextTask] = useState('');
  const sheep = allSheep.find(s => s._id === id);
  useEffect(() => {
    const fetchSheep = async () => {
      try {
        const response = await fetch('https://thesheep.top/api/sheep');
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'فشل في جلب البيانات');
        setAllSheep(result);
      } catch (error) {
        console.error('فشل في جلب النعاج:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSheep();
  }, [id]);
  useEffect(() => {
    if (activeTab === 'injection'){
      const fetchData = async () => {
        const res = await fetch(`https://thesheep.top/api/sheep/${id}/injection-history`);
        const { injectionTypes, injections } = await res.json();
        setInjectionTypes(injectionTypes);
        setSheepInjections(injections);
      };
      const fetchNextInjectionTask = async () => {
        try {
          const res = await fetch(`https://thesheep.top/api/tasks/next-injection/${id}`);
          if (!res.ok) return;
          const data = await res.json();
          setNextTask(data);
        } catch (err) {
          console.error('Error loading next task:', err);
        }
      };
      fetchData();
      fetchNextInjectionTask();
    }
  }, [activeTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'سليمة':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">سليمة</span>;
      case 'مريض':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">مريضة</span>;
      default:
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">سليمة</span>;
    }
  };

  interface MilkFormData { milkProduceDate: string;  milkAmount: number; notes: string }
  const milkForm = useForm<MilkFormData>({
    defaultValues: {milkProduceDate: '' , milkAmount: 0 , notes: ''}
  });
  const handleSubmitMilkAmount = async (data: MilkFormData) => {
    try {
      const response = await fetch("http://localhost:3030/api/pregnancies/update-milk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sheepId: sheep._id })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "فشل في تحديث البيانات");

      toast({ title: "تم إضافة الحليب بنجاح" });
      setMilkAmountModal(false);
      milkForm.reset();
    } catch (error) {
      console.error("Error submitting milk data:", error);
      toast({ title: "خطأ", description: error.message });
    }
  };

  //////////////////////////////////

  interface EndMilkFormData { milkEndDate: string;  notes: string }
  const endMilkForm = useForm<EndMilkFormData>({
    defaultValues: {milkEndDate: '' ,  notes: ''}
  });
  const handleSubmitEndMilkDate = async (data: EndMilkFormData) => {
    try {
      const response = await fetch("https://thesheep.top/api/pregnancies/update-end-milk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sheepId: sheep._id })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "فشل في تحديث بيانات تنشيف الحليب");

      toast({ title: "تم تحديث تاريخ التنشيف بنجاح" });
      setEndMilkDateModal(false); // <-- your second modal
      endMilkForm.reset();
    } catch (error: any) {
      console.error("Error submitting end milk data:", error);
      toast({ title: "خطأ", description: error.message });
    }
  };

  /////////////////////////////////////

  interface ChangeMilkAmountFormData { milkAmount: number; }
  const milkAmountForm = useForm<ChangeMilkAmountFormData>({
    defaultValues: { milkAmount: 0 }
  });
  const handleSubmitChangeMilkAmount = async (data: ChangeMilkAmountFormData) => {
    console.log("data is :" , data)
    try {
      const response = await fetch("https://thesheep.top/api/pregnancies/update-milk-amount", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheepId: sheep._id,
          milkAmount: data.milkAmount,
        }),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "فشل في تحديث كمية الحليب");

      toast({ title: "تم تحديث كمية الحليب بنجاح" });
      setChangeMilkAmountModal(false);  // close the modal
      milkAmountForm.reset();           // reset the form
    } catch (error: any) {
      console.error("Error updating milk amount:", error);
      toast({ title: "خطأ", description: error.message });
    }
  };




  // eslint-disable-next-line react-hooks/rules-of-hooks

  interface DisposalFormData { sheepId: string; sellPrice: number; }
  const handleSubmitDisposal = async (data: DisposalFormData) => {
    console.log("sheepId is :" , id);
    const sellPrice = disposalForm.getValues().sellPrice;

    try {
      if (tab === "death") {
        await fetch(`https://thesheep.top/api/sheep/${id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "نافقة" }),
        });
      } else if (tab === "sell") {
        await fetch(`https://thesheep.top/api/sheep/${id}/status`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "مباعة", sellPrice }),
        });
      } else if (tab === "delete") {
        await fetch(`https://thesheep.top/api/sheep/${id}`, {
          method: "DELETE",
        });
      }

      toast({ title: "تم التصريف بنجاح" });
      setDisposalModal(false);
      disposalForm.reset();
    } catch (error) {
      console.error(error);
      toast({ title: "حدث خطأ", description: "فشل في التصريف" });
    }
  };  const disposalForm = useForm<DisposalFormData>({
    defaultValues: {sheepId: '' , sellPrice: 0}
  });

  interface EditSheepData { sheepNumber: number; notes: string;}
  const handleSubmitEdit = async (data: EditSheepData) => {
    try {
      const response = await fetch(`https://thesheep.top/api/sheep/${sheep._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('فشل التعديل');
      }

      const updatedSheep = await response.json();
      toast({
        title: "تم التعديل",
        description: `تم تعديل النعجة بنجاح (رقم: ${updatedSheep.sheepNumber})`
      });
      setEditSheep(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast({ title: "خطأ", description: "فشل في تعديل النعجة" });
    }
  };
  const form = useForm<EditSheepData>({
    defaultValues: {notes: sheep?.notes, sheepNumber: sheep?.sheepNumber},
  });

  if (loading) {
    return <div className="p-6 text-center">جارٍ تحميل البيانات...</div>;
  }
  if (!sheep) {
    return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold mb-4">النعجة غير موجودة</h2>
          <p>النعجة ذات الرقم {id} غير موجودة.</p>
          <Button asChild className="mt-4">
            <Link to="/sheep">العودة</Link>
          </Button>
        </div>
    );
  }



  const sortedPregnancies = [...(sheep.pregnantCases || [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const latestPregnancy = sortedPregnancies[0] || null;
  const previousPregnancy = sortedPregnancies[1] || null;
  const pregnantSince = latestPregnancy ? formatDate(latestPregnancy.pregnantDate) : 'N/A';
  const expectedBirthDate = latestPregnancy ? formatDate(latestPregnancy.expectedBornDate) : 'N/A';
  const daysLeft = latestPregnancy ? Math.ceil((new Date(latestPregnancy.expectedBornDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;
  const slideBarWidth = 100 - daysLeft / 1.5;




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
          <h1 className="text-2xl font-bold tracking-tight"> معلومات النعجة {sheep.sheepNumber}</h1>
        </div>
        <div className="flex items-center gap-2">
          {
            !(sheep.status ===  "مباعة"|| sheep.status === 'نافقة') && !(sheep.sellPrice > 0) && (
                  <Button onClick={() => setEditSheep(true)} variant="outline" className="gap-1">
                    <Baby size={18} />
                    <span>تعديل معلومات النعجة</span>
                  </Button>
              )
          }

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
                  {getStatusBadge(sheep.medicalStatus)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">رقم النعجة</p>
                    <p className="flex items-center gap-1.5">
                      <Tag size={14} className="text-muted-foreground" />
                      <span>{sheep.sheepNumber}</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">الجنس</p>
                    <p>{ sheep.sheepGender }</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">المصدر</p>
                    <p>{sheep.source}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">الملاحظات</p>
                    <p className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-muted-foreground" />
                      <p>{sheep.notes || 'لا يوجد ملاحظات لهذه النعجة .'}</p>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {sheep.isPregnant && (
                <Card className="border-purple-200" dir="rtl">
                  <CardHeader className="pb-2 bg-purple-50 rounded-t-lg">
                    <CardTitle className="text-lg font-medium flex items-center gap-2">
                      <Baby size={18} />
                      <span>حالة الحمل</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">حامل منذ</p>
                      <p>{pregnantSince}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">التاريخ المتوقع للولادة</p>
                      <p className="font-medium">{expectedBirthDate}</p>
                    </div>
                    <div className="pt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: `${slideBarWidth < 0 ? 0 : slideBarWidth}%` }}></div>
                      </div>
                      <p className="text-xs text-right mt-1 text-muted-foreground">باقي {daysLeft} يوم للولادة</p>
                    </div>
                  </CardContent>
                </Card>
            )}


            {latestPregnancy ? (
                <Card dir="rtl">
                  <div className="flex items-center justify-between">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">إنتاج الحليب</CardTitle>
                    </CardHeader>

                    <div className={`flex flex-nowrap align-middle`}>
                      {!latestPregnancy.endMilkDate && latestPregnancy.milkAmount !== 0 && (
                          <Button style={{marginBlock: '1rem',marginLeft: '1rem'}} onClick={() => setEndMilkDateModal(true)}>
                            تاريخ التنشيف
                          </Button>
                      )}
                      {latestPregnancy.bornDate && latestPregnancy.milkAmount !== 0 && (
                          <Button style={{ marginBlock: '1rem', marginLeft: '1rem' }} onClick={() => setChangeMilkAmountModal(true)}>
                            تغيير كمية الحليب
                          </Button>
                      )}
                    </div>
                    {latestPregnancy.bornDate && latestPregnancy.milkAmount === 0 && (
                        <Button style={{ margin: '1rem' }} onClick={() => setMilkAmountModal(true)}>
                          إدخال انتاج الحليب
                        </Button>
                    )}
                  </div>

                  {latestPregnancy.bornDate ? (
                      latestPregnancy.milkAmount !== 0 ? (
                          <CardContent className="pt-4">
                              <div className="flex justify-between">
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground">كمية الحليب بعد اخر عملية ولادة</p>
                                  <div className="flex items-end">
                                    <span className="text-2xl font-bold">{latestPregnancy?.milkAmount}</span>
                                    <span className="text-sm text-muted-foreground ml-1 mb-1">لتر/يوم</span>
                                  </div>
                                </div>
                                <div>
                                  <p>تاريخ البداية</p>
                                  <p className="text-xs text-muted-foreground">
                                    {latestPregnancy?.startMilkDate
                                        ? formatDate(latestPregnancy.startMilkDate)
                                        : 'غير متوفر'}
                                  </p>
                                  <p>تاريخ التنشيف</p>
                                  <p className="text-xs text-muted-foreground">
                                    {latestPregnancy?.endMilkDate
                                        ? formatDate(latestPregnancy.endMilkDate)
                                        : 'غير متوفر'}
                                  </p>
                                </div>
                              </div>
                          </CardContent>
                      ) : null
                  ) : (
                      (
                          previousPregnancy ? (
                              <CardContent className="pt-4">
                                <div className="flex justify-between">
                                  <div>
                                    <p className="text-sm font-medium text-muted-foreground">كمية الحليب بعد اخر عملية ولادة</p>
                                    <div className="flex items-end">
                                      <span className="text-2xl font-bold">{previousPregnancy?.milkAmount}</span>
                                      <span className="text-sm text-muted-foreground ml-1 mb-1">لتر/يوم</span>
                                    </div>
                                  </div>
                                  <div>
                                    <p>تاريخ البداية</p>
                                    <p className="text-xs text-muted-foreground">
                                      {previousPregnancy?.startMilkDate
                                          ? formatDate(previousPregnancy.startMilkDate)
                                          : 'غير متوفر'}
                                    </p>
                                    <p>تاريخ التنشيف</p>
                                    <p className="text-xs text-muted-foreground">
                                      {previousPregnancy?.endMilkDate
                                          ? formatDate(previousPregnancy.endMilkDate)
                                          : 'غير متوفر'}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>

                          ) : <CardContent className="pt-4">لا يوجد تسجيلات حليب سابقة</CardContent>
                      )
                  )}
                </Card>
            ) : (
                <CardContent className="pt-4">
                  <p className="text-sm font-medium text-muted-foreground">لا يوجد تسجيلات حليب سابقة</p>
                </CardContent>
            )}


            <Card className="md:col-span-2" dir={'rtl'}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FileText size={16} />
                  <span>الملاحظات</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>{sheep.notes || 'لا يوجد ملاحظات لهذه النعجة .'}</p>
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
              {sheep?.patientCases?.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead style={{textAlign:"start"}}>التاريخ</TableHead>
                      <TableHead style={{textAlign:"start"}}>إسم المرض</TableHead>
                      <TableHead style={{textAlign:"start"}}>إسم الدواء</TableHead>
                      <TableHead style={{textAlign:"start"}}>الملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sheep?.patientCases?.map((event) => (
                      <TableRow key={event._id}>
                        { event.patientDate ?
                            <TableCell>{new Date(event.patientDate).toISOString().split('T')[0]}</TableCell>
                            : 'غير متوفر'
                        }
                        <TableCell>
                          {event.patientName}
                        </TableCell>
                        <TableCell>
                          {event.drugs.map((item, idx) => (
                              <span key={idx}>
                                {item.drug?.name || "اسم غير متاح"}
                                {idx < event.drugs.length - 1 && ', '}
                              </span>
                          ))}
                        </TableCell>
                        <TableCell>{event.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="mx-auto h-12 w-12 opacity-20 mb-2" />
                  <p>لا يوجد تسجيلات طبية ماحة لهذه النعجة.</p>
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
                      {getStatusBadge(sheep.medicalStatus)}
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
              {sheep?.injectionCases.length > 0 ? (
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
                        const givenInjection = [...sheepInjections].reverse().find(
                            inj => inj.injectionType?._id === type._id
                        );
                        console.log("givenInjection is " ,givenInjection)

                        return (
                            <TableRow key={type._id}>
                              <TableCell>{type.name}</TableCell>
                              <TableCell>
                                {givenInjection?.injectDate
                                    ? formatDate(givenInjection?.injectDate)
                                    : 'لم يتم إعطاؤه'}
                              </TableCell>
                              <TableCell>{givenInjection?.numOfInject === 1 ? 'جرعة أولى' :  givenInjection?.numOfInject === 2 ? "جرعة ثانية" : '-'}</TableCell>
                              <TableCell>{givenInjection?.notes || '—'}</TableCell>
                            </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
              ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>لا يوجد تسجيلات طبية ماحة لهذه النعجة.</p>
                  </div>
              )}
            </CardContent>
          </Card>
          {nextTask && (
              <Card>
                <CardHeader className="pb-2" dir="rtl">
                  <CardTitle className="text-lg">الحقنة القادمة</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-center" dir="rtl">
                    <div>
                      <p className="text-sm font-medium">{nextTask.title}</p>
                      <p className="text-muted-foreground">
                        خلال {Math.ceil((new Date(nextTask.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} يوم
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

        </TabsContent>
        <TabsContent value="births" className="space-y-4" dir={'rtl'}>
          {sheep.sex === 'male' ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">تسجيلات الولادة متاحة فقط للأغنام الإناث.</p>
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
                  {sheep?.pregnantCases?.length > 0 ? (
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
                        {sheep?.pregnantCases.filter(record => record.bornDate).map((record) => (
                          <TableRow key={record.id}>
                            {
                              record.bornDate
                                ?<TableCell>{new Date(record.bornDate).toISOString().split('T')[0]}</TableCell>
                                : 'غير متوفر'
                            }
                            <TableCell>{record.numberOfFemaleLamb + record.numberOfMaleLamb}</TableCell>
                            <TableCell> {record.milkAmount} L</TableCell>
                            <TableCell>{record.numberOfMaleLamb} </TableCell>
                            <TableCell>{record.numberOfFemaleLamb}</TableCell>
                            <TableCell>{record.notes || 'لا يوجد ملاحظات'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Baby className="mx-auto h-12 w-12 opacity-20 mb-2" />
                      <p>لا يوجد تسجيلات ولادة متاحة لهذه النعجة.</p>
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
                        {
                          latestPregnancy?.expectedBornDate ?
                              <p className="font-medium">{new Date(latestPregnancy?.expectedBornDate).toISOString().split('T')[0]}</p>
                              : 'غير متوفر'
                        }
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">الأيام الباقية</p>
                        <p className="font-medium">تقريبا {daysLeft} يوم</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

      </Tabs>
      {/* changeMilkAmountModal Sheep Modal */}
      <Dialog open={changeMilkAmountModal} onOpenChange={setChangeMilkAmountModal}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader style={{ textAlign: 'end' }}>
            <DialogTitle>تعديل كمية الحليب</DialogTitle>
            <DialogDescription>
              قم بإدخال الكمية الجديدة من الحليب لهذا الحمل
            </DialogDescription>
          </DialogHeader>

          <Form {...milkAmountForm}>
            <form onSubmit={milkAmountForm.handleSubmit(handleSubmitChangeMilkAmount)} className="space-y-4" dir="rtl">
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
                <FormField
                    control={milkAmountForm.control}
                    name="milkAmount"
                    render={({ field }) => (
                        <FormItem style={{ width: '100%' }}>
                          <FormLabel>كمية الحليب (لتر)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.1" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />
              </div>

              <DialogFooter>
                <Button type="submit" disabled={milkAmountForm.watch("milkAmount") <= 0}>
                  احفظ التعديلات
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setChangeMilkAmountModal(false);
                      milkAmountForm.reset();
                    }}
                >
                  الغاء
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* endMilkDateModal Sheep Modal */}
      <Dialog open={endMilkDateModal} onOpenChange={setEndMilkDateModal}>
        <DialogContent className="sm:max-w-[600px]" >
          <DialogHeader style={{textAlign:'end'}}>
            <DialogTitle>تحديد تاريخ التنشيف</DialogTitle>
            <DialogDescription>
            </DialogDescription>
          </DialogHeader>

          <Form {...endMilkForm}>
            <form onSubmit={endMilkForm.handleSubmit(handleSubmitEndMilkDate)} className="space-y-4" dir={'rtl'}>
              <div className="space-y-4 py-2 max-h-[400px]  overflow-y-auto pr-2">
                <div className="flex justify-between">
                  <FormField control={endMilkForm.control} name="milkEndDate" render={({ field }) => (
                      <FormItem style={{width:'100%'}}>
                        <FormLabel>تاريخ التنشيف</FormLabel>
                        <FormControl>
                          <Input type={"date"} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                </div>
                <FormField control={endMilkForm.control} name="notes" render={({ field }) => (
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
                <Button type="submit" disabled={!endMilkForm.watch("milkEndDate")}>
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
      {/* edit Sheep Modal */}
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
                          <FormItem className={'w-full'}>
                              <FormLabel>الرقم</FormLabel>
                              <FormControl>
                                  <Input type="number" {...field} />
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
                <Button type="submit" disabled={!form.watch("sheepNumber")}>
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
                  {
                      !(sheep.status === "مباعة"|| sheep.status === "نافقة") && !(sheep.sellPrice > 0) && (
                          <>
                            <TabsTrigger value="sell">بيع</TabsTrigger>
                            <TabsTrigger value="death">موت</TabsTrigger>
                          </>

                    )
                  }

                  <TabsTrigger value="delete">حذف</TabsTrigger>


                </TabsList>
                <div className="py-4 space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {
                    !(sheep.status === "مباعة"|| sheep.status === "نافقة") && !(sheep.sellPrice > 0) && (
                        <>
                          <TabsContent value="death">
                            <p className="text-red-600 font-semibold pb-5 pt-3" dir={'rtl'}>هل أنت متأكد أنك تريد تسجيل النعجة كمُتوفاة؟</p>
                          </TabsContent>
                          <TabsContent value="sell" dir={'rtl'} className={'pb-5 pt-3'}>
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
                        </>
                    )
                  }
                  <TabsContent value="delete">
                    <p className="text-red-600 font-semibold pb-5 pt-3" dir={'rtl'}>هل أنت متأكد أنك تريد حذف هذه النعجة؟ هذا الإجراء لا يمكن التراجع عنه.</p>
                  </TabsContent>
                </div>
              </Tabs>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {setDisposalModal(false);disposalForm.reset();setTab("death")}}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={ tab === 'sell' && !disposalForm.watch("sellPrice")}
                        onClick={disposalForm.handleSubmit(handleSubmitDisposal)}>
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
                      <FormItem style={{width:'100%'}}>
                        <FormLabel>تاريخ الإعطاء</FormLabel>
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
                <Button
                    type="submit"
                    onClick={milkForm.handleSubmit(handleSubmitMilkAmount)}
                    disabled={
                        !milkForm.watch("milkProduceDate") ||
                        !milkForm.watch("milkAmount")
                    }
                >
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
