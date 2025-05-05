
import { Exercise } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { User, Edit, Trash, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ExerciseCardWithOwnershipProps {
  exercise: Exercise;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exerciseId: string) => void;
  compact?: boolean;
}

export default function ExerciseCardWithOwnership({ 
  exercise,
  onEdit,
  onDelete,
  compact = false
}: ExerciseCardWithOwnershipProps) {
  const isDefault = exercise.coach_id === null;
  
  return (
    <Card className="overflow-hidden">
      <CardContent className={compact ? "p-4" : "p-6"}>
        <div className="flex items-center justify-between">
          <h3 className={`font-medium ${compact ? 'text-base' : 'text-lg'}`}>
            {exercise.name}
          </h3>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {exercise.category}
            </Badge>
          </div>
        </div>
        
        <p className={`${compact ? 'mt-1 text-sm' : 'mt-2'} text-muted-foreground`}>
          {exercise.description}
        </p>
        
        <Separator className="my-3" />
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-muted-foreground">Difficulty:</span>{" "}
            <Badge variant="secondary" className="capitalize">
              {exercise.difficulty}
            </Badge>
          </div>
          
          {exercise.parameters.sets && (
            <div>
              <span className="text-muted-foreground">Sets:</span>{" "}
              <span className="font-medium">{exercise.parameters.sets}</span>
            </div>
          )}
          
          {exercise.parameters.repetitions && (
            <div>
              <span className="text-muted-foreground">Reps:</span>{" "}
              <span className="font-medium">{exercise.parameters.repetitions}</span>
            </div>
          )}
          
          {exercise.parameters.duration && (
            <div className="flex items-center">
              <Clock className="mr-1 h-3 w-3 text-muted-foreground" />
              <span>{exercise.parameters.duration} min</span>
            </div>
          )}
          
          <div>
            <Badge variant={isDefault ? "default" : "outline"} className="mt-1">
              {isDefault ? "Default" : "Custom"}
            </Badge>
          </div>
        </div>
      </CardContent>
      
      {(onEdit || onDelete) && (
        <CardFooter className={`bg-muted/50 ${compact ? 'p-2' : 'p-3'} gap-2 flex justify-end`}>
          {onEdit && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onEdit(exercise)}
              disabled={isDefault && !onDelete} // Only allow editing default exercises for admins
            >
              <Edit className="h-4 w-4 mr-1" /> 
              Edit
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onDelete(exercise.id)}
              className="text-destructive hover:text-destructive"
              disabled={isDefault} // Prevent deletion of default exercises
            >
              <Trash className="h-4 w-4 mr-1" /> 
              Delete
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
