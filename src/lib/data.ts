import { User, Patient, Exercise, ExercisePlan, ScheduledExercise, TimeSlot, WeekDay, ExerciseProgress } from "../types";
import { format, subDays } from "date-fns";

// Mock users
export const users: User[] = [
  {
    id: "u1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@physio.com",
    role: "physiotherapist",
  },
  {
    id: "u2",
    name: "Dr. Michael Chen",
    email: "michael.chen@physio.com",
    role: "physiotherapist",
  },
  {
    id: "u3",
    name: "John Smith",
    email: "john.smith@client.com",
    role: "client",
  },
];

// Mock time slots
export const timeSlots: TimeSlot[] = [
  { id: "ts1", startTime: "08:00", endTime: "09:00" },
  { id: "ts2", startTime: "09:00", endTime: "10:00" },
  { id: "ts3", startTime: "10:00", endTime: "11:00" },
  { id: "ts4", startTime: "11:00", endTime: "12:00" },
  { id: "ts5", startTime: "13:00", endTime: "14:00" },
  { id: "ts6", startTime: "14:00", endTime: "15:00" },
  { id: "ts7", startTime: "15:00", endTime: "16:00" },
  { id: "ts8", startTime: "16:00", endTime: "17:00" },
];

// Mock patients with coach relationships
export const patients: Patient[] = [
  {
    id: "p1",
    name: "Emma",
    surname: "Wilson",
    age: 35,
    weight: 65,
    height: 168,
    fitnessLevel: "intermediate",
    limitations: ["Lower back pain"],
    notes: "Recovering from minor back injury",
    createdAt: new Date("2023-06-15"),
    createdBy: "u1",
    coachId: "u1",
  },
  {
    id: "p2",
    name: "James",
    surname: "Miller",
    age: 42,
    weight: 82,
    height: 180,
    fitnessLevel: "beginner",
    limitations: ["Knee pain"],
    notes: "Post knee surgery rehabilitation",
    createdAt: new Date("2023-05-28"),
    createdBy: "u1",
    coachId: "u1",
  },
  {
    id: "p3",
    name: "Sophia",
    surname: "Garcia",
    age: 29,
    weight: 58,
    height: 165,
    fitnessLevel: "advanced",
    limitations: [],
    notes: "Training for marathon",
    createdAt: new Date("2023-07-03"),
    createdBy: "u2",
    coachId: "u2",
  },
  {
    id: "p4",
    name: "Oliver",
    surname: "Taylor",
    age: 55,
    weight: 78,
    height: 175,
    fitnessLevel: "beginner",
    limitations: ["Shoulder mobility"],
    notes: "Rotator cuff strengthening",
    createdAt: new Date("2023-06-10"),
    createdBy: "u2",
    coachId: "u2",
  },
  {
    id: "p5",
    name: "John",
    surname: "Smith",
    age: 40,
    weight: 75,
    height: 178,
    fitnessLevel: "intermediate",
    limitations: [],
    notes: "Demo client account",
    createdAt: new Date("2023-07-01"),
    createdBy: "u1",
    coachId: "u1",
  },
];

// Mock exercises
export const exercises: Exercise[] = [
  {
    id: "e1",
    name: "Gentle Back Stretches",
    description: "Series of gentle stretches targeting the lower back to relieve tension and improve flexibility.",
    category: "flexibility",
    difficulty: "easy",
    parameters: {
      repetitions: 10,
      sets: 3,
      duration: 15,
      intensity: "low",
    },
    notes: "Focus on controlled movements and proper breathing",
  },
  {
    id: "e2",
    name: "Knee Stabilization",
    description: "Exercises designed to strengthen the muscles around the knee joint for better stability.",
    category: "rehabilitation",
    difficulty: "medium",
    parameters: {
      repetitions: 12,
      sets: 3,
      duration: 20,
      intensity: "medium",
    },
    notes: "Use resistance band for progressive overload",
  },
  {
    id: "e3",
    name: "Core Strengthening",
    description: "A series of exercises targeting the abdominal and lower back muscles to improve core stability.",
    category: "strength",
    difficulty: "medium",
    parameters: {
      repetitions: 15,
      sets: 4,
      duration: 25,
      intensity: "medium",
    },
    notes: "Maintain proper form to prevent strain",
  },
  {
    id: "e4",
    name: "Balance Training",
    description: "Exercises focused on improving balance and proprioception.",
    category: "balance",
    difficulty: "medium",
    parameters: {
      duration: 15,
      intensity: "medium",
    },
    notes: "Progress from stable to unstable surfaces",
  },
  {
    id: "e5",
    name: "Shoulder Mobility",
    description: "Gentle exercises to improve range of motion in the shoulder joint.",
    category: "flexibility",
    difficulty: "easy",
    parameters: {
      repetitions: 10,
      sets: 2,
      duration: 15,
      intensity: "low",
    },
    notes: "Avoid movements that cause pain",
  },
  {
    id: "e6",
    name: "Cardiovascular Endurance",
    description: "Low-impact cardio exercises to improve heart health and endurance.",
    category: "cardio",
    difficulty: "medium",
    parameters: {
      duration: 30,
      intensity: "medium",
    },
    notes: "Monitor heart rate during activity",
  },
];

