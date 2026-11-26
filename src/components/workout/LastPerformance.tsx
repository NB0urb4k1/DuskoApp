import { formatRelativeDate } from '../../lib/date';
import { formatSetCompact, formatVolume } from '../../lib/format';
import { logVolume } from '../../lib/stats';
import type { LogEntry } from '../../types';

export function LastPerformance({ log }: { log: LogEntry | null }) {
  return (
    <div className="rounded-xl border border-line bg-canvas/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
          Última vez
        </p>
        {log && (
          <p className="text-[11px] text-faint">
            {formatRelativeDate(log.date)}
          </p>
        )}
      </div>

      {log ? (
        <>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {log.sets.map((set, index) => (
              <span
                key={index}
                className="rounded-md border border-line bg-elevated/60 px-2 py-1 text-xs text-ink tabular-nums"
              >
                {formatSetCompact(set)}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted">
            {log.sets.length} series · {formatVolume(logVolume(log))}
          </p>
        </>
      ) : (
        <p className="mt-2 text-sm text-muted">
          Esta será tu primera sesión con este ejercicio.
        </p>
      )}
    </div>
  );
}
