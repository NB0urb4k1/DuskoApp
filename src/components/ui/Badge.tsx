import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export type BadgeTone =
  | 'accent'
  | 'neutral'
  | 'positive'
  | 'warning'
  | 'negative'
  | 'info';

const tones: Record<BadgeTone, string> = {
  accent: 'border-accent/20 bg-accent/10 text-accent',
  neutral: 'border-line bg-elevated/70 text-muted',
  positive: 'border-positive/20 bg-positive/10 text-positive',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  negative: 'border-negative/20 bg-negative/10 text-negative',
  info: 'border-info/20 bg-info/10 text-info',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium leading-5',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
