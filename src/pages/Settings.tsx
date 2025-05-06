
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileForm from "@/components/settings/ProfileForm";
import PasswordForm from "@/components/settings/PasswordForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import ThemeToggle from "@/components/layout/ThemeToggle";
import { useAuth } from "@/lib/auth/AuthContext";

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
  const { user, updateProfile, changePassword } = useAuth();
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Function to refresh user profile data
  const handleProfileUpdate = () => {
    // In a real implementation, this would fetch the latest client profile data
    console.log("Profile updated, refreshing data");
    // For now, we'll just use a mock implementation
  };

  // Effect to fetch client profile if the user is a client
  useEffect(() => {
    const fetchClientProfile = async () => {
      if (user && user.role === 'client') {
        setIsLoading(true);
        try {
          // In a real implementation, this would fetch from the API
          // For now just set a mock profile
          setClientProfile({
            height: 180,
            weight: 75,
            age: 30,
            fitness_level: 'intermediate',
            limitations: ['None'],
            notes: ''
          });
        } catch (error) {
          console.error("Error fetching client profile:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchClientProfile();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            <ProfileForm 
              user={user}
              clientProfile={clientProfile}
              onProfileUpdate={handleProfileUpdate}
              updateProfile={updateProfile}
            />
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <PasswordForm changePassword={changePassword} />
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize the appearance of the application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Dark Mode</h3>
                      <p className="text-sm text-muted-foreground">
                        Toggle between light and dark theme
                      </p>
                    </div>
                    <ThemeToggle variant="switch" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
