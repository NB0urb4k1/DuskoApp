import { useMemo } from 'react';
import { formatLongDate } from '../../lib/date';
import { formatVolume } from '../../lib/format';
import { getHeatmapWeeks } from '../../lib/stats';
import { cn } from '../../lib/cn';
import type { LogEntry } from '../../types';

const levelClasses = [
  'bg-elevated',
  'bg-accent/20',
  'bg-accent/40',
  'bg-accent/65',
  'bg-accent',
];

export function Heatmap({ logs }: { logs: LogEntry[] }) {
  const weeks = useMemo(() => getHeatmapWeeks(logs, 12), [logs]);
  const maxVolume = useMemo(
    () =>
      Math.max(
        1,
        ...weeks.flatMap((week) => week.days.map((day) => day.volume)),
      ),
    [weeks],
  );

  const level = (volume: number): number => {
    if (volume <= 0) return 0;
    return Math.min(4, Math.ceil((volume / maxVolume) * 4));
  };

  return (
    <div>
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <div className="mr-1 flex shrink-0 flex-col gap-1 text-[9px] leading-none text-faint">
          {['L', '', 'X', '', 'V', '', ''].map((label, index) => (
            <span
              key={index}
              className="flex h-3.5 items-center sm:h-4"
            >
              {label}
            </span>
          ))}
        </div>

        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex shrink-0 flex-col gap-1">
            {week.days.map((day) => (
              <div
                key={day.date}
                title={`${formatLongDate(day.date)} · ${
                  day.volume > 0 ? formatVolume(day.volume) : 'Sin registro'
                }`}
                className={cn(
                  'h-3.5 w-3.5 rounded-[4px] transition-colors sm:h-4 sm:w-4',
                  day.isFuture
                    ? 'bg-elevated/30'
                    : levelClasses[level(day.volume)],
                )}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-faint">
        <span>Últimas 12 semanas</span>
        <span className="flex items-center gap-1">
          Menos
          {levelClasses.slice(1).map((className) => (
            <span
              key={className}
              className={cn('h-2.5 w-2.5 rounded-[3px]', className)}
            />
          ))}
          Más
        </span>
      </div>
    </div>
  );
}
