import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format, addDays, startOfWeek, isSameDay, endOfWeek, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, User } from "lucide-react";
import { WeekDay, ScheduledExercise } from "@/types";
import { Link } from "react-router-dom";
import { 
  getScheduledExercisesForDate, 
  getClientsWithExercisesForWeek, 
  getExercisesForClient 
} from "@/lib/planUtils";
import { useBreakpoint } from "@/hooks/use-mobile";

interface WeeklyCalendarProps {
  patientId: string;
  showAppointments?: boolean;
  showExercises?: boolean;
}

const weekDays: { day: WeekDay; label: string; fullLabel: string }[] = [
  { day: "monday", label: "M", fullLabel: "Mon" },
  { day: "tuesday", label: "T", fullLabel: "Tue" },
  { day: "wednesday", label: "W", fullLabel: "Wed" },
  { day: "thursday", label: "T", fullLabel: "Thu" },
  { day: "friday", label: "F", fullLabel: "Fri" },
  { day: "saturday", label: "S", fullLabel: "Sat" },
  { day: "sunday", label: "S", fullLabel: "Sun" },
];

export default function WeeklyCalendar({ 
  patientId, 
  showAppointments = false, 
  showExercises = true 
}: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<WeekDay>("monday");
  const [exercises, setExercises] = useState<ScheduledExercise[]>([]);
  const [clientsByDate, setClientsByDate] = useState<Record<string, { clientId: string; name: string; count: number }[]>>({});
  const [loading, setLoading] = useState(false);
  
  const isMobile = useBreakpoint("sm");
  
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday
  
  const goToPreviousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };
  
  const goToNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };
  
  const goToCurrentWeek = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
    
    // Set selected day to current day of week
    const today = new Date();
    const dayIndex = today.getDay() === 0 ? 6 : today.getDay() - 1; // Convert Sunday (0) to 6, and others to 0-5
    setSelectedDay(weekDays[dayIndex].day);
  };
  
  const handleDaySelect = (day: WeekDay, date: Date) => {
    setSelectedDay(day);
    setSelectedDate(date);
    fetchExercisesForDate(date);
  };
  
  // Fetch clients with exercises for the week
  useEffect(() => {
    const fetchClientsForWeek = async () => {
      if (!showAppointments) return;
      
      try {
        const clients = await getClientsWithExercisesForWeek(startDate, endDate);
        setClientsByDate(clients);
      } catch (error) {
        console.error("Error fetching clients for week:", error);
      }
    };
    
    fetchClientsForWeek();
  }, [startDate.getTime(), showAppointments]);

  const fetchExercisesForDate = async (date: Date) => {
    if (!showExercises) return;
    
    setLoading(true);
    try {
      // If patientId is set, fetch exercises for that specific patient
      if (patientId) {
        const clientExercises = await getExercisesForClient(patientId);
        const dateString = format(date, "yyyy-MM-dd");
        // Filter for the selected date
        const exercisesForDate = clientExercises.filter(ex => ex.date === dateString);
        setExercises(exercisesForDate);
      } else {
        // If no patientId, fetch all exercises for the date (for the coach view)
        const exercisesForDate = await getScheduledExercisesForDate(date);
        setExercises(exercisesForDate);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initialize exercises on mount and when dependencies change
  useEffect(() => {
    // Clear exercises immediately if showExercises is false
    if (!showExercises) {
      setExercises([]);
      return;
    }
    
    fetchExercisesForDate(selectedDate);
  }, [patientId, selectedDate, showExercises]);

  return (
    <Card className="animate-fade-in">
      <CardHeader className="pb-1 pt-3 px-3 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-primary" />
            <CardTitle className="text-lg">Weekly Schedule</CardTitle>
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousWeek}
              aria-label="Previous Week"
              className="h-7 w-7 rounded-full"
            >
              <ChevronLeft className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToCurrentWeek}
              className="text-xs rounded-full h-7 px-2"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextWeek}
              aria-label="Next Week"
              className="h-7 w-7 rounded-full"
            >
              <ChevronRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <CardDescription className="flex justify-between items-center text-xs mt-1">
          <span>{format(startDate, "MMM d") + " - " + format(endDate, "MMM d, yyyy")}</span>
          {!isMobile && (
            <div className="text-xs font-medium text-primary">
              {format(selectedDate, "EEE, MMM d")}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 pb-3">
        <div className="flex flex-col space-y-3 px-3">
          {/* Week day selector with reduced padding between letter and number */}
          <div className="flex justify-between rounded-lg bg-muted/40 p-1 my-1">
            {weekDays.map(({ day, label, fullLabel }, index) => {
              const date = addDays(startDate, index);
              const dateString = format(date, "yyyy-MM-dd");
              
              // Check if there are clients with exercises for this date
              const hasClients = clientsByDate[dateString] && clientsByDate[dateString].length > 0;
              
              const isCurrentDay = isToday(date);
              const isSelected = isSameDay(date, selectedDate);
              
              return (
                <Button
                  key={day}
                  variant={isSelected ? "default" : "ghost"}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center px-1 rounded-md transition-all relative h-18",
                    isSelected ? "shadow-sm" : "hover:bg-muted",
                    isCurrentDay && !isSelected && "text-primary border border-primary/20"
                  )}
                  onClick={() => handleDaySelect(day, date)}
                >
                  <div className="flex flex-col space-y-0">
                    <span className={cn(
                      "text-xs uppercase font-medium",
                      isSelected && "text-primary-foreground",
                      !isSelected && isCurrentDay && "text-primary"
                    )}>
                      {label}
                    </span>
                    
                    <span className={cn(
                      "text-base font-semibold",
                      isSelected && "text-primary-foreground",
                      !isSelected && isCurrentDay && "text-primary"
                    )}>
                      {format(date, "d")}
                    </span>
                  </div>
                  
                  {showAppointments && hasClients && (
                    <div className={cn(
                      "absolute bottom-1 w-1 h-1 rounded-full",
                      isSelected ? "bg-primary-foreground" : "bg-primary"
                    )}></div>
                  )}
                </Button>
              );
            })}
          </div>
          
          {/* Today's selected date banner for mobile */}
          {isMobile && (
            <div className="text-xs font-medium text-center text-primary border-b pb-1 mb-1">
              {format(selectedDate, "EEEE, MMMM d")}
            </div>
          )}
          
          <div className="space-y-2">
            {loading ? (
              <div className="py-4 text-center text-muted-foreground text-xs">
                Loading schedule...
              </div>
            ) : (
              <>
                {showAppointments && (
                  <div className="mb-2">
                    <h3 className="font-medium text-xs mb-2 flex items-center text-primary">
                      <Clock className="w-3 h-3 mr-1" />
                      Appointments for {format(selectedDate, "MMM d")}
                    </h3>
                    
                    {/* Client list for the selected date */}
                    {clientsByDate[format(selectedDate, "yyyy-MM-dd")]?.length > 0 ? (
                      <div className="space-y-1">
                        {clientsByDate[format(selectedDate, "yyyy-MM-dd")].map((client) => (
                          <div 
                            key={client.clientId}
                            className="rounded-md border p-2 text-xs animate-slide-in-up hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="rounded-full bg-primary/10 p-1 mr-1.5">
                                  <User className="h-2.5 w-2.5 text-primary" />
                                </div>
                                <Link to={`/patients/${client.clientId}`} className="font-medium hover:underline">
                                  {client.name}
                                </Link>
                              </div>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary">
                                {client.count} exercise{client.count !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Exercise Review
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-2 text-center text-muted-foreground text-xs border rounded-md bg-muted/20">
                        No clients scheduled for this day.
                      </div>
                    )}
                  </div>
                )}
                
                {showExercises && (
                  <>
                    {exercises.length === 0 ? (
                      <div className="py-4 text-center text-muted-foreground text-xs bg-muted/20 border rounded-md">
                        No exercises scheduled for this day.
                      </div>
                    ) : (
                      <>
                        {showAppointments && <h3 className="font-medium text-xs mb-2 text-primary">Exercises</h3>}
                        <div className="grid gap-2">
                          {exercises.map((exercise) => (
                            <ExerciseCard key={exercise.id} exercise={exercise} />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ExerciseCardProps {
  exercise: ScheduledExercise;
}

function ExerciseCard({ exercise }: ExerciseCardProps) {
  return (
    <div className="flex flex-col rounded-md border p-2 transition-all hover:border-primary/50 hover:shadow-sm animate-slide-in-up">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-xs">{exercise.exercise.name}</h4>
        <span className="inline-flex items-center rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
          {exercise.exercise.category}
        </span>
      </div>
      <div className="mt-0.5 flex items-center text-xs text-muted-foreground">
        <Clock className="mr-0.5 h-2.5 w-2.5 text-primary" />
        <span className="text-[10px]">
          {exercise.timeSlot.startTime} - {exercise.timeSlot.endTime}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
        {exercise.exercise.description}
      </p>
      <div className="mt-1.5 flex items-center justify-between text-[10px]">
        <div>
          {exercise.exercise.parameters.sets && exercise.exercise.parameters.repetitions && (
            <span className="text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {exercise.exercise.parameters.sets} × {exercise.exercise.parameters.repetitions}
            </span>
          )}
          {exercise.exercise.parameters.duration && (
            <span className="text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
              {exercise.exercise.parameters.duration} min
            </span>
          )}
        </div>
        <span className="font-medium text-primary text-[10px]">
          {exercise.exercise.difficulty}
        </span>
      </div>
      {exercise.additionalNotes && (
        <div className="mt-1.5 text-[10px] italic text-muted-foreground bg-muted/40 p-1.5 rounded">
          Note: {exercise.additionalNotes}
        </div>
      )}
    </div>
  );
}
