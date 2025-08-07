import {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import {Check, Calendar, Download, Filter, Plus, Search, CalendarCheck, CalendarPlus, Syringe, Heart, History} from 'lucide-react';
import {Button, Input, Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Checkbox, Label, Form, FormField, FormItem, FormLabel, FormControl, FormMessage, toast, Table, TableHeader, TableRow, TableHead, TableBody, TableCell,} from '@/components/ui';
import {useForm} from "react-hook-form";
import {Combobox} from "@/components/ui/combobox.tsx";
import {any} from "zod";
import * as React from "react";
import { formatDate } from "../utils/dateUtils";

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusClass = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'upcoming':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'healed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${getStatusClass()}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Treatment card component
const TreatmentCard = ({ treatment,allDrugs }: { treatment: any;allDrugs: any }) => {
  return (
        <Card dir={'rtl'}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">النعجة #{treatment.sheepNumber}</CardTitle>
              <StatusBadge status={'مريضة'} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المرض :</span>
                <span className="font-medium">{treatment?.latestPatient?.patientName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الدواء :</span>
                <span className="font-medium">
                  {
                    treatment?.latestPatient?.drugs
                        ?.filter(drug => drug.order === treatment?.latestPatient?.order)
                        .map(drugg => drugg?.drug?.[0]?.name)
                        .join(', ')
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">رقم الدواء :</span>
                <span className="font-medium">{treatment?.latestPatient?.drugs?.[treatment?.latestPatient?.drugs?.length - 1]?.order || 1}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">تاريخ المرض :</span>
                <span className="font-medium">
                  {formatDate(treatment?.latestPatient?.patientDate)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">تاريخ الشفاء المتوقع :</span>
                <span className="font-medium">
                   {formatDate(treatment?.latestPatient?.healingDate)}
                </span>
              </div>
              <div className="pt-2">
                    <ChangeMedicine id={treatment?.sheepId} allDrugs={allDrugs} />
              </div>
            </div>
          </CardContent>
        </Card>
  );
};

// Injection Modal Component
const NewInjectionModal = ({allSheep}) => {
  const [selectedSheep, setSelectedSheep] = useState<string[]>([]);
  const [selectedInjection, setSelectedInjection] = useState("");
  const [dueDate, setDueDate] = useState(() => {const today = new Date();return today.toISOString().split("T")[0];});
  const [notes, setNotes] = useState("");
  const [injectNumber, setInjectNumber] = useState("");
  const [allInjections,setAllInjections] = useState([]);
  const [useTodayDate,setTodayDate] = useState(true)
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const filteredInjection = allInjections.filter(injection => injection.section === 'sheep' && injection.type === "Injection")
  const token = localStorage.getItem("token");

  const selectedInjectionObj = filteredInjection?.find(
      (inj) => inj._id === selectedInjection
  );
  const handleSheepToggle = (sheepId: string) => {
    if (selectedSheep.includes(sheepId)) {
      setSelectedSheep(selectedSheep.filter(id => id !== sheepId));
    } else {
      setSelectedSheep([...selectedSheep, sheepId]);
    }
  };

  const filteredSheepMultiSelector = allSheep.filter((sheep) =>
      sheep.sheepNumber.toString().includes(searchTerm.trim()) && sheep.status === ''
  );
  const allSelected = filteredSheepMultiSelector.length > 0 && filteredSheepMultiSelector.every(sheep => selectedSheep.includes(sheep._id));
  const handleSelectAllToggle = () => {
    if (allSelected) {
      setSelectedSheep([]); // Deselect all
    } else {
      const allIds = filteredSheepMultiSelector.map(sheep => sheep._id);
      setSelectedSheep(allIds); // Select all
    }
  };
  useEffect(() => {
    const fetchInjections = async () => {
      try {
        const response = await fetch('https://thesheep.top/api/stock');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'فشل في جلب البيانات');
        }


        setAllInjections(result);

      } catch (error: any) {
        console.error('فشل في جلب الأدوية:', error);
      }
    }
    fetchInjections();

  }, []);
  console.log('allInjections : ', allInjections);

  const handleSubmitAddInject = async () => {
    try {
      const payload = {
        sheepId: selectedSheep, // Array of IDs
        injectionType: selectedInjection,
        numOfInject: selectedInjectionObj?.reputation === '6m' ? Number(injectNumber) : undefined,
        injectDate: useTodayDate ? new Date() : new Date(dueDate),
        notes,
      };
      console.log("payload is : ", payload)
      const response = await fetch('https://thesheep.top/api/injections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('فشل في إضافة الطعم');

      toast({ title: 'تمت إضافة الطعم بنجاح' });
      // Optional: Reset states
      setSelectedInjection('');
      setInjectNumber('');
      setSelectedSheep([]);
      setDueDate('');
      setNotes('');
      setTodayDate(true);
      setOpen(false);
    } catch (error) {
      toast({ title: 'حدث خطأ', description: String(error) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button asChild>
          <div className="flex items-center gap-1" style={{cursor:'pointer'}}>
            <Plus size={18} />
            <span>إضافة طعومات</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader style={{textAlign: "end"}}>
          <DialogTitle>إضافة طعم جديد</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-2" dir={'rtl'}>
          <div className="space-y-1">
            <Label htmlFor="injection-type">نوع الطعم</Label>
            <Combobox value={selectedInjection} onChange={setSelectedInjection}
                  options={filteredInjection.map((injection) => ({
                  label: injection.name,
                  value: injection._id,
                }))}
                placeholder="ابحث واختر نوع الطعم"
                dir="rtl"
            />
          </div>
          {/* Number Of Inject */}
              {
                selectedInjectionObj?.reputation === '6m' &&
                  (
                    <div className="space-y-1">
                      <Label htmlFor="injectNumber">رقم الجرعة</Label>
                      <Input
                          id="injectNumber"
                          placeholder="أدخل رقم الجرعة"
                          value={injectNumber}
                          onChange={(e) => setInjectNumber(e.target.value)}
                      />
                    </div>
                  )
             }
          {/* Sheep Selection */}
          <div className="space-y-2">
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <div>
                <Label>حدد النعجة</Label>
                <div className="mb-3" >
                  <Input type="text" style={{width:'100%'}}
                         placeholder="إبحث بواسطة الرقم"
                         value={searchTerm}
                         onChange={(e) =>
                         setSearchTerm(e.target.value)}
                         className="w-full md:w-1/2"
                  />
                </div>
              </div>
              <div>
                {/* Due Date */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id={`use-today-date`}  checked={useTodayDate} onCheckedChange={(e) => setTodayDate(!useTodayDate)}/>
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
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto p-2 border rounded-md">
              {/* Select All */}
              <div className="flex items-center space-x-2 border-b pb-2 mb-2">
                <Checkbox
                    id="select-all"
                    checked={allSelected}
                    onCheckedChange={handleSelectAllToggle}
                />
                <Label htmlFor="select-all" className="cursor-pointer">
                  &nbsp;تحديد الكل
                </Label>
              </div>

              {/* Individual Sheep */}
              {filteredSheepMultiSelector.map((sheep) => (
                  <div key={sheep._id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                    <Checkbox
                        id={`sheep-${sheep._id}`}
                        checked={selectedSheep.includes(sheep._id)}
                        onCheckedChange={() => handleSheepToggle(sheep._id)}
                    />
                    <Label htmlFor={`sheep-${sheep._id}`} className="flex-grow cursor-pointer">
                      &nbsp;# {sheep.sheepNumber}
                      {sheep.badgeColor && (
                          <span
                              className={`inline-block w-3 h-3 rounded-full ms-2 ${
                                  sheep.badgeColor === 'أحمر' ? 'bg-red-500' : 'bg-yellow-400'
                              }`}
                              title={`علامة ${sheep.badgeColor === 'أحمر' ? 'حمراء' : 'صفراء'}`}
                          />
                      )}
                    </Label>
                  </div>
              ))}
            </div>

            <div className="text-sm text-muted-foreground mt-1">
              {selectedSheep.length} الأغنام المحددة
            </div>
          </div>
          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">ملاحظات (إختياري)</Label>
            <Input id="notes" placeholder="معلومات إضافية عن الطعم" value={notes} onChange={(e) => setNotes(e.target.value)}/>
          </div>
          <div className="pt-4">
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmitAddInject}
            disabled={!selectedInjection || selectedSheep.length === 0 || (selectedInjectionObj?.reputation === '6m' && !injectNumber) }
          >
            <Syringe className="mr-1" size={16} />
              اضافة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Treatment Modal Component
const NewTreatmentModal = ({allDrugs,allSheep}) => {
  const [selectedSheep, setSelectedSheep] = useState<string[]>([]);
  const [drugList, setDrugList] = useState([{ drug: "", order: 1 }]);
  const [dueDate, setDueDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [notes, setNotes] = useState("");
  const [injectNumber, setInjectNumber] = useState("");
  const [useTodayDate,setTodayDate] = useState(true)
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const token = localStorage.getItem("token");

  const handleSheepToggle = (sheepId: string) => {
    if (selectedSheep.includes(sheepId)) {
      setSelectedSheep(selectedSheep.filter(id => id !== sheepId));
    } else {
      setSelectedSheep([...selectedSheep, sheepId]);
    }
  };
  const healthySheep = allSheep.filter(sheep => !sheep.isPatient && sheep.status === '')
  const filteredSheepMultiSelector = healthySheep.filter((sheep) =>
      sheep.sheepNumber.toString().includes(searchTerm.trim())
  );
  const handleSubmit = async () => {
    // Convert the drugList into valid drug entries
    const validDrugs = drugList
        .filter(entry => entry.drug && entry.order)
        .map(entry => ({
          drug: entry.drug,
          order: entry.order
        }));

    const payload = {
      sheepIds: selectedSheep,
      patientName: injectNumber,
      drugs: validDrugs,
      patientDate: useTodayDate ? new Date().toISOString() : dueDate,
      notes,
    };
    console.log("the payload is : ",  payload);
    try {
      const res = await fetch("https://thesheep.top/api/patient", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "فشل في إضافة الحالة المرضية");
      }

      toast({ title: 'تم إضافة الحالات المرضية بنجاح!' });

      // Reset form
      setSelectedSheep([]);
      setDrugList([{ drug: "", order: 1 }]);
      setDueDate(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
      });
      setNotes("");
      setInjectNumber("");
      setTodayDate(true);
      setOpen(false);

    } catch (error) {
      console.error("Error creating patient record:", error);
      toast({ title: 'حدث خطأ أثناء إضافة الحالات المرضية', description: String(error) });
    }
  };
  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button asChild>
            <div className="flex items-center gap-1" style={{cursor:'pointer'}}>
              <Plus size={18} />
              <span>إضافة حالات مرضية</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader style={{textAlign: "end"}}>
            <DialogTitle>إضافة حالات مرضية </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2" dir={'rtl'}>
            {/* Number Of Inject */}
            <div className="space-y-1">
                <Label htmlFor="injectNumber">إسم المرض</Label>
                <Input
                    id="injectNumber"
                    placeholder="الرجاء إدخال اسم المرض المصابين به"
                    value={injectNumber}
                    onChange={(e) => setInjectNumber(e.target.value)}
                />
              </div>

            {/* Given Drug */}
            <div className="space-y-1">
              <Label>الأدوية المعطاة</Label>
              {drugList.map((entry, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Combobox
                        value={entry.drug}
                        onChange={(value) => {
                          const updated = [...drugList];
                          updated[index].drug = value;
                          setDrugList(updated);
                        }}
                        options={allDrugs.map((drug) => ({
                          label: drug.name,
                          value: drug._id,
                        }))}
                        placeholder="حدد الدواء"
                        dir="rtl"
                    />
                    <Input
                        type="number"
                        min="1"
                        value={entry.order}
                        onChange={(e) => {
                          const updated = [...drugList];
                          updated[index].order = parseInt(e.target.value);
                          setDrugList(updated);
                        }}
                        placeholder="الترتيب"
                        className="w-20"
                    />
                    <Button variant="destructive" size="icon" onClick={() => {
                      const updated = drugList.filter((_, i) => i !== index);
                      setDrugList(updated);
                    }}>
                      ✕
                    </Button>
                  </div>
              ))}
              <Button type="button" onClick={() => setDrugList([...drugList, { drug: "", order: drugList.length + 1 }])}>
                + أضف دواء
              </Button>
            </div>



            {/* Due Date */}
            <div className="space-y-2">
              <div style={{display:'flex',justifyContent:'space-between'}}>
                <div>
                  <Label>حدد الأغنام المريضة</Label>
                  <div className="my-3">
                    <Input type="text" placeholder="إبحث بواسطة الرقم " value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{width:"100%"}} className="w-full md:w-1/2"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id={`use-today-date`}  checked={useTodayDate} onCheckedChange={(e) => setTodayDate(!useTodayDate)}/>
                    <Label htmlFor={`use-today-date`} className="flex-grow cursor-pointer">
                      &nbsp;إستخدام تاريخ اليوم
                    </Label>
                  </div>

                  {
                      !useTodayDate && (
                          <div className="space-y-2">
                            <Label htmlFor="due-date">تاريخ الإصابة بالمرض</Label>
                            <Input id="due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}/>
                          </div>
                      )
                  }
                </div>
              </div>

              {/* Sheep Selection */}
              <div className="max-h-40 overflow-y-auto p-2 border rounded-md">
                {filteredSheepMultiSelector.map((sheep) => (
                    <div key={sheep._id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                      <Checkbox id={`sheep-${sheep._id}`} checked={selectedSheep.includes(sheep._id)} onCheckedChange={() => handleSheepToggle(sheep._id)}/>
                      <Label htmlFor={`sheep-${sheep._id}`} className="flex-grow cursor-pointer">
                        &nbsp;# {sheep.sheepNumber}
                        {sheep.badgeColor && (
                            <span
                                className={`inline-block w-3 h-3 rounded-full ms-2 ${
                                    sheep.badgeColor === 'أحمر' ? 'bg-red-500' : 'bg-yellow-400'
                                }`}
                                title={`علامة ${sheep.badgeColor === 'red' ? 'حمراء' : 'صفراء'}`}
                            />
                        )}
                      </Label>
                    </div>
                ))}
              </div>

              <div className="text-sm text-muted-foreground mt-1">
                {selectedSheep.length} الأغنام المحددة
              </div>
            </div>
          </div >

          {/* Notes */}
          <div className="space-y-1" dir={'rtl'}>
            <Label htmlFor="notes">ملاحظات (إختياري)</Label>
            <Input
                id="notes"
                placeholder="معلومات إضافية عن المرض"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
          </div>


          <DialogFooter>
            <Button
                type="submit"
                onClick={handleSubmit}
                disabled={selectedSheep.length === 0 || !dueDate || !injectNumber}
            >
              <Syringe className="mr-1" size={16} />
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

// ChangeMedicine Modal Component
const ChangeMedicine = ({id,allDrugs}) => {

  const [medicineNumber, setMedicineNumber] = useState("");
  const [open, setOpen] = useState(false);
  const [drugList, setDrugList] = useState([{ drug: "", order: 2 }]);
  const token = localStorage.getItem("token");

  const handleSubmit = async () => {
    if (drugList.length === 0 || !medicineNumber) return;
    const validDrugs = drugList.filter(d => d.drug && d.order !== null);

    try {
      const response = await fetch(`https://thesheep.top/api/patient/add-drug/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          drugs: validDrugs,
          order: Number(medicineNumber),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'فشل في إضافة الدواء');
      }

      // Reset form
      setDrugList([{ drug: "", order: 2 }]);
      setMedicineNumber('');
      setOpen(false);

      // Optional: Show success message
      toast({ title: 'تمت إضافة الدواء بنجاح' });
      // Optional: trigger data refresh or close dialog if needed
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'حدث خطأ', description: String(error) });
    }
  };

  return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button asChild>
            <div className="flex items-center gap-1" style={{cursor:'pointer',width:'100%'}}>
              <span>تغيير الدواء</span>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader style={{textAlign:'end'}}>
            <DialogTitle>إضافة دواء جديد</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2" dir={'rtl'}>
            <div className="space-y-1">
              <Label>الأدوية المعطاة</Label>
              {drugList.map((entry, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Combobox
                        value={entry.drug}
                        onChange={(value) => {
                          const updated = [...drugList];
                          updated[index].drug = value;
                          setDrugList(updated);
                        }}
                        options={allDrugs.map((drug) => ({
                          label: drug.name,
                          value: drug._id,
                        }))}
                        placeholder="حدد الدواء"
                        dir="rtl"
                    />
                    <Input
                        type="number"
                        min="1"
                        value={entry.order}
                        onChange={(e) => {
                          const updated = [...drugList];
                          updated[index].order = parseInt(e.target.value);
                          setDrugList(updated);
                        }}
                        placeholder="الترتيب"
                        className="w-20"
                    />
                    <Button variant="destructive" size="icon" onClick={() => {
                      const updated = drugList.filter((_, i) => i !== index);
                      setDrugList(updated);
                    }}>
                      ✕
                    </Button>
                  </div>
              ))}
              <Button type="button" onClick={() => setDrugList([...drugList, { drug: "", order: drugList.length + 1 }])}>
                + أضف دواء
              </Button>
            </div>

            {/* Number Of Inject */}
            <div className="space-y-1">
              <Label htmlFor="injectNumber">ترتيب الدواء</Label>
              <Input
                  id="injectNumber"
                  placeholder="الرجاء إدخال ترتيب الدواء"
                  value={medicineNumber}
                  onChange={(e) => setMedicineNumber(e.target.value)}
              />
            </div>

          </div>

          <DialogFooter>
            <Button type="submit" onClick={handleSubmit} disabled={!medicineNumber}>
              <Syringe className="mr-1" size={16} />
              تغيير الدواء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}



const Medical = () => {
  const [activeTab, setActiveTab] = useState('injections');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [givenInjections,setGivenInjections] = useState([]);
  const [upcomingInjections,setUpcomingInjections] = useState([])
  const [sickSheep, setSickSheep] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allDrugs,setAllDrugs] = useState([])
  const [allSheep,setAllSheep] = useState([]);
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [injectDate, setInjectDate] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
  const filteredDrug = allDrugs.filter(drug => drug.section === 'sheep' && drug.type === "Medicine")
  const token = localStorage.getItem("token");

  //////////////// EDIT TASK \\\\\\\\\\\\\\
  const openDialogForTask = (task: any) => {
    setSelectedTaskId(task._id);
    setSelectedTaskTitle(task.title);
    setSelectedDate(task.dueDate?.slice(0, 10)); // format as YYYY-MM-DD
    setOpenEditDialog(true);
  };

  const handleUpdateTask = async () => {
    const success = await EditTask(selectedTaskId, selectedDate);
    if (success) {
      setOpenEditDialog(false);
      // refresh task list if needed
    }
  };

  const handleDeleteTask = async () => {
    const confirmed = window.confirm("هل أنت متأكد أنك تريد حذف هذه المهمة؟");
    if (!confirmed) return;

    const success = await EditTask(selectedTaskId, '', true);
    if (success) {
      setOpenEditDialog(false);
      // refresh task list if needed
    }
  };
  const EditTask = async (taskId: string, newDate?: string, deleteTask = false) => {
    try {
      let response;

      if (deleteTask) {
        response = await fetch(`https://thesheep.top/api/tasks/${taskId}`, {
          method: 'DELETE',
        });
      } else {
        response = await fetch(`https://thesheep.top/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dueDate: newDate }),
        });
      }

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "حدث خطأ");

      toast({
        title: deleteTask ? "تم الحذف" : "تم التحديث",
        description: data.message,
      });

      return true;
    } catch (error: any) {
      console.error("EditTask error:", error);
      toast({
        title: "خطأ",
        description: error.message || "فشل في العملية",
        variant: "destructive",
      });
      return false;
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
      } catch (error: any) {
        console.error('فشل في جلب النعاج:', error);
      }
    };
    fetchSheep();
  }, []);
  useEffect(() => {
    if(activeTab === 'sicks') {
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
      const fetchLatestPatients = async () => {
        setLoading(true)
        try {
          const res = await fetch('https://thesheep.top/api/sheep/latest-patient-cases');
          const data = await res.json();
          setSickSheep(data);
        } catch (err) {
          console.error('Failed to fetch latest patient cases', err);
        } finally {
          setLoading(false);
        }
      };
      fetchDrug();
      fetchLatestPatients();
    }
    else if(activeTab === 'injections') {
      const fetchGivenInjections = async () => {
        try {
          const res = await fetch('https://thesheep.top/api/injections');
          const data = await res.json();
          setGivenInjections(data); // Save to state
        } catch (err) {
          console.error('Error loading given injections:', err);
        }
      };
      const fetchCommingInjections = async () => {
        try {
          const res = await fetch('https://thesheep.top/api/tasks/injections-tasks');
          const data = await res.json();
          setUpcomingInjections(data);
        } catch (err) {
          console.error('Error loading upcoming injections:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchGivenInjections();
      fetchCommingInjections();
    }
  }, [activeTab]);

  if (loading)
    return <div className="p-6 text-center">جارٍ تحميل البيانات...</div>;

  const markTaskAsCompleted = async (taskId) => {
    try {
      const res = await fetch(`https://thesheep.top/api/tasks/${taskId}/complete`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {

        toast({
          title: "تمت المهمة ✅",
          description: "تم تحديث حالة المهمة إلى مكتملة بنجاح.",
          duration: 3000,
        });
      } else {
        toast({
          title: "حدث خطأ",
          description: "فشل في تحديث حالة المهمة.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ في الاتصال",
        description: "تعذر الاتصال بالخادم.",
        variant: "destructive",
      });
    }
  };

  const handleTaskCompletion = (task) => {
    console.log("task", task);
    if (["إسفنجة", "اعطاء الهرمون"].includes(task.title)) {
      setCurrentTask(task);
      setOpenDateDialog(true);
    }
    else {
      markTaskAsCompleted(task._id);
    }
  };
  const handleInjectConfirmation = async () => {
    const date = new Date(injectDate);
    const taskTitle = currentTask.title;

    // 1. Mark current task as completed
    await markTaskAsCompleted(currentTask._id);

    // 2. Prepare new task
    let newTask = null;
    if (taskTitle === "إسفنجة") {
      date.setDate(date.getDate() + 12);
      newTask = {
        title: "اعطاء الهرمون",
        dueDate: date,
        sheepIds: currentTask.sheepIds,
        type: "injection",
      };
    } else if (taskTitle === "اعطاء الهرمون") {
      date.setDate(date.getDate() + 30);
      newTask = {
        title: "فحص الحمل",
        dueDate: date,
        sheepIds: currentTask.sheepIds,
        type: "pregnancy-check",
      };
    }

    if (newTask) {
      try {
        await fetch("https://thesheep.top/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newTask),
        });
        toast({ title: "تم إنشاء مهمة جديدة بنجاح" });
      } catch (error) {
        toast({
          title: "فشل في إنشاء المهمة الجديدة",
          variant: "destructive",
        });
      }
    }
  };

  return (
      <div className="p-6 space-y-6 animate-fade-in">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold tracking-tight">الإدارة الطبية</h1>
          <div className="flex items-center gap-2">
            {activeTab === 'injections'
                ? <NewInjectionModal allSheep={allSheep} />
                : <NewTreatmentModal allSheep={allSheep} allDrugs={filteredDrug} />}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="injections">الطعومات</TabsTrigger>
            <TabsTrigger value="sicks">الأمراض</TabsTrigger>
          </TabsList>
          {activeTab === 'sicks' &&
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="ابحث عن اغنام بواسطة الرقم..." className="pl-8" value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}/>
                </div>

              </div>}
          <TabsContent value="injections">
            <Card dir={'rtl'}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <Heart size={18} />
                  <span>الطعومات القادمة</span>
                </CardTitle>
                <CardDescription style={{fontWeight:'bold'}}>سجل الطعومات القادمة للطعومات التي يجب اعطاؤها</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {upcomingInjections.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{textAlign:"start"}}>التاريخ</TableHead>
                          <TableHead style={{textAlign:"start"}}>الطعم</TableHead>
                          <TableHead style={{textAlign:"start"}}>الملاحظات</TableHead>
                          <TableHead style={{textAlign:"start"}}>قائمة الاغنام</TableHead>
                          <TableHead style={{textAlign:"start"}}>الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingInjections.map((event) => (
                            <TableRow key={event._id}>
                              <TableCell className={`p-1`}>
                                {event.dueDate ? formatDate(event.dueDate) : "غير متوفر"}
                              </TableCell>
                              <TableCell className={`p-1`}>{event.title}</TableCell>
                              <TableCell className={`p-1`}>{event.notes || 'لا يوجد ملاحظات'}</TableCell>
                              <TableCell className={`p-1`}
                                         style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                         title={event?.sheepIds?.map((sheep) => sheep.sheepNumber).join(', ')}>
                                {event?.sheepIds?.map((sheep) => sheep.sheepNumber).join(', ')}
                              </TableCell>
                              <TableCell className={`px-1`}>
                                <div className={'flex gap-2'}>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => openDialogForTask(event)}
                                  >
                                    تعديل
                                  </Button>
                                  <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleTaskCompletion(event)}
                                  >
                                    ✅ تم
                                  </Button>
                                </div>

                              </TableCell>
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
            <br />
            <Card dir={'rtl'}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2">
                  <span>تاريخ الطعومات</span>
                </CardTitle>
                <CardDescription style={{fontWeight:'bold'}}>سجل الطعومات الكامل للطعومات التي تم اعطاؤها</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {givenInjections.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead style={{textAlign:"start"}}>التاريخ</TableHead>
                          <TableHead style={{textAlign:"start"}}>نوع الطعم</TableHead>
                          <TableHead style={{textAlign:"start"}}>الجرعة</TableHead>
                          <TableHead style={{textAlign:"start"}}>الملاحظات</TableHead>
                          <TableHead style={{textAlign:"start"}}>قائمة الاغنام</TableHead>
                          <TableHead style={{textAlign:"start"}}>الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {givenInjections?.map((event) => (
                            <TableRow key={event._id}>
                              <TableCell>
                                {event.injectDate ? formatDate(event.injectDate) : "غير متوفر"}
                              </TableCell>
                              <TableCell>
                                {event?.injectionType?.name}
                              </TableCell>
                              <TableCell>
                                {event.numOfInject === 1 ? 'جرعة اولى' : "جرعة ثانية"}
                              </TableCell>
                              <TableCell>{event.notes}</TableCell>
                              <TableCell
                                  style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                  title={event?.sheepId?.map((sheep) => sheep.sheepNumber).join(', ')}>
                                {event?.sheepId?.map((sheep) => sheep.sheepNumber).join(', ')}
                              </TableCell>
                              <TableCell>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDialogForTask(event)}
                                >
                                  تعديل
                                </Button>
                              </TableCell>
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
          </TabsContent>
          <TabsContent value="sicks">
            {sickSheep.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sickSheep
                      .filter(sheep => sheep?.sheepNumber?.toString().includes(searchQuery))
                      .map((treatment) => {
                        console.log("treatment is :", treatment)
                        return (
                            <TreatmentCard key={treatment._id} treatment={treatment} allDrugs={filteredDrug} />
                        )
                      })}
                </div>
            ) : (
                <div className="py-12 text-center">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">لم يتم العثور على علاجات</h3>
                  <p className="text-muted-foreground mt-2">
                    لا توجد علاجات تتطابق مع معايير البحث أو التصفية الحالية الخاصة بك.
                  </p>
                  <Button variant="outline" className="mt-4"
                          onClick={() => {
                            setSearchQuery('');
                            setFilterStatus('all');
                          }}
                  >
                    إعادة الفلاتر
                  </Button>
                </div>
            )}
          </TabsContent>
        </Tabs>

        {openDateDialog && (
            <Dialog open={openDateDialog} onOpenChange={setOpenDateDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle style={{textAlign:'end'}}>أدخل تاريخ إعطاء {currentTask.title}</DialogTitle>
                </DialogHeader>
                <Input
                    type="date"
                    value={injectDate}
                    onChange={(e) => setInjectDate(e.target.value)}
                />
                <Button
                    onClick={async () => {
                      await handleInjectConfirmation();
                      setOpenDateDialog(false);
                    }}
                >
                  تأكيد
                </Button>
              </DialogContent>
            </Dialog>
        )}
        {openEditDialog && (
            <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle style={{textAlign:'end'}}>تعديل مهمة - {selectedTaskTitle}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                  />

                  <div className="flex justify-between gap-2">
                    <Button className="w-full" onClick={handleUpdateTask}>
                      تحديث التاريخ
                    </Button>
                    <Button variant="destructive" className="w-full" onClick={handleDeleteTask}>
                      حذف المهمة
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
        )}

      </div>
  );
};

export default Medical;