// Generate dates for the past 14 days
const generatePastDates = (days: number) => {
  return Array.from({ length: days }).map((_, i) => {
    const date = subDays(new Date(), i);
    return format(date, "yyyy-MM-dd");
  });
};

const pastDates = generatePastDates(14);

// Link John Smith user to patient
const johnSmithPatient = patients.find(p => p.name === "John" && p.surname === "Smith");

// Mock scheduled exercises for John Smith (demo client)
const johnScheduledExercises: ScheduledExercise[] = [
  // Today's exercises
  {
    id: "se9",
    exerciseId: "e1",
    exercise: exercises.find(e => e.id === "e1")!,
    day: "monday",
    timeSlot: timeSlots[1],
    patientId: johnSmithPatient?.id || "p5",
    additionalNotes: "Focus on form",
    date: format(new Date(), "yyyy-MM-dd")
  },
  {
    id: "se10",
    exerciseId: "e3",
    exercise: exercises.find(e => e.id === "e3")!,
    day: "monday",
    timeSlot: timeSlots[2],
    patientId: johnSmithPatient?.id || "p5",
    date: format(new Date(), "yyyy-MM-dd")
  },
  // Past exercises (for the last 14 days)
  ...pastDates.slice(1).flatMap((date, index) => {
    const day = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"][
      new Date(date).getDay() === 0 ? 6 : new Date(date).getDay() - 1
    ] as WeekDay;
    
    // Add 1-2 exercises per day with some variety
    const exercisesToAdd = [];
    
    // Add core exercise almost every day
    if (index % 3 !== 0) {
      exercisesToAdd.push({
        id: `se-past-${date}-1`,
        exerciseId: "e3",
        exercise: exercises.find(e => e.id === "e3")!,
        day,
        timeSlot: timeSlots[1],
        patientId: johnSmithPatient?.id || "p5",
        date
      });
    }
    
    // Add different exercises on different days
    if (index % 2 === 0) {
      exercisesToAdd.push({
        id: `se-past-${date}-2`,
        exerciseId: "e1",
        exercise: exercises.find(e => e.id === "e1")!,
        day,
        timeSlot: timeSlots[2],
        patientId: johnSmithPatient?.id || "p5",
        date
      });
    } else if (index % 3 === 0) {
      exercisesToAdd.push({
        id: `se-past-${date}-2`,
        exerciseId: "e5",
        exercise: exercises.find(e => e.id === "e5")!,
        day,
        timeSlot: timeSlots[3],
        patientId: johnSmithPatient?.id || "p5",
        date
      });
    } else if (index % 5 === 0) {
      exercisesToAdd.push({
        id: `se-past-${date}-2`,
        exerciseId: "e6",
        exercise: exercises.find(e => e.id === "e6")!,
        day,
        timeSlot: timeSlots[4],
        patientId: johnSmithPatient?.id || "p5",
        date
      });
    }
    
    return exercisesToAdd;
  })
];

// Mock scheduled exercises for Emma's plan
const emmaScheduledExercises: ScheduledExercise[] = [
  {
    id: "se1",
    exerciseId: "e1",
    exercise: exercises.find(e => e.id === "e1")!,
    day: "monday",
    timeSlot: timeSlots[1],
    patientId: "p1",
    additionalNotes: "Focus on gentle movements",
  },
  {
    id: "se2",
    exerciseId: "e3",
    exercise: exercises.find(e => e.id === "e3")!,
    day: "monday",
    timeSlot: timeSlots[2],
    patientId: "p1",
    additionalNotes: "Use modified plank position if needed",
  },
  {
    id: "se3",
    exerciseId: "e5",
    exercise: exercises.find(e => e.id === "e5")!,
    day: "wednesday",
    timeSlot: timeSlots[1],
    patientId: "p1",
  },
  {
    id: "se4",
    exerciseId: "e6",
    exercise: exercises.find(e => e.id === "e6")!,
    day: "friday",
    timeSlot: timeSlots[2],
    patientId: "p1",
    additionalNotes: "Keep intensity low to moderate",
  },
];

