import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Calendar,
  Download,
  Filter,
  Plus,
  Search,
  CalendarCheck,
  CalendarPlus,
  Syringe,
  Heart, History
} from 'lucide-react';
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Checkbox,
  Label,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  toast,
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody, TableCell,
} from '@/components/ui';
import {useForm} from "react-hook-form";

// Mock data for injections
const injectionsData = [
  { id: '101', sheepId: '1001', type: 'routine', status: 'completed', dueDate: '2025-04-30', completedDate: '2025-04-28' },
  { id: '102', sheepId: '1002', type: 'routine', status: 'overdue', dueDate: '2025-05-01', completedDate: null },
  { id: '103', sheepId: '1003', type: 'birth-first', status: 'upcoming', dueDate: '2025-05-10', completedDate: null },
  { id: '104', sheepId: '1004', type: 'birth-second', status: 'upcoming', dueDate: '2025-05-15', completedDate: null },
  { id: '105', sheepId: '1005', type: 'routine', status: 'upcoming', dueDate: '2025-05-20', completedDate: null },
  { id: '106', sheepId: '1006', type: 'routine', status: 'upcoming', dueDate: '2025-06-01', completedDate: null },
];

// Mock data for treatments
const treatmentsData = [
  { id: '201', sheepId: '1003', disease: 'الرشح', medicine: 'Antibiotics A', status: 'active', startDate: '2025-05-02', expectedHealDate: '2025-05-07' },
  { id: '202', sheepId: '1002', disease: 'الرشح', medicine: 'Antibiotics B', status: 'healed', startDate: '2025-04-20', expectedHealDate: '2025-04-25' },
  { id: '203', sheepId: '1005', disease: 'الرشح', medicine: 'Anti-parasite', status: 'healed', startDate: '2025-04-15', expectedHealDate: '2025-04-20' },
];

// Mock data for available sheep
const sheepData = [
  { id: '1001', number:'1001', name: 'Sheep #1001' },
  { id: '1002', number:'1002', name: 'Sheep #1002' },
  { id: '1003', number:'1003', name: 'Sheep #1003' },
  { id: '1004', number:'1004', name: 'Sheep #1004' },
  { id: '1005', number:'1005', name: 'Sheep #1005' },
  { id: '1006', number:'1006', name: 'Sheep #1006' },
  { id: '1007', number:'1007', name: 'Sheep #1007' },
  { id: '1008', number:'1008', name: 'Sheep #1008' },

];


// Mock data for injection types
const injectionTypes = [
  { id: 'routine', name: 'Routine (6-month)' },
  { id: 'birth-first', name: 'Post-birth (1st)' },
  { id: 'birth-second', name: 'Post-birth (2nd)' },
  { id: 'antibiotic-a', name: 'Antibiotic A' },
  { id: 'antibiotic-b', name: 'Antibiotic B' },
  { id: 'vitamin-complex', name: 'Vitamin Complex' },
  { id: 'parasite', name: 'Anti-parasite' },
];


// Status badge component
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

