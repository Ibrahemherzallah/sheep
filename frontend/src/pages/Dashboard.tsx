import {useEffect, useState} from 'react';
import {Activity, Baby, Calendar, Ear, Info, Pill,Milk, Syringe, Truck} from 'lucide-react';
import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Dialog, DialogContent, Input, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Tabs, TabsContent, TabsList, TabsTrigger, toast, Checkbox,} from '@/components/ui';
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
  const [openDateDialog, setOpenDateDialog] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [injectDate, setInjectDate] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
  const [newSelectedTaskId,setNewSelectedTaskId] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(false);
  const token = localStorage.getItem("token");
  const [selectedSheepIds, setSelectedSheepIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const toggleSheepSelection = (id: string) => {
    setSelectedSheepIds((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };
  const handleOpenModal = async (task: any) => {
    setModalLoading(true)
    setSelectedTask(task);
    setIsModalOpen(true);

    try {
      const response = await fetch(`https://thesheep.top/api/sheep/list-by-ids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
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
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      if (res.ok) {
        const updated = displayedRecent.map((task) =>
            task._id === taskId ? { ...task, completed: true } : task
        );
        toast({
          title: "تمت المهمة ✅",
          description: "تم تحديث حالة المهمة إلى مكتملة بنجاح.",
          duration: 3000,
        });
        setSelectedSheepIds([])
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
    } finally {
      setIsLoading(false);
    }
  };
  const markPregnantTaskAsCompleted = async (donePregnant:boolean) => {
    try {
      const res = await fetch(`https://thesheep.top/api/tasks/${newSelectedTaskId||selectedTask._id}/completePregnant`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ completedSheepIds: selectedSheepIds, donePregnant }),
      });

      if (res.ok) {
        const updated = displayedRecent.map((task) =>
            task._id === selectedTask._id || task._id === newSelectedTaskId ? { ...task, completed: true } : task
        );

        toast({
          title: "تمت المهمة ✅",
          description: "تم تحديث حالة المهمة إلى مكتملة بنجاح.",
          duration: 3000,
        });
        setIsModalOpen(false)
        setSelectedSheepIds([])
        window.location.reload()
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
    setNewSelectedTaskId(task._id)
    console.log("task", task);
    if (["إسفنجة", "اعطاء الهرمون"].includes(task.title)) {
      setCurrentTask(task);
      setOpenDateDialog(true);
    }
    else if(["فحص الحمل"].includes(task.title)){
      setConfirmDialog(true);
    }
    else {
      markTaskAsCompleted(task._id);
    }
  };
  const handleTaskCompletionForSelectedSheep = (task) => {
    console.log("task", task);
    if (["إسفنجة", "اعطاء الهرمون"].includes(task.title)) {
      setCurrentTask(task);
      setOpenDateDialog(true);
    } else {
      confirmCompletionForSelectedSheep();
    }
  };
  const handleInjectConfirmation = async () => {
    setIsLoading(true);
    const date = new Date(injectDate);
        const taskTitle = currentTask.title;
        console.log("currentTask is :" ,currentTask)
        // 1. Mark current task as completed
    selectedSheepIds.length > 0 ?  confirmCompletionForSelectedSheep() : await markTaskAsCompleted(currentTask._id)


        // 2. Prepare new task
    let newTask = null;
    if (taskTitle === "إسفنجة") {
      date.setDate(date.getDate() + 12);
      newTask = {
        title: "اعطاء الهرمون",
        dueDate: date,
        sheepIds: selectedSheepIds.length > 0 ? selectedSheepIds : currentTask.sheepIds,
        type: "injection",
      };
    } else if (taskTitle === "اعطاء الهرمون") {
      date.setDate(date.getDate() + 30);
      newTask = {
        title: "فحص الحمل",
        dueDate: date,
        sheepIds: selectedSheepIds.length > 0 ? selectedSheepIds : currentTask.sheepIds,
        type: "pregnancy-check",
      };
    }

    if (newTask) {
      try {
        await fetch("https://thesheep.top/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(newTask),
        });
        toast({ title: "تم إنشاء مهمة جديدة بنجاح" });
        setSelectedSheepIds([])
        window.location.reload()}
      catch (error) {
        toast({
          title: "فشل في إنشاء المهمة الجديدة",
          variant: "destructive",
        });
      }
    }
  };
  const confirmCompletionForSelectedSheep = async () => {
    if (!selectedTask || selectedSheepIds.length === 0) {
      toast({
        title: "الرجاء اختيار بعض الخراف أولاً",
        variant: "destructive",
      });
      return;
    }
    if (selectedTask.title === 'فحص الحمل') {
      setConfirmDialog(true);
      return;
    }
    try {
      // 1. Mark selected sheep as completed for this task
      const res = await fetch(`https://thesheep.top/api/tasks/${selectedTask._id}/markTaskCompleteForSelectedSheep`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completedSheepIds: selectedSheepIds }),
      });

      if (!res.ok) {
        return toast({
          title: "خطأ",
          description: "فشل في تحديث المهمة",
          variant: "destructive",
        });
      }
      setIsModalOpen(false);
      setSelectedSheepIds([])
      window.location.reload()
    } catch (err) {
      toast({
        title: "فشل الاتصال",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
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
      window.location.reload()
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDialogForTask(task)}
                            >
                              تعديل
                            </Button>
                            {!task.completed && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTaskCompletion(task)}
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
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openDialogForTask(task)}
                            >
                              تعديل
                            </Button>
                            {!task.completed && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleTaskCompletion(task)}
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
                                  <>
                                    <div key={sheep._id} className="flex items-center gap-2">
                                      <Checkbox
                                          checked={selectedSheepIds.includes(sheep._id)}
                                          onCheckedChange={() => toggleSheepSelection(sheep._id)}
                                      />
                                      <span>
                                        🐑 النعجة رقم: {sheep.sheepNumber}
                                        {sheep.badgeColor && (
                                            <span
                                                className={`inline-block w-3 h-3 rounded-full ms-2 ${
                                                    sheep.badgeColor === 'أحمر' ? 'bg-red-500' : 'bg-yellow-400'
                                                }`}
                                                title={`علامة ${sheep.badgeColor === 'red' ? 'حمراء' : 'صفراء'}`}
                                            />
                                        )}
                                      </span>
                                    </div>

                                  </>

                              ))
                          ) : (
                              <li className="text-muted-foreground text-sm">لا يوجد نعاج</li>
                          )}
                        </ul>
                        <div className="flex justify-end gap-2 mt-4">

                          <Button onClick={()=>{handleTaskCompletionForSelectedSheep(selectedTask)}} size="sm" disabled={selectedSheepIds.length === 0}>
                            تأكيد تنفيذ المهمة للخراف المحددة
                          </Button>
                          <Button size="sm" onClick={() => {setIsModalOpen(false);setSelectedSheepIds([])}}>
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
                  disabled={isLoading}
                  onClick={async () => {
                    await handleInjectConfirmation();
                    setOpenDateDialog(false);
                  }}
              >
                {isLoading ? "جار تأكيد..." : "تأكيد"}
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

      {confirmDialog && (
          <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle style={{textAlign:'end'}}>تأكيد حدوث الحمل</DialogTitle>
              </DialogHeader>
              <div className={'flex gap-2 mt-5'}>
                <Button
                    variant={'ghost'}
                    onClick={async () => {
                      await markPregnantTaskAsCompleted(false);  // 👈 Not Pregnant
                      setConfirmDialog(false);
                    }}
                >
                  لم يتم
                </Button>
                <Button
                    onClick={async () => {
                      await markPregnantTaskAsCompleted(true);  // 👈 Pregnant confirmed
                      setConfirmDialog(false);
                    }}
                >
                  تم الحمل
                </Button>

              </div>
            </DialogContent>
          </Dialog>
      )}
    </div>
  );
};

export default Dashboard;
