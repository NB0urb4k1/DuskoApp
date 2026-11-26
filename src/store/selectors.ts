import { useMemo } from 'react';
import {
  getCurrentWeekStats,
  getExerciseSummary,
  getExerciseMap,
  getRecentPRs,
  getTotalStats,
  getWeeklyStreak,
  sortLogsAsc,
  type ExerciseSummary,
  type RecentPR,
} from '../lib/stats';
import { getAllInsights, isActionable, type Insight } from '../lib/progression';
import type { Exercise, LogEntry } from '../types';
import { useGymStore } from './gymStore';

export function useExercises(): Exercise[] {
  return useGymStore((state) => state.exercises);
}

export function useLogs(): LogEntry[] {
  return useGymStore((state) => state.logs);
}

export function useActiveExercises(): Exercise[] {
  const exercises = useExercises();

  return useMemo(
    () =>
      exercises
        .filter((exercise) => !exercise.archived)
        .sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [exercises],
  );
}

export function useExerciseLogs(exerciseId: string | null): LogEntry[] {
  const logs = useLogs();

  return useMemo(() => {
    if (!exerciseId) return [];
    return sortLogsAsc(
      logs.filter((log) => log.exerciseId === exerciseId),
    );
  }, [logs, exerciseId]);
}

export function useInsights(): Insight[] {
  const exercises = useExercises();
  const logs = useLogs();

  return useMemo(() => getAllInsights(exercises, logs), [exercises, logs]);
}

export function useActionableInsights(): Insight[] {
  const insights = useInsights();

  return useMemo(() => insights.filter(isActionable), [insights]);
}

export function useInsightMap(): Map<string, Insight> {
  const insights = useInsights();

  return useMemo(
    () => new Map(insights.map((insight) => [insight.exerciseId, insight])),
    [insights],
  );
}

export function useExerciseSummaries(): Map<string, ExerciseSummary> {
  const exercises = useExercises();
  const logs = useLogs();

  return useMemo(() => {
    const map = new Map<string, ExerciseSummary>();
    for (const exercise of exercises) {
      map.set(exercise.id, getExerciseSummary(exercise.id, logs));
    }
    return map;
  }, [exercises, logs]);
}

export function useExerciseMap(): Map<string, Exercise> {
  const exercises = useExercises();
  return useMemo(() => getExerciseMap(exercises), [exercises]);
}

export function useDashboardStats(): {
  week: ReturnType<typeof getCurrentWeekStats>;
  total: ReturnType<typeof getTotalStats>;
  streak: number;
} {
  const logs = useLogs();

  return useMemo(
    () => ({
      week: getCurrentWeekStats(logs),
      total: getTotalStats(logs),
      streak: getWeeklyStreak(logs),
    }),
    [logs],
  );
}

export function useRecentPRs(days = 30): RecentPR[] {
  const exercises = useExercises();
  const logs = useLogs();

  return useMemo(
    () => getRecentPRs(exercises, logs, days),
    [exercises, logs, days],
  );
}
