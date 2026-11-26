import {
  Archive,
  ArchiveRestore,
  Pencil,
  Plus,
  Trash2,
  Trophy,
} from 'lucide-react';
import { formatKg, pluralize } from '../../lib/format';
import { formatRelativeDate } from '../../lib/date';
import { INSIGHT_UI } from '../../lib/insightUi';
import type { Insight } from '../../lib/progression';
import type { ExerciseSummary } from '../../lib/stats';
import type { Exercise } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Sparkline } from '../progress/Sparkline';

export interface ExerciseCardProps {
  exercise: Exercise;
  summary: ExerciseSummary;
  insight?: Insight;
  onLog: () => void;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}

export function ExerciseCard({
  exercise,
  summary,
  insight,
  onLog,
  onEdit,
  onArchive,
  onDelete,
}: ExerciseCardProps) {
  const insightUi = insight ? INSIGHT_UI[insight.kind] : null;
  const InsightIcon = insightUi?.icon;
  const sparkTone =
    insight?.kind === 'stagnant' || insight?.kind === 'change'
      ? 'warning'
      : insight?.kind === 'progress'
        ? 'positive'
        : 'accent';

  const prLabel =
    summary.prWeight > 0
      ? `${formatKg(summary.prWeight)} × ${summary.prWeightReps}`
      : summary.prReps > 0
        ? `${summary.prReps} reps`
        : '—';

  return (
    <Card className="flex h-full flex-col p-5 transition hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone="neutral">{exercise.muscleGroup}</Badge>
            {insight && insightUi && InsightIcon && (
              <Badge tone={insightUi.tone}>
                <InsightIcon className="h-3 w-3" />
                {insightUi.label}
              </Badge>
            )}
            {exercise.archived && <Badge tone="warning">Archivado</Badge>}
          </div>

          <h3 className="mt-2 truncate font-display text-lg font-semibold text-ink">
            {exercise.name}
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {exercise.equipment} · {exercise.targetSets} × {exercise.repMin}-
            {exercise.repMax} reps
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onEdit}
            aria-label={`Editar ${exercise.name}`}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onArchive}
            aria-label={
              exercise.archived
                ? `Restaurar ${exercise.name}`
                : `Archivar ${exercise.name}`
            }
          >
            {exercise.archived ? (
              <ArchiveRestore className="h-3.5 w-3.5" />
            ) : (
              <Archive className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-negative"
            onClick={onDelete}
            aria-label={`Eliminar ${exercise.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
            Última vez
          </p>
          {summary.lastLog && summary.lastDate ? (
            <p className="mt-0.5 text-sm font-semibold text-ink tabular-nums">
              {summary.lastWeight > 0
                ? formatKg(summary.lastWeight)
                : `${summary.lastLog.sets.reduce(
                    (best, set) => Math.max(best, set.reps),
                    0,
                  )} reps`}
              <span className="ml-1.5 text-xs font-normal text-faint">
                · {formatRelativeDate(summary.lastDate)}
              </span>
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-faint">Sin registros</p>
          )}
          <p className="mt-1 flex items-center gap-1 text-[11px] text-faint">
            <Trophy className="h-3 w-3" />
            PR {prLabel}
          </p>
        </div>

        <Sparkline
          values={summary.sparkline.map((point) => point.value)}
          tone={sparkTone}
        />
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <span className="text-xs text-faint">
          {summary.totalLogs}{' '}
          {pluralize(summary.totalLogs, 'registro', 'registros')}
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={onLog}
          disabled={exercise.archived}
        >
          <Plus className="h-3.5 w-3.5" />
          Registrar
        </Button>
      </div>
    </Card>
  );
}
