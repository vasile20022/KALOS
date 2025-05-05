
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Patient } from "@/types";
import { Trash2, User, ClipboardList } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { useIsMobile } from "@/hooks/use-mobile";

export default function PatientsList({ 
  patients = [],
  onPatientDeleted
}: { 
  patients: Patient[];
  onPatientDeleted?: (patientId: string) => void;
}) {
  const navigate = useNavigate();
  const [deletingClient, setDeletingClient] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleDelete = async (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (window.confirm('Are you sure you want to remove this client?')) {
      setDeletingClient(clientId);
      
      try {
        console.log('Deleting client:', clientId);
        
        if (onPatientDeleted) {
          onPatientDeleted(clientId);
        }
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('An error occurred while removing the client');
      } finally {
        setDeletingClient(null);
      }
    }
  };

  const handleViewProfile = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Navigating to patient profile:', clientId);
    navigate(`/patients/${clientId}`);
  };

  const handleViewPlan = (e: React.MouseEvent, clientId: string) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Navigating to patient plan:', clientId);
    navigate(`/patients/${clientId}?tab=plan`);
  };

  return (
    <div className="grid gap-3 xs:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {patients.length === 0 ? (
        <div className="col-span-full text-center p-4 xs:p-8 border rounded-lg">
          <p className="text-muted-foreground">No clients found</p>
        </div>
      ) : (
        patients.map((client) => (
          <div
            key={client.id}
            className="group relative overflow-hidden rounded-lg border p-3 xs:p-4 hover:border-primary"
            role="button"
            onClick={() => {
              console.log('Clicked on client card:', client.id);
              navigate(`/patients/${client.id}`);
            }}
          >
            <div className="flex items-start justify-between space-x-4">
              <div className="space-y-1">
                <h3 className="font-semibold tracking-tight text-base xs:text-lg truncate max-w-[80%]">
                  {client.name} {client.surname}
                </h3>
                {client.fitnessLevel && (
                  <div className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    {client.fitnessLevel}
                  </div>
                )}
              </div>
            </div>
            <div className={`${isMobile ? 'flex mt-4' : 'absolute bottom-4 right-4'} gap-2 ${!isMobile && 'opacity-0 group-hover:opacity-100 transition-opacity'}`}>
              {!isMobile ? (
                <>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="destructive"
                        onClick={(e) => handleDelete(e, client.id)}
                        disabled={deletingClient === client.id}
                        className="h-9 w-9"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="p-2 text-xs">
                      {deletingClient === client.id ? 'Removing...' : 'Remove'}
                    </HoverCardContent>
                  </HoverCard>
                  
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button 
                        size="icon" 
                        variant="outline"
                        onClick={(e) => handleViewProfile(e, client.id)}
                        className="h-9 w-9"
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="p-2 text-xs">
                      View Profile
                    </HoverCardContent>
                  </HoverCard>
                  
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button 
                        size="icon"
                        onClick={(e) => handleViewPlan(e, client.id)}
                        className="h-9 w-9 bg-blue-500 hover:bg-blue-600"
                      >
                        <ClipboardList className="h-4 w-4" />
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent side="top" className="p-2 text-xs">
                      Exercise Plan
                    </HoverCardContent>
                  </HoverCard>
                </>
              ) : (
                <>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={(e) => handleDelete(e, client.id)}
                    disabled={deletingClient === client.id}
                    className="h-8 flex-1"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    {deletingClient === client.id ? 'Removing...' : 'Remove'}
                  </Button>
                  
                  <Button 
                    size="sm"
                    onClick={(e) => handleViewPlan(e, client.id)}
                    className="h-8 flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    <ClipboardList className="h-3.5 w-3.5 mr-1" />
                    Plan
                  </Button>
                </>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