// Injection card component
const InjectionCard = ({ injection }: { injection: typeof injectionsData[0] }) => {
  const getInjectionTypeLabel = (type: string) => {
    switch (type) {
      case 'routine':
        return 'Routine (6-month)';
      case 'birth-first':
        return 'Post-birth (1st)';
      case 'birth-second':
        return 'Post-birth (2nd)';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Sheep #{injection.sheepId}</CardTitle>
          <StatusBadge status={injection.status} />
        </div>
        <CardDescription>{getInjectionTypeLabel(injection.type)} Injection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Due Date:</span>
            <span className="font-medium">{injection.dueDate}</span>
          </div>
          {injection.completedDate && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Completed:</span>
              <span className="font-medium">{injection.completedDate}</span>
            </div>
          )}
          <div className="pt-2">
            {injection.status === 'upcoming' || injection.status === 'overdue' ? (
              <Button size="sm" className="w-full gap-1">
                <Check size={16} />
                <span>Mark as Completed</span>
              </Button>
            ) : injection.status === 'completed' ? (
              <Button variant="outline" size="sm" className="w-full gap-1">
                <CalendarCheck size={16} />
                <span>View Details</span>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Treatment card component
const TreatmentCard = ({ treatment }: { treatment: typeof treatmentsData[0] }) => {
  const [openChangeMedicineDialog,setOpenChangeMedicineDialog] = useState(false);
  return (
        <Card dir={'rtl'}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">النعجة #{treatment.sheepId}</CardTitle>
              <StatusBadge status={'مريضة'} />
            </div>
            <CardDescription> علاج&nbsp;{treatment.disease}  </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الدواء :</span>
                <span className="font-medium">{treatment.medicine}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">رقم الدواء :</span>
                <span className="font-medium">1</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">تاريخ المرض :</span>
                <span className="font-medium">{treatment.startDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">تاريخ الشفاء المتوقع :</span>
                <span className="font-medium">{treatment.expectedHealDate}</span>
              </div>
              <div className="pt-2">
                    <ChangeMedicine />
              </div>
            </div>
          </CardContent>
        </Card>
  );
};

// Treatment Modal Component
const NewInjectionModal = () => {
  const [selectedSheep, setSelectedSheep] = useState<string[]>([]);
  const [selectedInjection, setSelectedInjection] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [injectNumber, setInjectNumber] = useState("");
  const handleSheepToggle = (sheepId: string) => {
    if (selectedSheep.includes(sheepId)) {
      setSelectedSheep(selectedSheep.filter(id => id !== sheepId));
    } else {
      setSelectedSheep([...selectedSheep, sheepId]);
    }
  };

  const handleSubmit = () => {
    // Reset form after submission
    setSelectedSheep([]);
    setSelectedInjection("");
    setDueDate("");
    setNotes("");
  };
  const [useTodayDate,setTodayDate] = useState(true)
  const [searchTerm, setSearchTerm] = useState('');
  const filteredSheepMultiSelector = sheepData.filter((sheep) =>
      sheep.number.toString().includes(searchTerm.trim())
  );
  return (
    <Dialog>
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
            <Select value={selectedInjection} onValueChange={setSelectedInjection} dir={'rtl'}>
              <SelectTrigger id="injection-type">
                <SelectValue placeholder="حدد نوع الطعم" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {injectionTypes.map((injection) => (
                    <SelectItem key={injection.id} value={injection.id}>
                      {injection.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {/* Number Of Inject */}
          <div className="space-y-1">
            <Label htmlFor="injectNumber">رقم الجرعة</Label>
            <Input
                id="injectNumber"
                placeholder="يظهر فقط اذا كان الطعم ذو جرعتين"
                value={injectNumber}
                onChange={(e) => setInjectNumber(e.target.value)}
            />
          </div>




          {/* Sheep Selection */}
          <div className="space-y-2">
            <div style={{display: "flex", justifyContent: "space-between"}}>
              <div>
                <Label>حدد النعجة</Label>
                <div className="mb-3" >
                  <Input type="text" style={{width:'100%'}} placeholder="إبحث بواسطة الرقم" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full md:w-1/2"/>
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
              {filteredSheepMultiSelector.map((sheep) => (
                <div key={sheep.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                  <Checkbox id={`sheep-${sheep.id}`} checked={selectedSheep.includes(sheep.id)} onCheckedChange={() => handleSheepToggle(sheep.id)}/>
                  <Label htmlFor={`sheep-${sheep.id}`} className="flex-grow cursor-pointer">
                    {sheep.name}
                  </Label>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {selectedSheep.length} sheep selected
            </div>
          </div>
          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">ملاحظات (إختياري)</Label>
            <Input
                id="notes"
                placeholder="معلومات إضافية عن الطعم"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!selectedInjection || selectedSheep.length === 0 || !dueDate}
          >
            <Syringe className="mr-1" size={16} />
              اضافة
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
const NewTreatmentModal = () => {
  const [selectedSheep, setSelectedSheep] = useState<string[]>([]);
  const [selectedInjection, setSelectedInjection] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [injectNumber, setInjectNumber] = useState("");
  const handleSheepToggle = (sheepId: string) => {
    if (selectedSheep.includes(sheepId)) {
      setSelectedSheep(selectedSheep.filter(id => id !== sheepId));
    } else {
      setSelectedSheep([...selectedSheep, sheepId]);
    }
  };

  const handleSubmit = () => {
    // Reset form after submission
    setSelectedSheep([]);
    setSelectedInjection("");
    setDueDate("");
    setNotes("");
  };
  const [useTodayDate,setTodayDate] = useState(true)
  const [searchTerm, setSearchTerm] = useState('');
  const filteredSheepMultiSelector = sheepData.filter((sheep) =>
      sheep.number.toString().includes(searchTerm.trim())
  );
  return (
      <Dialog>
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
              <div className="space-y-1" >
                <Label htmlFor="injection-type">الدواء المعطى</Label>
                <Select value={selectedInjection} onValueChange={setSelectedInjection} dir={'rtl'}>
                  <SelectTrigger id="injection-type">
                    <SelectValue placeholder="حدد الدواء المعطى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {injectionTypes.map((injection) => (
                          <SelectItem key={injection.id} value={injection.id}>
                            {injection.name}
                          </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>


            {/* Due Date */}



            {/* Sheep Selection */}
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

              <div className="max-h-40 overflow-y-auto p-2 border rounded-md">
                {filteredSheepMultiSelector.map((sheep) => (
                    <div key={sheep.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                      <Checkbox id={`sheep-${sheep.id}`} checked={selectedSheep.includes(sheep.id)} onCheckedChange={() => handleSheepToggle(sheep.id)}/>
                      <Label htmlFor={`sheep-${sheep.id}`} className="flex-grow cursor-pointer">
                        {sheep.name}
                      </Label>
                    </div>
                ))}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {selectedSheep.length} sheep selected
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
                disabled={!selectedInjection || selectedSheep.length === 0 || !dueDate}
            >
              <Syringe className="mr-1" size={16} />
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
};

const ChangeMedicine = () => {

  const [newMedicine, setNewMedicine] = useState("");
  const [medicineNumber, setMedicineNumber] = useState("");

  const handleSubmit = () => {
    setNewMedicine("");
    setMedicineNumber("");
  };

  return (
      <Dialog>
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
              <Label htmlFor="injection-type">الدواء الجديد</Label>
              <Select value={newMedicine} onValueChange={setNewMedicine} dir={'rtl'}>
                <SelectTrigger id="injection-type">
                  <SelectValue placeholder="حدد الدواء المعطى" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {injectionTypes.map((injection) => (
                        <SelectItem key={injection.id} value={injection.id}>
                          {injection.name}
                        </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {/* Number Of Inject */}
            <div className="space-y-1">
              <Label htmlFor="injectNumber">ترتيب الدواء</Label>
              <Input
                  id="injectNumber"
                  placeholder="الرجاء إدخال اسم المرض المصابين به"
                  value={medicineNumber}
                  onChange={(e) => setMedicineNumber(e.target.value)}
              />
            </div>

          </div>

          <DialogFooter>
            <Button type="submit" onClick={handleSubmit} disabled={!newMedicine ||  !medicineNumber}>
              <Syringe className="mr-1" size={16} />
              تغيير الدواء
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  )
}


const sheepMedicalHistory = [
  { id: 'm1', sheepId: '1001', type: 'routine-injection', date: '2024-01-15', description: 'Semi-annual routine injection', notes: 'No adverse reactions' },
  { id: 'm2', sheepId: '1001', type: 'vitamin', date: '2024-02-20', vitaminId: 'v1', vitaminName: 'Vitamin B Complex', notes: 'Administered during weekly check' },
  { id: 'm3', sheepId: '1001', type: 'disease', date: '2024-03-05', diseaseId: 'd1', diseaseName: 'Mild fever', notes: 'Observed lethargy, treated immediately' },
  { id: 'm4', sheepId: '1001', type: 'medication', date: '2024-03-05', medicineId: 'med1', medicineName: 'Antibiotics', notes: 'For fever treatment' },
];

const Medical = () => {
  const [activeTab, setActiveTab] = useState('injections');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');


  // Filter injections based on search and status
  const filteredInjections = injectionsData.filter(injection => {
    if (filterStatus !== 'all' && injection.status !== filterStatus) return false;
    if (searchQuery) {
      return injection.sheepId.includes(searchQuery);
    }
    return true;
  });

  // Filter treatments based on search and status
  const filteredTreatments = treatmentsData.filter(treatment => {
    if (filterStatus !== 'all' && treatment.status !== filterStatus) return false;
    if (searchQuery) {
      return treatment.sheepId.includes(searchQuery);
    }
    return true;
  });



  return (
    <div className="flex-1 space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">الإدارة الطبية</h1>
        <div className="flex items-center gap-2">
          {
            activeTab === 'injections' ?
            <NewInjectionModal /> : <NewTreatmentModal />
          }

        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="injections">الطعومات</TabsTrigger>
          <TabsTrigger value="sicks">الأمراض</TabsTrigger>
        </TabsList>

        {
          activeTab === 'sicks' &&
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by sheep ID..." className="pl-8" value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}/>
              </div>
            </div>
        }

        
        <TabsContent value="injections">

          <Card dir={'rtl'}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span>الطعومات القادمة</span>
              </CardTitle>
              <CardDescription style={{fontWeight:'bold'}}>سجل الطعومات القادمة للطعومات التي يجب اعطاؤها</CardDescription>
            </CardHeader>
            <CardContent>
              {sheepMedicalHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead style={{textAlign:"start"}}>التاريخ</TableHead>
                        <TableHead style={{textAlign:"start"}}>نوع الطعم</TableHead>
                        <TableHead style={{textAlign:"start"}}>الجرعة</TableHead>
                        <TableHead style={{textAlign:"start"}}>قائمة الاغنام</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sheepMedicalHistory.map((event) => (
                          <TableRow key={event.id}>
                            <TableCell>{event.date}</TableCell>
                            <TableCell>
                              اسفنجة
                            </TableCell>
                            <TableCell>
                              جرعة ثانية
                            </TableCell>
                            <TableCell style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis'}} title={'1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45,1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45,1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45'}>1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45,1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45,1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45</TableCell>
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

          <br />
          <Card dir={'rtl'}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <span>تاريخ الطعومات</span>
              </CardTitle>
              <CardDescription style={{fontWeight:'bold'}}>سجل الطعومات الكامل للطعومات التي تم اعطاؤها</CardDescription>
            </CardHeader>
            <CardContent>
              {sheepMedicalHistory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead style={{textAlign:"start"}}>التاريخ</TableHead>
                        <TableHead style={{textAlign:"start"}}>نوع الطعم</TableHead>
                        <TableHead style={{textAlign:"start"}}>الجرعة</TableHead>
                        <TableHead style={{textAlign:"start"}}>الملاحظات</TableHead>
                        <TableHead style={{textAlign:"start"}}>قائمة الاغنام</TableHead>
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
                            <TableCell style={{maxWidth:'200px',overflow:'hidden',textOverflow:'ellipsis'}}>تم العلاج من المرة الاولى</TableCell>
                            <TableCell style={{maxWidth:'300px',overflow:'hidden',textOverflow:'ellipsis'}} title={'1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45,1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45,1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45'}>1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45,1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45,1,2,3,4,5,6,7,78,5,4,21,23,56,33,2,45</TableCell>
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
        </TabsContent>
        <TabsContent value="sicks">
          {filteredTreatments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTreatments.map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No treatments found</h3>
              <p className="text-muted-foreground mt-2">
                No treatments match your current search or filter criteria.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
              >
                Reset filters
              </Button>
            </div>
          )}
        </TabsContent>
        
      </Tabs>

    </div>
  );
};

export default Medical;
