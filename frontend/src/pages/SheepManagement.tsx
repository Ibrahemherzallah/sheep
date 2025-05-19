
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {Baby, Calendar, Download, Filter, Plus, Search, Users} from 'lucide-react';
import { GiSheep } from 'react-icons/gi';

import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Checkbox,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Label,
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import {is} from "date-fns/locale";

// Mock data
const sheepData = [
  { id: '1001', number: '1001', status: '', sex: 'female', origin: 'farm-produced', birthDate: '2023-01-15', isPregnant: true },
  { id: '1002', number: '1002', status: 'pregnant', sex: 'female', origin: 'farm-produced', birthDate: '2023-02-10', isPregnant: false },
  { id: '1003', number: '1003', status: 'sick', sex: 'male', origin: 'bought', birthDate: '2023-01-05', isPregnant: false },
  { id: '1004', number: '1004', status: 'giving-birth-soon', sex: 'female', origin: 'bought', birthDate: '2022-11-20', isPregnant: true },
  { id: '1005', number: '1005', status: 'pregnant', sex: 'male', origin: 'farm-produced', birthDate: '2022-12-05', isPregnant: false },
  { id: '1006', number: '1006', status: 'pregnant', sex: 'female', origin: 'bought', birthDate: '2023-03-14', isPregnant: false },
  { id: '1007', number: '1007', status: 'born', sex: 'female', origin: 'bought', birthDate: '2023-03-14', isPregnant: false },
  { id: '1008', number: '1008', status: '', sex: 'female', origin: 'farm-produced', birthDate: '2023-01-15', isPregnant: true },
  { id: '1009', number: '1009', status: 'pregnant', sex: 'female', origin: 'farm-produced', birthDate: '2023-02-10', isPregnant: false },
  { id: '1010', number: '1010', status: 'sick', sex: 'male', origin: 'bought', birthDate: '2023-01-05', isPregnant: false },
  { id: '10011', number: '1011', status: 'giving-birth-soon', sex: 'female', origin: 'bought', birthDate: '2022-11-20', isPregnant: true },
  { id: '1012', number: '1012', status: 'pregnant', sex: 'male', origin: 'farm-produced', birthDate: '2022-12-05', isPregnant: false },
  { id: '1013', number: '1013', status: 'pregnant', sex: 'female', origin: 'bought', birthDate: '2023-03-14', isPregnant: false },
  { id: '1014', number: '1014', status: 'born', sex: 'female', origin: 'bought', birthDate: '2023-03-14', isPregnant: false },
  { id: '1015', number: '1015', status: '', sex: 'female', origin: 'farm-produced', birthDate: '2023-01-15', isPregnant: true },
  { id: '1016', number: '1016', status: 'pregnant', sex: 'female', origin: 'farm-produced', birthDate: '2023-02-10', isPregnant: false },
  { id: '1017', number: '1017', status: 'sick', sex: 'male', origin: 'bought', birthDate: '2023-01-05', isPregnant: false },
  { id: '1018', number: '1018', status: 'giving-birth-soon', sex: 'female', origin: 'bought', birthDate: '2022-11-20', isPregnant: true },
  { id: '1019', number: '1019', status: 'pregnant', sex: 'male', origin: 'farm-produced', birthDate: '2022-12-05', isPregnant: false },
  { id: '1020', number: '1020', status: 'pregnant', sex: 'female', origin: 'bought', birthDate: '2023-03-14', isPregnant: false },
  { id: '1021', number: '1021', status: 'born', sex: 'female', origin: 'bought', birthDate: '2023-03-14', isPregnant: false },
  { id: '1022', number: '1022', status: '', sex: 'female', origin: 'farm-produced', birthDate: '2023-01-15', isPregnant: true },
  { id: '1023', number: '1023', status: 'pregnant', sex: 'female', origin: 'farm-produced', birthDate: '2023-02-10', isPregnant: false },
  { id: '1034', number: '1034', status: 'sick', sex: 'male', origin: 'bought', birthDate: '2023-01-05', isPregnant: false },
  { id: '1043', number: '1441', status: 'giving-birth-soon', sex: 'female', origin: 'bought', birthDate: '2022-11-20', isPregnant: true },
  { id: '1012', number: '1432', status: 'pregnant', sex: 'male', origin: 'farm-produced', birthDate: '2022-12-05', isPregnant: false },
  { id: '1353', number: '1333', status: 'pregnant', sex: 'female', origin: 'bought', birthDate: '2023-03-14', isPregnant: false },
  { id: '1564', number: '1364', status: 'born', sex: 'female', origin: 'bought', birthDate: '2023-03-14', isPregnant: false },
];

