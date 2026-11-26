import type { ReactNode } from 'react';
import { Archive, Search } from 'lucide-react';
import { MUSCLE_GROUPS, type MuscleGroup } from '../../types';
import { cn } from '../../lib/cn';
import { Input } from '../ui/Field';

export interface ExerciseFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  muscleGroup: MuscleGroup | 'Todos';
  onMuscleGroupChange: (value: MuscleGroup | 'Todos') => void;
  showArchived: boolean;
  onShowArchivedChange: (value: boolean) => void;
}

export function ExerciseFilters({
  search,
  onSearchChange,
  muscleGroup,
  onMuscleGroupChange,
  showArchived,
  onShowArchivedChange,
}: ExerciseFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
        />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Buscar ejercicio..."
          className="pl-9"
          aria-label="Buscar ejercicio"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <FilterChip
          active={muscleGroup === 'Todos'}
          onClick={() => onMuscleGroupChange('Todos')}
        >
          Todos
        </FilterChip>
        {MUSCLE_GROUPS.map((group) => (
          <FilterChip
            key={group}
            active={muscleGroup === group}
            onClick={() => onMuscleGroupChange(group)}
          >
            {group}
          </FilterChip>
        ))}
        <button
          type="button"
          onClick={() => onShowArchivedChange(!showArchived)}
          aria-pressed={showArchived}
          className={cn(
            'ml-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition',
            showArchived
              ? 'border-accent/25 bg-accent/10 text-accent'
              : 'border-line text-faint hover:border-line-strong hover:text-ink',
          )}
        >
          <Archive className="h-3 w-3" />
          Archivados
        </button>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition',
        active
          ? 'border-accent/25 bg-accent/10 text-accent'
          : 'border-line text-muted hover:border-line-strong hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}
