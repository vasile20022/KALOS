
import LoginForm from "@/components/auth/LoginForm";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth/AuthContext";

/**
 * Componente della pagina di login
 * 
 * Questa pagina gestisce:
 * - La visualizzazione del form di login
 * - Il reindirizzamento automatico degli utenti già autenticati
 * - Stati di caricamento durante l'autenticazione
 */

export default function Login() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      if (user.role === 'client') {
        navigate("/client-schedule");
      } else {
        navigate("/dashboard");
      }
    }
  }, [isAuthenticated, navigate, user]);

  if (isLoading) {
    return <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30">
        <div className="animate-pulse flex space-x-2">
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
          <div className="h-3 w-3 bg-primary rounded-full"></div>
        </div>
      </div>;
  }
  
  if (isAuthenticated) {
    return null; // Will redirect based on useEffect
  }
  
  return <div className="flex min-h-screen flex-col bg-muted/30">
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="tracking-tight animate-fade-in font-extrabold text-4xl">KALOS</h1>
            <p className="text-muted-foreground animate-fade-in delay-75">
              Sign in to access your account
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>;
}
