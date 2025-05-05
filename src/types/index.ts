
export type User = {
  id: string;
  name: string;
  email: string;
  role: 'physiotherapist' | 'admin' | 'client';
};

export type Patient = {
  id: string;
  name: string;
  surname: string;
  age: number;
  weight: number;
  height: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  limitations?: string[];
  notes?: string;
  createdAt: Date;
  createdBy: string;
  coachId?: string;
};

export type Exercise = {
  id: string;
  name: string;
  description: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'balance' | 'rehabilitation';
  difficulty: 'easy' | 'medium' | 'hard';
  parameters: {
    repetitions?: number;
    sets?: number;
    duration?: number; // in minutes
    intensity?: 'low' | 'medium' | 'high';
  };
  notes?: string;
  coach_id?: string | null; // null means it's a default exercise available to all coaches
};

export type TimeSlot = {
  id: string;
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
};

export type WeekDay = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type ScheduledExercise = {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  day: WeekDay;
  timeSlot: TimeSlot;
  patientId: string;
  additionalNotes?: string;
  date?: string;
};

export type ExercisePlan = {
  id: string;
  patientId: string;
  exercises: ScheduledExercise[];
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
};

export type ExerciseProgress = {
  exerciseId: string;
  date: string; // ISO date string (YYYY-MM-DD)
  completed: boolean;
  actualSets?: number;
  actualReps?: number;
  actualDuration?: number;
  weight?: number; // Weight in kg
  feedback?: string;
  exerciseName: string;
  targetSets?: number;
  targetReps?: number;
  targetDuration?: number;
  category: string;
  patientId: string;
};
