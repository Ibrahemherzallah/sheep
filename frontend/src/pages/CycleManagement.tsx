import {useEffect, useState} from 'react';
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


interface CycleFormData {
  cycleName: string ;
  cycleNumber: number ;
  maleNum: number ;
  femaleNum: number ;
  startDate: string ;
  notes: string
}




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
  const [cycles, setCycles] = useState([]);
  const [allCycles, setAllCycles] = useState([]);


  interface AddCycleData {
    cycleName: string;
    cycleNumber: number;
    femaleNum: number;
    maleNum: number;
    startDate: string;
    notes: string;
  }

  const form = useForm<AddCycleData>({
    defaultValues: {
      cycleName: "",
      cycleNumber: 0,
      maleNum: 0,
      femaleNum: 0,
      startDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB'); // e.g., 26/05/2025
  };
  const handleSubmitSheep = async (data: AddCycleData) => {
    if (useTodayDate) {
      data.startDate = new Date().toISOString().split("T")[0];
    }

    const start = new Date(data.startDate!);
    const expectedEndDate = new Date(start);
    expectedEndDate.setMonth(expectedEndDate.getMonth() + 6);

    const payload = {
      name: data.cycleName,
      number: data.cycleNumber,
      status: "نشطة", // Automatically set to active
      numOfMale: data.maleNum,
      numOfFemale: data.femaleNum,
      startDate: data.startDate,
      expectedEndDate: expectedEndDate.toISOString().split("T")[0],
      notes: data.notes || "",
    };

    console.log("Sending payload:", payload);

    try {
      const response = await fetch("http://localhost:3030/api/cycle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to add cycle");
      }

      const result = await response.json();
      console.log("Cycle added:", result);

      hotToast({
        title: "الدورة أضيفت",
        description: `تمت اضافة الدورة بنجاح.`,
      });

      setAddCycleDialog(false);
      form.reset();
    } catch (error) {
      console.error("Error adding cycle:", error);
      hotToast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الدورة.",
      });
    }
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


  useEffect(() => {
    const fetchCycles = async () => {
      try {
        const response = await fetch('http://localhost:3030/api/cycle');
        const data = await response.json();
        setAllCycles(data);
        setCycles(data); // Default to all
      } catch (error) {
        console.error('Failed to fetch cycles:', error);
      }
    };

    fetchCycles();
  }, []);
  useEffect(() => {
    switch (activeTab) {
      case 'all':
        setCycles(allCycles);
        break;
      case 'active':
        setCycles(allCycles.filter(cycle => cycle.status === 'نشطة'));
        break;
      case 'completed':
        setCycles(allCycles.filter(cycle => cycle.status === 'منتهية'));
        break;
      default:
        setCycles(allCycles);
    }
  }, [activeTab, allCycles]);

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
          <TabsTrigger value="all">كل الدورات</TabsTrigger>
          <TabsTrigger value="active">النشطة</TabsTrigger>
          <TabsTrigger value="completed">المنتهية</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <div className="col-span-1 md:col-span-3">
          <Card >
            <CardHeader className="pb-5" dir={'rtl'}>
              <CardTitle>الدورات</CardTitle>
            </CardHeader>
            <CardContent>
              <Table dir={'rtl'}>
                <TableHeader>
                  <TableRow>
                    <TableHead>إسم الدورة</TableHead>
                    <TableHead>تاريخ البداية</TableHead>
                    <TableHead>تاريخ النهاية</TableHead>
                    <TableHead>عدد الاغنام</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الأحداث</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cycles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        لا يوجد دوارت
                      </TableCell>
                    </TableRow>
                  ) : (
                      cycles.map((cycle) => (
                      <TableRow key={cycle._id}>
                        <TableCell className="font-medium" style={{textAlign:'end'}}>{cycle.name}</TableCell>
                        <TableCell>

                          <div className="flex items-center gap-2 justify-end" >
                            <Calendar size={16} className="text-muted-foreground " />
                            {formatDate(cycle.startDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2">
                              <CalendarDays size={16} className="text-muted-foreground" />
                              <span>
                                {formatDate(cycle.endDate || cycle.expectedEndDate)}
                              </span>
                            </div>
                            {!cycle.endDate && (
                                <span className="text-xs text-muted-foreground">(تاريخ نهاية متوقعة)</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell style={{textAlign:'end'}}>
                          {cycle.numOfMale + cycle.numOfFemale} الكل
                          <div className="text-xs text-muted-foreground mt-1">
                            {cycle.numOfMale} ذكور, {cycle.numOfFemale} إاناث
                          </div>
                        </TableCell>
                        <TableCell style={{textAlign:'end'}}>
                          <Badge variant={cycle.status === 'نشطة' ? 'default' : 'secondary'}>
                            {cycle.status}
                          </Badge>
                        </TableCell>
                        <TableCell style={{textAlign:'end'}}>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/cycles/${cycle._id}`} className="flex items-center">
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
                <Button type="submit" disabled={!form.watch("cycleName") || !form.watch("cycleNumber") || !form.watch("femaleNum") || !form.watch("maleNum")}>
                  إضافة الدورة
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
