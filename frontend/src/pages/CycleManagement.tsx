
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  CalendarDays, 
  Plus, 
  ChevronRight, 
  Search,
  Syringe,
  Pill
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Cycle } from '@/types';
import { toast } from 'sonner';

// Mock data for cycles
const mockCycles: Cycle[] = [
  {
    id: "c1",
    name: "Spring Lambs 2025",
    startDate: new Date(2025, 2, 15),
    endDate: undefined,
    sheepIds: ["s1", "s2", "s3", "s4", "s5"],
    initialMaleCount: 3,
    initialFemaleCount: 2,
    status: "active",
    notes: "First cycle of the spring season"
  },
  {
    id: "c2",
    name: "Winter Group 2024",
    startDate: new Date(2024, 10, 10),
    endDate: new Date(2025, 3, 15),
    sheepIds: ["s6", "s7", "s8", "s9", "s10", "s11"],
    initialMaleCount: 4,
    initialFemaleCount: 2,
    status: "completed",
    notes: "Winter breeding program"
  },
  {
    id: "c3",
    name: "Summer Cycle 2024",
    startDate: new Date(2024, 5, 20),
    endDate: new Date(2024, 9, 30),
    sheepIds: ["s12", "s13", "s14", "s15"],
    initialMaleCount: 2,
    initialFemaleCount: 2,
    status: "completed",
    notes: "Summer breeding group"
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

const CycleManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [medicineTab, setMedicineTab] = useState('medicines');
  
  const [selectedCycle, setSelectedCycle] = useState<string>('');
  const [selectedMedicine, setSelectedMedicine] = useState<string>('');
  const [selectedInjection, setSelectedInjection] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Filter cycles based on search query and active tab
  const filteredCycles = mockCycles
    .filter(cycle => 
      cycle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cycle.notes?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter(cycle => {
      if (activeTab === 'all') return true;
      if (activeTab === 'active') return cycle.status === 'active';
      if (activeTab === 'completed') return cycle.status === 'completed';
      return true;
    });

  // Format date to a readable string
  const formatDate = (date?: Date) => {
    if (!date) return 'Ongoing';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
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
          <h1 className="text-3xl font-bold">Cycle Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track breeding cycles of your flock
          </p>
        </div>
        <Button className="gap-2">
          <Plus size={16} />
          <span>New Cycle</span>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cycle Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Sheep Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
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
                        <TableCell className="font-medium">{cycle.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-muted-foreground" />
                            {formatDate(cycle.startDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <CalendarDays size={16} className="text-muted-foreground" />
                            {formatDate(cycle.endDate)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {cycle.initialMaleCount + cycle.initialFemaleCount} total
                          <div className="text-xs text-muted-foreground mt-1">
                            {cycle.initialMaleCount} male, {cycle.initialFemaleCount} female
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={cycle.status === 'active' ? 'default' : 'secondary'}>
                            {cycle.status === 'active' ? 'Active' : 'Completed'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/cycles/${cycle.id}`} className="flex items-center">
                              View Details
                              <ChevronRight size={16} className="ml-1" />
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

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add Medical Records</CardTitle>
              <CardDescription>
                Add medicines or injections to a cycle
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cycle">Select Cycle</Label>
                  <Select value={selectedCycle} onValueChange={setSelectedCycle}>
                    <SelectTrigger id="cycle">
                      <SelectValue placeholder="Select a cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCycles
                        .filter(cycle => cycle.status === 'active')
                        .map((cycle) => (
                          <SelectItem key={cycle.id} value={cycle.id}>
                            {cycle.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <Tabs defaultValue="medicines" onValueChange={setMedicineTab}>
                  <TabsList className="grid grid-cols-2">
                    <TabsTrigger value="medicines" className="flex items-center gap-2">
                      <Pill size={16} />
                      <span>Medicines</span>
                    </TabsTrigger>
                    <TabsTrigger value="injections" className="flex items-center gap-2">
                      <Syringe size={16} />
                      <span>Injections</span>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="medicines" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="medicine">Select Medicine</Label>
                      <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                        <SelectTrigger id="medicine">
                          <SelectValue placeholder="Select a medicine" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockMedicines.map((medicine) => (
                            <SelectItem key={medicine.id} value={medicine.id}>
                              {medicine.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input 
                        id="dosage" 
                        placeholder="e.g., 10ml per sheep" 
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="injections" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="injection">Select Injection</Label>
                      <Select value={selectedInjection} onValueChange={setSelectedInjection}>
                        <SelectTrigger id="injection">
                          <SelectValue placeholder="Select an injection" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockInjections.map((injection) => (
                            <SelectItem key={injection.id} value={injection.id}>
                              {injection.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input 
                        id="dosage" 
                        placeholder="e.g., 2ml per sheep" 
                        value={dosage}
                        onChange={(e) => setDosage(e.target.value)}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input 
                    id="notes" 
                    placeholder="Additional notes..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <Button 
                  className="w-full"
                  onClick={handleAddMedication}
                >
                  Add to Cycle
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CycleManagement;