// Mock scheduled exercises for James's plan
const jamesScheduledExercises: ScheduledExercise[] = [
  {
    id: "se5",
    exerciseId: "e2",
    exercise: exercises.find(e => e.id === "e2")!,
    day: "tuesday",
    timeSlot: timeSlots[3],
    patientId: "p2",
    additionalNotes: "Use lightest resistance band to start",
  },
  {
    id: "se6",
    exerciseId: "e4",
    exercise: exercises.find(e => e.id === "e4")!,
    day: "tuesday",
    timeSlot: timeSlots[4],
    patientId: "p2",
  },
  {
    id: "se7",
    exerciseId: "e2",
    exercise: exercises.find(e => e.id === "e2")!,
    day: "thursday",
    timeSlot: timeSlots[3],
    patientId: "p2",
    additionalNotes: "Progress to medium resistance if comfortable",
  },
  {
    id: "se8",
    exerciseId: "e6",
    exercise: exercises.find(e => e.id === "e6")!,
    day: "saturday",
    timeSlot: timeSlots[1],
    patientId: "p2",
    additionalNotes: "Low impact only, no jumping",
  },
];

// Mock exercise plans - add John Smith's plan
export const exercisePlans: ExercisePlan[] = [
  {
    id: "ep1",
    patientId: "p1",
    exercises: emmaScheduledExercises,
    startDate: new Date("2023-07-10"),
    endDate: new Date("2023-08-07"),
    createdAt: new Date("2023-07-08"),
    updatedAt: new Date("2023-07-08"),
    createdBy: "u1",
  },
  {
    id: "ep2",
    patientId: "p2",
    exercises: jamesScheduledExercises,
    startDate: new Date("2023-07-11"),
    endDate: new Date("2023-08-08"),
    createdAt: new Date("2023-07-09"),
    updatedAt: new Date("2023-07-09"),
    createdBy: "u1",
  },
  {
    id: "ep3",
    patientId: johnSmithPatient?.id || "p5",
    exercises: johnScheduledExercises,
    startDate: new Date(subDays(new Date(), 14)),
    endDate: new Date(subDays(new Date(), -14)),
    createdAt: new Date(subDays(new Date(), 14)),
    updatedAt: new Date(subDays(new Date(), 14)),
    createdBy: "u1",
  },
];

// Initialize mock exercise progress data
const mockProgressData: ExerciseProgress[] = [];

// Generate some mock progress data for past exercises
pastDates.slice(1, 12).forEach((date, index) => {
  // Add progress for core strengthening - showing improvement over time
  if (index % 3 !== 0) {
    const baseReps = 12;
    const improvement = Math.floor(index / 2);
    
    mockProgressData.push({
      exerciseId: "e3",
      date,
      completed: true,
      actualSets: 3,
      actualReps: baseReps + improvement,
      targetSets: 3,
      targetReps: 15,
      exerciseName: "Core Strengthening",
      category: "strength",
      patientId: johnSmithPatient?.id || "p5",
      feedback: index % 4 === 0 ? "Feeling stronger today" : undefined
    });
  }
  
  // Add progress for back stretches - consistent performance
  if (index % 2 === 0) {
    mockProgressData.push({
      exerciseId: "e1",
      date,
      completed: true,
      actualSets: 3,
      actualReps: 10,
      targetSets: 3,
      targetReps: 10,
      exerciseName: "Gentle Back Stretches",
      category: "flexibility",
      patientId: johnSmithPatient?.id || "p5"
    });
  }
  
  // Add progress for shoulder mobility - some days missed
  if (index % 3 === 0) {
    mockProgressData.push({
      exerciseId: "e5",
      date,
      completed: index % 6 !== 0,
      actualSets: index % 6 !== 0 ? 2 : 0,
      actualReps: index % 6 !== 0 ? 8 : 0,
      targetSets: 2,
      targetReps: 10,
      exerciseName: "Shoulder Mobility",
      category: "flexibility",
      patientId: johnSmithPatient?.id || "p5",
      feedback: index % 6 === 0 ? "Skipped due to soreness" : undefined
    });
  }
  
  // Add progress for cardio - duration increases over time
  if (index % 5 === 0) {
    const baseDuration = 15;
    const improvement = Math.floor(index / 3) * 5;
    
    mockProgressData.push({
      exerciseId: "e6",
      date,
      completed: true,
      actualDuration: baseDuration + improvement,
      targetDuration: 30,
      exerciseName: "Cardiovascular Endurance",
      category: "cardio",
      patientId: johnSmithPatient?.id || "p5",
      feedback: "Feeling less winded today"
    });
  }
});

