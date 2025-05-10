
import { Link, useLocation } from 'react-router-dom';
import { 
  Ear, 
  Calendar, 
  Activity, 
  Syringe, 
  Boxes, 
  BarChart3, 
  Settings, 
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
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

export const AppSidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const navItems = [
    { to: "/", icon: BarChart3, label: "Dashboard" },
    { to: "/sheep", icon: Ear, label: "Sheep Management" },
    { to: "/medical", icon: Syringe, label: "Medical Records" },
    { to: "/cycles", icon: Calendar, label: "Cycle Management" },
    { to: "/breeding", icon: Activity, label: "Breeding" },
    { to: "/stock", icon: Boxes, label: "Stock" },
    { to: "/reports", icon: FileText, label: "Reports" },
    { to: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside 
      className={cn(
        "bg-sidebar fixed top-0 left-0 h-full w-64 z-40 transform transition-transform duration-200 ease-in-out pt-16",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
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
          <div className="px-3 py-2 text-sidebar-foreground/70">
            <div className="text-xs">FlockWatch Pro</div>
            <div className="text-sm">v1.0.0</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
