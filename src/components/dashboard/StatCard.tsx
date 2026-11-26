import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Card } from '../ui/Card';

type Tone = 'accent' | 'positive' | 'info' | 'warning';

const tones: Record<Tone, string> = {
  accent: 'border-accent/15 bg-accent/10 text-accent',
  positive: 'border-positive/15 bg-positive/10 text-positive',
  info: 'border-info/15 bg-info/10 text-info',
  warning: 'border-warning/15 bg-warning/10 text-warning',
};

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: Tone;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = 'accent',
}: StatCardProps) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-faint sm:text-[11px]">
          {label}
        </p>
        <span
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
            tones[tone],
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink tabular-nums sm:text-[1.7rem]">
        {value}
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </Card>
  );
}
