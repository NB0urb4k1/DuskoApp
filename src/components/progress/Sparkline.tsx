import { useId } from 'react';
import { cn } from '../../lib/cn';

export interface SparklineProps {
  values: number[];
  className?: string;
  tone?: 'accent' | 'positive' | 'warning' | 'muted';
}

const colors: Record<NonNullable<SparklineProps['tone']>, string> = {
  accent: 'var(--accent)',
  positive: 'var(--positive)',
  warning: 'var(--warning)',
  muted: 'var(--faint)',
};

export function Sparkline({
  values,
  className,
  tone = 'accent',
}: SparklineProps) {
  const gradientId = useId().replace(/:/g, '');
  const color = colors[tone];

  if (values.length === 0) {
    return (
      <svg
        viewBox="0 0 120 36"
        className={cn('h-9 w-28', className)}
        aria-hidden="true"
      >
        <line
          x1="2"
          y1="18"
          x2="118"
          y2="18"
          stroke="var(--line)"
          strokeDasharray="3 4"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  const width = 120;
  const height = 36;
  const padding = 4;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const points = values.map((value, index) => {
    const x =
      values.length === 1
        ? width / 2
        : padding + (index / (values.length - 1)) * (width - padding * 2);
    const y =
      height -
      padding -
      ((value - min) / span) * (height - padding * 2);
    return { x, y };
  });

  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ');
  const first = points[0];
  const last = points[points.length - 1];
  const area = `${line} L ${last.x} ${height - padding} L ${first.x} ${
    height - padding
  } Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn('h-9 w-28', className)}
      role="img"
      aria-label="Tendencia de las últimas sesiones"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={last.x}
        cy={last.y}
        r="2.6"
        fill={color}
        stroke="var(--surface)"
        strokeWidth="1.5"
      />
    </svg>
  );
}