// Authentication helpers
export const authenticateUser = (email: string, password: string): User | null => {
  // In a real app, you would validate credentials against a backend
  // For now, we'll check if the email matches any user in our users array
  if (password.length >= 6) {
    const user = users.find(u => u.email === email);
    if (user) {
      return user;
    }
  }
  return null;
};

// Helper to get a patient's exercise plan
export const getPatientExercisePlan = (patientId: string): ExercisePlan | undefined => {
  return exercisePlans.find(plan => plan.patientId === patientId);
};

// Helper to get a patient's scheduled exercises
export const getPatientScheduledExercises = (patientId: string): ScheduledExercise[] => {
  const plan = getPatientExercisePlan(patientId);
  return plan ? plan.exercises : [];
};

// Helper to get all exercises for a patient (for the patient plan dialog)
export const getExercisesForPatient = (patientId: string): ScheduledExercise[] => {
  return getPatientScheduledExercises(patientId);
};

// Helper to get exercises scheduled for a specific day
export const getExercisesForDay = (patientId: string, day: WeekDay): ScheduledExercise[] => {
  const exercises = getPatientScheduledExercises(patientId);
  const today = format(new Date(), "yyyy-MM-dd");
  
  // Filter exercises: include both recurring weekly exercises (day matches and no date)
  // and exercises scheduled specifically for today
  return exercises.filter(exercise => 
    (exercise.day === day && !exercise.date) || // Weekly recurring exercises
    (exercise.day === day && exercise.date === today) // Today's specific exercises
  );
};

// Helper to get exercises scheduled for a specific date
export const getExercisesForDate = (patientId: string, date: string): ScheduledExercise[] => {
  const allExercises = getPatientScheduledExercises(patientId);
  return allExercises.filter(exercise => exercise.date === date);
};

// Helper to save exercise progress
export const saveExerciseProgress = (progress: ExerciseProgress): void => {
  const existingProgressJSON = localStorage.getItem('exerciseProgress');
  let allProgress: ExerciseProgress[] = existingProgressJSON 
    ? JSON.parse(existingProgressJSON) 
    : [...mockProgressData];
  
  // Check if there's already progress for this exercise on this date
  const existingIndex = allProgress.findIndex(
    p => p.exerciseId === progress.exerciseId && p.date === progress.date && p.patientId === progress.patientId
  );
  
  if (existingIndex >= 0) {
    allProgress[existingIndex] = progress;
  } else {
    allProgress.push(progress);
  }
  
  localStorage.setItem('exerciseProgress', JSON.stringify(allProgress));
};

// Helper to get all exercise progress for a patient
export const getPatientExerciseProgress = (patientId: string): ExerciseProgress[] => {
  const progressJSON = localStorage.getItem('exerciseProgress');
  if (!progressJSON) {
    return mockProgressData.filter(p => p.patientId === patientId);
  }
  
  const allProgress: ExerciseProgress[] = JSON.parse(progressJSON);
  return allProgress.filter(p => p.patientId === patientId);
};

// Helper to get exercise progress for a specific date
export const getExerciseProgressForDate = (
  patientId: string, 
  date: string
): ExerciseProgress[] => {
  const allProgress = getPatientExerciseProgress(patientId);
  return allProgress.filter(p => p.date === date);
};

// Helper to get a patient by user ID
export const getPatientByUserId = (userId: string): Patient | undefined => {
  return patients.find(patient => 
    patient.name.toLowerCase() === users.find(u => u.id === userId)?.name.toLowerCase()
  );
};

// Helper to get a coach's patients
export const getCoachPatients = (coachId: string): Patient[] => {
  return patients.filter(patient => patient.coachId === coachId);
};

