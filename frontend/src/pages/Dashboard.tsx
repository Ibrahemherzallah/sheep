import {useEffect, useState} from 'react';
import {Activity, Baby, Calendar, Ear, Info, Pill,Milk, Syringe, Truck} from 'lucide-react';
import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger, toast,} from '@/components/ui';
import { Link } from 'react-router-dom';
import * as React from "react";
import {formatDate} from "@/utils/dateUtils.ts";


const getEventIcon = (type: string) => {
  switch (type) {
    case 'born': return <Baby className="text-farm-blue-500" size={18} />;
    case 'milk': return <Milk className="text-amber-500" size={18} />;
    case 'injection': return <Syringe className="text-farm-green-600" size={18} />;
    case 'end-cycle': return <Calendar className="text-farm-brown-500" size={18} />;
    default: return <Info size={18} />;
  }
};

const StatCard = ({title, value, description, icon: Icon, trend,}: {
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
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [medicalDashboard, setMedicalDashboard] = useState(null);
  const [cycleDashboard, setCycleDashboard] = useState(null);
  const [recentTasks, setResentTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sheepList, setSheepList] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const displayedUpcoming = showAllUpcoming ? upcomingTasks : upcomingTasks.slice(0, 4);
  const displayedRecent = showAllRecent ? recentTasks : recentTasks.slice(0, 4);

  const handleOpenModal = async (task: any) => {
    setModalLoading(true)
    setSelectedTask(task);
    setIsModalOpen(true);

    try {
      const response = await fetch(`https://thesheep.top/api/sheep/list-by-ids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: task.sheepIds }),
      });
      const data = await response.json();
      setSheepList(data);
    } catch (error) {
      console.error("Error fetching sheep list:", error);
      setSheepList([]);
    } finally {
      setModalLoading(false)
    }
  };

  const markTaskAsCompleted = async (taskId) => {
    try {
      const res = await fetch(`https://thesheep.top/api/tasks/${taskId}/complete`, {
        method: 'PUT',
      });

      if (res.ok) {
        const updated = displayedRecent.map((task) =>
            task._id === taskId ? { ...task, completed: true } : task
        );
        console.log(updated);

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("https://thesheep.top/api/dashboard/summary", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await res.json();
        setDashboardData(data);
        setResentTasks(data.recentTasks)
        setUpcomingTasks(data.veryRecentTasks)
      } catch (error) {
        console.error("Error fetching dashboard:", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchMedicalDashboard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://thesheep.top/api/dashboard/summary-medical", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch medical dashboard data");
        }

        const data = await res.json();
        setMedicalDashboard(data);
        setResentTasks(data.recentTasks)
        setUpcomingTasks(data.veryRecentTasks)
      } catch (err) {
        console.error("Error fetching medical dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchCycleDashboard = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("https://thesheep.top/api/dashboard/summary-cycle", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch cycle dashboard");
        }

        const data = await res.json();
        setCycleDashboard(data);
        setResentTasks(data.recentTasks)
        setUpcomingTasks(data.veryRecentTasks)
      } catch (err) {
        console.error("Error fetching cycle dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    if(activeTab === 'overview')  fetchDashboardData();
    if(activeTab === 'medical')  fetchMedicalDashboard();
    if(activeTab === 'cycles')  fetchCycleDashboard();
  }, [activeTab]);

  if (loading) return <div className={"text-center mt-4"}>جار تحميل البيانات...</div>;
  if (!dashboardData) return <div>حدث شيء خاطئ!</div>;

  return (
    <div className="flex-1 space-y-6 p-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">الرئيسية</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="medical">الطب</TabsTrigger>
          <TabsTrigger value="cycles">الدورات</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="عدد الاغنام الكلي" value={dashboardData.totalSheep} icon={Ear} trend={{ value: dashboardData.sheepGrowthPercentage, label: "من الشهر الفائت", positive: true }}/>
            <StatCard title="الاغنام الحوامل" value={dashboardData.pregnantSheep} description={`${dashboardData.upcomingPregnancies} تلد في ال7 أيام القادمة `} icon={Baby}/>
            <StatCard title="الدورات النشطة" value={dashboardData.activeCycles} description={`${dashboardData.totalCycles} جميع الدورات `} icon={Calendar}/>
            <StatCard title="الحالات الصحية" value={`${dashboardData.totalSheep - dashboardData.patientSheep}نعجة سليمة `} description={`${dashboardData.patientSheep} مريضات`} icon={Activity}/>
          </div>
        </TabsContent>
        <TabsContent value="medical">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="الحقن المنتظرة" value={medicalDashboard?.upcomingInjections} description="نعجة تحتاج حقن" icon={Syringe}/>
            <StatCard title="الاغنام المريضة" value={medicalDashboard?.totalPatientSheep} description="حاليا تحت العلاج" icon={Activity}/>
            <StatCard title="الأدوية المستخدمة" value={medicalDashboard?.differentMedicineTypesCount} description="نوع دواء مختلف" icon={Pill}/>
            <StatCard title="تم علاجها مؤخرا" value={medicalDashboard?.nonPatientCount} description="في اخر 14 يوم" icon={Activity}/>
          </div>
        </TabsContent>
        <TabsContent value="cycles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="الدورات النشطة" value={cycleDashboard?.activeCycles} description={` من أصل${cycleDashboard?.totalCycles} دورات اجمالية`} icon={Calendar}/>
            <StatCard title="نعجة في الدورات" value={cycleDashboard?.totalSheepInCycles} description="حاليا في دورات نشطة" icon={Ear}/>
            <StatCard title="معدل الغذاء الاسبوعي" value={`${cycleDashboard?.feedAvgPerWeek} kg`} description="غذاء يستهلك اسبوعيا" icon={Truck}/>
            <StatCard title="معدل الحليب الأسبوعي" value={`${cycleDashboard?.totalMilkPerWeek} L`} description="الحليب المنتج اسبوعيا" icon={Truck}/>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">المهام الحالية</CardTitle>
            <CardDescription>المهام الحالية يجب القيام بها</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingTasks?.length > 0 ? (
                <>
                  <div className="space-y-5">
                    {displayedUpcoming.map((task) => (
                        <div key={task._id} className="flex items-center">
                          <div className="mr-3">{getEventIcon(task.type)}</div>
                          <div className="flex-grow">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(task.dueDate)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenModal(task)}
                            >
                              رؤية القائمة
                            </Button>
                            {!task.completed && (
                                <Button
                                    variant="outline" size="sm"
                                    onClick={() => markTaskAsCompleted(task._id)}
                                >
                                  تم
                                </Button>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
                  {upcomingTasks.length > 4 && (
                      <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full"
                          onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                      >
                        {showAllUpcoming ? "عرض أقل" : "رؤية جميع المهام"}
                      </Button>
                  )}
                </>
            ) : (
                <div className="text-center text-muted-foreground py-6">
                  لا يوجد مهام لهذه القائمة
                </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">المهام القادمة</CardTitle>
            <CardDescription>المهام القريبة تتطلب اهتمامك وتتبعك</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTasks?.length > 0 ? (
                <>
                  <div className="space-y-5">
                    {displayedRecent.map((task) => (
                        <div key={task._id} className="flex items-center">
                          <div className="mr-3">{getEventIcon(task.type)}</div>
                          <div className="flex-grow">
                            <div className="font-medium">{task.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {formatDate(task.dueDate)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenModal(task)}
                            >
                              رؤية القائمة
                            </Button>
                            {!task.completed && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markTaskAsCompleted(task._id)}
                                >
                                  تم
                                </Button>
                            )}
                          </div>
                        </div>
                    ))}
                  </div>
                  {recentTasks.length > 4 && (
                      <Button
                          variant="outline"
                          size="sm"
                          className="mt-4 w-full"
                          onClick={() => setShowAllRecent(!showAllRecent)}
                      >
                        {showAllRecent ? "عرض أقل" : "رؤية جميع المهام"}
                      </Button>
                  )}
                </>
            ) : (
                <div className="text-center text-muted-foreground py-6">
                  لا يوجد مهام لهذه القائمة
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      {isModalOpen && selectedTask && (
          modalLoading ? <div className="text-center py-10">جاري التحميل ...</div> :
          <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-lg font-semibold mb-3">قائمة النعاج</h2>
              <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="bg-white p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-3">النعاج المرتبطة بالمهمة</h2>
                        <ul className="space-y-2 max-h-[300px] overflow-y-auto">
                          {sheepList.length > 0 ? (
                              sheepList.map((sheep) => (
                                  <li key={sheep._id} className="text-sm text-gray-800 border-b py-1">
                                    🐑 النعجة رقم: {sheep.sheepNumber}
                                  </li>
                              ))
                          ) : (
                              <li className="text-muted-foreground text-sm">لا يوجد نعاج</li>
                          )}
                        </ul>
                        <div className="flex justify-end mt-4">
                          <Button size="sm" onClick={() => setIsModalOpen(false)}>
                            إغلاق
                          </Button>
                        </div>
                      </div>
                    </div>
                )}
              </ul>
              <div className="flex justify-end mt-4">
                <Button size="sm" onClick={() => setIsModalOpen(false)}>
                  إغلاق
                </Button>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
