import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalThemeProvider } from "@/contexts/GlobalThemeContext";

// Main Pages
import Index from "./pages/Index";
import Campaigns from "./pages/Campaigns";
import CampaignBuilder from "./pages/CampaignBuilder";
import CampaignLauncher from "./pages/CampaignLauncher";
import CampaignLocationTargeting from "./pages/CampaignLocationTargeting";
import CampaignScheduleManager from "./pages/CampaignScheduleManager";
import CreateSchedule from "./pages/CreateSchedule";
import DebugDashboard from "./pages/DebugDashboard";
import LocationBuilder from "./pages/LocationBuilder";
import NotFound from "./pages/NotFound";
import SchedulerDashboard from "./pages/SchedulerDashboard";
import Theme from "./pages/Theme";
import ThemeSystemDemo from "./pages/ThemeSystemDemo";

// Admin Pages
import MenuManagementPage from "./pages/admin/MenuManagement";
import ThemeSettings from "./pages/admin/ThemeSettings";

import './styles/globals.css';

const queryClient = new QueryClient();

function App() {
  return (
    <GlobalThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <div className="min-h-screen" style={{ backgroundColor: `rgb(var(--bg-primary))` }}>
            <BrowserRouter>
              <Routes>
                {/* Main Dashboard */}
                <Route path="/" element={<Index />} />
                
                {/* Campaign Management */}
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaign-builder" element={<CampaignBuilder />} />
                <Route path="/campaign-launcher" element={<CampaignLauncher />} />
                <Route path="/campaign-location-targeting" element={<CampaignLocationTargeting />} />
                <Route path="/campaign-schedule-manager" element={<CampaignScheduleManager />} />
                
                {/* Scheduler */}
                <Route path="/scheduler" element={<SchedulerDashboard />} />
                <Route path="/scheduler/create" element={<CreateSchedule />} />
                
                {/* Location Builder */}
                <Route path="/location-builder" element={<LocationBuilder />} />
                
                {/* Theme & Demo */}
                <Route path="/theme" element={<Theme />} />
                <Route path="/theme-system-demo" element={<ThemeSystemDemo />} />
                
                {/* Debug & Development */}
                <Route path="/debug-dashboard" element={<DebugDashboard />} />
                
                {/* Admin Pages */}
                <Route path="/admin/theme" element={<ThemeSettings />} />
                <Route path="/admin/menu" element={<MenuManagementPage />} />
                
                {/* 404 Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </QueryClientProvider>
    </GlobalThemeProvider>
  );
}

export default App;