const sheepGender = [
  {id:'1', gender:'ذكر'},
  {id:'2', gender:'أنثى'},
]

const sheepSource = [
  {id:'1', source:'شراء'},
  {id:'2', source:'إنتاج المزرعة'},
]

const drugs = [
  {id:'1',name:'test1'},
  {id:'2',name:'test2'},
  {id:'3',name:'test3'},
  {id:'4',name:'test4'}
]

// Types for the birth record form
interface BirthFormData {selectedSheep: string[]; birthDuration:number ; birthDetails: Record<string, { maleCount: number, femaleCount: number }>;birthDate: string;notes: string;}
interface PregnantFormData {selectedSheep: string[];birthDetails: Record<string, { maleCount: number, femaleCount: number }>;birthDate: string;notes: string;}
interface AddSheepFormData {sheepNumber: number; gender: string; source: string; patientName: string; drug:string ; pregnantDuration: string; notes: string;}

const SheepCard = ({ sheep }: { sheep: typeof sheepData[0] }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sick':
        return <span className="sheep-status-alert">مريضة</span>;
      case 'giving-birth-soon':
        return <span className="sheep-status-attention">تلد قريبا</span>;
      case 'pregnant':
        return <span className="sheep-status-attention">حامل</span>;
      default:
        return;
    }
  };

  return (
    <div className="sheep-card" dir="rtl">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">#{sheep.number}</h3>
          <div>
            {getStatusBadge(sheep.status)}
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">الجنس :</span>
            <span className="font-medium">{sheep.sex === 'male' ? 'ذكر' : 'انثى'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">المصدر :</span>
            <span className="font-medium">{sheep.origin === 'farm-produced' ? 'إنتاج المزرعة' : 'شراء'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">تاريخ الإدخال :</span>
            <span className="font-medium">{sheep.birthDate}</span>
          </div>
          {sheep.isPregnant && (
            <div className="flex items-center gap-1 mt-2 text-farm-blue-700">
              <Baby size={16} />
              <span className="text-xs font-medium">متوقع ان تلد خلال 23 يوم</span>
            </div>
          )}
        </div>
      </div>
      <div className="border-t p-3 bg-muted/30 flex justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/sheep/${sheep.id}`}>رؤوية التفاصيل</Link>
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
  const [pregnantDialogOpen, setPregnantDialogOpen] = useState(false);
  const [selectedSheep, setSelectedSheep] = useState<string[]>([]);
  
  const form = useForm<BirthFormData>({
    defaultValues: {selectedSheep: [], birthDetails: {}, birthDate: new Date().toISOString().split('T')[0], birthDuration: 0 , notes: ''},
  });

  const addSheepForm = useForm<AddSheepFormData>({
    defaultValues: {sheepNumber: 0, gender: '', source:'', patientName:'', drug:'', pregnantDuration:'' , notes: ''},
  });

  // Filter for female sheep that could give birth
  const femaleSheep = sheepData.filter(sheep => sheep.sex === 'female');
  
  const filteredSheep = sheepData.filter(sheep => {
    if (activeTab === 'pregnant' && !sheep.isPregnant) return false;
    if (activeTab === 'male' && sheep.sex !== 'male') return false;
    if (activeTab === 'female' && sheep.sex !== 'female') return false;
    if (activeTab === 'sick' && sheep.status !== 'sick') return false;
    if (activeTab === 'born' && sheep.status !== 'born') return false;

    if (searchQuery) {
      return sheep.number.includes(searchQuery);
    }
    
    return true;
  });

  const handleSubmitBirth = (data: BirthFormData) => {
    console.log({selectedSheep: data.selectedSheep, birthDetails: data.birthDetails, birthDate: data.birthDate, notes: data.notes});
    toast({title: "Birth records added", description: `${data.selectedSheep.length} birth records have been successfully added.`});
    setBirthDialogOpen(false);
    form.reset();
    setSelectedSheep([]);
  };

  const handleSubmitPregnant = (data: BirthFormData) => {
    toast({title: "تسجيلات الحمل اضيفت", description: `${data.selectedSheep.length} .تسجيلات الحمل تم إضافتها بنجاح`});
    setPregnantDialogOpen(false);
    form.reset();
    setSelectedSheep([]);
  };



  const handleSubmitSheep = (data: AddSheepFormData) => {
    toast({title: "النعجة أضيفت", description: ` .تم إضافة النعجة بنجاح`});
    setAddSheepDialog(false);
    addSheepForm.reset();
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
  const [searchTerm, setSearchTerm] = useState('');
  const filteredSheepMultiSelector = femaleSheep.filter((sheep) =>
      sheep.number.toString().includes(searchTerm.trim())
  );


  const handleSheepToggle = (sheepId: string) => {
    if (selectedSheep.includes(sheepId)) {
      setSelectedSheep(selectedSheep.filter(id => id !== sheepId));
    } else {
      setSelectedSheep([...selectedSheep, sheepId]);
    }
  };
  const [selectedSheepGender,setSelectedSheepGender] = useState('');
  const [selectedSheepSource,setSelectedSheepSource] = useState('');
  const [isSheepPatient,setIsSheepPatient] = useState(false);
  const [isSheepPregnant,setIsSheepPregnant] = useState(false);
  const [patient,setPatient] = useState('');
  const [selectedDrug,setSelectedDrug] = useState('');
  const sheepNumber = addSheepForm.watch("sheepNumber");
  return (
    <div className="flex-1 space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">إدارة الأغنام</h1>
        <div className="flex items-center gap-2">
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
            <TabsTrigger value="born">اخر الولادات</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex w-full sm:w-auto gap-2 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              dir={'rtl'}
              placeholder="ادخل رقم العجة ...."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="flex-shrink-0">
            <Filter size={18} />
          </Button>
          <Select defaultValue="all" dir={'rtl'}>
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
        filteredSheep.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSheep.map((sheep) => (
            <SheepCard key={sheep.id} sheep={sheep} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No sheep found</h3>
          <p className="text-muted-foreground mt-2">
            We couldn't find any sheep matching your search criteria.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => {setSearchQuery('');setActiveTab('all');}}>
            Reset filters
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-3 max-h-[500px] overflow-y-auto">
                    {filteredSheepMultiSelector.map((sheep) => (
                        <div key={sheep.id} className="flex items-start space-x-2">

                          <div className="grid gap-1.5 w-full">
                            <label htmlFor={`sheep-${sheep.id}`} className="text-sm font-medium leading-none cursor-pointer">
                              {sheep.number}#
                            </label>
                            {selectedSheep.includes(sheep.id) && (
                                <div className="flex items-center gap-3 mt-1">
                                  <div className="flex-1">
                                    <label className="text-xs text-muted-foreground">Males</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        {...form.register(`birthDetails.${sheep.id}.maleCount`, {
                                          valueAsNumber: true,
                                          min: 0
                                        })}
                                        className="h-8"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <label className="text-xs text-muted-foreground">Females</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        {...form.register(`birthDetails.${sheep.id}.femaleCount`, {
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
                              id={`sheep-${sheep.id}`}
                              checked={selectedSheep.includes(sheep.id)}
                              onCheckedChange={(checked) => handleSheepSelection(sheep.id, checked === true)}
                          />
                        </div>
                    ))}

                    {filteredSheepMultiSelector.length === 0 && (
                        <p className="text-sm text-muted-foreground col-span-full">No sheep found with that number.</p>
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
                <Button type="submit" disabled={selectedSheep.length === 0}>
                  احفظ تسجيلات الولادة
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitPregnant)} className="space-y-4" dir={'rtl'}>
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
                <FormField control={form.control} name="birthDuration" render={({ field }) => (
                    <FormItem>
                      <FormLabel>مدة الحمل</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder={"كم يوم وهي النعجة حامل ؟"} {...field} />
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
                      {filteredSheepMultiSelector.map((sheep) => (
                          <div key={sheep.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                            <Label htmlFor={`sheep-${sheep.id}`} className="flex-grow cursor-pointer">
                              #{sheep.number}
                            </Label>
                            <Checkbox id={`sheep-${sheep.id}`} checked={selectedSheep.includes(sheep.id)} onCheckedChange={() => handleSheepToggle(sheep.id)}/>

                          </div>

                      ))}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {selectedSheep.length} الأغنام المحددة
                    </div>
                  </div>
                </div>

                <FormField control={form.control} name="notes" render={({ field }) => (
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
                <Button type="button" variant="outline" onClick={() => {setBirthDialogOpen(false);form.reset();setSelectedSheep([]);}}>
                  الغاء
                </Button>
                <Button type="submit" disabled={selectedSheep.length === 0}>
                  احفظ تسجيلات الولادة
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
                    <Label htmlFor="sheep-gender">جنس النعجة</Label>
                    <Select dir={'rtl'} value={selectedSheepGender} onValueChange={setSelectedSheepGender}>
                      <SelectTrigger id="sheep-gender">
                        <SelectValue placeholder="حدد جنس النعجة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {
                            sheepGender.map(sheep => (
                                <SelectItem key={sheep.id} value={sheep.id}>{ sheep.gender }</SelectItem>
                            ))
                          }
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1" >
                  <Label htmlFor="sheep-source">مصدر النعجة</Label>
                  <Select dir={'rtl'} value={selectedSheepSource} onValueChange={setSelectedSheepSource}>
                    <SelectTrigger id="sheep-source">
                      <SelectValue placeholder="حدد مصدر النعجة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {
                          sheepSource.map(sheep => (
                              <SelectItem key={sheep.id} value={sheep.id}>{sheep.source}</SelectItem>
                          ))
                        }
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`sheep-patient`}  checked={isSheepPregnant} onCheckedChange={(e) => setIsSheepPregnant(!isSheepPregnant)}/>
                      &nbsp;
                      <Label htmlFor={`sheep-patient`} className="flex-grow cursor-pointer">
                        هل هي حامل ؟
                      </Label>
                    </div>
                    {
                        isSheepPregnant && (
                        <>
                          <div className="space-y-2 mt-5">
                            <Input id="due-date" type="text" value={patient} placeholder={"قم بإدخال مدة الحمل"} onChange={(e) => setPatient(e.target.value)}/>
                          </div>
                        </>
                      )
                    }
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`sheep-pregnant`}  checked={isSheepPatient} onCheckedChange={(e) => setIsSheepPatient(!isSheepPatient)}/>
                      &nbsp;
                      <Label htmlFor={`sheep-pregnant`} className="flex-grow cursor-pointer">
                        هل هي مريضة ؟
                      </Label>
                    </div>
                    {
                        isSheepPatient && (
                            <>
                              <div className="space-y-2 mt-5">
                                <Input id="due-date" type="text" value={patient} placeholder={"قم بإدخال المرض المصابة به"} onChange={(e) => setPatient(e.target.value)}/>
                              </div>
                              <div className="space-y-1 mt-3" >
                                <Select value={selectedDrug} onValueChange={setSelectedDrug} dir={'rtl'}>
                                  <SelectTrigger id="sheep-gender">
                                    <SelectValue placeholder="قم بإدخال الدواء" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectGroup>
                                      {
                                        drugs.map(drug => (
                                            <SelectItem key={drug.id} value={drug.id}>{ drug.name }</SelectItem>
                                        ))
                                      }
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                              </div>
                            </>
                        )
                    }
                  </div>

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
                <Button type="submit" disabled={!sheepNumber || !selectedSheepGender}>
                  إضافة النعجة
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
