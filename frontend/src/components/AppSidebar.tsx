import {Link, useLocation, useNavigate} from 'react-router-dom';
import {Ear, Calendar, Activity, Syringe, Boxes, BarChart3, Settings, FileText, Milk, Package, LogOut, X, Baby} from 'lucide-react';
import { cn } from '@/lib/utils';
import {toast} from "@/hooks/use-toast.ts";

interface SidebarProps {
  isOpen: boolean;
  setIsSidebarOpen: any;
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isActive }) => {


  return (
    <Link to={to} className={cn("flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
        isActive 
          ? "bg-sidebar-accent text-sidebar-accent-foreground" 
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
      )}
    >
      <Icon size={20} />
      <span>{label}</span>
    </Link>
  );
};

export const AppSidebar: React.FC<SidebarProps> = ({ isOpen,setIsSidebarOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const navItems = [
    { to: "/", icon: BarChart3, label: "الرئيسية" },
    { to: "/sheep", icon: Ear, label: "ادارة الأغنام" },
    { to: "/medical", icon: Syringe, label: "التسجيلات الطبية" },
    { to: "/cycles", icon: Calendar, label: "ادارة الدورات" },
    { to: "/milk", icon: Milk, label: "انتاج الحليب" },
    { to: "/births", icon: Baby, label: "الولادات" },
    { to: "/stock-management", icon: Boxes, label: "المخزون" },
    { to: "/inventory", icon: Package, label: "الجرد" },
    { to: "/profile", icon: Settings, label: "الاعدادات" },
  ];


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast({ title: "Logged out successfully" });
    navigate("/login");
  };

  return (
      <aside
          className={cn(
              "bg-sidebar fixed top-0 left-0 h-full w-64 z-40 transform transition-transform duration-200 ease-in-out pt-16",
              isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
      >
        <button
            onClick={() => setIsSidebarOpen(!isOpen)}
            className="absolute top-4 right-4 text-sidebar-foreground hover:text-sidebar-accent transition-colors block md:hidden"
        >
          <X size={24} />
        </button>

        <div className="h-full overflow-y-auto py-4 px-3 flex flex-col">
          <div className="space-y-1">
            {navItems.map((item) => (
                <NavItem
                    key={item.to}
                    to={item.to}
                    icon={item.icon}
                    label={item.label}
                    isActive={currentPath === item.to}
                />
            ))}
          </div>

          <div className="mt-auto border-t border-sidebar-border pt-4">
            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground w-full text-left"
            >
              <LogOut size={20} />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>
  );
};

export default AppSidebar;
