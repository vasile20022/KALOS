
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { Exercise, TimeSlot, ScheduledExercise, WeekDay } from "@/types";

// Function to get an exercise plan by ID
export const getExercisePlanById = async (planId: string) => {
  try {
    const { data, error } = await supabase
      .from("exercise_plans" as any)
      .select("*")
      .eq("id", planId)
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching exercise plan:", error);
    return null;
  }
};

// Function to get all exercise plans for a coach
export const getCoachExercisePlans = async () => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return [];
    }

    const { data, error } = await supabase
      .from("exercise_plans" as any)
      .select(`
        *,
        client_profiles(name, surname)
      `)
      .eq("coach_id", userData.user.id)
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching coach exercise plans:", error);
    return [];
  }
};

// Function to get scheduled exercises for a plan
export const getScheduledExercisesForPlan = async (planId: string) => {
  try {
    const { data, error } = await supabase
      .from("scheduled_exercises" as any)
      .select(`
        *,
        exercises(*)
      `)
      .eq("plan_id", planId)
      .order("scheduled_date", { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching scheduled exercises:", error);
    return [];
  }
};

// Function to get scheduled exercises for a date
export const getScheduledExercisesForDate = async (date: Date) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return [];
    }
    
    const formattedDate = format(date, "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("scheduled_exercises" as any)
      .select(`
        *,
        exercises(*),
        exercise_plans!inner(
          *,
          client_profiles(name, surname)
        )
      `)
      .eq("scheduled_date", formattedDate)
      .eq("exercise_plans.coach_id", userData.user.id);
    
    if (error) {
      console.error("Error in query:", error);
      return [];
    }
    
    // Transform data to match the ScheduledExercise type
    const scheduledExercises: ScheduledExercise[] = (data || []).map((item: any) => {
      // Map the day of week
      const dayIndex = parseISO(item.scheduled_date).getDay();
      const days: WeekDay[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const day = days[dayIndex];
      
      // Create time slot from the string
      const timeSlotParts = (item.time_slot || "").split(" - ");
      const timeSlot: TimeSlot = {
        id: `ts-${timeSlotParts[0]}-${timeSlotParts[1]}`,
        startTime: timeSlotParts[0] || "",
        endTime: timeSlotParts[1] || ""
      };
      
      return {
        id: item.id,
        exerciseId: item.exercise_id,
        exercise: item.exercises as Exercise,
        day,
        timeSlot,
        patientId: item.exercise_plans.client_id,
        additionalNotes: item.notes || undefined,
        date: item.scheduled_date
      };
    });
    
    return scheduledExercises;
  } catch (error) {
    console.error("Error fetching scheduled exercises for date:", error);
    return [];
  }
};

// Function to get exercises scheduled for a client
export const getExercisesForClient = async (clientId: string) => {
  try {
    const { data, error } = await supabase
      .from("scheduled_exercises" as any)
      .select(`
        *,
        exercises(*),
        exercise_plans!inner(*)
      `)
      .eq("exercise_plans.client_id", clientId)
      .order("scheduled_date", { ascending: true });
    
    if (error) {
      console.error("Error in query:", error);
      return [];
    }
    
    // Transform data to match the ScheduledExercise type
    const scheduledExercises: ScheduledExercise[] = (data || []).map((item: any) => {
      // Map the day of week
      const dayIndex = parseISO(item.scheduled_date).getDay();
      const days: WeekDay[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      const day = days[dayIndex];
      
      // Create time slot from the string
      const timeSlotParts = (item.time_slot || "").split(" - ");
      const timeSlot: TimeSlot = {
        id: `ts-${timeSlotParts[0]}-${timeSlotParts[1]}`,
        startTime: timeSlotParts[0] || "",
        endTime: timeSlotParts[1] || ""
      };
      
      return {
        id: item.id,
        exerciseId: item.exercise_id,
        exercise: item.exercises as Exercise,
        day,
        timeSlot,
        patientId: item.exercise_plans.client_id,
        additionalNotes: item.notes || undefined,
        date: item.scheduled_date
      };
    });
    
    return scheduledExercises;
  } catch (error) {
    console.error("Error fetching exercises for client:", error);
    return [];
  }
};

// Function to get clients with scheduled exercises for a week
export const getClientsWithExercisesForWeek = async (startDate: Date, endDate: Date) => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return {};
    }
    
    const startDateFormatted = format(startDate, "yyyy-MM-dd");
    const endDateFormatted = format(endDate, "yyyy-MM-dd");
    
    const { data, error } = await supabase
      .from("scheduled_exercises" as any)
      .select(`
        scheduled_date,
        exercise_plans!inner(
          client_id,
          client_profiles(name, surname)
        )
      `)
      .eq("exercise_plans.coach_id", userData.user.id)
      .gte("scheduled_date", startDateFormatted)
      .lte("scheduled_date", endDateFormatted);
    
    if (error) {
      console.error("Error fetching clients with exercises:", error);
      return {};
    }
    
    // Group exercises by date and client
    const clientsByDate: Record<string, { clientId: string; name: string; count: number }[]> = {};
    
    data?.forEach((item: any) => {
      const date = item.scheduled_date;
      const clientId = item.exercise_plans.client_id;
      const clientName = `${item.exercise_plans.client_profiles.name} ${item.exercise_plans.client_profiles.surname}`;
      
      if (!clientsByDate[date]) {
        clientsByDate[date] = [];
      }
      
      // Check if client already exists for this date
      const existingClient = clientsByDate[date].find(c => c.clientId === clientId);
      if (existingClient) {
        existingClient.count++;
      } else {
        clientsByDate[date].push({
          clientId,
          name: clientName,
          count: 1
        });
      }
    });
    
    return clientsByDate;
  } catch (error) {
    console.error("Error fetching clients with exercises for week:", error);
    return {};
  }
};

// Function to update the completed status of a scheduled exercise
export const updateExerciseStatus = async (exerciseId: string, completed: boolean) => {
  try {
    const { error } = await supabase
      .from("scheduled_exercises" as any)
      .update({ completed })
      .eq("id", exerciseId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error updating exercise status:", error);
    return false;
  }
};
