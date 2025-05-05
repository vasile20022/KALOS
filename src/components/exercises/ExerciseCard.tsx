
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Exercise } from "@/types";
import { ActivitySquare, Clock, Edit, Trash2 } from "lucide-react";

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exerciseId: string) => void;
  compact?: boolean;
  isReadOnly?: boolean;
}

export default function ExerciseCard({ 
  exercise, 
  onEdit, 
  onDelete, 
  compact = false,
  isReadOnly = false
}: ExerciseCardProps) {
  return (
    <Card className={`transition-all duration-300 hover:shadow-md ${compact ? "" : "hover:-translate-y-1"} animate-scale-in overflow-hidden`}>
      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-1">
              <ActivitySquare className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm">{exercise.name}</h3>
            </div>
            <div className="mt-1 flex items-center gap-1 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
                {exercise.category}
              </span>
              <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium ${
                exercise.difficulty === "easy" 
                  ? "bg-green-100 text-green-800" 
                  : exercise.difficulty === "medium" 
                  ? "bg-yellow-100 text-yellow-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {exercise.difficulty}
              </span>
              {exercise.parameters.duration && (
                <span className="inline-flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-0.5 h-3 w-3" />
                  {exercise.parameters.duration} min
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-1.5">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {exercise.description}
          </p>
        </div>
        
        {(exercise.parameters.sets || exercise.parameters.repetitions) && (
          <div className="mt-1.5">
            <div className="flex items-center text-xs">
              <span className="font-medium mr-1">Sets/Reps:</span>
              <span className="text-muted-foreground">
                {exercise.parameters.sets || "-"} × {exercise.parameters.repetitions || "-"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
      {(!isReadOnly && (onEdit || onDelete)) && (
        <CardFooter className="px-3 py-1.5 bg-secondary/20 flex justify-end gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(exercise)}
              className="h-7 px-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(exercise.id)}
              className="h-7 px-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
