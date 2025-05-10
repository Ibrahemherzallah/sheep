
import { useState } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui';

interface AppHeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  notificationCount: number;
}

export const AppHeader = ({ 
  toggleSidebar, 
  isSidebarOpen, 
  notificationCount 
}: AppHeaderProps) => {
  
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-3 px-4 flex justify-between items-center">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="mr-2 md:hidden"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
        <Link to="/" className="flex items-center">
          <img 
            src="/logo.svg" 
            alt="Sheep Management System" 
            className="h-8 w-8 mr-2" 
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="font-semibold text-farm-green-700 text-lg hidden sm:inline-block">
            FlockWatch
          </span>
        </Link>
      </div>
      
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="p-4 text-center border-b">
              <h3 className="font-medium">Notifications</h3>
            </div>
            <div className="max-h-64 overflow-auto">
              {notificationCount > 0 ? (
                <>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div>
                      <p className="font-medium">Birth Approaching</p>
                      <p className="text-sm text-muted-foreground">Sheep #1234 expected to give birth in 3 days</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-3 cursor-pointer">
                    <div>
                      <p className="font-medium">Injection Due</p>
                      <p className="text-sm text-muted-foreground">15 sheep need routine injections today</p>
                      <p className="text-xs text-muted-foreground mt-1">8 hours ago</p>
                    </div>
                  </DropdownMenuItem>
                </>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No notifications
                </div>
              )}
            </div>
            <div className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-10">
              <span className="w-8 h-8 rounded-full bg-farm-green-100 text-farm-green-700 flex items-center justify-center">
                FM
              </span>
              <span className="hidden md:inline-block font-medium">Farm Manager</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/profile">My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/login">Sign Out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
