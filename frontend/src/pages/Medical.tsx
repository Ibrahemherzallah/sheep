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
  Syringe
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
} from '@/components/ui';

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
  { id: '201', sheepId: '1003', disease: 'Foot Rot', medicine: 'Antibiotics A', status: 'active', startDate: '2025-05-02', expectedHealDate: '2025-05-07' },
  { id: '202', sheepId: '1002', disease: 'Respiratory Infection', medicine: 'Antibiotics B', status: 'healed', startDate: '2025-04-20', expectedHealDate: '2025-04-25' },
  { id: '203', sheepId: '1005', disease: 'Parasite', medicine: 'Anti-parasite', status: 'healed', startDate: '2025-04-15', expectedHealDate: '2025-04-20' },
];

// Mock data for available sheep
const sheepData = [
  { id: '1001', name: 'Sheep #1001' },
  { id: '1002', name: 'Sheep #1002' },
  { id: '1003', name: 'Sheep #1003' },
  { id: '1004', name: 'Sheep #1004' },
  { id: '1005', name: 'Sheep #1005' },
  { id: '1006', name: 'Sheep #1006' },
  { id: '1007', name: 'Sheep #1007' },
  { id: '1008', name: 'Sheep #1008' },
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
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Sheep #{treatment.sheepId}</CardTitle>
          <StatusBadge status={treatment.status} />
        </div>
        <CardDescription>{treatment.disease} Treatment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Medicine:</span>
            <span className="font-medium">{treatment.medicine}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Start Date:</span>
            <span className="font-medium">{treatment.startDate}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Expected Heal:</span>
            <span className="font-medium">{treatment.expectedHealDate}</span>
          </div>
          <div className="pt-2">
            {treatment.status === 'active' ? (
              <Button size="sm" className="w-full gap-1">
                <Check size={16} />
                <span>Mark as Healed</span>
              </Button>
            ) : (
              <Button variant="outline" size="sm" className="w-full gap-1">
                <Calendar size={16} />
                <span>View History</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Treatment Modal Component
const NewTreatmentModal = () => {
  const [selectedSheep, setSelectedSheep] = useState<string[]>([]);
  const [selectedInjection, setSelectedInjection] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSheepToggle = (sheepId: string) => {
    if (selectedSheep.includes(sheepId)) {
      setSelectedSheep(selectedSheep.filter(id => id !== sheepId));
    } else {
      setSelectedSheep([...selectedSheep, sheepId]);
    }
  };

  const handleSubmit = () => {
    // Here you would handle the form submission
    console.log({
      selectedSheep,
      selectedInjection,
      dueDate,
      notes
    });
    
    // Reset form after submission
    setSelectedSheep([]);
    setSelectedInjection("");
    setDueDate("");
    setNotes("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button asChild>
          <div className="flex items-center gap-1">
            <Plus size={18} />
            <span>New Treatment</span>
          </div>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Treatment</DialogTitle>
          <DialogDescription>
            Select sheep and injection details for the new treatment
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Injection Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="injection-type">Injection Type</Label>
            <Select 
              value={selectedInjection} 
              onValueChange={setSelectedInjection}
            >
              <SelectTrigger id="injection-type">
                <SelectValue placeholder="Select an injection type" />
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
          <div className="space-y-2">
            <Label htmlFor="due-date">Due Date</Label>
            <Input 
              id="due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input 
              id="notes"
              placeholder="Additional notes about this treatment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          
          {/* Sheep Selection */}
          <div className="space-y-2">
            <Label>Select Sheep</Label>
            <div className="max-h-60 overflow-y-auto p-2 border rounded-md">
              {sheepData.map((sheep) => (
                <div key={sheep.id} className="flex items-center space-x-2 py-2 border-b last:border-0">
                  <Checkbox 
                    id={`sheep-${sheep.id}`}
                    checked={selectedSheep.includes(sheep.id)}
                    onCheckedChange={() => handleSheepToggle(sheep.id)}
                  />
                  <Label 
                    htmlFor={`sheep-${sheep.id}`}
                    className="flex-grow cursor-pointer"
                  >
                    {sheep.name}
                  </Label>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {selectedSheep.length} sheep selected
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={!selectedInjection || selectedSheep.length === 0 || !dueDate}
          >
            <Syringe className="mr-1" size={16} />
            Add Treatment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
        <h1 className="text-2xl font-bold tracking-tight">Medical Tracking</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1">
            <Download size={18} />
            <span>Export</span>
          </Button>
          <NewTreatmentModal />
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="injections">Injections</TabsTrigger>
          <TabsTrigger value="treatments">Treatments</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
        </TabsList>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by sheep ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 items-center">
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Filter size={18} />
            </Button>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="healed">Healed</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="injections">
          {filteredInjections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredInjections.map((injection) => (
                <InjectionCard key={injection.id} injection={injection} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                <CalendarPlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No injections found</h3>
              <p className="text-muted-foreground mt-2">
                No injections match your current search or filter criteria.
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
        
        <TabsContent value="treatments">
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
        
        <TabsContent value="history">
          <div className="py-12 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">Medical History</h3>
            <p className="text-muted-foreground mt-2">
              Select a sheep to view its complete medical history.
            </p>
            <Button 
              className="mt-4"
              asChild
            >
              <Link to="/sheep">Browse Sheep</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Medical;
