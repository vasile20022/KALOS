import { useParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ClipboardList, CalendarClock, Activity, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay, endOfWeek } from "date-fns";
import { useState, useEffect, useMemo } from "react";
import { Patient, Exercise } from "@/types";
import { toast } from "sonner";
import { getClientProfile } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getExercisesForClient, getScheduledExercisesForDate } from "@/lib/planUtils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/AuthContext";

export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [client, setClient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExercises, setShowExercises] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  
  const queryParams = new URLSearchParams(location.search);
  const shouldShowExercises = queryParams.get('tab') === 'plan';
  
  useEffect(() => {
    setShowExercises(shouldShowExercises);
  }, [shouldShowExercises]);
  
  useEffect(() => {
    const loadClient = async () => {
      setLoading(true);
      
      if (!id) {
        console.log("No client ID provided");
        setLoading(false);
        return;
      }
      
      try {
        console.log(`Loading client profile for ID: ${id}`);
        const clientData = await getClientProfile(id);
        
        if (clientData) {
          console.log("Client profile loaded:", clientData);
          setClient(clientData);
        } else {
          // Check if we have client data in localStorage
          const storedClient = localStorage.getItem(`patient_${id}`);
          
          if (storedClient) {
            const parsedClient = JSON.parse(storedClient);
            
            if (typeof parsedClient.createdAt === 'string') {
              parsedClient.createdAt = new Date(parsedClient.createdAt);
            }
            
            console.log("Using client profile from localStorage:", parsedClient);
            setClient(parsedClient);
          } else {
            console.log("Client not found in database or localStorage");
            toast.error("Client not found");
          }
        }
      } catch (error) {
        console.error("Error loading client:", error);
        toast.error("Error loading client data");
      }
      
      setLoading(false);
    };
    
    loadClient();
  }, [id]);

  useEffect(() => {
    const fetchExercises = async () => {
      if (!id || !showExercises) return;
      
      try {
        const clientExercises = await getExercisesForClient(id);
        setExercises(clientExercises);

        const dateString = format(selectedDate, "yyyy-MM-dd");
        const exercisesForDate = clientExercises.filter(ex => ex.date === dateString);
        setSelectedExercises(exercisesForDate);
      } catch (error) {
        console.error("Error fetching exercises:", error);
      }
    };

    fetchExercises();
  }, [id, showExercises, selectedDate]);

  useEffect(() => {
    const fetchAvailableExercises = async () => {
      if (!showExercises) return;
      
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData.user) {
          toast.error("Authentication required");
          return;
        }

        const { data, error } = await supabase
          .from("exercises")
          .select("*")
          .eq("coach_id", authData.user.id);
        
        if (error) throw error;
        
        if (data) {
          setAvailableExercises(data as Exercise[]);
        }
      } catch (error) {
        console.error("Error fetching available exercises:", error);
        toast.error("Failed to load exercises");
      }
    };

    fetchAvailableExercises();
  }, [showExercises]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    
    const dateString = format(date, "yyyy-MM-dd");
    const exercisesForDate = exercises.filter(ex => ex.date === dateString);
    setSelectedExercises(exercisesForDate);
  };

  const handleRemoveExercise = async (exerciseId: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_exercises")
        .delete()
        .eq("id", exerciseId);
      
      if (error) throw error;
      
      setExercises(prevExercises => 
        prevExercises.filter(ex => ex.id !== exerciseId)
      );
      
      setSelectedExercises(prevSelected => 
        prevSelected.filter(ex => ex.id !== exerciseId)
      );
      
      toast.success("Exercise removed from plan");
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast.error("Failed to remove exercise");
    }
  };

  const handleAddExercise = async (exerciseId: string, timeSlot: string) => {
    if (!id || !user) {
      toast.error("Missing required information");
      return;
    }

    try {
      const exerciseData = availableExercises.find(ex => ex.id === exerciseId);
      if (!exerciseData) {
        toast.error("Exercise not found");
        return;
      }

      let planId;
      const { data: existingPlans, error: planError } = await supabase
        .from("exercise_plans")
        .select("id")
        .eq("client_id", id)
        .limit(1);
      
      if (planError) throw planError;
      
      if (existingPlans && existingPlans.length > 0) {
        planId = existingPlans[0].id;
      } else {
        const { data: newPlan, error: createError } = await supabase
          .from("exercise_plans")
          .insert({
            name: `${client?.name}'s Exercise Plan`,
            client_id: id,
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
          exercise_id: exerciseId,
          scheduled_date: formattedDate,
          time_slot: timeSlot,
        })
        .select(`
          *,
          exercises(*)
        `)
        .single();
      
      if (error) throw error;

      const timeParts = timeSlot.split(" - ");
      const newExercise = {
        id: data.id,
        exerciseId: data.exercise_id,
        exercise: data.exercises,
        day: getWeekDayFromDate(selectedDate),
        timeSlot: {
          id: `ts-${timeParts[0]}-${timeParts[1]}`,
          startTime: timeParts[0] || "",
          endTime: timeParts[1] || ""
        },
        patientId: id,
        date: formattedDate
      };
      
      setExercises(prev => [...prev, newExercise]);
      setSelectedExercises(prev => [...prev, newExercise]);
      
      toast.success("Exercise added to plan");
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast.error("Failed to add exercise to plan");
    }
  };

  const getWeekDayFromDate = (date: Date) => {
    const dayIndex = date.getDay();
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    return days[dayIndex];
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };
  
  const bookedTimeSlots = useMemo(() => {
    return selectedExercises.map(ex => ex.timeSlot.startTime + " - " + ex.timeSlot.endTime);
  }, [selectedExercises]);

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

  const availableTimeSlots = useMemo(() => {
    return allTimeSlots.filter(slot => !bookedTimeSlots.includes(slot));
  }, [allTimeSlots, bookedTimeSlots]);
  
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <p className="text-muted-foreground">Loading client data...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-96">
          <h1 className="text-2xl font-bold">Client not found</h1>
          <p className="text-muted-foreground mt-2">
            The client you're looking for doesn't exist or has been removed.
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate("/patients")}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Clients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const clientAge = client.age;
  const clientBMI = (client.weight / Math.pow(client.height / 100, 2)).toFixed(1);
  const filteredExercises = availableExercises.filter(ex => 
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const startDay = startOfMonth.getDay() === 0 ? 6 : startOfMonth.getDay() - 1;
  const totalDays = endOfMonth.getDate();

  const calendarDays = [];
  const weekDaysLabels = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  for (let i = 0; i < startDay; i++) {
    const prevMonthDay = new Date(startOfMonth);
    prevMonthDay.setDate(prevMonthDay.getDate() - (startDay - i));
    calendarDays.push({
      date: prevMonthDay,
      isCurrentMonth: false,
      isToday: isSameDay(prevMonthDay, new Date()),
      hasExercises: exercises.some(ex => ex.date === format(prevMonthDay, "yyyy-MM-dd"))
    });
  }

  for (let i = 1; i <= totalDays; i++) {
    const currentMonthDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    calendarDays.push({
      date: currentMonthDay,
      isCurrentMonth: true,
      isToday: isSameDay(currentMonthDay, new Date()),
      hasExercises: exercises.some(ex => ex.date === format(currentMonthDay, "yyyy-MM-dd"))
    });
  }

  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    const nextMonthDay = new Date(endOfMonth);
    nextMonthDay.setDate(nextMonthDay.getDate() + i);
    calendarDays.push({
      date: nextMonthDay,
      isCurrentMonth: false,
      isToday: isSameDay(nextMonthDay, new Date()),
      hasExercises: exercises.some(ex => ex.date === format(nextMonthDay, "yyyy-MM-dd"))
    });
  }

  return (
    <DashboardLayout allowedRoles={['coach', 'admin']}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate("/patients")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight animate-fade-in">
              {client.name} {client.surname}
            </h1>
          </div>
          <div className="flex gap-2">
            {!showExercises && (
              <Button onClick={() => {
                navigate(`/patients/${id}?tab=plan`);
                setShowExercises(true);
              }}>
                <ClipboardList className="mr-2 h-4 w-4" />
                View Exercise Plan
              </Button>
            )}
            {showExercises && (
              <Button variant="outline" onClick={() => {
                navigate(`/patients/${id}`);
                setShowExercises(false);
              }}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back to Profile
              </Button>
            )}
          </div>
        </div>

        {!showExercises ? (
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
              <CardDescription>
                Basic details and health information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Personal Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-medium">{clientAge} years</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Fitness Level</p>
                    <Badge variant="outline" className="capitalize">
                      {client.fitnessLevel}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Physical Measurements</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Height</p>
                    <p className="font-medium">{client.height} cm</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Weight</p>
                    <p className="font-medium">{client.weight} kg</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">BMI</p>
                    <p className="font-medium">{clientBMI}</p>
                  </div>
                </div>
              </div>
              
              {client.limitations && client.limitations.length > 0 && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Limitations</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {client.limitations.map((limitation) => (
                      <Badge key={limitation} variant="secondary" className="text-xs">
                        {limitation}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {client.notes && (
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
              
              <div className="pt-2 space-y-1">
                <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                <p className="text-sm">{format(new Date(client.createdAt), "MMMM d, yyyy")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader className="px-4 py-3 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{format(currentDate, "MMMM yyyy")}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={goToPreviousMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-xs"
                      onClick={goToToday}
                    >
                      Today
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={goToNextMonth}
                    >
                      <ChevronLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="grid grid-cols-7 text-center border-b">
                    {weekDaysLabels.map((day) => (
                      <div 
                        key={day} 
                        className="px-1 py-2 text-xs font-medium text-muted-foreground"
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-7">
                    {calendarDays.map((day, i) => (
                      <Button
                        key={i}
                        variant={isSameDay(day.date, selectedDate) ? "default" : "ghost"}
                        className={`
                          h-12 w-full rounded-none flex flex-col items-center justify-center p-1 relative
                          ${!day.isCurrentMonth ? 'text-muted-foreground opacity-50' : ''}
                          ${day.isToday && !isSameDay(day.date, selectedDate) ? 'bg-muted/50' : ''}
                        `}
                        onClick={() => handleDateSelect(day.date)}
                      >
                        <span className="text-xs md:text-sm">
                          {day.date.getDate()}
                        </span>
                        {day.hasExercises && (
                          <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary"></div>
                        )}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-base flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Selected Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center p-2 border rounded-md bg-muted/50">
                    <CalendarIcon className="h-5 w-5 mr-2 text-muted-foreground" />
                    <span className="font-medium">{format(selectedDate, "MMMM dd, yyyy")}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="px-4 py-3">
                  <CardTitle className="text-base">Selected Exercises</CardTitle>
                  <CardDescription>
                    Exercises scheduled for {format(selectedDate, "MMM dd")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {selectedExercises.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No exercises scheduled for this date
                    </div>
                  ) : (
                    <ul className="divide-y">
                      {selectedExercises.map(exercise => (
                        <li key={exercise.id} className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{exercise.exercise.name}</p>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <CalendarIcon className="mr-1 h-3 w-3" />
                              <span>
                                {exercise.timeSlot.startTime} - {exercise.timeSlot.endTime}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExercise(exercise.id)}
                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Available Exercises</CardTitle>
                  <CardDescription>
                    Select exercises to add to the plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Input 
                      placeholder="Search exercises..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    {filteredExercises.map(exercise => (
                      <Card key={exercise.id} className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <h4 className="font-medium">{exercise.name}</h4>
                              <Badge variant="outline" className="ml-2 text-xs capitalize">
                                {exercise.category}
                              </Badge>
                            </div>
                            <Badge className="capitalize">
                              {exercise.difficulty}
                            </Badge>
                          </div>
                          
                          {exercise.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {exercise.description}
                            </p>
                          )}
                          
                          <div className="mt-2">
                            <Label className="text-xs">Time Slot</Label>
                            {availableTimeSlots.length > 0 ? (
                              <Select onValueChange={(value) => handleAddExercise(exercise.id, value)}>
                                <SelectTrigger className="mt-1 h-8 text-xs">
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
                              <div className="p-2 mt-1 border rounded-md text-xs text-muted-foreground text-center">
                                No available time slots for this date
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
