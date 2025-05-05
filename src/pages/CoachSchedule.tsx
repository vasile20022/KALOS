
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import WeeklyCalendar from "@/components/dashboard/WeeklyCalendar";
import { ExerciseTracker } from "@/components/exercises/ExerciseTracker";
import ExercisePlanDialog from "@/components/exercises/ExercisePlanDialog";
import { 
  User, 
  Search, 
  Filter,
  Calendar,
  UsersRound,
} from "lucide-react";
import { ScheduledExercise } from "@/types";
import { getExercisesForClient } from "@/lib/planUtils";
import { getClientProfiles } from "@/integrations/supabase/client";
import { useBreakpoint } from "@/hooks/use-mobile";

/**
 * Componente della pagina di pianificazione per gli allenatori
 * 
 * Questo componente gestisce:
 * - La visualizzazione del calendario settimanale degli appuntamenti
 * - La lista dei clienti/pazienti con funzionalità di ricerca
 * - La visualizzazione degli esercizi pianificati per ogni cliente
 * - La selezione di date e clienti specifici per visualizzare i piani
 */

export default function CoachSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [patientExercises, setPatientExercises] = useState<ScheduledExercise[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isMobile = useBreakpoint("md");
  
  // Fetch patients from database
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const profiles = await getClientProfiles();
        setPatients(profiles);
        
        // Set the first patient as selected if there are patients
        if (profiles.length > 0 && !selectedPatientId) {
          setSelectedPatientId(profiles[0].id);
        }
        
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatients();
  }, []);
  
  // Fetch exercises when selected patient or date changes
  useEffect(() => {
    if (!selectedPatientId) return;
    
    const fetchExercises = async () => {
      try {
        const dateString = format(selectedDate, "yyyy-MM-dd");
        const exercises = await getExercisesForClient(selectedPatientId);
        const exercisesForDate = exercises.filter(ex => ex.date === dateString);
        setPatientExercises(exercisesForDate);
      } catch (error) {
        console.error("Error fetching patient exercises:", error);
      }
    };
    
    fetchExercises();
  }, [selectedDate, selectedPatientId]);

  const filteredPatients = patients.filter(patient => {
    const fullName = `${patient.name} ${patient.surname}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout allowedRoles={['coach', 'admin']}>
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center gap-1">
            <Calendar className="h-5 w-5 text-primary hidden md:block" />
            <h1 className="text-xl md:text-2xl font-bold tracking-tight animate-fade-in">
              Coach Schedule
            </h1>
          </div>
          <p className="text-xs text-muted-foreground animate-fade-in">
            Manage patient exercise plans
          </p>
        </div>
        <div className="w-full md:w-auto">
          {patients.length > 0 && (
            <ExercisePlanDialog patients={patients} exercises={[]} />
          )}
        </div>
      </div>

      <div className="mb-4 animate-fade-in">
        <WeeklyCalendar 
          patientId=""
          showAppointments={true} 
          showExercises={false}
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-2">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search patients..."
              className="pl-7 h-8 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Filter className="h-3 w-3 mr-1" />
            Filter
          </Button>
        </div>
        
        <div className="mb-1 flex items-center">
          <UsersRound className="h-4 w-4 mr-1.5 text-primary" />
          <h2 className="text-sm font-semibold">Patients</h2>
        </div>
        
        {loading ? (
          <div className="py-4 text-center text-xs text-muted-foreground">
            Loading patients...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 mt-2">
            {filteredPatients.length === 0 ? (
              <div className="col-span-full py-4 text-center text-xs text-muted-foreground">
                No patients found.
              </div>
            ) : (
              filteredPatients.map(patient => (
                <Card 
                  key={patient.id} 
                  className={cn(
                    "cursor-pointer transition-all hover:border-primary hover:shadow-sm",
                    selectedPatientId === patient.id ? "border-primary bg-primary/5" : ""
                  )}
                  onClick={() => setSelectedPatientId(patient.id)}
                >
                  <CardContent className="p-2 flex items-center space-x-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-xs">{patient.name} {patient.surname}</h3>
                      <p className="text-[10px] text-muted-foreground capitalize">
                        {patient.fitnessLevel} • {patient.age} yrs
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
        
        {selectedPatientId && (
          <>
            <div className="flex items-center justify-between mt-4 mb-2">
              <div className="flex items-center">
                <User className="mr-1.5 h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">
                  {filteredPatients.find(p => p.id === selectedPatientId)?.name || "Patient"}'s Exercise Plan
                </h2>
              </div>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="rounded-full text-xs h-7 px-2"
              >
                <Link to={`/patients/${selectedPatientId}?tab=plan`}>
                  View Full Plan
                </Link>
              </Button>
            </div>
            
            <div className="bg-muted/20 rounded-lg p-2">
              <div className="text-xs font-medium text-primary mb-1">
                Exercises for {format(selectedDate, "MMMM d, yyyy")}
              </div>
              
              {patientExercises.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center text-xs">
                    <p className="text-muted-foreground">
                      No exercises scheduled for this patient on the selected day.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {patientExercises.map(exercise => (
                    <ExerciseTracker 
                      key={exercise.id} 
                      exercise={exercise}
                      isCoach={true}
                      dateString={format(selectedDate, "yyyy-MM-dd")}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
