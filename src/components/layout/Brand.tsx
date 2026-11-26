import { Dumbbell } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-ink shadow-lg shadow-accent/20">
        <Dumbbell className="h-5 w-5" />
      </div>
      <div className="leading-none">
        <p
          className={cn(
            'font-display font-bold tracking-[0.14em] text-ink',
            compact ? 'text-sm' : 'text-base',
          )}
        >
          DUSKO
        </p>
        {!compact && (
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.3em] text-faint">
            Gym tracker
          </p>
        )}
      </div>
    </div>
  );
}
