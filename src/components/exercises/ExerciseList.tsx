
import { Exercise } from "@/types";
import { Search } from "lucide-react";
import ExerciseCard from "./ExerciseCard";
import EmptyState from "./EmptyState";
import { useIsMobile } from "@/hooks/use-mobile";

interface ExerciseListProps {
  exercises: Exercise[];
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exerciseId: string) => void;
  searchQuery: string;
  categoryFilter: string;
  difficultyFilter: string;
  onClearFilters: () => void;
  isClient: boolean;
  isReadOnly?: boolean;
}

export default function ExerciseList({
  exercises,
  onEdit,
  onDelete,
  searchQuery,
  categoryFilter,
  difficultyFilter,
  onClearFilters,
  isClient,
  isReadOnly
}: ExerciseListProps) {
  const isMobile = useIsMobile();
  
  // Filter exercises based on the search query and filters
  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || exercise.category === categoryFilter;
    const matchesDifficulty =
      difficultyFilter === "all" || exercise.difficulty === difficultyFilter;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (filteredExercises.length === 0) {
    return (
      <EmptyState
        icon={<Search className="h-8 w-8 text-muted-foreground" />}
        title="No exercises found"
        description={
          isClient 
            ? "You don't have any exercises assigned yet." 
            : "We couldn't find any exercises matching your search."
        }
        showClearFilters={!!(searchQuery || categoryFilter !== "all" || difficultyFilter !== "all")}
        onClearFilters={onClearFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4">
      {filteredExercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onEdit={isReadOnly ? undefined : onEdit}
          onDelete={isReadOnly ? undefined : onDelete}
          compact={!isMobile}
        />
      ))}
    </div>
  );
}
