
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Loader2 } from "lucide-react";
import { Exercise, Patient } from "@/types";
import { toast } from "sonner";
import { fetchExercisesData, saveExercise, deleteExercise } from "@/components/exercises/exerciseUtils";
import { useAuth } from "@/lib/auth/AuthContext";
import SearchFilterBar from "@/components/exercises/SearchFilterBar";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ExercisePlanDialog from "@/components/exercises/ExercisePlanDialog";
import { getClientProfiles } from "@/integrations/supabase/client";
import ExerciseForm from "@/components/exercises/ExerciseForm";
import ExerciseList from "@/components/exercises/ExerciseList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Exercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | undefined>(undefined);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!user) {
      console.error("No authenticated user found");
      setError("Authentication required. Please login first.");
      setIsLoading(false);
      return;
    }
    
    console.log("Authenticated user:", user);
    fetchData();
    fetchPatients();
  }, [user?.id]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const exercisesData = await fetchExercisesData();
      setExercises(exercisesData || []);
      console.log("Fetched exercises in page:", exercisesData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Failed to load exercises");
      toast.error("Failed to load exercises. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatients = async () => {
    setIsLoadingPatients(true);
    try {
      const clientProfiles = await getClientProfiles();
      console.log("Loaded client profiles:", clientProfiles);
      setPatients(clientProfiles);
    } catch (error) {
      console.error("Error fetching patients:", error);
      toast.error("Failed to load patients data");
    } finally {
      setIsLoadingPatients(false);
    }
  };

  const handleSaveExercise = async (exercise: Exercise) => {
    try {
      const savedExercise = await saveExercise(exercise);
      
      if (savedExercise) {
        const existingIndex = exercises.findIndex(ex => ex.id === exercise.id);
        if (existingIndex >= 0) {
          const updatedExercises = [...exercises];
          updatedExercises[existingIndex] = savedExercise;
          setExercises(updatedExercises);
          toast.success("Exercise updated successfully");
        } else {
          setExercises([...exercises, savedExercise]);
          toast.success("Exercise created successfully");
        }
      }
    } catch (error) {
      console.error("Error in handleSaveExercise:", error);
      toast.error("Failed to save exercise: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    try {
      const success = await deleteExercise(exerciseId);
      
      if (success) {
        setExercises(exercises.filter((ex) => ex.id !== exerciseId));
        toast.success("Exercise deleted successfully");
      }
    } catch (error) {
      console.error("Error in handleDeleteExercise:", error);
      toast.error("Failed to delete exercise: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsFormOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("all");
    setDifficultyFilter("all");
  };

  const handleRetry = () => {
    fetchData();
    toast.info("Retrying to fetch exercises...");
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading exercise data...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            Please login to view and manage exercises
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3 mb-4 xs:mb-6">
        <div>
          <h1 className="text-2xl xs:text-3xl font-bold tracking-tight animate-fade-in">
            Exercise Library
          </h1>
          <p className="text-sm text-muted-foreground animate-fade-in">
            Manage your exercise library
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isLoadingPatients && (
            <ExercisePlanDialog patients={patients} exercises={exercises} />
          )}
          <Button onClick={() => setIsFormOpen(true)} size={isMobile ? "sm" : "default"}>
            <Plus className="mr-1 h-4 w-4" />
            {isMobile ? "Add" : "Add Exercise"}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading exercises</AlertTitle>
          <AlertDescription className="flex justify-between items-center">
            <span>{error}</span>
            <Button size="sm" onClick={handleRetry}>Retry</Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-2 xs:mt-4">
        <SearchFilterBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          difficultyFilter={difficultyFilter}
          setDifficultyFilter={setDifficultyFilter}
          showFilters={true}
          placeholder="Search exercises..."
        />
      </div>

      <div className="mt-2 xs:mt-4">
        <ExerciseList
          exercises={exercises}
          onEdit={handleEditExercise}
          onDelete={handleDeleteExercise}
          searchQuery={searchQuery}
          categoryFilter={categoryFilter}
          difficultyFilter={difficultyFilter}
          onClearFilters={handleClearFilters}
          isClient={false}
          isReadOnly={false}
        />
      </div>

      <ExerciseForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveExercise}
        initialExercise={editingExercise}
      />
    </DashboardLayout>
  );
}
