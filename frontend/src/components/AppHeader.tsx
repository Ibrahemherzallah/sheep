import { useState } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import logo from '../assets/sheep-logo.png';
import {Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, toast} from '@/components/ui';

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

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    toast({ title: "Logged out successfully" });
    navigate("/login");
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-1 px-4 flex justify-between items-center">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 md:hidden" aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}>
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
        <Link to="/" className="flex items-center">
          <img src="/logo.svg" alt="Sheep Management System" className="h-8 w-8 mr-2" onError={(e) => {e.currentTarget.style.display = 'none';}}/>
          <span className="font-semibold text-farm-green-700 text-lg hidden sm:inline-block">
            FlockWatch
          </span>
        </Link>
      </div>
      <div className="justify-between" style={{display:'flex', width:'80%',alignItems:'center'}}>
        <img src={logo} alt={"sheep-icon"} style={{width:'80px',height:'80px'}} />
        <div className="flex items-center gap-3">
      </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 h-10">
              <span className="w-8 h-8 rounded-full bg-farm-green-100 text-farm-green-700 flex items-center justify-center">
                AH
              </span>
              <span className="hidden md:inline-block font-medium">Ahmed Hanaisheh</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/profile">My Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} asChild>
              <Link to="/login">Sign Out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AppHeader;
