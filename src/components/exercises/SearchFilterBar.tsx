
/**
 * Componente SearchFilterBar
 * 
 * Questo componente fornisce un'interfaccia di ricerca e filtri
 * per le liste di esercizi. Consente agli utenti di cercare esercizi
 * per nome e filtrare per categoria e difficoltà.
 */

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SearchFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter?: string;
  setCategoryFilter?: (category: string) => void;
  difficultyFilter?: string;
  setDifficultyFilter?: (difficulty: string) => void;
  showFilters?: boolean;
  placeholder?: string;
}

export default function SearchFilterBar({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  difficultyFilter,
  setDifficultyFilter,
  showFilters = true,
  placeholder = "Search exercises..."
}: SearchFilterBarProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex flex-col xs:flex-row gap-2 xs:gap-4 mb-6">
      {/* Campo di ricerca */}
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={placeholder}
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Filtri di categoria e difficoltà */}
      {showFilters && setCategoryFilter && setDifficultyFilter && (
        <div className="flex gap-2">
          <div className={isMobile ? "flex-1" : "w-32 xs:w-36"}>
            <Select
              value={categoryFilter}
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger className="h-10">
                <Filter className="mr-1 h-3.5 w-3.5" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="cardio">Cardio</SelectItem>
                <SelectItem value="flexibility">Flexibility</SelectItem>
                <SelectItem value="balance">Balance</SelectItem>
                <SelectItem value="rehabilitation">Rehabilitation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className={isMobile ? "flex-1" : "w-32 xs:w-36"}>
            <Select
              value={difficultyFilter}
              onValueChange={setDifficultyFilter}
            >
              <SelectTrigger className="h-10">
                <Filter className="mr-1 h-3.5 w-3.5" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
