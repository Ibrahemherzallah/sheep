import {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import {Baby, Calendar, Download, Filter, Plus, Search, Skull, Users} from 'lucide-react';
import { GiSheep } from 'react-icons/gi';
import {Button, Input, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, Checkbox, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Label,} from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import {is} from "date-fns/locale";
import * as React from "react";
import {Combobox} from "@/components/ui/combobox.tsx";
import {formatDate} from "@/utils/dateUtils.ts";


const sheepGender = [
  {id:'1', gender:'ذكر'},
  {id:'2', gender:'أنثى'},
]

const sheepSource = [
  {id:'1', source:'شراء'},
  {id:'2', source:'إنتاج المزرعة'},
]


// Types for the birth record form
interface BirthFormData {
  selectedSheep: string[];
  birthDetails: Record<string, { maleCount: number, femaleCount: number }>;birthDate: string;notes: string;
}
interface PregnantFormData {
  selectedSheep: string[];
  pregnantDuration: number;
  pregnantDate: string;
  expectedBornDate: string;
  bornDate: string;
  notes: string;
}
interface TrahFormData {
  trahDate: string;
  numberOfMaleLamb: number;
  numberOfFemaleLamb: number;
  order?: number;
  notes?: string;
};
interface AddSheepFormData {
  sheepNumber: number;
  sheepGender: string;
  isPregnant: boolean;
  isPatient: boolean;
  source: string;
  status: string;
  sellPrice: number;
  patientName: string;
  drug: string;
  order: number;
  pregnantDate: string;
  expectedBornDate: string;
  patientDate: string;
  pregnantDuration: number;
  notes: string;
  // 👇 New fields for age input
  ageYears: number;
  ageMonths: number;
  ageDays: number;
  badgeColor: 'red' | 'yellow' | ''; // limit to options or use string
}
interface Drug {
  _id: string;
  name: string;
  patientTakeFor: string;
  notes: string;
}


const SheepCard = ({ sheep }: { sheep: any }) => {
  return (
      <div className="sheep-card" dir="rtl">
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg">#{sheep.sheepNumber}</h3>
              {sheep.badgeColor && (
                  <span
                      className={`inline-block w-3 h-3 rounded-full ${
                          sheep.badgeColor === 'أحمر' ? 'bg-red-500' : 'bg-yellow-400'
                      }`}
                      title={`علامة ${sheep.badgeColor === 'red' ? 'حمراء' : 'صفراء'}`}
                  />
              )}
              {/* Death badge */}
              {sheep.status === 'نافقة' && (
                  <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-medium">
                    نافقة
                  </span>
              )}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">الجنس :</span>
              <span className="font-medium">{sheep.sheepGender}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">المصدر :</span>
              <span className="font-medium">
              {sheep.source}
            </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">تاريخ الإدخال :</span>
              <span className="font-medium">{formatDate(sheep.createdAt)}</span>
            </div>

            {sheep.isPregnant && sheep.pregnantCases.length > 0 && (() => {
              const lastPregnancy = sheep.pregnantCases[sheep.pregnantCases.length - 1];
              const expectedDate = new Date(lastPregnancy.expectedBornDate);
              const today = new Date();
              const timeDiff = expectedDate.getTime() - today.getTime();
              const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

              return (
                  <div className="flex items-center gap-1 mt-2 text-farm-blue-700">
                    <Baby size={16} />
                    <span className="text-xs font-medium">
                  متوقع أن تلد خلال {daysRemaining > 0 ? `${daysRemaining} يوم` : 'اليوم أو قريبا'}
                </span>
                  </div>
              );
            })()}

            {sheep.status === 'نافقة' && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">تاريخ النفوق :</span>
                <span className="font-medium">{formatDate(sheep.updatedAt)}</span>
              </div>
            )}

            {sheep?.sellPrice > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">تاريخ البيع :</span>
                    <span className="font-medium">{formatDate(sheep.updatedAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-red-700 font-medium">
                    💰 تم بيع هذه النعجة بسعر {sheep.sellPrice} شيكل
                  </div>
                </>
            )}
          </div>
        </div>

        <div className="border-t p-3 bg-muted/30 flex justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/sheep/${sheep._id}`}>رؤوية التفاصيل</Link>
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Calendar size={16} />
            </Button>
          </div>
        </div>
      </div>
  );
};

const SheepManagement = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [addSheepDialog,setAddSheepDialog] = useState(false);
  const [birthDialogOpen, setBirthDialogOpen] = useState(false);
  const [trahDialogOpen, setTrahDialogOpen] = useState(false);
  const [pregnantDialogOpen, setPregnantDialogOpen] = useState(false);
  const [selectedSheep, setSelectedSheep] = useState<string[]>([]);
  const [selectedSheepGender,setSelectedSheepGender] = useState('');
  const [selectedSheepSource,setSelectedSheepSource] = useState('');
  const [allDrugs, setAllDrugs] = useState<Drug[]>([]);
  const [allSheep, setAllSheep] = useState([]);
  const [pregnantSheep, setPregnantSheep] = useState([]);
  const [nonPregnantSheep, setNonPregnantSheep] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem("token");

  // Forms
  const form = useForm<BirthFormData>({
    defaultValues: {
      selectedSheep: [],
      birthDetails: {},
      birthDate: new Date().toISOString().split('T')[0],
      notes: ''
    }
  });
  const pregnantForm = useForm<PregnantFormData>({
    defaultValues: {
      selectedSheep: [],
      pregnantDuration: 0,
      pregnantDate: new Date().toISOString().split('T')[0],
      expectedBornDate: new Date().toISOString().split('T')[0],
      bornDate: undefined,
      notes: ''
    }
  })
  const trahForm = useForm<TrahFormData>({
    defaultValues: {
      trahDate: "",
      numberOfMaleLamb: 0,
      numberOfFemaleLamb: 0,
      order: undefined,
      notes: ""
    },
    mode: "onChange" // optional, validate on change
  });
  const addSheepForm = useForm<AddSheepFormData>({
    defaultValues: {
      sheepNumber: 0,
      sheepGender: '',
      isPregnant: false,
      isPatient: false,
      source: '',
      status: '',
      sellPrice: 0,
      order: 1,
      patientName: '',
      drug:'',
      pregnantDuration:0 ,
      pregnantDate: new Date().toISOString().split('T')[0],
      expectedBornDate: new Date().toISOString().split('T')[0],
      patientDate: new Date().toISOString().split('T')[0],
      notes: '',
      ageYears: 0,
      ageMonths: 0,
      ageDays: 0,
      badgeColor: '',
    },
  });
  const sheepNumber = addSheepForm.watch("sheepNumber");

  //methods
  const filteredSheep = allSheep.filter(sheep => {
    if (activeTab === 'pregnant' && !sheep.isPregnant) return false;
    if (activeTab === 'male' && sheep.sheepGender !== 'ذكر') return false;
    if (activeTab === 'female' && sheep.sheepGender !== 'أنثى') return false;
    if (activeTab === 'sick' && !sheep.isPatient) return false;
    if (activeTab === 'trah' && !sheep?.trahCases?.length > 0) return false;
    if (statusFilter === 'sells' && !sheep.status === 'مباع') return false;
    if (statusFilter === 'died' && !sheep.status === 'نفوق') return false;
    return true;
  });
  const dropdownSheep = filteredSheep.filter(sheep =>
    statusFilter === 'sells' ? sheep.status === 'مباعة'  : statusFilter === 'died' ? sheep.status ===  'نافقة' : sheep
  )
  const visibleSheep = dropdownSheep.filter(sheep =>
      sheep.sheepNumber?.toString().includes(searchQuery.trim())
  );

  // Submit Forms
  const handleSubmitBirth = async (data: BirthFormData) => {
    setIsSubmitting(true); // 🔄 Start loading

    const birthsArray = Object.entries(data.birthDetails).map(([sheepId, counts]) => ({
      sheepId,
      numberOfMaleLamb: counts.maleCount,
      numberOfFemaleLamb: counts.femaleCount,
    }));

    const payload = {
      bornDate: data.birthDate,
      notes: data.notes,
      births: birthsArray,
    };

    try {
      const response = await fetch('https://thesheep.top/api/pregnancies/update-after-birth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'حدث شيء خاطئ');
      }

      toast({
        title: 'تم تحديث السجلات بنجاح',
        description: `${selectedSheep.length} سجلات ولادة تم تسجيلها.`,
      });

      setBirthDialogOpen(false);
      form.reset();
      setSelectedSheep([]);
      window.location.reload()
    } catch (error: any) {
      console.error('Failed to submit birth data:', error);
      toast({
        title: 'حدث خطأ',
        description: error.message || 'تعذر حفظ سجلات الولادة.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false); // ✅ End loading
    }
  };
  const handleSubmitTrah = async (data: BirthFormData) => {
    setIsSubmitting(true); // 🔄 Start loading

    const birthsArray = Object.entries(data.birthDetails).map(([sheepId, counts]) => ({
      sheepId,
      numberOfMaleLamb: counts.maleCount,
      numberOfFemaleLamb: counts.femaleCount,
    }));

    const payload = {
      trahDate: data.birthDate,
      notes: data.notes,
      births: birthsArray,
    };

    try {
      const response = await fetch('https://thesheep.top/api/trah/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'حدث شيء خاطئ');
      }

      toast({
        title: 'تم تحديث السجلات بنجاح',
        description: `${selectedSheep.length} سجلات ولادة تم تسجيلها.`,
      });

      setBirthDialogOpen(false);
      form.reset();
      setSelectedSheep([]);
      window.location.reload()
    } catch (error: any) {
      console.error('Failed to submit birth data:', error);
      toast({
        title: 'حدث خطأ',
        description: error.message || 'تعذر حفظ سجلات الولادة.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false); // ✅ End loading
    }
  };
  const handleSubmitPregnant = async (data: PregnantFormData) => {
    setIsSubmitting(true); // 🔄 Start loading

    // Sync selectedSheep from UI state
    data.selectedSheep = selectedSheep;

    // Calculate dates
    let pregnantDate = '';
    let expectedBornDate = '';

    if (data.pregnantDuration || data.pregnantDuration === 0) {
      const today = new Date();

      // Subtract duration
      const calculatedPregnantDate = new Date(today);
      calculatedPregnantDate.setDate(today.getDate() - data.pregnantDuration);

      // Add 150 days to get expected birth date
      const calculatedExpectedBornDate = new Date(calculatedPregnantDate);
      calculatedExpectedBornDate.setDate(calculatedPregnantDate.getDate() + 150);

      pregnantDate = calculatedPregnantDate.toISOString();
      expectedBornDate = calculatedExpectedBornDate.toISOString();
    }

    const requestData = {
      sheepIds: data.selectedSheep,
      pregnantDate,
      expectedBornDate,
      notes: data.notes
    };

    console.log("📤 Request Data:", requestData);

    try {
      const response = await fetch('https://thesheep.top/api/pregnancies/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل في إرسال بيانات الحمل');
      }

      console.log("✅ Created pregnancies:", result);

      toast({
        title: "تم تسجيل الحمل",
        description: "تمت إضافة سجلات الحمل بنجاح.",
      });

      // Reset form & state
      pregnantForm.reset();
      setSelectedSheep([]);
      setPregnantDialogOpen(false);
      window.location.reload()
    } catch (error: any) {
      console.error("❌ Error submitting pregnancy:", error);
      toast({
        title: "خطأ أثناء التسجيل",
        description: error.message || "حدث خطأ أثناء حفظ بيانات الحمل.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false); // ✅ End loading
    }
  };
  const handleSubmitSheep = async (data: AddSheepFormData) => {
    setIsSubmitting(true); // 🔄 Start loading

    const requestData = { ...data };

    // Convert age to birthdate
    const today = new Date();
    const birthDate = new Date(today);
    birthDate.setFullYear(birthDate.getFullYear() - requestData.ageYears);
    birthDate.setMonth(birthDate.getMonth() - requestData.ageMonths);
    birthDate.setDate(birthDate.getDate() - requestData.ageDays);
    requestData.birthDate = birthDate.toISOString(); // 💾 Send to backend

    if (requestData.isPregnant && requestData.pregnantDuration) {
      const today = new Date();

      // Calculate pregnantDate
      const pregnantDate = new Date(today);
      pregnantDate.setDate(today.getDate() - requestData.pregnantDuration);

      // Calculate expectedBornDate
      const expectedBornDate = new Date(pregnantDate);
      expectedBornDate.setDate(pregnantDate.getDate() + 150);

      // Add to requestData in ISO format (or as needed by backend)
      requestData.pregnantDate = pregnantDate.toISOString();
      requestData.expectedBornDate = expectedBornDate.toISOString();
    }
    // ✅ Ensure `order` is explicitly added if it's not coming from form
    requestData.order = 1;
    requestData.badgeColor = data.badgeColor;

    console.log("The requestData is:", requestData);


    try {
      const response = await fetch('https://thesheep.top/api/sheep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json(); // read response body

      if (!response.ok) {
        // Display backend error message if available
        throw new Error(result.error || 'فشل في إرسال البيانات');
      }

      console.log('تمت الإضافة بنجاح:', result);

      toast({
        title: 'النعجة أضيفت',
        description: 'تم إضافة النعجة بنجاح.',
      });

      setAddSheepDialog(false);
      addSheepForm.reset();
      window.location.reload()
    } catch (error: any) {
      console.error('خطأ في الإرسال:', error);

      toast({
        title: 'حدث خطأ',
        description: error.message || 'لم يتم إضافة النعجة. حاول مرة أخرى.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false); // ✅ End loading
    }
  };
  const handleSheepSelection = (sheepId: string, checked: boolean) => {
    if (checked) {
      setSelectedSheep(prev => [...prev, sheepId]);
      
      // Initialize birth details for this sheep
      form.setValue(`birthDetails.${sheepId}`, { maleCount: 0, femaleCount: 0 });
    } else {
      setSelectedSheep(prev => prev.filter(id => id !== sheepId));
      
      // Remove birth details for this sheep
      const currentDetails = form.getValues('birthDetails');
      delete currentDetails[sheepId];
      form.setValue('birthDetails', currentDetails);
    }
    
    form.setValue('selectedSheep', selectedSheep);
  };
  const handleSheepToggle = (sheepId: string) => {
    if (selectedSheep.includes(sheepId)) {
      setSelectedSheep(selectedSheep.filter(id => id !== sheepId));
    } else {
      setSelectedSheep([...selectedSheep, sheepId]);
    }
  };


  useEffect(() => {
    const fetchSheep = async () => {
      try {
        const response = await fetch('https://thesheep.top/api/sheep');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'فشل في جلب البيانات');
        }

        console.log('تم جلب النعاج بنجاح:', result);

        setAllSheep(result); // full list

        const pregnant = result.filter((sheep: any) => sheep.isPregnant === true && sheep.status !== 'نافقة');
        const nonPregnant = result.filter((sheep: any) => sheep.isPregnant === false && sheep.sheepGender === 'أنثى' && sheep.status !== 'نافقة' && !sheep.sellPrice);

        setPregnantSheep(pregnant);
        setNonPregnantSheep(nonPregnant);

      } catch (error: any) {
        console.error('فشل في جلب النعاج:', error);
      }finally {
        setLoading(false);
      }
    };
    const fetchDrug = async () => {
      try {
        const response = await fetch('https://thesheep.top/api/stock');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'فشل في جلب البيانات');
        }

        console.log('تم جلب الأدوية بنجاح:', result);

        setAllDrugs(result);

      } catch (error: any) {
        console.error('فشل في جلب الأدوية:', error);
      }
    };

    fetchSheep();
    fetchDrug();
  }, []);
  if (loading) {
    return <div className="p-6 text-center">جارٍ تحميل البيانات...</div>;
  }
  return (
    <div className="flex-1 space-y-6 p-6 animate-fade-in">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">إدارة الأغنام</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {
              activeTab === 'trah' && (
                  <Button onClick={() => setTrahDialogOpen(true)} variant="outline" className="gap-1">
                    <Skull className="h-4 w-4 text-muted-foreground" />
                    <span>إضافة طراح</span>
                  </Button>
              )
          }

          <Button onClick={() => setPregnantDialogOpen(true)} variant="outline" className="gap-1">
            <GiSheep className="mr-1" />
            <span>إضافة حمل</span>
          </Button>
          <Button onClick={() => setBirthDialogOpen(true)} variant="outline" className="gap-1">
            <Baby size={18} />
            <span>إضافة ولادة</span>
          </Button>
          <Button onClick={() => setAddSheepDialog(true)}>
            <Plus size={18} />
            <span>إضافة أغنام</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">الكل</TabsTrigger>
            <TabsTrigger value="pregnant">الحوامل</TabsTrigger>
            <TabsTrigger value="male">الذكور</TabsTrigger>
            <TabsTrigger value="female">الاناث</TabsTrigger>
            <TabsTrigger value="sick">المرضى</TabsTrigger>
            <TabsTrigger value="trah">الطراح</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex w-full sm:w-auto gap-2 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                dir={'rtl'}
                placeholder="ادخل رقم النعجة ...."
                className="pl-8" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}/>
          </div>
          <Button variant="outline" size="icon" className="flex-shrink-0">
            <Filter size={18} />
          </Button>
          <Select defaultValue="all" dir={'rtl'} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
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
      {
        visibleSheep.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleSheep.filter(sheep => sheep._id).map((sheep) => (
            <SheepCard key={sheep._id} sheep={sheep} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No sheep found</h3>
          <p className="text-muted-foreground mt-2">
            لا يوجد اي اغنام تطابق البحث
          </p>
          <Button variant="outline" className="mt-4" onClick={() => {setSearchQuery('');setActiveTab('all');}}>
            اعادة الفلتر
          </Button>
        </div>
      )}

      {/* Add Birth Dialog */}
      <Dialog open={birthDialogOpen} onOpenChange={setBirthDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" >
          <DialogHeader style={{textAlign: "end"}}>
            <DialogTitle>تسجيل ولادات جديدة</DialogTitle>
            <DialogDescription>
              حدد الأغنام التي سوف تلد وحدد عدد المواليد
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitBirth)} className="space-y-4" dir={'rtl'}>
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
                <FormField control={form.control} name="birthDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الميلاد</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} dir={'rtl'}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users size={16} />
                    حدد الأغنام التي سوف تلد
                  </h3>
                  <div className="mb-3">
                    <Input type="text" placeholder="ادخل رقم النعجة" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-1/2"/>
                  </div>

                  {/* 🐑 Multi-selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-3 max-h-60 overflow-y-auto">
                    {pregnantSheep.filter(sheep =>
                        String(sheep.sheepNumber).toLowerCase().includes(searchTerm.toLowerCase())).map((sheep) => (
                        <div key={sheep._id} className="flex items-start space-x-2">
                          <div className="grid gap-1.5 w-full">
                            <label htmlFor={`sheep-${sheep._id}`} className="text-sm font-medium leading-none cursor-pointer">
                              {sheep.sheepNumber}#
                              {sheep.badgeColor && (
                                  <span
                                      className={`inline-block w-3 h-3 rounded-full ms-2 ${
                                          sheep.badgeColor === 'أحمر' ? 'bg-red-500' : 'bg-yellow-400'
                                      }`}
                                      title={`علامة ${sheep.badgeColor === 'red' ? 'حمراء' : 'صفراء'}`}
                                  />
                              )}
                            </label>

                            {selectedSheep.includes(sheep._id) && (
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex-1">
                                    <label className="text-xs text-muted-foreground">الذكور</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        {...form.register(`birthDetails.${sheep._id}.maleCount`, {
                                          valueAsNumber: true,
                                          min: 0
                                        })}
                                        className="h-8"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-xs text-muted-foreground">الإناث</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        {...form.register(`birthDetails.${sheep._id}.femaleCount`, {
                                          valueAsNumber: true,
                                          min: 0
                                        })}
                                        className="h-8"
                                    />
                                  </div>

                                </div>
                            )}
                          </div>
                          <Checkbox
                              id={`sheep-${sheep._id}`}
                              checked={selectedSheep.includes(sheep._id)}
                              onCheckedChange={(checked) => handleSheepSelection(sheep._id, checked === true)}
                          />
                        </div>
                    ))}

                    {pregnantSheep.length === 0 && (
                        <p className="text-sm text-muted-foreground col-span-full">لا يوجد أغنام بهذا الرقم.</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedSheep.length} الأغنام المحددة
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
                <Button type="button" variant="outline" onClick={() => {setBirthDialogOpen(false);form.reset();setSelectedSheep([]);}}>
                  الغاء
                </Button>
                <Button type="submit" disabled={selectedSheep.length === 0 || isSubmitting}>
                  {isSubmitting ? "جاري الحفظ..." : "احفظ تسجيلات الولادة"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Trah Dialog */}
      <Dialog open={trahDialogOpen} onOpenChange={setTrahDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader style={{ textAlign: 'end' }}>
            <DialogTitle>تسجيل حالات طراح جديدة</DialogTitle>
            <DialogDescription>حدد الأغنام وحدد عدد المواليد</DialogDescription>
          </DialogHeader>

          <Form {...trahForm}>
            <form onSubmit={form.handleSubmit(handleSubmitTrah)} className="space-y-4" dir={'rtl'}>
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
                <FormField control={form.control} name="birthDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ الميلاد</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} dir={'rtl'}/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}
                />

                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users size={16} />
                    حدد الأغنام التي طرحت
                  </h3>
                  <div className="mb-3">
                    <Input type="text" placeholder="ادخل رقم النعجة" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-1/2"/>
                  </div>

                  {/* 🐑 Multi-selector */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-3 max-h-60 overflow-y-auto">
                    {pregnantSheep.filter(sheep =>
                        String(sheep.sheepNumber).toLowerCase().includes(searchTerm.toLowerCase())).map((sheep) => (
                        <div key={sheep._id} className="flex items-start space-x-2">
                          <div className="grid gap-1.5 w-full">
                            <label htmlFor={`sheep-${sheep._id}`} className="text-sm font-medium leading-none cursor-pointer">
                              {sheep.sheepNumber}#
                              {sheep.badgeColor && (
                                  <span
                                      className={`inline-block w-3 h-3 rounded-full ms-2 ${
                                          sheep.badgeColor === 'أحمر' ? 'bg-red-500' : 'bg-yellow-400'
                                      }`}
                                      title={`علامة ${sheep.badgeColor === 'red' ? 'حمراء' : 'صفراء'}`}
                                  />
                              )}
                            </label>

                            {selectedSheep.includes(sheep._id) && (
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex-1">
                                    <label className="text-xs text-muted-foreground">الذكور</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        {...form.register(`birthDetails.${sheep._id}.maleCount`, {
                                          valueAsNumber: true,
                                          min: 0
                                        })}
                                        className="h-8"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-xs text-muted-foreground">الإناث</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        {...form.register(`birthDetails.${sheep._id}.femaleCount`, {
                                          valueAsNumber: true,
                                          min: 0
                                        })}
                                        className="h-8"
                                    />
                                  </div>

                                </div>
                            )}
                          </div>
                          <Checkbox
                              id={`sheep-${sheep._id}`}
                              checked={selectedSheep.includes(sheep._id)}
                              onCheckedChange={(checked) => handleSheepSelection(sheep._id, checked === true)}
                          />
                        </div>
                    ))}

                    {pregnantSheep.length === 0 && (
                        <p className="text-sm text-muted-foreground col-span-full">لا يوجد أغنام بهذا الرقم.</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {selectedSheep.length} الأغنام المحددة
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
                <Button type="button" variant="outline" onClick={() => {setBirthDialogOpen(false);form.reset();setSelectedSheep([]);}}>
                  الغاء
                </Button>
                <Button type="submit" disabled={selectedSheep.length === 0 || isSubmitting}>
                  {isSubmitting ? "جاري الحفظ..." : "احفظ تسجيلات الولادة"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Pregnant Dialog */}
      <Dialog open={pregnantDialogOpen} onOpenChange={setPregnantDialogOpen}>
        <DialogContent className="sm:max-w-[600px]" >
          <DialogHeader style={{textAlign: "end"}}>
            <DialogTitle>تسجيل حوامل جديدة</DialogTitle>
            <DialogDescription>
              حدد الأغنام الحاملة
            </DialogDescription>
          </DialogHeader>

          <Form {...pregnantForm}>
            <form onSubmit={pregnantForm.handleSubmit(handleSubmitPregnant)} className="space-y-4" dir={'rtl'}>
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
                <FormField control={pregnantForm.control} name="pregnantDuration" render={({ field }) => (
                    <FormItem>
                      <FormLabel>مدة الحمل</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder={"كم يوم وهي النعجة حامل ؟"} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}
                />

                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users size={16} />
                    حدد الأغنام الحامل
                  </h3>
                  <div className="mb-3">
                    <Input type="text" placeholder="ابحث عن رقم النعجة" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-1/2"/>
                  </div>

                  {/* 🐑 Multi-selector */}
                  <div className="space-y-2">
                    <div className="max-h-60 overflow-y-auto p-2 border rounded-md">
                      {nonPregnantSheep.filter(sheep =>
                          String(sheep.sheepNumber).toLowerCase().includes(searchTerm.toLowerCase())).map((sheep) => (
                          <div key={sheep._id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                            <Label htmlFor={`sheep-${sheep._id}`} className="flex-grow cursor-pointer">
                              #{sheep.sheepNumber}
                              {sheep.badgeColor && (
                                  <span
                                      className={`inline-block w-3 h-3 rounded-full ms-2 ${
                                          sheep.badgeColor === 'أحمر' ? 'bg-red-500' : 'bg-yellow-400'
                                      }`}
                                      title={`علامة ${sheep.badgeColor === 'red' ? 'حمراء' : 'صفراء'}`}
                                  />
                              )}
                            </Label>
                            <Checkbox id={`sheep-${sheep._id}`} checked={selectedSheep.includes(sheep._id)} onCheckedChange={() => handleSheepToggle(sheep._id)}/>
                          </div>
                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {selectedSheep.length} الأغنام المحددة
                    </div>
                  </div>
                </div>

                <FormField control={pregnantForm.control} name="notes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>الملاحظات</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder=" أي ملاحظات اضافية ..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => {setPregnantDialogOpen(false);form.reset();setSelectedSheep([]);}}>
                  الغاء
                </Button>
                <Button type="submit" disabled={selectedSheep.length === 0 || isSubmitting}>
                  {isSubmitting ? "جاري الحفظ..." : "احفظ تسجيلات الحمل"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Add Sheep Dialog */}
      <Dialog open={addSheepDialog} onOpenChange={setAddSheepDialog}>
        <DialogContent className="sm:max-w-[600px]" >
          <DialogHeader style={{textAlign: "end"}}>
            <DialogTitle>إضافة أغنام جديدة</DialogTitle>
            <DialogDescription>
              أضف أغنام جديدة للمزرعة
            </DialogDescription>
          </DialogHeader>

          <Form {...addSheepForm} >
            <form onSubmit={addSheepForm.handleSubmit(handleSubmitSheep)} className="space-y-4"  dir={'rtl'}>
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <FormField control={addSheepForm.control} name="sheepNumber"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>رقم النعجة</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال رقم النعجة الجديدة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>
                  <div className="space-y-1" style={{width:'45%'}}>
                    <FormField control={addSheepForm.control} name="sheepGender" render={({ field }) => (
                        <FormItem>
                          <FormLabel>جنس النعجة</FormLabel>
                          <Select dir={'rtl'} value={field.value} onValueChange={(value) => {
                                field.onChange(value);
                                setSelectedSheepGender(value);
                              }}>
                            <SelectTrigger id="sheep-gender">
                              <SelectValue placeholder="حدد جنس النعجة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {sheepGender.map(sheep => (
                                    <SelectItem key={sheep.id} value={sheep.gender}>
                                    {sheep.gender}
                                    </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )} />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>

                  <div style={{ width: '100%' }}>
                    <FormField control={addSheepForm.control} name="badgeColor" render={({ field }) => (
                        <FormItem>
                          <FormLabel>لون البادج</FormLabel>
                          <Select
                              dir="rtl"
                              value={field.value}
                              onValueChange={(value) => field.onChange(value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر لون البطاقة" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectItem value="أحمر">أحمر</SelectItem>
                                <SelectItem value="أصفر">أصفر</SelectItem>
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                    )}/>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <FormField control={addSheepForm.control} name="ageYears" render={({ field }) => (
                      <FormItem style={{ width: '30%' }}>
                        <FormLabel>العمر (بالسنوات)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                      </FormItem>
                  )} />
                  <FormField control={addSheepForm.control} name="ageMonths" render={({ field }) => (
                      <FormItem style={{ width: '30%' }}>
                        <FormLabel>الشهور</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={11} {...field} />
                        </FormControl>
                      </FormItem>
                  )} />
                  <FormField control={addSheepForm.control} name="ageDays" render={({ field }) => (
                      <FormItem style={{ width: '30%' }}>
                        <FormLabel>الأيام</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} max={30} {...field} />
                        </FormControl>
                      </FormItem>
                  )} />
                </div>
                <div className="space-y-1" >
                  <FormField control={addSheepForm.control} name="source" render={({ field }) => (
                      <FormItem>
                        <FormLabel>مصدر النعجة</FormLabel>
                        <Select dir={'rtl'} value={field.value} onValueChange={(value) => {
                          console.log("value is : " , value);
                          field.onChange(value);
                          setSelectedSheepSource(value);
                        }}>
                          <SelectTrigger id="sheep-source">
                            <SelectValue placeholder="حدد مصدر النعجة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              {
                                sheepSource.map(sheep => (
                                    <SelectItem key={sheep.id} value={sheep.source}>{sheep.source}</SelectItem>
                                ))
                              }
                            </SelectGroup>
                          </SelectContent>
                        </Select>

                        <FormMessage />
                      </FormItem>
                  )} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  {/* هل هي حامل؟ */}
                  <div style={{ width: '45%' }}>
                    <FormField
                        control={addSheepForm.control}
                        name="isPregnant"
                        render={({ field }) => (
                            <FormItem>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="sheep-pregnant"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                                <Label htmlFor="sheep-pregnant" className="cursor-pointer">
                                  &nbsp; هل هي حامل ؟
                                </Label>
                              </div>
                            </FormItem>
                        )}
                    />

                    {/* مدة الحمل */}
                    {addSheepForm.watch('isPregnant') && (
                        <FormField
                            control={addSheepForm.control}
                            name="pregnantDuration"
                            render={({ field }) => (
                                <FormItem className="mt-3">
                                  <FormControl>
                                    <Input type="text" placeholder="قم بإدخال مدة الحمل" {...field} />
                                  </FormControl>
                                </FormItem>
                            )}
                        />
                    )}
                  </div>

                </div>
                <FormField control={addSheepForm.control} name="notes" render={({ field }) => (
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
                <Button type="submit" disabled={!sheepNumber || !selectedSheepGender || !selectedSheepSource || !addSheepForm.watch("badgeColor") || isSubmitting}>
                  {isSubmitting ? "جاري إضافة النعجة..." : "إضافة النعجة"}
                </Button>
                <Button type="button" variant="outline" onClick={() => {setAddSheepDialog(false);addSheepForm.reset()}}>
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

export default SheepManagement;
