
import { useState, useEffect, useMemo } from "react";
import { format, addDays, startOfWeek, endOfWeek, isSameDay } from "date-fns";
import { 
  ClipboardList, 
  Calendar, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Edit,
  ArrowLeft,
  Trash,
  Plus,
  Save 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import ExerciseForm from "@/components/exercises/ExerciseForm";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getExercisesForClient } from "@/lib/planUtils";
import { ScheduledExercise, WeekDay, Exercise } from "@/types";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/lib/auth/AuthContext";

interface PatientPlanDialogProps {
  patientId: string;
  patientName: string;
}

export function PatientPlanDialog({ patientId, patientName }: PatientPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [exercises, setExercises] = useState<ScheduledExercise[]>([]);
  const [exercisesForSelectedDate, setExercisesForSelectedDate] = useState<ScheduledExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [isAddingExercise, setIsAddingExercise] = useState(false);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [exerciseNote, setExerciseNote] = useState<string>("");
  const { user } = useAuth();

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday

  useEffect(() => {
    if (open) {
      fetchExercises();
      fetchAvailableExercises();
    }
  }, [open, patientId]);

  useEffect(() => {
    const dateString = format(selectedDate, "yyyy-MM-dd");
    const filteredExercises = exercises.filter(ex => ex.date === dateString);
    setExercisesForSelectedDate(filteredExercises);
  }, [selectedDate, exercises]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const fetchedExercises = await getExercisesForClient(patientId);
      setExercises(fetchedExercises);
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableExercises = async () => {
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*");
      
      if (error) throw error;
      
      if (data) {
        setAvailableExercises(data as Exercise[]);
      }
    } catch (error) {
      console.error("Error fetching available exercises:", error);
    }
  };

  const goToPreviousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setIsEditFormOpen(true);
  };

  const handleSaveExercise = (updatedExercise: Exercise) => {
    console.log("Saving updated exercise:", updatedExercise);
    
    const updatedExercises = exercises.map(ex => 
      ex.exercise.id === updatedExercise.id 
        ? { ...ex, exercise: updatedExercise } 
        : ex
    );
    
    setExercises(updatedExercises);
    
    toast.success("Exercise updated successfully");
  };

  const handleDeleteExercise = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_exercises")
        .delete()
        .eq("id", scheduleId);
      
      if (error) throw error;
      
      setExercises(prevExercises => 
        prevExercises.filter(ex => ex.id !== scheduleId)
      );
      
      toast.success("Exercise removed from plan");
    } catch (error) {
      console.error("Error deleting scheduled exercise:", error);
      toast.error("Failed to remove exercise");
    }
  };

  const handleAddExercise = async () => {
    if (!selectedExerciseId || !selectedTimeSlot) {
      toast.error("Please select an exercise and time slot");
      return;
    }
    
    const selectedExercise = availableExercises.find(ex => ex.id === selectedExerciseId);
    if (!selectedExercise) {
      toast.error("Selected exercise not found");
      return;
    }

    if (!user) {
      toast.error("You must be logged in to add exercises");
      return;
    }
    
    try {
      let planId;
      
      const { data: existingPlans, error: planError } = await supabase
        .from("exercise_plans")
        .select("id")
        .eq("client_id", patientId)
        .limit(1);
      
      if (planError) throw planError;
      
      if (existingPlans && existingPlans.length > 0) {
        planId = existingPlans[0].id;
      } else {
        const { data: newPlan, error: createError } = await supabase
          .from("exercise_plans")
          .insert({
            name: `${patientName}'s Exercise Plan`,
            client_id: patientId,
            coach_id: user.id,
            description: "Exercise plan created from patient profile"
          })
          .select("id")
          .single();
        
        if (createError) throw createError;
        planId = newPlan.id;
      }
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("scheduled_exercises")
        .insert({
          plan_id: planId,
          exercise_id: selectedExerciseId,
          scheduled_date: formattedDate,
          time_slot: selectedTimeSlot,
          notes: exerciseNote || null
        })
        .select(`
          *,
          exercises(*)
        `)
        .single();
      
      if (error) throw error;
      
      const newScheduledExercise: ScheduledExercise = {
        id: data.id,
        exerciseId: data.exercise_id,
        exercise: data.exercises as Exercise,
        day: getWeekDayFromDate(selectedDate),
        timeSlot: {
          id: `ts-${selectedTimeSlot.split(' - ')[0]}-${selectedTimeSlot.split(' - ')[1]}`,
          startTime: selectedTimeSlot.split(' - ')[0] || "",
          endTime: selectedTimeSlot.split(' - ')[1] || ""
        },
        patientId: patientId,
        additionalNotes: exerciseNote,
        date: formattedDate
      };
      
      setExercises(prev => [...prev, newScheduledExercise]);
      
      setSelectedExerciseId("");
      setSelectedTimeSlot("");
      setExerciseNote("");
      setIsAddingExercise(false);
      
      toast.success("Exercise added to plan");
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast.error("Failed to add exercise to plan");
    }
  };

  const getWeekDayFromDate = (date: Date): WeekDay => {
    const dayIndex = date.getDay();
    const days: WeekDay[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[dayIndex];
  };

  // All available time slots
  const allTimeSlots = [
    "08:00 - 09:00",
    "09:00 - 10:00",
    "10:00 - 11:00",
    "11:00 - 12:00",
    "13:00 - 14:00",
    "14:00 - 15:00",
    "15:00 - 16:00",
    "16:00 - 17:00",
    "17:00 - 18:00",
    "18:00 - 19:00"
  ];

  // Get booked time slots
  const bookedTimeSlots = useMemo(() => {
    return exercisesForSelectedDate.map(ex => `${ex.timeSlot.startTime} - ${ex.timeSlot.endTime}`);
  }, [exercisesForSelectedDate]);

  // Filter available time slots
  const availableTimeSlots = useMemo(() => {
    return allTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));
  }, [allTimeSlots, bookedTimeSlots]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <ClipboardList className="mr-2 h-4 w-4" />
            View Exercise Plan
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">{patientName}'s Exercise Schedule</DialogTitle>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/patients/${patientId}`}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Profile
                </Link>
              </Button>
            </div>
            <DialogDescription>
              Manage exercise plan for {patientName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Calendar</h3>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={goToPreviousWeek}
                        className="h-7 w-7"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToToday}
                        className="text-xs h-7"
                      >
                        Today
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={goToNextWeek}
                        className="h-7 w-7"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {format(startDate, "MMMM d")} - {format(endDate, "MMMM d, yyyy")}
                  </p>
                  
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                      <div key={day} className="text-center text-xs font-medium">
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 7 }, (_, i) => {
                      const date = addDays(startDate, i);
                      const dateString = format(date, "yyyy-MM-dd");
                      const hasExercises = exercises.some(ex => ex.date === dateString);
                      const isToday = isSameDay(date, new Date());
                      const isSelected = isSameDay(date, selectedDate);
                      
                      return (
                        <Button
                          key={i}
                          variant={isSelected ? "default" : isToday ? "outline" : "ghost"}
                          className={cn(
                            "h-10 flex flex-col items-center justify-center p-0 relative",
                            isSelected ? "" : "hover:bg-secondary",
                          )}
                          onClick={() => setSelectedDate(date)}
                        >
                          <span>{format(date, "d")}</span>
                          {hasExercises && (
                            <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary"></div>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4">
                    <div className="text-sm font-medium mb-2">
                      Selected: {format(selectedDate, "EEEE, MMMM d")}
                    </div>
                    {!isAddingExercise ? (
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => setIsAddingExercise(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Exercise
                      </Button>
                    ) : (
                      <Card className="p-2">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="exercise" className="text-xs">Exercise</Label>
                            <Select 
                              value={selectedExerciseId} 
                              onValueChange={setSelectedExerciseId}
                            >
                              <SelectTrigger id="exercise" className="h-8 text-xs">
                                <SelectValue placeholder="Select exercise" />
                              </SelectTrigger>
                              <SelectContent>
                                {availableExercises.map(exercise => (
                                  <SelectItem key={exercise.id} value={exercise.id}>
                                    {exercise.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="time-slot" className="text-xs">Time Slot</Label>
                            {availableTimeSlots.length > 0 ? (
                              <Select 
                                value={selectedTimeSlot} 
                                onValueChange={setSelectedTimeSlot}
                              >
                                <SelectTrigger id="time-slot" className="h-8 text-xs">
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {availableTimeSlots.map(slot => (
                                    <SelectItem key={slot} value={slot}>
                                      {slot}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="p-2 border rounded-md text-xs text-muted-foreground text-center">
                                No available time slots for this date
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <Label htmlFor="note" className="text-xs">Note (Optional)</Label>
                            <Input
                              id="note"
                              value={exerciseNote}
                              onChange={(e) => setExerciseNote(e.target.value)}
                              className="h-8 text-xs"
                              placeholder="Add notes..."
                            />
                          </div>
                          
                          <div className="flex justify-end space-x-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 text-xs"
                              onClick={() => setIsAddingExercise(false)}
                            >
                              Cancel
                            </Button>
                            <Button 
                              size="sm" 
                              className="h-8 text-xs"
                              onClick={handleAddExercise}
                              disabled={!selectedExerciseId || !selectedTimeSlot || availableTimeSlots.length === 0}
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">
                Exercises for {format(selectedDate, "MMMM d")}
              </h3>
              
              {loading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading exercises...
                </div>
              ) : exercisesForSelectedDate.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground border rounded-lg">
                  No exercises scheduled for this day. Use the calendar to add exercises.
                </div>
              ) : (
                <div className="space-y-4">
                  {exercisesForSelectedDate.map((exercise) => (
                    <Card key={exercise.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-lg font-medium">{exercise.exercise.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {exercise.exercise.category}
                            </Badge>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={() => handleEditExercise(exercise.exercise)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => handleDeleteExercise(exercise.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-1 flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          <span>
                            {exercise.timeSlot.startTime} - {exercise.timeSlot.endTime}
                          </span>
                        </div>
                        
                        <p className="mt-2 text-sm text-muted-foreground">
                          {exercise.exercise.description}
                        </p>
                        
                        <Separator className="my-3" />
                        
                        <div className="flex flex-wrap justify-between gap-2">
                          <div className="flex flex-wrap gap-2">
                            {exercise.exercise.parameters.sets && (
                              <Badge variant="secondary">
                                {exercise.exercise.parameters.sets} sets
                              </Badge>
                            )}
                            {exercise.exercise.parameters.repetitions && (
                              <Badge variant="secondary">
                                {exercise.exercise.parameters.repetitions} reps
                              </Badge>
                            )}
                            {exercise.exercise.parameters.duration && (
                              <Badge variant="secondary">
                                {exercise.exercise.parameters.duration} min
                              </Badge>
                            )}
                          </div>
                          <Badge className="capitalize">
                            {exercise.exercise.difficulty}
                          </Badge>
                        </div>
                        
                        {exercise.additionalNotes && (
                          <div className="mt-3 text-sm italic text-muted-foreground">
                            <span className="font-medium">Note:</span> {exercise.additionalNotes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <ExerciseForm
        open={isEditFormOpen}
        onOpenChange={setIsEditFormOpen}
        onSave={handleSaveExercise}
        initialExercise={editingExercise || undefined}
      />
    </>
  );
}
