import type { SetEntry } from '../types';

export function formatNumber(value: number, maxDecimals = 1): string {
  return new Intl.NumberFormat('es-ES', {
    maximumFractionDigits: maxDecimals,
  }).format(value);
}

export function formatKg(value: number, withUnit = true): string {
  const formatted = formatNumber(value, 2);
  return withUnit ? `${formatted} kg` : formatted;
}

export function formatVolume(value: number): string {
  if (value >= 10_000) {
    return `${formatNumber(value / 1000, 1)} t`;
  }
  return `${formatNumber(value, 0)} kg`;
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('es-ES', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatSet(set: SetEntry): string {
  return set.weight > 0
    ? `${formatKg(set.weight)} × ${set.reps}`
    : `${set.reps} reps`;
}

export function formatSetCompact(set: SetEntry): string {
  return set.weight > 0
    ? `${formatNumber(set.weight, 2)}×${set.reps}`
    : `${set.reps} reps`;
}

export function pluralize(
  count: number,
  singular: string,
  plural: string,
): string {
  return count === 1 ? singular : plural;
}
