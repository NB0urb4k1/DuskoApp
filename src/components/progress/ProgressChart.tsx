import { useId, useState } from 'react';
import { formatNumber } from '../../lib/format';

export interface ChartPoint {
  date: string;
  label: string;
  value: number;
}

export interface ProgressChartProps {
  points: ChartPoint[];
  formatValue: (value: number) => string;
}

const WIDTH = 760;
const HEIGHT = 300;
const PADDING = { top: 24, right: 24, bottom: 40, left: 58 };
const INNER_WIDTH = WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

function axisLabel(value: number, range: number): string {
  if (value >= 1000) {
    return `${formatNumber(value / 1000, range < 200 ? 2 : 1)}k`;
  }
  return formatNumber(value, range < 20 ? 1 : 0);
}

function smoothPath(coords: { x: number; y: number }[]): string {
  if (coords.length === 0) return '';
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;

  let path = `M ${coords[0].x} ${coords[0].y}`;
  for (let index = 1; index < coords.length; index += 1) {
    const previous = coords[index - 1];
    const current = coords[index];
    const middleX = (previous.x + current.x) / 2;
    path += ` C ${middleX} ${previous.y}, ${middleX} ${current.y}, ${current.x} ${current.y}`;
  }
  return path;
}

export function ProgressChart({ points, formatValue }: ProgressChartProps) {
  const gradientId = useId().replace(/:/g, '');
  const [hovered, setHovered] = useState<number | null>(null);

  if (points.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-line text-sm text-faint">
        Aún no hay datos para este ejercicio.
      </div>
    );
  }

  const values = points.map((point) => point.value);
  const minRaw = Math.min(...values);
  const maxRaw = Math.max(...values);
  const padding =
    maxRaw === minRaw
      ? Math.max(maxRaw * 0.1, 1)
      : (maxRaw - minRaw) * 0.15;
  const min = Math.max(0, minRaw - padding);
  const max = maxRaw + padding;
  const range = max - min || 1;

  const xFor = (index: number) =>
    points.length === 1
      ? PADDING.left + INNER_WIDTH / 2
      : PADDING.left + (index / (points.length - 1)) * INNER_WIDTH;
  const yFor = (value: number) =>
    PADDING.top + INNER_HEIGHT - ((value - min) / range) * INNER_HEIGHT;

  const coords = points.map((point, index) => ({
    x: xFor(index),
    y: yFor(point.value),
  }));

  const line = smoothPath(coords);
  const first = coords[0];
  const last = coords[coords.length - 1];
  const area = `${line} L ${last.x} ${
    PADDING.top + INNER_HEIGHT
  } L ${first.x} ${PADDING.top + INNER_HEIGHT} Z`;

  const ticks = Array.from({ length: 5 }, (_, index) => {
    const value = min + (range / 4) * index;
    return { value, y: yFor(value) };
  });

  const labelStep = Math.max(
    1,
    Math.ceil((points.length - 1) / 5),
  );
  const labelIndices = new Set<number>();
  for (let index = 0; index < points.length; index += labelStep) {
    labelIndices.add(index);
  }
  labelIndices.add(points.length - 1);

  const hoveredPoint = hovered !== null ? points[hovered] : null;
  const hoveredCoord = hovered !== null ? coords[hovered] : null;
  const tooltipX = hoveredCoord
    ? Math.min(Math.max(hoveredCoord.x - 55, 4), WIDTH - 114)
    : 0;
  const tooltipY = hoveredCoord
    ? Math.max(6, hoveredCoord.y - 56)
    : 0;

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Evolución del progreso por sesión"
        onMouseLeave={() => setHovered(null)}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {ticks.map((tick) => (
          <g key={tick.value}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={tick.y}
              y2={tick.y}
              stroke="var(--line)"
              strokeDasharray="3 5"
              strokeWidth="1"
            />
            <text
              x={PADDING.left - 10}
              y={tick.y + 3}
              textAnchor="end"
              fontSize="10"
              fill="var(--faint)"
            >
              {axisLabel(tick.value, range)}
            </text>
          </g>
        ))}

        {points.map((point, index) => {
          if (!labelIndices.has(index)) return null;
          const anchor =
            index === 0
              ? 'start'
              : index === points.length - 1
                ? 'end'
                : 'middle';
          return (
            <text
              key={`${point.date}-${index}`}
              x={xFor(index)}
              y={HEIGHT - 14}
              textAnchor={anchor}
              fontSize="10"
              fill="var(--faint)"
            >
              {point.label}
            </text>
          );
        })}

        {points.length > 1 && (
          <path d={area} fill={`url(#${gradientId})`} />
        )}

        {points.length > 1 && (
          <path
            d={line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {coords.map((coord, index) => (
          <circle
            key={`${points[index].date}-${index}`}
            cx={coord.x}
            cy={coord.y}
            r={hovered === index ? 5 : 3}
            fill={
              hovered === index ? 'var(--accent)' : 'var(--surface)'
            }
            stroke="var(--accent)"
            strokeWidth="2"
          />
        ))}

        {points.map((point, index) => {
          const left =
            index === 0
              ? PADDING.left
              : (xFor(index - 1) + xFor(index)) / 2;
          const right =
            index === points.length - 1
              ? PADDING.left + INNER_WIDTH
              : (xFor(index) + xFor(index + 1)) / 2;

          return (
            <rect
              key={`hover-${point.date}-${index}`}
              x={left}
              y={PADDING.top}
              width={Math.max(1, right - left)}
              height={INNER_HEIGHT}
              fill="transparent"
              onMouseEnter={() => setHovered(index)}
              onFocus={() => setHovered(index)}
            />
          );
        })}

        {hoveredPoint && hoveredCoord && (
          <g pointerEvents="none">
            <line
              x1={hoveredCoord.x}
              x2={hoveredCoord.x}
              y1={PADDING.top}
              y2={PADDING.top + INNER_HEIGHT}
              stroke="var(--line-strong)"
              strokeDasharray="3 4"
            />
            <g transform={`translate(${tooltipX}, ${tooltipY})`}>
              <rect
                width="110"
                height="42"
                rx="9"
                fill="var(--surface)"
                stroke="var(--line-strong)"
              />
              <text
                x="10"
                y="16"
                fontSize="9"
                fill="var(--faint)"
              >
                {hoveredPoint.label}
              </text>
              <text
                x="10"
                y="32"
                fontSize="12"
                fontWeight="600"
                fill="var(--ink)"
              >
                {formatValue(hoveredPoint.value)}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
