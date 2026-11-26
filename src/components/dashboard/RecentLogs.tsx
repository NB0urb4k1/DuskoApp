import { ArrowRight, History } from 'lucide-react';
import { formatRelativeDate } from '../../lib/date';
import { formatKg, formatVolume } from '../../lib/format';
import {
  logVolume,
  maxWeight,
  sortLogsDesc,
} from '../../lib/stats';
import type { Exercise, LogEntry } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export interface RecentLogsProps {
  logs: LogEntry[];
  exercises: Exercise[];
  onSeeAll: () => void;
}

export function RecentLogs({ logs, exercises, onSeeAll }: RecentLogsProps) {
  const exerciseMap = new Map(
    exercises.map((exercise) => [exercise.id, exercise]),
  );
  const recent = sortLogsDesc(logs).slice(0, 5);

  return (
    <Card className="flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-semibold text-ink">
          Últimos registros
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSeeAll}
          className="px-2"
        >
          Ver todo
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8 text-center">
          <History className="h-6 w-6 text-faint" />
          <p className="mt-2 text-sm font-medium text-ink">Sin registros aún</p>
          <p className="mt-1 text-xs text-muted">
            Tu primera sesión aparecerá aquí.
          </p>
        </div>
      ) : (
        <div className="mt-2 divide-y divide-line">
          {recent.map((log) => {
            const exercise = exerciseMap.get(log.exerciseId);
            if (!exercise) return null;

            return (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {exercise.name}
                  </p>
                  <p className="text-xs text-faint">
                    {formatRelativeDate(log.date)} · {log.sets.length}{' '}
                    {log.sets.length === 1 ? 'serie' : 'series'}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-ink tabular-nums">
                    {maxWeight(log) > 0 ? formatKg(maxWeight(log)) : '—'}
                  </p>
                  <p className="text-[11px] text-faint tabular-nums">
                    {formatVolume(logVolume(log))}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
