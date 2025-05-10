
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Baby, 
  Calendar,
  Edit,
  FileText,
  Heart,
  History,
  LineChart,
  Syringe,
  Tag
} from 'lucide-react';
import { 
  Button,
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Separator,
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';

// Mock data - in a real app, this would come from an API
const sheepData = [
  { id: '1001', number: '1001', status: 'healthy', sex: 'female', origin: 'farm-produced', birthDate: '2023-01-15', isPregnant: true, pregnantSince: '2024-04-10', expectedBirthDate: '2024-09-07', milkProductionCapacity: 2.5, notes: 'Good health, consistent milk production' },
  { id: '1002', number: '1002', status: 'healthy', sex: 'female', origin: 'farm-produced', birthDate: '2023-02-10', isPregnant: false, milkProductionCapacity: 1.8, notes: 'Average production, had illness in February' },
  { id: '1003', number: '1003', status: 'sick', sex: 'male', origin: 'bought', birthDate: '2023-01-05', isPregnant: false, notes: 'Currently treating for respiratory infection' },
  { id: '1004', number: '1004', status: 'giving-birth-soon', sex: 'female', origin: 'bought', birthDate: '2022-11-20', isPregnant: true, pregnantSince: '2024-03-20', expectedBirthDate: '2024-08-17', milkProductionCapacity: 3.2, notes: 'High producer, second pregnancy' },
  { id: '1005', number: '1005', status: 'healthy', sex: 'male', origin: 'farm-produced', birthDate: '2022-12-05', isPregnant: false, notes: 'Strong breeding male' },
  { id: '1006', number: '1006', status: 'healthy', sex: 'female', origin: 'bought', birthDate: '2023-03-14', isPregnant: false, milkProductionCapacity: 2.1, notes: 'First-time mother last year' },
];

const medicalHistory = [
  { id: 'm1', sheepId: '1001', type: 'routine-injection', date: '2024-01-15', description: 'Semi-annual routine injection', notes: 'No adverse reactions' },
  { id: 'm2', sheepId: '1001', type: 'vitamin', date: '2024-02-20', vitaminId: 'v1', vitaminName: 'Vitamin B Complex', notes: 'Administered during weekly check' },
  { id: 'm3', sheepId: '1001', type: 'disease', date: '2024-03-05', diseaseId: 'd1', diseaseName: 'Mild fever', notes: 'Observed lethargy, treated immediately' },
  { id: 'm4', sheepId: '1001', type: 'medication', date: '2024-03-05', medicineId: 'med1', medicineName: 'Antibiotics', notes: 'For fever treatment' },
  { id: 'm5', sheepId: '1001', type: 'recovered', date: '2024-03-10', notes: 'Fully recovered from fever' },
  { id: 'm6', sheepId: '1001', type: 'post-birth-injection', date: '2023-10-25', notes: 'First injection after giving birth' },
  { id: 'm7', sheepId: '1001', type: 'post-birth-injection', date: '2023-11-06', notes: 'Second injection after giving birth' },
];

const birthRecords = [
  { id: 'b1', motherId: '1001', date: '2023-09-15', childrenCount: 2, maleCount: 1, femaleCount: 1, childIds: ['1010', '1011'], notes: 'Normal delivery, no complications' },
  { id: 'b2', motherId: '1004', date: '2023-08-20', childrenCount: 3, maleCount: 1, femaleCount: 2, childIds: ['1012', '1013', '1014'], notes: 'Difficult birth, required assistance' },
];

const SheepDetails = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find the sheep with the matching ID
  const sheep = sheepData.find(s => s.id === id);
  
  // Find medical events for this sheep
  const sheepMedicalHistory = medicalHistory.filter(record => record.sheepId === id);
  
  // Find birth records for this sheep (if female)
  const sheepBirthRecords = sheep?.sex === 'female' ? birthRecords.filter(record => record.motherId === id) : [];
  
  if (!sheep) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-4">Sheep Not Found</h2>
        <p>The sheep with ID {id} could not be found.</p>
        <Button asChild className="mt-4">
          <Link to="/sheep">Back to Sheep Management</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Healthy</span>;
      case 'sick':
        return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">Sick</span>;
      case 'giving-birth-soon':
        return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Birth Soon</span>;
      default:
        return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Healthy</span>;
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Back button and header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="outline" asChild className="mb-2">
            <Link to="/sheep" className="inline-flex items-center gap-1">
              <ArrowLeft size={16} />
              <span>Back to All Sheep</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Sheep #{sheep.number}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to={`/sheep/${sheep.id}/edit`} className="inline-flex items-center gap-1">
              <Edit size={16} />
              <span>Edit Sheep</span>
            </Link>
          </Button>
          <Button variant="default">Record Medical Event</Button>
        </div>
      </div>

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical History</TabsTrigger>
          <TabsTrigger value="births">Birth Records</TabsTrigger>
          <TabsTrigger value="production">Production</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                  <span>Basic Information</span>
                  {getStatusBadge(sheep.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">ID Number</p>
                    <p className="flex items-center gap-1.5">
                      <Tag size={14} className="text-muted-foreground" />
                      <span>{sheep.number}</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Sex</p>
                    <p>{sheep.sex === 'male' ? 'Male' : 'Female'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Origin</p>
                    <p>{sheep.origin === 'farm-produced' ? 'Farm Produced' : 'Bought'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Birth Date</p>
                    <p className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-muted-foreground" />
                      <span>{sheep.birthDate}</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {sheep.isPregnant && (
              <Card className="border-purple-200">
                <CardHeader className="pb-2 bg-purple-50 rounded-t-lg">
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Baby size={18} />
                    <span>Pregnancy Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Pregnant Since</p>
                    <p>{sheep.pregnantSince || 'N/A'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Expected Birth Date</p>
                    <p className="font-medium">{sheep.expectedBirthDate || 'N/A'}</p>
                  </div>
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                    <p className="text-xs text-right mt-1 text-muted-foreground">Approximately 98 days left</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {sheep.sex === 'female' && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">Milk Production</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Production Capacity</p>
                    <div className="flex items-end">
                      <span className="text-2xl font-bold">{sheep.milkProductionCapacity || 0}</span>
                      <span className="text-sm text-muted-foreground ml-1 mb-1">liters/day</span>
                    </div>
                    {sheep.isPregnant && (
                      <p className="text-xs text-muted-foreground mt-1">Production paused during pregnancy</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                  <FileText size={16} />
                  <span>Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p>{sheep.notes || 'No notes available for this sheep.'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Heart size={18} />
                <span>Medical History</span>
              </CardTitle>
              <CardDescription>Complete medical record including injections, diseases, and treatments</CardDescription>
            </CardHeader>
            <CardContent>
              {sheepMedicalHistory.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sheepMedicalHistory.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>{event.date}</TableCell>
                        <TableCell>
                          {(() => {
                            switch(event.type) {
                              case 'routine-injection':
                                return <span className="flex items-center gap-1"><Syringe size={14} /> Routine Injection</span>;
                              case 'post-birth-injection':
                                return <span className="flex items-center gap-1"><Syringe size={14} /> Post-birth Injection</span>;
                              case 'disease':
                                return <span className="text-red-600">Disease: {event.diseaseName}</span>;
                              case 'medication':
                                return <span className="text-blue-600">Medication: {event.medicineName}</span>;
                              case 'vitamin':
                                return <span className="text-green-600">Vitamin: {event.vitaminName}</span>;
                              case 'recovered':
                                return <span className="text-green-600">Recovery</span>;
                              default:
                                return event.type;
                            }
                          })()}
                        </TableCell>
                        <TableCell>
                          {event.type === 'routine-injection' && 'Semi-annual routine vaccination'}
                          {event.type === 'post-birth-injection' && (event.id === 'm6' ? 'First injection 40 days after birth' : 'Second injection 12 days after first')}
                          {event.type === 'disease' && event.diseaseName}
                          {event.type === 'medication' && event.medicineName}
                          {event.type === 'vitamin' && event.vitaminName}
                          {event.type === 'recovered' && 'Fully recovered'}
                        </TableCell>
                        <TableCell>{event.notes}</TableCell>
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Next Scheduled Injection</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Routine Injection</p>
                    <p className="text-muted-foreground">Due in 45 days</p>
                  </div>
                  <Button variant="outline" size="sm">Schedule</Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Current Health Status</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      {getStatusBadge(sheep.status)}
                    </p>
                    <p className="text-muted-foreground mt-1">Last updated: Today</p>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="births" className="space-y-4">
          {sheep.sex === 'male' ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">Birth records are only available for female sheep.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Baby size={18} />
                    <span>Birth Records</span>
                  </CardTitle>
                  <CardDescription>History of all births from this sheep</CardDescription>
                </CardHeader>
                <CardContent>
                  {sheepBirthRecords.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Total Children</TableHead>
                          <TableHead>Male</TableHead>
                          <TableHead>Female</TableHead>
                          <TableHead>Child IDs</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sheepBirthRecords.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{record.date}</TableCell>
                            <TableCell>{record.childrenCount}</TableCell>
                            <TableCell>{record.maleCount}</TableCell>
                            <TableCell>{record.femaleCount}</TableCell>
                            <TableCell>
                              {record.childIds.map((childId) => (
                                <Link 
                                  key={childId} 
                                  to={`/sheep/${childId}`}
                                  className="inline-block bg-muted mr-1 px-2 py-0.5 rounded text-xs hover:bg-muted/80"
                                >
                                  #{childId}
                                </Link>
                              ))}
                            </TableCell>
                            <TableCell>{record.notes}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Baby className="mx-auto h-12 w-12 opacity-20 mb-2" />
                      <p>No birth records available for this sheep.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {sheep.isPregnant && (
                <Card className="border-purple-200">
                  <CardHeader className="bg-purple-50">
                    <CardTitle>Upcoming Birth</CardTitle>
                    <CardDescription>Expected birth details</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Expected Date</p>
                        <p className="font-medium">{sheep.expectedBirthDate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Days Remaining</p>
                        <p className="font-medium">Approximately 98 days</p>
                      </div>
                      <div className="col-span-2">
                        <Button 
                          variant="outline" 
                          className="w-full mt-2"
                        >
                          Schedule Birth Record
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="production" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart size={18} />
                <span>Production Data</span>
              </CardTitle>
              <CardDescription>Milk production metrics and history</CardDescription>
            </CardHeader>
            <CardContent>
              {sheep.sex === 'female' ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Average Daily Production</p>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold">{sheep.milkProductionCapacity || 0}</span>
                        <span className="text-sm text-muted-foreground ml-1">liters/day</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-muted-foreground">Production Status</p>
                      <p className="font-medium">
                        {sheep.isPregnant ? 
                          <span className="text-purple-600">Paused (Pregnant)</span> : 
                          <span className="text-green-600">Active</span>
                        }
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="text-center py-8 text-muted-foreground">
                    <LineChart className="mx-auto h-12 w-12 opacity-20 mb-2" />
                    <p>Production history chart will be displayed here.</p>
                    <p className="text-xs mt-1">Historical data tracking coming soon</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Production data is only available for female sheep.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SheepDetails;
