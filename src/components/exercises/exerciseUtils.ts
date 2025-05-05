
import { Exercise } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

// Sample exercises to use as a fallback only if absolutely necessary
const sampleExercises: Exercise[] = [
  {
    id: "sample-1",
    name: "Push-ups",
    description: "A classic exercise that targets the chest, shoulders, and triceps.",
    category: "strength",
    difficulty: "medium",
    parameters: {
      sets: 3,
      repetitions: 15
    }
  },
  {
    id: "sample-2",
    name: "Squats",
    description: "A fundamental lower body exercise that works the quadriceps, hamstrings, and glutes.",
    category: "strength",
    difficulty: "medium",
    parameters: {
      sets: 3,
      repetitions: 12
    }
  },
  {
    id: "sample-3",
    name: "Plank",
    description: "An isometric core strength exercise that involves maintaining a position similar to a push-up for the maximum possible time.",
    category: "strength",
    difficulty: "easy",
    parameters: {
      duration: 1
    }
  },
  {
    id: "sample-4",
    name: "Lunges",
    description: "A single-leg exercise that works the quadriceps, glutes, and hamstrings while also improving balance and coordination.",
    category: "strength",
    difficulty: "medium",
    parameters: {
      sets: 3,
      repetitions: 10
    }
  },
  {
    id: "sample-5",
    name: "Jumping Jacks",
    description: "A full body cardio exercise that increases your heart rate and improves coordination.",
    category: "cardio",
    difficulty: "easy",
    parameters: {
      duration: 3
    }
  }
];

export const fetchExercisesData = async (): Promise<Exercise[]> => {
  try {
    console.log("Fetching exercises directly from Supabase database...");
    
    // Check if user is authenticated first
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error("Authentication error:", authError);
      throw new Error("Authentication error: Please login first");
    }
    
    if (!authData.session) {
      console.error("No active session found");
      throw new Error("No active session: Please login first");
    }
    
    const userId = authData.session.user.id;
    console.log("Fetching exercises for user ID:", userId);
    
    // Query the exercises table directly
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('coach_id', userId);
    
    if (error) {
      console.error("Database query error:", error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      console.log("No exercises found for user ID:", userId);
    } else {
      console.log(`Found ${data.length} exercises for user ID ${userId}:`, data);
    }
    
    // Apply type assertion to ensure the data conforms to Exercise type
    const typedExercises: Exercise[] = (data || []).map((exercise: any) => {
      return {
        ...exercise,
        // Ensure category is one of the valid values
        category: exercise.category as "strength" | "cardio" | "flexibility" | "balance" | "rehabilitation",
        // Ensure difficulty is one of the valid values
        difficulty: exercise.difficulty as "easy" | "medium" | "hard",
        // Make sure parameters is properly formatted
        parameters: exercise.parameters || {}
      };
    });
    
    return typedExercises;
  } catch (error) {
    console.error("Error fetching exercises:", error);
    throw error;
  }
};

export const saveExercise = async (exercise: Exercise): Promise<Exercise | null> => {
  try {
    // Get the authenticated user's ID
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.error("Authentication error:", userError);
      throw new Error("Authentication required: Please login first");
    }
    
    const userId = userData.user.id;
    
    // Remove the temporary UUID if it's a new exercise
    const exerciseToSave = { ...exercise };
    if (exerciseToSave.id && exerciseToSave.id.startsWith('e')) {
      delete exerciseToSave.id;
    }

    // Ensure coach_id is set to the current user's ID
    exerciseToSave.coach_id = userId;
    
    console.log("Saving exercise with coach_id:", userId);

    if (!exerciseToSave.id) {
      // This is a new exercise
      console.log("Creating new exercise in database:", exerciseToSave);
      const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseToSave])
        .select()
        .single();
      
      if (error) {
        console.error("Error creating exercise:", error);
        throw error;
      }
      
      console.log("Successfully created exercise:", data);
      // Type assertion to ensure it matches the Exercise type
      return {
        ...data,
        category: data.category as "strength" | "cardio" | "flexibility" | "balance" | "rehabilitation",
        difficulty: data.difficulty as "easy" | "medium" | "hard",
        parameters: data.parameters || {}
      } as Exercise;
    } else {
      // This is an existing exercise that needs updating
      console.log("Updating existing exercise in database:", exerciseToSave);
      const { data, error } = await supabase
        .from('exercises')
        .update(exerciseToSave)
        .eq('id', exerciseToSave.id)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating exercise:", error);
        throw error;
      }
      
      console.log("Successfully updated exercise:", data);
      // Type assertion to ensure it matches the Exercise type
      return {
        ...data,
        category: data.category as "strength" | "cardio" | "flexibility" | "balance" | "rehabilitation",
        difficulty: data.difficulty as "easy" | "medium" | "hard",
        parameters: data.parameters || {}
      } as Exercise;
    }
  } catch (error) {
    console.error("Error saving exercise:", error);
    throw error;
  }
};

export const deleteExercise = async (exerciseId: string): Promise<boolean> => {
  try {
    console.log("Deleting exercise:", exerciseId);
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseId);
    
    if (error) {
      console.error("Error deleting exercise:", error);
      throw error;
    }
    
    console.log("Successfully deleted exercise:", exerciseId);
    return true;
  } catch (error) {
    console.error("Error deleting exercise:", error);
    throw error;
  }
};
