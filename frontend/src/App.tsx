import PrivateRoute from './config/privateRoute.tsx';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
// Pages
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import SheepManagement from "@/pages/SheepManagement";
import SheepDetails from "@/pages/SheepDetails";
import Medical from "@/pages/Medical";
import CycleManagement from "@/pages/CycleManagement";
import CycleDetails from "@/pages/CycleDetails";
import MedicineManagement from "@/pages/MedicineManagement";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile.tsx";
import Milk from "@/pages/Milk.tsx";
import Inventory from "@/pages/Inventory.tsx";
import StockManagement from "@/pages/StockManagement.tsx";
import Births from "@/pages/Births";

const queryClient = new QueryClient();

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route path="/" element={
                  <PrivateRoute>
                    <MainLayout />
                  </PrivateRoute>
                }
            >
              <Route index element={<Dashboard />} />
              <Route path="sheep" element={<SheepManagement />} />
              <Route path="sheep/:id" element={<SheepDetails />} />
              <Route path="medical" element={<Medical />} />
              <Route path="cycles" element={<CycleManagement />} />
              <Route path="cycles/:id" element={<CycleDetails />} />
              <Route path="medicine-management" element={<MedicineManagement />} />
              <Route path="stock-management" element={<StockManagement />} />
              <Route path="milk" element={<Milk />} />
              <Route path="births" element={<Births />} />
              <Route path="profile" element={<Profile />} />
              <Route path="inventory" element={<Inventory />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
  );
}

export default App;
