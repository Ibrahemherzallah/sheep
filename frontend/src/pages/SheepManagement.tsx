
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Baby, 
  Calendar, 
  Download, 
  Filter, 
  Plus, 
  Search,
  Users
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
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';

// Mock data
const sheepData = [
  { id: '1001', number: '1001', status: 'healthy', sex: 'female', origin: 'farm-produced', birthDate: '2023-01-15', isPregnant: true },
  { id: '1002', number: '1002', status: 'healthy', sex: 'female', origin: 'farm-produced', birthDate: '2023-02-10', isPregnant: false },
  { id: '1003', number: '1003', status: 'sick', sex: 'male', origin: 'bought', birthDate: '2023-01-05', isPregnant: false },
  { id: '1004', number: '1004', status: 'giving-birth-soon', sex: 'female', origin: 'bought', birthDate: '2022-11-20', isPregnant: true },
  { id: '1005', number: '1005', status: 'healthy', sex: 'male', origin: 'farm-produced', birthDate: '2022-12-05', isPregnant: false },
  { id: '1006', number: '1006', status: 'healthy', sex: 'female', origin: 'bought', birthDate: '2023-03-14', isPregnant: false },
];

// Types for the birth record form
interface BirthFormData {
  selectedSheep: string[];
  birthDetails: Record<string, { maleCount: number, femaleCount: number }>;
  birthDate: string;
  notes: string;
}

const SheepCard = ({ sheep }: { sheep: typeof sheepData[0] }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="sheep-status-healthy">Healthy</span>;
      case 'sick':
        return <span className="sheep-status-alert">Sick</span>;
      case 'giving-birth-soon':
        return <span className="sheep-status-attention">Birth Soon</span>;
      default:
        return <span className="sheep-status-healthy">Healthy</span>;
    }
  };

  return (
    <div className="sheep-card">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg">#{sheep.number}</h3>
          <div>
            {getStatusBadge(sheep.status)}
            {sheep.isPregnant && <span className="sheep-status-pregnant ml-2">Pregnant</span>}
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sex:</span>
            <span className="font-medium">{sheep.sex === 'male' ? 'Male' : 'Female'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Origin:</span>
            <span className="font-medium">{sheep.origin === 'farm-produced' ? 'Farm Produced' : 'Bought'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Birth Date:</span>
            <span className="font-medium">{sheep.birthDate}</span>
          </div>
          {sheep.isPregnant && (
            <div className="flex items-center gap-1 mt-2 text-farm-blue-700">
              <Baby size={16} />
              <span className="text-xs font-medium">Expected birth in 23 days</span>
            </div>
          )}
        </div>
      </div>
      <div className="border-t p-3 bg-muted/30 flex justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/sheep/${sheep.id}`}>View Details</Link>
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
  const [birthDialogOpen, setBirthDialogOpen] = useState(false);
  const [selectedSheep, setSelectedSheep] = useState<string[]>([]);
  
  const form = useForm<BirthFormData>({
    defaultValues: {
      selectedSheep: [],
      birthDetails: {},
      birthDate: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  // Filter for female sheep that could give birth
  const femaleSheep = sheepData.filter(sheep => sheep.sex === 'female');
  
  const filteredSheep = sheepData.filter(sheep => {
    if (activeTab === 'pregnant' && !sheep.isPregnant) return false;
    if (activeTab === 'male' && sheep.sex !== 'male') return false;
    if (activeTab === 'female' && sheep.sex !== 'female') return false;
    if (activeTab === 'sick' && sheep.status !== 'sick') return false;
    
    if (searchQuery) {
      return sheep.number.includes(searchQuery);
    }
    
    return true;
  });

  const handleSubmitBirth = (data: BirthFormData) => {
    console.log({
      selectedSheep: data.selectedSheep,
      birthDetails: data.birthDetails,
      birthDate: data.birthDate,
      notes: data.notes
    });
    
    toast({
      title: "Birth records added",
      description: `${data.selectedSheep.length} birth records have been successfully added.`
    });
    
    setBirthDialogOpen(false);
    form.reset();
    setSelectedSheep([]);
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

  return (
    <div className="flex-1 space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Sheep Management</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1">
            <Download size={18} />
            <span>Export</span>
          </Button>
          <Button onClick={() => setBirthDialogOpen(true)} variant="outline" className="gap-1">
            <Baby size={18} />
            <span>Add Born</span>
          </Button>
          <Button asChild>
            <Link to="/sheep/new" className="flex items-center gap-1">
              <Plus size={18} />
              <span>Add Sheep</span>
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pregnant">Pregnant</TabsTrigger>
            <TabsTrigger value="male">Male</TabsTrigger>
            <TabsTrigger value="female">Female</TabsTrigger>
            <TabsTrigger value="sick">Sick</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex w-full sm:w-auto gap-2 items-center">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="flex-shrink-0">
            <Filter size={18} />
          </Button>
          <Select defaultValue="newest">
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="id-asc">ID (Asc)</SelectItem>
                <SelectItem value="id-desc">ID (Desc)</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {filteredSheep.length > 0 ? (
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
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
          >
            Reset filters
          </Button>
        </div>
      )}

      {/* Add Birth Dialog */}
      <Dialog open={birthDialogOpen} onOpenChange={setBirthDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Record New Births</DialogTitle>
            <DialogDescription>
              Select sheep that have given birth and record the number of offspring.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitBirth)} className="space-y-4">
              <div className="space-y-4 py-2 max-h-[400px] overflow-y-auto pr-2">
                <FormField
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Birth Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Users size={16} />
                    Select Mother Sheep
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 border rounded-md p-3">
                    {femaleSheep.map((sheep) => (
                      <div key={sheep.id} className="flex items-start space-x-2">
                        <Checkbox 
                          id={`sheep-${sheep.id}`} 
                          checked={selectedSheep.includes(sheep.id)}
                          onCheckedChange={(checked) => handleSheepSelection(sheep.id, checked === true)}
                        />
                        <div className="grid gap-1.5 w-full">
                          <label
                            htmlFor={`sheep-${sheep.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            #{sheep.number}
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
                      </div>
                    ))}
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Any additional notes..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setBirthDialogOpen(false);
                    form.reset();
                    setSelectedSheep([]);
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={selectedSheep.length === 0}
                >
                  Save Birth Records
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
