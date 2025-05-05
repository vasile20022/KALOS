import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Exercise } from "@/types";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from "@/components/ui/dialog";

interface ExerciseAssignmentListProps {
  exercises: Exercise[];
  onAssignExercise: (exercise: Exercise, timeSlot: string, notes?: string) => void;
  availableTimeSlots: string[]; // Array of available time slots
}

export default function ExerciseAssignmentList({ 
  exercises, 
  onAssignExercise,
  availableTimeSlots
}: ExerciseAssignmentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [open, setOpen] = useState(false);
  
  const filteredExercises = exercises.filter(exercise => {
    const searchString = searchQuery.toLowerCase();
    return (
      exercise.name.toLowerCase().includes(searchString) ||
      exercise.category.toLowerCase().includes(searchString) ||
      exercise.difficulty.toLowerCase().includes(searchString)
    );
  });

  const handleOpenAssignDialog = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setSelectedTimeSlot("");
    setNotes("");
    setOpen(true);
  };

  const handleAssign = () => {
    if (!selectedExercise || !selectedTimeSlot) return;
    
    onAssignExercise(selectedExercise, selectedTimeSlot, notes);
    setOpen(false);
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader className="px-4 py-3">
          <CardTitle className="text-base">Available Exercises</CardTitle>
          <CardDescription>Select exercises to add to the plan</CardDescription>
          <div className="relative mt-1">
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0 max-h-[300px] overflow-y-auto">
          {filteredExercises.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-muted-foreground">No exercises found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredExercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="p-3 hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => handleOpenAssignDialog(exercise)}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{exercise.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {exercise.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {exercise.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Exercise</DialogTitle>
            <DialogDescription>
              Schedule this exercise for the selected date
            </DialogDescription>
          </DialogHeader>

          {selectedExercise && (
            <div className="space-y-4 py-2">
              <div className="space-y-1">
                <h3 className="font-medium">{selectedExercise.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {selectedExercise.category}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {selectedExercise.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedExercise.description}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-slot">Time Slot</Label>
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                  <SelectTrigger id="time-slot">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTimeSlots.length > 0 ? (
                      availableTimeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="py-2 px-3 text-sm text-muted-foreground text-center">
                        No available time slots for this date
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add instructions or notes for this exercise"
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={!selectedTimeSlot}>
              Add to Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
