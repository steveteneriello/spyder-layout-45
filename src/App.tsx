
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GlobalThemeProvider } from "@/contexts/GlobalThemeContext";
import Index from "./pages/Index";
import Campaigns from "./pages/Campaigns";
import SchedulerDashboard from "./pages/SchedulerDashboard";
import CreateSchedule from "./pages/CreateSchedule";
import LocationBuilder from "./pages/LocationBuilder";
import Theme from "./pages/Theme";
import AdminThemeSettings from "./pages/AdminThemeSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalThemeProvider>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/scheduler" element={<SchedulerDashboard />} />
              <Route path="/scheduler/create" element={<CreateSchedule />} />
              <Route path="/location-builder" element={<LocationBuilder />} />
              <Route path="/theme" element={<Theme />} />
              <Route path="/admin/theme" element={<AdminThemeSettings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </GlobalThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
