import type { Exercise, LogEntry } from '../types';
import {
  addDays,
  getWeekStartISO,
  startOfWeek,
  toISODate,
} from './date';

export function estimated1RM(weight: number, reps: number): number {
  if (weight <= 0) return 0;
  if (reps <= 1) return weight;
  return weight * (1 + reps / 30);
}

export function logVolume(log: LogEntry): number {
  return log.sets.reduce((total, set) => total + set.weight * set.reps, 0);
}

export function maxWeight(log: LogEntry): number {
  return log.sets.reduce((best, set) => Math.max(best, set.weight), 0);
}

export function bestE1rm(log: LogEntry): number {
  return log.sets.reduce(
    (best, set) => Math.max(best, estimated1RM(set.weight, set.reps)),
    0,
  );
}

/**
 * Puntuación comparable dentro de un ejercicio: 1RM estimado cuando hay
 * peso y repeticiones máximas cuando es peso corporal.
 */
export function performanceScore(log: LogEntry): number {
  const hasWeight = log.sets.some((set) => set.weight > 0);
  if (hasWeight) return bestE1rm(log);
  return log.sets.reduce((best, set) => Math.max(best, set.reps), 0);
}

export function sortLogsAsc(logs: LogEntry[]): LogEntry[] {
  return [...logs].sort(
    (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt),
  );
}

export function sortLogsDesc(logs: LogEntry[]): LogEntry[] {
  return [...logs].sort(
    (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  );
}

export function getLogsForExercise(
  logs: LogEntry[],
  exerciseId: string,
): LogEntry[] {
  return logs.filter((log) => log.exerciseId === exerciseId);
}

export interface ExerciseSummary {
  lastLog: LogEntry | null;
  lastWeight: number;
  lastDate: string | null;
  prWeight: number;
  prWeightReps: number;
  prE1rm: number;
  prE1rmDate: string | null;
  prReps: number;
  totalLogs: number;
  totalVolume: number;
  sparkline: { date: string; value: number }[];
}

export function getExerciseSummary(
  exerciseId: string,
  logs: LogEntry[],
): ExerciseSummary {
  const history = sortLogsAsc(getLogsForExercise(logs, exerciseId));
  const lastLog = history.at(-1) ?? null;

  let prWeight = 0;
  let prWeightReps = 0;
  let prE1rm = 0;
  let prE1rmDate: string | null = null;
  let prReps = 0;
  let totalVolume = 0;

  for (const log of history) {
    totalVolume += logVolume(log);

    for (const set of log.sets) {
      if (
        set.weight > prWeight ||
        (set.weight === prWeight && set.reps > prWeightReps)
      ) {
        prWeight = set.weight;
        prWeightReps = set.reps;
      }

      const e1rm = estimated1RM(set.weight, set.reps);
      if (e1rm > prE1rm) {
        prE1rm = e1rm;
        prE1rmDate = log.date;
      }

      prReps = Math.max(prReps, set.reps);
    }
  }

  return {
    lastLog,
    lastWeight: lastLog ? maxWeight(lastLog) : 0,
    lastDate: lastLog?.date ?? null,
    prWeight,
    prWeightReps,
    prE1rm,
    prE1rmDate,
    prReps,
    totalLogs: history.length,
    totalVolume,
    sparkline: history.slice(-8).map((log) => ({
      date: log.date,
      value: performanceScore(log),
    })),
  };
}

export interface WeekStats {
  logs: number;
  days: number;
  volume: number;
  sets: number;
}

export function getCurrentWeekStats(
  logs: LogEntry[],
  reference = new Date(),
): WeekStats {
  const weekStart = toISODate(startOfWeek(reference));
  const weekEnd = toISODate(reference);
  const weekLogs = logs.filter(
    (log) => log.date >= weekStart && log.date <= weekEnd,
  );

  return {
    logs: weekLogs.length,
    days: new Set(weekLogs.map((log) => log.date)).size,
    volume: weekLogs.reduce((total, log) => total + logVolume(log), 0),
    sets: weekLogs.reduce((total, log) => total + log.sets.length, 0),
  };
}

export function getTotalStats(logs: LogEntry[]): {
  logs: number;
  volume: number;
  sets: number;
  days: number;
} {
  return {
    logs: logs.length,
    volume: logs.reduce((total, log) => total + logVolume(log), 0),
    sets: logs.reduce((total, log) => total + log.sets.length, 0),
    days: new Set(logs.map((log) => log.date)).size,
  };
}

export function getWeeklyStreak(
  logs: LogEntry[],
  reference = new Date(),
): number {
  if (logs.length === 0) return 0;

  const weeks = new Set(logs.map((log) => getWeekStartISO(log.date)));
  let cursor = startOfWeek(reference);

  if (!weeks.has(toISODate(cursor))) {
    cursor = addDays(cursor, -7);
    if (!weeks.has(toISODate(cursor))) return 0;
  }

  let streak = 0;
  while (weeks.has(toISODate(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -7);
  }
  return streak;
}

export interface RecentPR {
  exerciseId: string;
  date: string;
  weight: number;
  reps: number;
  e1rm: number;
}

export function getRecentPRs(
  exercises: Exercise[],
  logs: LogEntry[],
  days = 30,
): RecentPR[] {
  const since = toISODate(addDays(new Date(), -days));
  const results: RecentPR[] = [];

  for (const exercise of exercises) {
    const history = sortLogsAsc(getLogsForExercise(logs, exercise.id));
    let bestScore = 0;
    let best: RecentPR | null = null;

    for (const log of history) {
      for (const set of log.sets) {
        const hasWeight = log.sets.some((item) => item.weight > 0);
        const score = hasWeight
          ? estimated1RM(set.weight, set.reps)
          : set.reps;

        if (score > bestScore) {
          bestScore = score;
          best = {
            exerciseId: exercise.id,
            date: log.date,
            weight: set.weight,
            reps: set.reps,
            e1rm: estimated1RM(set.weight, set.reps),
          };
        }
      }
    }

    if (best && best.date >= since) {
      results.push(best);
    }
  }

  return results.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
}

export interface HeatmapDay {
  date: string;
  volume: number;
  logs: number;
  isFuture: boolean;
}

export interface HeatmapWeek {
  days: HeatmapDay[];
}

export function getHeatmapWeeks(
  logs: LogEntry[],
  weeks = 12,
  reference = new Date(),
): HeatmapWeek[] {
  const byDate = new Map<string, { volume: number; logs: number }>();

  for (const log of logs) {
    const current = byDate.get(log.date) ?? { volume: 0, logs: 0 };
    current.volume += logVolume(log);
    current.logs += 1;
    byDate.set(log.date, current);
  }

  const currentWeekStart = startOfWeek(reference);
  const firstWeekStart = addDays(currentWeekStart, -(weeks - 1) * 7);
  const referenceISO = toISODate(reference);
  const result: HeatmapWeek[] = [];

  for (let week = 0; week < weeks; week += 1) {
    const days: HeatmapDay[] = [];

    for (let day = 0; day < 7; day += 1) {
      const date = addDays(firstWeekStart, week * 7 + day);
      const iso = toISODate(date);
      const entry = byDate.get(iso);

      days.push({
        date: iso,
        volume: entry?.volume ?? 0,
        logs: entry?.logs ?? 0,
        isFuture: iso > referenceISO,
      });
    }

    result.push({ days });
  }

  return result;
}

export function getExerciseMap(
  exercises: Exercise[],
): Map<string, Exercise> {
  return new Map(exercises.map((exercise) => [exercise.id, exercise]));
}
