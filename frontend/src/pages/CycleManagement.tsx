import { useState } from 'react';
import { Link } from 'react-router-dom';
import {Calendar, CalendarDays, Plus, ChevronRight, Search, Syringe, Pill, ChevronLeft} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle, CardDescription} from '@/components/ui/card';
import {Table, TableHeader, TableBody, TableHead, TableRow, TableCell} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Cycle } from '@/types';
import { toast } from 'sonner';
import { toast as hotToast } from '@/hooks/use-toast';
import {useForm} from "react-hook-form";
import {Checkbox, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Form, FormControl, FormField, FormItem, FormLabel, FormMessage, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue} from "@/components/ui";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Mock data for cycles
const mockCycles: Cycle[] = [
  {
    id: "c1",
    name: "دورة شتاء 2025",
    startDate: new Date(2025, 2, 15),
    endDate: undefined,
    sheepIds: ["s1", "s2", "s3", "s4", "s5"],
    initialMaleCount: 3,
    initialFemaleCount: 2,
    status: "نشطة",
    notes: "أول دورة تنشط في هذا الموسم"
  },
  {
    id: "c2",
    name: "دورة شتاء 2025",
    startDate: new Date(2024, 10, 10),
    endDate: new Date(2025, 3, 15),
    sheepIds: ["s6", "s7", "s8", "s9", "s10", "s11"],
    initialMaleCount: 4,
    initialFemaleCount: 2,
    status: "منتهية",
    notes: "أول دورة تنشط في هذا الموسم"
  },
  {
    id: "c3",
    name: "دورة شتاء 2025",
    startDate: new Date(2024, 5, 20),
    endDate: new Date(2024, 9, 30),
    sheepIds: ["s12", "s13", "s14", "s15"],
    initialMaleCount: 2,
    initialFemaleCount: 2,
    status: "منتهية",
    notes: "أول دورة تنشط في هذا الموسم"
  }
];

// Mock data for medicines and injections
const mockMedicines = [
  { id: "m1", name: "Penicillin", description: "Antibiotic for bacterial infections" },
  { id: "m2", name: "Ivermectin", description: "Anti-parasitic medication" },
  { id: "m3", name: "Tetracycline", description: "Broad-spectrum antibiotic" },
  { id: "m4", name: "Flunixin", description: "Anti-inflammatory medication" }
];

const mockInjections = [
  { id: "i1", name: "Clostridial Vaccine", description: "Protects against clostridial diseases" },
  { id: "i2", name: "Foot Rot Vaccine", description: "Protects against foot rot" },
  { id: "i3", name: "Q Fever Vaccine", description: "Protects against Q fever" },
  { id: "i4", name: "Anthrax Vaccine", description: "Protects against anthrax" }
];


interface CycleFormData {cycleName: string ;cycleNumber: number ;maleNum: number ;femaleNum: number ;startDate: string ;notes: string }




const CycleManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [medicineTab, setMedicineTab] = useState('medicines');
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [selectedMedicine, setSelectedMedicine] = useState<string>('');
  const [selectedInjection, setSelectedInjection] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [addCycleDialog,setAddCycleDialog] = useState(false);
  const [useTodayDate,setUseTodayDate] = useState(true);


  // Filter cycles based on search query and active tab
  const filteredCycles = mockCycles
    .filter(cycle => 
      cycle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cycle.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(cycle => {
      if (activeTab === 'all') return true;
      if (activeTab === 'نشطة') return cycle.status === 'active';
      if (activeTab === 'انتهت') return cycle.status === 'completed';
      return true;
    });

  // Format date to a readable string
  const formatDate = (date?: Date) => {
    if (!date) return ' مستمر';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formSchema = z.object({
    cycleName: z.string().min(1, "هذا الحقل مطلوب"),
    cycleNumber: z.coerce.number().min(1, "رقم الدورة مطلوب"),
    maleNum: z.coerce.number().min(1, "عدد الذكور مطلوب"),
    femaleNum: z.coerce.number().min(1, "عدد الإناث مطلوب"),
    startDate: z.string().min(1, "تاريخ البداية مطلوب"),
    notes: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cycleName: "",
      cycleNumber: 0,
      maleNum: 0,
      femaleNum: 0,
      startDate: "",
      notes: "",
    },
  });





  const handleSubmitSheep = (data: CycleFormData) => {
    hotToast({title: "الدورة أضيفت", description: ` تمت اضافة الدورة بنجاح .`});
    setAddCycleDialog(false);
    form.reset();
  };

  // Handle adding a medicine or injection to a cycle
  const handleAddMedication = () => {
    if (!selectedCycle) {
      toast.error("Please select a cycle");
      return;
    }

    if (medicineTab === 'medicines' && !selectedMedicine) {
      toast.error("Please select a medicine");
      return;
    }

    if (medicineTab === 'injections' && !selectedInjection) {
      toast.error("Please select an injection");
      return;
    }

    // In a real app, this would save to a database
    toast.success(`${medicineTab === 'medicines' ? 'Medicine' : 'Injection'} added to cycle successfully`);
    
    // Reset form
    setSelectedMedicine('');
    setSelectedInjection('');
    setDosage('');
    setNotes('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">إدارة الدورات</h1>

        </div>
        <Button className="gap-2" onClick={() => {setAddCycleDialog(true);form.reset();}}>
          <Plus size={16} />
          <span>إضافة دورة</span>
        </Button>
      </div>

      <div className="flex items-center space-x-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search cycles..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Cycles</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="col-span-1 md:col-span-3">
          <Card>
            <CardHeader className="pb-5" dir={'rtl'}>
              <CardTitle>الدورات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table dir={'rtl'}>
                <TableHeader>
                  <TableRow >
                    <TableHead>إسم الدورة</TableHead>
                    <TableHead>تاريخ البداية</TableHead>
                    <TableHead>تاريخ النهاية</TableHead>
                    <TableHead>عدد الاغنام</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الأحداث</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCycles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No cycles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCycles.map((cycle) => (
                      <TableRow key={cycle.id}>
                        <TableCell className="font-medium" style={{textAlign:'end'}}>{cycle.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-end" >
                            <Calendar size={16} className="text-muted-foreground " />
                            {formatDate(cycle.startDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 justify-end">
                            <CalendarDays size={16} className="text-muted-foreground" />
                            {formatDate(cycle.endDate)}
                          </div>
                        </TableCell>
                        <TableCell style={{textAlign:'end'}}>
                          {cycle.initialMaleCount + cycle.initialFemaleCount} الكل
                          <div className="text-xs text-muted-foreground mt-1">
                            {cycle.initialMaleCount} ذكور, {cycle.initialFemaleCount} إاناث
                          </div>
                        </TableCell>
                        <TableCell style={{textAlign:'end'}}>
                          <Badge variant={cycle.status === 'active' ? 'default' : 'secondary'}>
                            {cycle.status === 'active' ? 'Active' : 'Completed'}
                          </Badge>
                        </TableCell>
                        <TableCell style={{textAlign:'end'}}>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/cycles/${cycle.id}`} className="flex items-center">
                              رؤية التفاصيل
                              <ChevronLeft size={16} className="ml-1" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

      </div>
      <Dialog open={addCycleDialog} onOpenChange={setAddCycleDialog}>
        <DialogContent className="sm:max-w-[600px]" >
          <DialogHeader style={{textAlign: "end"}}>
            <DialogTitle>إضافة دورة جديدة</DialogTitle>
            <DialogDescription>
              أضف دورة جديدة للمزرعة
            </DialogDescription>
          </DialogHeader>

          <Form {...form} >
            <form onSubmit={form.handleSubmit(handleSubmitSheep)} className="space-y-4"  dir={'rtl'}>
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <FormField control={form.control} name="cycleName"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>اسم الدورة</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال اسم الدورة الجديدة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>

                  <FormField control={form.control} name="cycleNumber"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>رقم الدورة</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال رقم الدورة الجديدة'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>

                </div>


                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <FormField control={form.control} name="femaleNum"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>عدد الإناث</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال عدد الإناث'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>

                  <FormField control={form.control} name="maleNum"  render={({ field }) => (
                      <FormItem style={{width:'45%'}}>
                        <FormLabel>عدد الذكور</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder={'الرجاء إدخال عدد الذكور'} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                  )}/>

                </div>

                <div style={{display:'flex', justifyContent:'space-between'}}>
                    <div className="items-center space-x-2 space-y-5">
                      <Checkbox id={`sheep-patient`}  checked={useTodayDate} onCheckedChange={(e) => setUseTodayDate(!useTodayDate)}/>
                      &nbsp;
                      <Label htmlFor={`sheep-patient`} className="flex-grow cursor-pointer">
                        استخدام تاريخ اليوم ؟
                      </Label>
                      {
                          !useTodayDate && (
                              <FormField control={form.control} name="startDate" render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>تاريخ بدية الدورة</FormLabel>
                                    <FormControl>
                                      <Input type="date" {...field} dir={'rtl'}/>
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                              )}
                              />
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
                <Button type="submit">
                  إضافة النعجة
                </Button>

                <Button type="button" variant="outline" onClick={() => {setAddCycleDialog(false);form.reset()}}>
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

export default CycleManagement;
