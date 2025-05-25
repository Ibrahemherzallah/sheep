import { useState } from 'react';
import {Activity, Baby, Calendar, Ear, Info, Pill, Syringe, Truck} from 'lucide-react';
import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger,} from '@/components/ui';
import { Link } from 'react-router-dom';

// Mock data - in a real application this would come from an API
const mockStats = {
  totalSheep: 245,
  healthySheep: 230,
  sickSheep: 5,
  pregnantSheep: 10,
  upcomingBirths: 3,
  pendingInjections: 15,
  totalCycles: 4,
  activeCycles: 2,
};

const recentEvents = [
  { id: 1, type: 'birth', sheepId: '1234', date: '2025-05-03', details: 'Sheep #1234 gave birth to 2 lambs' },
  { id: 2, type: 'medication', sheepId: '2156', date: '2025-05-02', details: 'Sheep #2156 treated for infection' },
  { id: 3, type: 'injection', sheepIds: ['1001', '1002', '1003'], date: '2025-05-01', details: 'Routine injection given to 3 sheep' },
  { id: 4, type: 'cycle', cycleId: 'C-2023-04', date: '2025-04-30', details: 'New cycle C-2023-04 started with 15 sheep' },
];

const upcomingTasks = [
  { id: 1, type: 'birth', date: '2025-05-07', details: 'Expected birth from Sheep #1567' },
  { id: 2, type: 'injection', date: '2025-05-06', details: '8 sheep due for routine injections' },
  { id: 3, type: 'injection', date: '2025-05-10', details: 'Sheep #2156 post-birth injection due' },
  { id: 4, type: 'cycle', date: '2025-05-15', details: 'Cycle C-2023-03 due to end' },
];

const getEventIcon = (type: string) => {
  switch (type) {
    case 'birth': return <Baby className="text-farm-blue-500" size={18} />;
    case 'medication': return <Pill className="text-amber-500" size={18} />;
    case 'injection': return <Syringe className="text-farm-green-600" size={18} />;
    case 'cycle': return <Calendar className="text-farm-brown-500" size={18} />;
    default: return <Info size={18} />;
  }
};

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend,
}: { 
  title: string; 
  value: string | number; 
  description?: string; 
  icon: React.ElementType;
  trend?: { value: number; label: string; positive?: boolean };
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="bg-primary/10 p-2 rounded-full">
        <Icon size={18} className="text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
      {trend && (
        <div className={`text-xs mt-2 flex items-center ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.positive ? '+' : '-'}{trend.value}% {trend.label}
        </div>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  return (
    <div className="flex-1 space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/sheep/new" className="flex items-center gap-1">
              <span>Add Sheep</span>
            </Link>
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="medical">Medical</TabsTrigger>
          <TabsTrigger value="breeding">Breeding</TabsTrigger>
          <TabsTrigger value="cycles">Cycles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Sheep" 
              value={mockStats.totalSheep} 
              icon={Ear}
              trend={{ value: 5, label: "since last month", positive: true }}
            />
            <StatCard 
              title="Pregnant Sheep" 
              value={mockStats.pregnantSheep}
              description={`${mockStats.upcomingBirths} births in next 7 days`}
              icon={Baby}
            />
            <StatCard 
              title="Active Cycles" 
              value={mockStats.activeCycles} 
              description={`${mockStats.totalCycles} total cycles`}
              icon={Calendar}
            />
            <StatCard 
              title="Health Status" 
              value={`${mockStats.healthySheep} healthy`} 
              description={`${mockStats.sickSheep} sheep need attention`}
              icon={Activity}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="medical">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Pending Injections" 
              value={mockStats.pendingInjections} 
              description="Sheep requiring injections"
              icon={Syringe}
            />
            <StatCard 
              title="Sick Sheep" 
              value={mockStats.sickSheep}
              description="Currently under treatment"
              icon={Activity}
            />
            <StatCard 
              title="Medications Used" 
              value="12"
              description="Different medications"
              icon={Pill}
            />
            <StatCard 
              title="Recent Recoveries" 
              value="8" 
              description="In the past 14 days"
              icon={Activity}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="breeding">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Pregnant Sheep" 
              value={mockStats.pregnantSheep}
              description="Currently pregnant"
              icon={Baby}
            />
            <StatCard 
              title="Upcoming Births" 
              value={mockStats.upcomingBirths}
              description="Within next 7 days"
              icon={Calendar}
            />
            <StatCard 
              title="Recent Births" 
              value="5"
              description="In the past 30 days"
              icon={Baby}
            />
            <StatCard 
              title="Total Offspring" 
              value="42"
              description="In this year"
              icon={Truck}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="cycles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Active Cycles" 
              value={mockStats.activeCycles}
              description={`Out of ${mockStats.totalCycles} total cycles`}
              icon={Calendar}
            />
            <StatCard 
              title="Sheep in Cycles" 
              value="35"
              description="Currently in active cycles"
              icon={Ear}
            />
            <StatCard 
              title="Weekly Feed Avg" 
              value="120 kg"
              description="Feed consumed weekly"
              icon={Truck}
            />
            <StatCard 
              title="Weekly Milk Avg" 
              value="85 L"
              description="Milk produced weekly"
              icon={Truck}
            />
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Recent Events</CardTitle>
            <CardDescription>The last activities recorded in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex">
                  <div className="mr-3">
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">{event.details}</div>
                    <div className="text-sm text-muted-foreground">{event.date}</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full">
              View All Events
            </Button>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
            <CardDescription>Tasks that require your attention soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex">
                  <div className="mr-3">
                    {getEventIcon(task.type)}
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">{task.details}</div>
                    <div className="text-sm text-muted-foreground">Due on {task.date}</div>
                  </div>
                  <Button variant="ghost" size="sm">Complete</Button>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full">
              View All Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
