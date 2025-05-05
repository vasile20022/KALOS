
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth/AuthContext";
import { getClientProfile } from "@/integrations/supabase/client";
import ProfileForm from "@/components/settings/ProfileForm";
import PasswordForm from "@/components/settings/PasswordForm";

/**
 * Componente della pagina delle impostazioni
 * 
 * Questo componente gestisce:
 * - La visualizzazione e modifica del profilo utente
 * - Il cambio password
 * - Il logout dall'applicazione
 * - Caricamento dei dati specifici del profilo cliente
 */

export default function Settings() {
  const [clientProfile, setClientProfile] = useState<any>(null);
  const navigate = useNavigate();
  const { user, signOut, updateProfile, changePassword } = useAuth();

  const fetchClientProfile = async () => {
    if (user?.id && user?.role === 'client') {
      const profile = await getClientProfile(user.id);
      if (profile) {
        setClientProfile(profile);
      }
    }
  };

  useEffect(() => {
    if (user) {
      // Fetch client profile data only if the user is a client
      if (user.role === 'client') {
        fetchClientProfile();
      }
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Account Settings</h1>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                Update your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm 
                user={user}
                clientProfile={clientProfile}
                onProfileUpdate={fetchClientProfile}
                updateProfile={updateProfile}
              />
              
              <Separator className="my-6" />
              
              <PasswordForm changePassword={changePassword} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                type="button" 
                onClick={handleLogout} 
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
