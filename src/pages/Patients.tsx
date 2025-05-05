
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PatientsList from "@/components/patients/PatientsList";
import { NewPatientDialog } from "@/components/patients/NewPatientDialog";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Patient } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth/AuthContext";
import { getClientProfiles, deleteClientProfile } from "@/integrations/supabase/client";

/**
 * Componente della pagina dei pazienti/clienti
 * 
 * Questo componente gestisce:
 * - La visualizzazione dell'elenco di tutti i pazienti/clienti
 * - La ricerca dei pazienti per nome
 * - La creazione di nuovi pazienti
 * - L'eliminazione di pazienti esistenti
 */

export default function Patients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [clients, setClients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    loadClients();
  }, [user?.role]);
  
  const loadClients = async () => {
    setIsLoading(true);
    try {
      // Load clients from Supabase
      const clientProfiles = await getClientProfiles();
      console.log('Loaded client profiles:', clientProfiles);
      setClients(clientProfiles);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Error loading clients");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClientDeleted = async (clientId: string) => {
    console.log('Client deleted:', clientId);
    
    // Delete from Supabase
    const success = await deleteClientProfile(clientId);
    
    if (success) {
      // Update local state immediately to reflect deletion
      setClients(prevClients => prevClients.filter(client => client.id !== clientId));
      toast.success("Client removed successfully");
    } else {
      toast.error("Failed to remove client");
    }
  };
  
  // Filter clients based on search query
  const filteredClients = clients.filter((client) => {
    const fullName = `${client.name} ${client.surname}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
            Clients
          </h1>
          <p className="text-muted-foreground animate-fade-in">
            Manage your clients and their exercise plans
          </p>
        </div>
        <NewPatientDialog onPatientAdded={loadClients} />
      </div>
      
      <div className="relative w-full sm:max-w-xs mb-6">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search clients..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center p-8">
          <p className="text-muted-foreground">Loading clients...</p>
        </div>
      ) : (
        <PatientsList 
          patients={filteredClients}
          onPatientDeleted={handleClientDeleted}
        />
      )}
    </DashboardLayout>
  );
}
