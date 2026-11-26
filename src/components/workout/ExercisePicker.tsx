import { useMemo, useState } from 'react';
import { Dumbbell, Search } from 'lucide-react';
import { formatRelativeDate } from '../../lib/date';
import { formatKg } from '../../lib/format';
import type { ExerciseSummary } from '../../lib/stats';
import type { Exercise } from '../../types';
import { Input } from '../ui/Field';

export interface ExercisePickerProps {
  exercises: Exercise[];
  summaries: Map<string, ExerciseSummary>;
  onSelect: (exerciseId: string) => void;
}

export function ExercisePicker({
  exercises,
  summaries,
  onSelect,
}: ExercisePickerProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const sorted = [...exercises].sort((a, b) =>
      a.name.localeCompare(b.name, 'es'),
    );

    if (!term) return sorted;

    return sorted.filter((exercise) =>
      `${exercise.name} ${exercise.muscleGroup} ${exercise.equipment}`
        .toLowerCase()
        .includes(term),
    );
  }, [exercises, search]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
        />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar entre tus ejercicios..."
          className="pl-9"
          aria-label="Buscar ejercicio"
          autoFocus
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line py-10 text-center">
          <Dumbbell className="h-5 w-5 text-faint" />
          <p className="mt-2 text-sm font-medium text-ink">Sin resultados</p>
          <p className="mt-1 text-xs text-muted">
            Prueba con otro nombre o grupo muscular.
          </p>
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {filtered.map((exercise) => {
            const summary = summaries.get(exercise.id);

            return (
              <button
                key={exercise.id}
                type="button"
                onClick={() => onSelect(exercise.id)}
                className="group flex items-center justify-between gap-3 rounded-xl border border-line bg-surface/50 p-3.5 text-left transition hover:border-accent/30 hover:bg-accent/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {exercise.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-faint">
                    {exercise.muscleGroup} · {exercise.equipment}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  {summary?.lastLog && summary.lastDate ? (
                    <>
                      <p className="text-xs font-semibold text-ink tabular-nums">
                        {summary.lastWeight > 0
                          ? formatKg(summary.lastWeight)
                          : `${summary.lastLog.sets.length} series`}
                      </p>
                      <p className="text-[10px] text-faint">
                        {formatRelativeDate(summary.lastDate)}
                      </p>
                    </>
                  ) : (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-faint">
                      Nuevo
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
