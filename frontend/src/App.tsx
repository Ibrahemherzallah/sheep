
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="sheep" element={<SheepManagement />} />
            <Route path="sheep/:id" element={<SheepDetails />} />
            <Route path="medical" element={<Medical />} />
            <Route path="cycles" element={<CycleManagement />} />
            <Route path="cycles/:id" element={<CycleDetails />} />
            <Route path="medicine-management" element={<MedicineManagement />} />
            {/* Add other routes when we create those pages */}
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
