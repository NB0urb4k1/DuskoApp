import { Pencil, Trash2 } from 'lucide-react';
import { formatSetCompact, formatVolume } from '../../lib/format';
import { logVolume } from '../../lib/stats';
import type { Exercise, LogEntry } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface LogItemProps {
  log: LogEntry;
  exercise: Exercise;
  onEdit: () => void;
  onDelete: () => void;
}

export function LogItem({
  log,
  exercise,
  onEdit,
  onDelete,
}: LogItemProps) {
  return (
    <div className="rounded-xl border border-line bg-surface/60 p-4 transition hover:border-line-strong">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">{exercise.name}</p>
            <Badge tone="neutral">{exercise.muscleGroup}</Badge>
            {exercise.archived && <Badge tone="warning">Archivado</Badge>}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {log.sets.map((set, index) => (
              <span
                key={index}
                className="rounded-md border border-line bg-elevated/50 px-2 py-1 text-xs text-ink tabular-nums"
              >
                {formatSetCompact(set)}
              </span>
            ))}
          </div>

          {log.notes && (
            <p className="mt-2 text-xs italic leading-relaxed text-muted">
              {log.notes}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold text-ink tabular-nums">
              {formatVolume(logVolume(log))}
            </p>
            <p className="text-[11px] text-faint">
              {log.sets.length}{' '}
              {log.sets.length === 1 ? 'serie' : 'series'}
            </p>
          </div>

          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onEdit}
              aria-label={`Editar registro de ${exercise.name}`}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-negative"
              onClick={onDelete}
              aria-label={`Eliminar registro de ${exercise.name}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
