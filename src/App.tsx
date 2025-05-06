
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Patients from "./pages/Patients";
import PatientProfile from "./pages/PatientProfile";
import Exercises from "./pages/Exercises";
import CoachSchedule from "./pages/CoachSchedule";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp";

/**
 * Componente principale dell'applicazione KALOS
 * 
 * Questo componente gestisce:
 * - Il routing dell'applicazione utilizzando React Router
 * - La configurazione del provider di autenticazione
 * - La configurazione del client per React Query
 * - I provider per i componenti di UI (Tooltip, Toast)
 */

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-right" closeButton />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/patients/:id" element={<PatientProfile />} />
              <Route path="/exercises" element={<Exercises />} />
              <Route path="/coach-schedule" element={<CoachSchedule />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
