
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppHeader from '@/components/AppHeader';
import AppSidebar from '@/components/AppSidebar';

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(2); // Mock notification count
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <AppHeader 
        toggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
        notificationCount={notificationCount}
      />
      
      <div className="flex">
        <AppSidebar isOpen={isSidebarOpen} />
        
        <main className="flex-1 md:ml-64 min-h-screen pt-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
