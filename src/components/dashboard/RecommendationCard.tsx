import { ArrowRight } from 'lucide-react';
import { formatKg } from '../../lib/format';
import { INSIGHT_UI } from '../../lib/insightUi';
import type { Insight } from '../../lib/progression';
import type { Exercise } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export interface RecommendationCardProps {
  insight: Insight;
  exercise: Exercise;
  onLog: () => void;
}

export function RecommendationCard({
  insight,
  exercise,
  onLog,
}: RecommendationCardProps) {
  const ui = INSIGHT_UI[insight.kind];
  const Icon = ui.icon;

  return (
    <Card className="flex h-full flex-col p-5 transition hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <Badge tone={ui.tone}>
          <Icon className="h-3 w-3" />
          {ui.label}
        </Badge>
        <span className="pt-0.5 text-[10px] font-semibold uppercase tracking-wider text-faint">
          {exercise.muscleGroup}
        </span>
      </div>

      <h3 className="mt-3 font-display text-lg font-semibold text-ink">
        {exercise.name}
      </h3>
      <p className="mt-1 text-sm font-medium text-ink/90">{insight.title}</p>
      <p className="mt-1 flex-1 text-sm leading-relaxed text-muted">
        {insight.message}
      </p>

      <div className="mt-4 flex items-end justify-between gap-3 border-t border-line pt-4">
        {insight.suggestedWeight !== null ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
              Peso sugerido
            </p>
            <p className="font-display text-xl font-semibold text-accent tabular-nums">
              {formatKg(insight.suggestedWeight)}
            </p>
          </div>
        ) : (
          <span className="text-xs text-faint">{exercise.equipment}</span>
        )}

        <Button size="sm" variant="secondary" onClick={onLog}>
          Registrar
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </Card>
  );
}
