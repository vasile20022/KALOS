
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  showClearFilters?: boolean;
  onClearFilters?: () => void;
  actionButton?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  showClearFilters = false,
  onClearFilters,
  actionButton
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-fade-in">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        {description}
      </p>
      {showClearFilters && onClearFilters && (
        <Button
          variant="link"
          onClick={onClearFilters}
          className="mt-4"
        >
          Clear filters
        </Button>
      )}
      {actionButton && (
        <div className="mt-4">
          {actionButton}
        </div>
      )}
    </div>
  );
}
