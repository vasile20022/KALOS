
/**
 * Componente DashboardLayout
 * 
 * Questo componente fornisce il layout principale per le pagine del dashboard.
 * Gestisce l'autenticazione, il controllo dei ruoli e la visualizzazione della 
 * barra laterale e della barra di navigazione principale.
 */

import { ReactNode, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/AuthContext";
import { toast } from "sonner";

interface DashboardLayoutProps {
  children: ReactNode;
  requiresAuth?: boolean;
  allowedRoles?: string[];
}

export default function DashboardLayout({ 
  children, 
  requiresAuth = true,
  allowedRoles = ['coach', 'admin']
}: DashboardLayoutProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Start with collapsed sidebar

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Effetto per il controllo dell'autenticazione e dei ruoli
  useEffect(() => {
    // Reindirizza al login se non autenticato e l'autenticazione è richiesta
    if (!isLoading && requiresAuth && !isAuthenticated) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }

    // Controlla che il ruolo dell'utente sia tra quelli consentiti
    if (!isLoading && isAuthenticated && user) {
      const userRole = user.role;
      
      if (!allowedRoles.includes(userRole)) {
        console.log(`Access denied: User role ${userRole} not allowed to access this page`);
        toast.error(`This page is only accessible to ${allowedRoles.join(' or ')} users`);
        navigate("/login");
        return;
      }
    }
  }, [isAuthenticated, isLoading, navigate, user, requiresAuth, allowedRoles, location.pathname]);

  // Mostra un indicatore di caricamento durante la verifica dell'autenticazione
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
      </div>
    );
  }

  // Reindirizza al login se non autenticato
  if (requiresAuth && !isAuthenticated) {
    return null; // Reindirizza al login
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1 pt-12 xs:pt-14 sm:pt-16">
        <div className="sidebar-container hidden md:block">
          <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        </div>
        <div className="content-container flex-1 flex justify-center">
          <main className={cn(
            "w-full h-full",
            "transition-all duration-300 ease-in-out",
            "px-2 sm:px-4 md:px-6 lg:px-8"
          )}>
            <div className="mx-auto w-full max-w-6xl py-2 xs:py-3 sm:py-4 md:py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
