
/**
 * Componente LoginForm
 * 
 * Questo componente gestisce il form di accesso degli utenti.
 * Permette l'inserimento di credenziali (email e password) e
 * gestisce il processo di autenticazione.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LockKeyhole, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { Link } from "react-router-dom";

export default function LoginForm() {
  // Stati per memorizzare email, password e stato di caricamento
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, provider } = useAuth();

  /**
   * Gestisce l'invio del modulo di login
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { success, error, user } = await signIn(email, password);
      
      if (success && user) {
        toast.success(`Welcome back!`);
        
        // Reindirizza in base al ruolo dell'utente
        if (user.role === 'client') {
          navigate("/client-schedule");
        } else {
          navigate("/dashboard");
        }
      } else {
        toast.error(error || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error("Login failed. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden animate-scale-in">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                autoComplete="email"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm">
          {provider === 'mock' && (
            <>
              <p className="text-muted-foreground">
                Demo credentials: 
              </p>
              <p className="text-muted-foreground">
                Physiotherapist: sarah.johnson@physio.com / password123
              </p>
              <p className="text-muted-foreground">
                Client: john.smith@client.com / password123
              </p>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="text-center text-sm">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </CardFooter>
    </Card>
  );
}
