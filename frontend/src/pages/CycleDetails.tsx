
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  ArrowLeft,
  Ear, 
  FileText, 
  PlusCircle, 
  BarChart3, 
  ListPlus 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Cycle, WeeklyCycleRecord, Sheep } from '@/types';

// Mock data for a specific cycle
const mockCycle: Cycle = {
  id: "c1",
  name: "Spring Lambs 2025",
  startDate: new Date(2025, 2, 15),
  endDate: undefined,
  sheepIds: ["s1", "s2", "s3", "s4", "s5"],
  initialMaleCount: 3,
  initialFemaleCount: 2,
  status: "active",
  notes: "This cycle focuses on the spring lamb breeding program. The group consists of young lambs being raised for both milk production and eventual meat stock. Weekly monitoring of feed, milk, and medical treatments is essential for optimal growth.",
};

// Mock weekly records
const mockWeeklyRecords: WeeklyCycleRecord[] = [
  {
    id: "wr1",
    cycleId: "c1",
    weekStartDate: new Date(2025, 2, 15),
    feedQuantity: 45.5,
    milkQuantity: 32.8,
    vitaminsGiven: ["B12", "D3"],
    syringesGiven: 5,
    notes: "First week went well, sheep are adapting to the new schedule",
  },
  {
    id: "wr2",
    cycleId: "c1",
    weekStartDate: new Date(2025, 2, 22),
    feedQuantity: 48.2,
    milkQuantity: 36.7,
    vitaminsGiven: ["B12", "D3", "Iron"],
    syringesGiven: 0,
    notes: "Increased feed slightly, milk production improving",
  },
  {
    id: "wr3",
    cycleId: "c1",
    weekStartDate: new Date(2025, 3, 1),
    feedQuantity: 50.0,
    milkQuantity: 39.2,
    vitaminsGiven: ["B12", "D3"],
    syringesGiven: 2,
    notes: "Two sheep needed routine injections",
  },
];

// Mock sheep data
const mockSheep: Sheep[] = [
  {
    id: "s1",
    sheepNumber: "SH-2023-001",
    origin: "farm-produced",
    birthDate: new Date(2023, 5, 15),
    sex: "female",
    isPregnant: false,
    status: "healthy",
    createdAt: new Date(2023, 5, 15),
    updatedAt: new Date(2025, 2, 10),
  },
  {
    id: "s2",
    sheepNumber: "SH-2023-002",
    origin: "farm-produced",
    birthDate: new Date(2023, 5, 15),
    sex: "female",
    isPregnant: false,
    status: "healthy",
    createdAt: new Date(2023, 5, 15),
    updatedAt: new Date(2025, 2, 10),
  },
  {
    id: "s3",
    sheepNumber: "SH-2023-005",
    origin: "bought",
    birthDate: new Date(2023, 3, 10),
    sex: "male",
    isPregnant: false,
    status: "healthy",
    createdAt: new Date(2023, 6, 20),
    updatedAt: new Date(2025, 2, 10),
  },
  {
    id: "s4",
    sheepNumber: "SH-2023-008",
    origin: "bought",
    birthDate: new Date(2023, 3, 12),
    sex: "male",
    isPregnant: false,
    status: "healthy",
    createdAt: new Date(2023, 6, 20),
    updatedAt: new Date(2025, 2, 10),
  },
  {
    id: "s5",
    sheepNumber: "SH-2023-009",
    origin: "bought",
    birthDate: new Date(2023, 3, 12),
    sex: "male",
    isPregnant: false,
    status: "healthy",
    createdAt: new Date(2023, 6, 20),
    updatedAt: new Date(2025, 2, 10),
  },
];

const CycleDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  // Format date to a readable string
  const formatDate = (date?: Date) => {
    if (!date) return 'Ongoing';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Format week date range
  const formatWeekRange = (startDate: Date) => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const startFormatted = startDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endFormatted = endDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    return `${startFormatted} - ${endFormatted}`;
  };

  // Calculate statistics
  const totalFeed = mockWeeklyRecords.reduce((sum, record) => sum + record.feedQuantity, 0);
  const totalMilk = mockWeeklyRecords.reduce((sum, record) => sum + record.milkQuantity, 0);
  const totalSyringes = mockWeeklyRecords.reduce((sum, record) => sum + record.syringesGiven, 0);
  
  // Count vitamins
  const vitaminCounts: Record<string, number> = mockWeeklyRecords.reduce((acc, record) => {
    record.vitaminsGiven.forEach(vitamin => {
      acc[vitamin] = (acc[vitamin] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Button 
        variant="ghost" 
        className="mb-6 pl-0 flex items-center gap-2"
        onClick={() => navigate('/cycles')}
      >
        <ArrowLeft size={16} />
        Back to Cycles
      </Button>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{mockCycle.name}</h1>
            <Badge variant={mockCycle.status === 'active' ? 'default' : 'secondary'}>
              {mockCycle.status === 'active' ? 'Active' : 'Completed'}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>Started: {formatDate(mockCycle.startDate)}</span>
            </div>
            {mockCycle.endDate && (
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>Ended: {formatDate(mockCycle.endDate)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileText size={16} />
            <span>Edit Details</span>
          </Button>
          {mockCycle.status === 'active' && (
            <Button className="gap-2">
              <PlusCircle size={16} />
              <span>Add Weekly Record</span>
            </Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="overview" className="mt-6" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sheep">Sheep</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Records</TabsTrigger>
          {mockCycle.status === 'completed' && (
            <TabsTrigger value="summary">Cycle Summary</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Feed</CardDescription>
                <CardTitle className="text-2xl">{totalFeed.toFixed(1)} kg</CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Milk Produced</CardDescription>
                <CardTitle className="text-2xl">{totalMilk.toFixed(1)} L</CardTitle>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Sheep Count</CardDescription>
                <CardTitle className="text-2xl">{mockCycle.initialMaleCount + mockCycle.initialFemaleCount}</CardTitle>
                <div className="text-xs text-muted-foreground mt-1">
                  {mockCycle.initialMaleCount} male, {mockCycle.initialFemaleCount} female
                </div>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Medical Injections</CardDescription>
                <CardTitle className="text-2xl">{totalSyringes}</CardTitle>
              </CardHeader>
            </Card>
          </div>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Cycle Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{mockCycle.notes || "No notes available for this cycle."}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Vitamins Administered</CardTitle>
              <CardDescription>Vitamins given throughout the cycle</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(vitaminCounts).map(([vitamin, count]) => (
                  <Badge key={vitamin} variant="outline" className="py-1.5">
                    {vitamin}: {count} times
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sheep">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Sheep in this Cycle</CardTitle>
              <Button variant="outline" size="sm" className="gap-2">
                <ListPlus size={16} />
                <span>Manage Sheep</span>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sheep ID</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead>Birth Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSheep.map((sheep) => (
                    <TableRow key={sheep.id}>
                      <TableCell className="font-medium">{sheep.sheepNumber}</TableCell>
                      <TableCell className="capitalize">{sheep.origin}</TableCell>
                      <TableCell className="capitalize">{sheep.sex}</TableCell>
                      <TableCell>{formatDate(sheep.birthDate)}</TableCell>
                      <TableCell>
                        <Badge variant={sheep.status === 'healthy' ? 'default' : 'destructive'}>
                          {sheep.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild className="gap-1">
                          <a href={`/sheep/${sheep.id}`}>
                            <Ear size={16} />
                            <span>View</span>
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="weekly">
          <div className="grid gap-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Weekly Records</h3>
              {mockCycle.status === 'active' && (
                <Button className="gap-2">
                  <PlusCircle size={16} />
                  <span>Add Record</span>
                </Button>
              )}
            </div>
            
            {mockWeeklyRecords.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Week of {formatWeekRange(record.weekStartDate)}</CardTitle>
                      <CardDescription>Record #{record.id}</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Feed Quantity</p>
                      <p className="font-medium">{record.feedQuantity} kg</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Milk Production</p>
                      <p className="font-medium">{record.milkQuantity} L</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Medical Injections</p>
                      <p className="font-medium">{record.syringesGiven}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Vitamins Given</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {record.vitaminsGiven.map(vitamin => (
                          <Badge key={vitamin} variant="secondary" className="text-xs">
                            {vitamin}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {record.notes && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm text-muted-foreground mb-1">Notes</p>
                      <p>{record.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="summary">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Cycle Summary is not available</CardTitle>
              <CardDescription>This cycle is still active. A summary will be available once the cycle is completed.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CycleDetails;
