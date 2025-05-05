import { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Exercise, Patient } from "@/types";
import { toast } from "sonner";
import { Loader2, Calendar as CalendarIcon, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ExerciseAssignmentList from "./ExerciseAssignmentList";
import { getAvailableTimeSlots, allTimeSlots } from "./timeSlotUtils";
import { fetchExercisesData } from "./exerciseUtils";

interface ExercisePlanDialogProps {
  patients: Patient[];
  exercises: Exercise[];
}

interface ScheduledExercise {
  exercise: Exercise;
  scheduledDate: Date;
  timeSlot: string;
  notes?: string;
}

export default function ExercisePlanDialog({ patients, exercises: initialExercises }: ExercisePlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedExercises, setSelectedExercises] = useState<ScheduledExercise[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const { user } = useAuth();

  useEffect(() => {
    if (open) {
      const loadExercises = async () => {
        try {
          const userExercises = await fetchExercisesData();
          setExercises(userExercises);
        } catch (error) {
          console.error("Error loading exercises:", error);
          toast.error("Failed to load exercises");
        }
      };
      
      loadExercises();
    }
  }, [open]);

  const bookedTimeSlots = selectedExercises
    .filter(ex => selectedDate && ex.scheduledDate.toDateString() === selectedDate.toDateString())
    .map(ex => ex.timeSlot);
  
  const availableTimeSlots = getAvailableTimeSlots(bookedTimeSlots);

  const handleAddExercise = (exercise: Exercise, timeSlot: string, notes?: string) => {
    if (!selectedDate) {
      toast.error("Please select a date first");
      return;
    }

    setSelectedExercises([
      ...selectedExercises,
      {
        exercise,
        scheduledDate: selectedDate,
        timeSlot,
        notes,
      },
    ]);
    
    toast.success(`Added ${exercise.name} to plan`);
  };

  const handleRemoveExercise = (index: number) => {
    const updatedExercises = [...selectedExercises];
    updatedExercises.splice(index, 1);
    setSelectedExercises(updatedExercises);
  };

  const resetForm = () => {
    setPlanName("");
    setPlanDescription("");
    setSelectedPatient("");
    setSelectedDate(new Date());
    setSelectedExercises([]);
  };

  const handleSavePlan = async () => {
    if (!planName.trim()) {
      toast.error("Please enter a plan name");
      return;
    }

    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    if (selectedExercises.length === 0) {
      toast.error("Please add at least one exercise to the plan");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: planError } = await supabase
        .from("exercise_plans" as any)
        .insert({
          name: planName,
          description: planDescription,
          client_id: selectedPatient,
          coach_id: user?.id,
        })
        .select();

      if (planError) {
        throw planError;
      }

      if (!data || data.length === 0) {
        throw new Error("No data returned from exercise plan creation");
      }

      const planData = data[0] as unknown as { id: string };
      
      if (!planData || !planData.id) {
        throw new Error("Invalid plan data structure");
      }
      
      const exercisesToInsert = selectedExercises.map((exercise) => ({
        plan_id: planData.id,
        exercise_id: exercise.exercise.id,
        scheduled_date: format(exercise.scheduledDate, "yyyy-MM-dd"),
        time_slot: exercise.timeSlot,
        notes: exercise.notes || null,
      }));

      const { error: exercisesError } = await supabase
        .from("scheduled_exercises" as any)
        .insert(exercisesToInsert);

      if (exercisesError) {
        throw exercisesError;
      }

      toast.success("Exercise plan created successfully");
      setOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving exercise plan:", error);
      toast.error("Failed to save exercise plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Exercise Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Exercise Plan</DialogTitle>
          <DialogDescription>
            Create a customized exercise plan for your client
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-name">Plan Name</Label>
              <Input
                id="plan-name"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Enter plan name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="patient">Select Patient</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Select a patient" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} {patient.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
              placeholder="Add additional notes about this plan"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
            <div>
              <Label className="mb-2 block">Select Date for Exercises</Label>
              <div className="border rounded-md p-2">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border pointer-events-auto"
                  initialFocus
                />
              </div>
              
              <div className="mt-4">
                <Label className="mb-2 block">Selected Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : <span>Select a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Assign Exercises</Label>
              <ExerciseAssignmentList 
                exercises={exercises} 
                onAssignExercise={handleAddExercise} 
                availableTimeSlots={availableTimeSlots}
              />
            </div>
          </div>

          {selectedExercises.length > 0 && (
            <div className="mt-4">
              <Label className="mb-2 block">Selected Exercises</Label>
              <div className="border rounded-md divide-y">
                {selectedExercises.map((exercise, index) => (
                  <div key={index} className="p-3 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{exercise.exercise.name}</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        <span>{format(exercise.scheduledDate, "PP")}</span>
                        <span className="mx-1">•</span>
                        <span>{exercise.timeSlot}</span>
                      </div>
                      {exercise.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{exercise.notes}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveExercise(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSavePlan} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Plan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
