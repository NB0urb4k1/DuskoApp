import { formatKg } from '../../lib/format';
import { INSIGHT_UI } from '../../lib/insightUi';
import type { Insight, InsightKind } from '../../lib/progression';
import { cn } from '../../lib/cn';
import { Badge } from '../ui/Badge';

const toneClasses: Record<InsightKind, string> = {
  increase: 'border-accent/25 bg-accent/5',
  change: 'border-warning/25 bg-warning/5',
  stagnant: 'border-warning/25 bg-warning/5',
  progress: 'border-positive/25 bg-positive/5',
  steady: 'border-line bg-canvas/40',
  baseline: 'border-info/25 bg-info/5',
};

const iconClasses: Record<InsightKind, string> = {
  increase: 'border-accent/20 bg-accent/10 text-accent',
  change: 'border-warning/20 bg-warning/10 text-warning',
  stagnant: 'border-warning/20 bg-warning/10 text-warning',
  progress: 'border-positive/20 bg-positive/10 text-positive',
  steady: 'border-line bg-elevated text-muted',
  baseline: 'border-info/20 bg-info/10 text-info',
};

export function RecommendationBanner({ insight }: { insight: Insight }) {
  const ui = INSIGHT_UI[insight.kind];
  const Icon = ui.icon;

  return (
    <div className={cn('rounded-xl border p-4', toneClasses[insight.kind])}>
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
            iconClasses[insight.kind],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-ink">{insight.title}</p>
            <Badge tone={ui.tone}>{ui.label}</Badge>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            {insight.message}
          </p>
          {insight.suggestedWeight !== null && (
            <p className="mt-2 text-xs font-semibold text-accent">
              Peso sugerido: {formatKg(insight.suggestedWeight)}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
