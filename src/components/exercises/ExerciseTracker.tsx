
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScheduledExercise, ExerciseProgress } from "@/types";
import { Check, Clock, Save } from "lucide-react";

interface ExerciseTrackerProps {
  exercise: ScheduledExercise;
  isCoach?: boolean;
  onSaveProgress?: (progress: ExerciseProgress) => void;
  dateString?: string;
}

export function ExerciseTracker({ 
  exercise, 
  isCoach = false,
  onSaveProgress,
  dateString
}: ExerciseTrackerProps) {
  const { toast } = useToast();
  const [completed, setCompleted] = useState(false);
  const [actualSets, setActualSets] = useState(exercise.exercise.parameters.sets || 0);
  const [actualReps, setActualReps] = useState(exercise.exercise.parameters.repetitions || 0);
  const [actualDuration, setActualDuration] = useState(exercise.exercise.parameters.duration || 0);
  const [weight, setWeight] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const currentDate = dateString || new Date().toISOString().split('T')[0];

  useEffect(() => {
    const savedProgressString = localStorage.getItem(`exercise-progress-${exercise.id}-${currentDate}`);
    if (savedProgressString) {
      try {
        const savedProgress = JSON.parse(savedProgressString) as ExerciseProgress;
        setCompleted(savedProgress.completed);
        setActualSets(savedProgress.actualSets);
        setActualReps(savedProgress.actualReps);
        setActualDuration(savedProgress.actualDuration);
        setWeight(savedProgress.weight || 0);
        setFeedback(savedProgress.feedback);
      } catch (e) {
        console.error("Error loading saved progress", e);
      }
    }
  }, [exercise.id, currentDate]);

  const handleSave = () => {
    setIsSaving(true);
    
    const progress: ExerciseProgress = {
      exerciseId: exercise.id,
      date: currentDate,
      completed,
      actualSets,
      actualReps,
      actualDuration,
      weight,
      feedback,
      exerciseName: exercise.exercise.name,
      targetSets: exercise.exercise.parameters.sets,
      targetReps: exercise.exercise.parameters.repetitions,
      targetDuration: exercise.exercise.parameters.duration,
      category: exercise.exercise.category,
      patientId: exercise.patientId,
    };
    
    localStorage.setItem(`exercise-progress-${exercise.id}-${currentDate}`, JSON.stringify(progress));
    
    if (onSaveProgress) {
      onSaveProgress(progress);
    }
    
    setTimeout(() => {
      toast({
        title: "Progress saved!",
        description: "Your exercise progress has been recorded.",
      });
      setIsSaving(false);
    }, 800);
  };

  // Render read-only value for coach view
  const renderReadOnlyValue = (value: number | string) => {
    return (
      <div className="h-6 md:h-7 text-[0.625rem] md:text-xs px-1 md:px-2 bg-white border rounded-md flex items-center">
        {value}
      </div>
    );
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-1 pt-2 px-3 space-y-0 bg-muted/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm md:text-base">{exercise.exercise.name}</CardTitle>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[0.625rem] md:text-xs font-medium text-primary">
            {exercise.exercise.category}
          </span>
        </div>
        <CardDescription>
          <div className="flex items-center mt-0.5 text-[0.625rem] md:text-xs text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            <span>
              {exercise.timeSlot.startTime} - {exercise.timeSlot.endTime}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="px-3 py-2">
        <p className="text-[0.625rem] md:text-xs text-muted-foreground mb-2 line-clamp-2">
          {exercise.exercise.description}
        </p>
        
        <div className="grid grid-cols-5 gap-1 text-[0.625rem] md:text-xs">
          {exercise.exercise.parameters.sets && (
            <div>
              <label className="text-muted-foreground block">Sets</label>
              {isCoach ? (
                renderReadOnlyValue(actualSets)
              ) : (
                <Input
                  type="number"
                  value={actualSets}
                  onChange={(e) => setActualSets(parseInt(e.target.value) || 0)}
                  min={0}
                  max={20}
                  disabled={isCoach}
                  className="h-6 md:h-7 text-[0.625rem] md:text-xs px-1 md:px-2 bg-white"
                />
              )}
            </div>
          )}
          
          {exercise.exercise.parameters.repetitions && (
            <div>
              <label className="text-muted-foreground block">Reps</label>
              {isCoach ? (
                renderReadOnlyValue(actualReps)
              ) : (
                <Input
                  type="number"
                  value={actualReps}
                  onChange={(e) => setActualReps(parseInt(e.target.value) || 0)}
                  min={0}
                  max={100}
                  disabled={isCoach}
                  className="h-6 md:h-7 text-[0.625rem] md:text-xs px-1 md:px-2 bg-white"
                />
              )}
            </div>
          )}
          
          {exercise.exercise.parameters.duration && (
            <div>
              <label className="text-muted-foreground block">Min</label>
              {isCoach ? (
                renderReadOnlyValue(actualDuration)
              ) : (
                <Input
                  type="number"
                  value={actualDuration}
                  onChange={(e) => setActualDuration(parseInt(e.target.value) || 0)}
                  min={0}
                  max={180}
                  disabled={isCoach}
                  className="h-6 md:h-7 text-[0.625rem] md:text-xs px-1 md:px-2 bg-white"
                />
              )}
            </div>
          )}
          
          <div>
            <label className="text-muted-foreground block">KG</label>
            {isCoach ? (
              renderReadOnlyValue(weight)
            ) : (
              <Input
                type="number"
                value={weight}
                onChange={(e) => setWeight(parseInt(e.target.value) || 0)}
                min={0}
                max={500}
                disabled={isCoach}
                className="h-6 md:h-7 text-[0.625rem] md:text-xs px-1 md:px-2 bg-white"
              />
            )}
          </div>
          
          <div className="col-span-1 md:col-span-1">
            <label className="text-muted-foreground block">Notes</label>
            {isCoach ? (
              <div className="h-6 md:h-7 text-[0.625rem] md:text-xs px-1 md:px-2 bg-white border rounded-md flex items-center overflow-hidden overflow-ellipsis whitespace-nowrap">
                {feedback || "No notes"}
              </div>
            ) : (
              <Input
                type="text"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={isCoach ? "Coach notes" : "How did it feel?"}
                className="h-6 md:h-7 text-[0.625rem] md:text-xs px-1 md:px-2 bg-white"
                disabled={isCoach}
              />
            )}
          </div>
        </div>
      </CardContent>
      
      {/* Only show footer with controls for non-coach users */}
      {!isCoach ? (
        <CardFooter className="border-t pt-1 pb-1 px-3 flex justify-between bg-muted/10">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`completed-${exercise.id}`}
              checked={completed}
              onCheckedChange={(checked) => setCompleted(checked as boolean)}
              className="h-3 w-3 md:h-4 md:w-4"
            />
            <label
              htmlFor={`completed-${exercise.id}`}
              className="text-[0.625rem] md:text-xs font-medium leading-none"
            >
              Done
            </label>
          </div>
          
          <Button 
            onClick={handleSave} 
            disabled={isSaving} 
            size="sm" 
            className="h-6 md:h-7 text-[0.625rem] md:text-xs px-2"
          >
            {isSaving ? (
              <span className="flex items-center">
                <span className="h-3 w-3 mr-1 animate-spin border-2 border-current border-t-transparent rounded-full" />
                Saving
              </span>
            ) : (
              <>
                <Save className="mr-1 h-3 w-3" />
                Save
              </>
            )}
          </Button>
        </CardFooter>
      ) : completed ? (
        <CardFooter className="border-t pt-1 pb-1 px-3 justify-end bg-muted/10">
          <span className="flex items-center text-green-600 text-[0.625rem] md:text-xs">
            <Check className="mr-1 h-3 w-3" />
            Completed
          </span>
        </CardFooter>
      ) : null}
    </Card>
  );
}
