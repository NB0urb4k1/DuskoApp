import type { Exercise, LogEntry } from '../types';
import { weeksBetween } from './date';
import { formatKg } from './format';
import {
  getLogsForExercise,
  maxWeight,
  performanceScore,
  sortLogsAsc,
} from './stats';

export type InsightKind =
  | 'increase'
  | 'change'
  | 'stagnant'
  | 'progress'
  | 'steady'
  | 'baseline';

export interface Insight {
  exerciseId: string;
  kind: InsightKind;
  title: string;
  message: string;
  suggestedWeight: number | null;
  priority: number;
}

const PRIORITY: Record<InsightKind, number> = {
  increase: 0,
  change: 1,
  stagnant: 2,
  progress: 3,
  steady: 4,
  baseline: 5,
};

function topRangeSets(log: LogEntry, exercise: Exercise): number {
  return log.sets.filter((set) => set.reps >= exercise.repMax).length;
}

export function analyzeExercise(
  exercise: Exercise,
  allLogs: LogEntry[],
): Insight | null {
  const history = sortLogsAsc(getLogsForExercise(allLogs, exercise.id));

  if (history.length === 0) return null;

  if (history.length === 1) {
    return {
      exerciseId: exercise.id,
      kind: 'baseline',
      title: 'Establece tu base',
      message: `Registra al menos 2 sesiones de ${exercise.name} para empezar a recibir recomendaciones.`,
      suggestedWeight: null,
      priority: PRIORITY.baseline,
    };
  }

  const latest = history[history.length - 1];
  const previous = history[history.length - 2];
  const targetSets = Math.max(1, Math.round(exercise.targetSets));

  const latestAtTop = topRangeSets(latest, exercise) >= targetSets;
  const previousAtTop = topRangeSets(previous, exercise) >= targetSets;

  if (latestAtTop && previousAtTop) {
    if (exercise.incrementKg > 0) {
      const suggested =
        Math.round((maxWeight(latest) + exercise.incrementKg) * 100) / 100;

      return {
        exerciseId: exercise.id,
        kind: 'increase',
        title: 'Es hora de subir el peso',
        message: `Completaste ${targetSets} series a ${exercise.repMax}+ reps en tus últimas 2 sesiones. Prueba con ${formatKg(suggested)}.`,
        suggestedWeight: suggested,
        priority: PRIORITY.increase,
      };
    }

    return {
      exerciseId: exercise.id,
      kind: 'change',
      title: 'Añade dificultad',
      message: `Dominas el tope de ${exercise.repMax} reps en ${exercise.name}. Añade lastre o prueba una variante más difícil.`,
      suggestedWeight: null,
      priority: PRIORITY.change,
    };
  }

  // Última sesión en la que se superó la mejor marca anterior.
  let lastImprovementIndex = 0;
  let bestWeightSoFar = 0;
  let bestScoreSoFar = 0;

  for (let index = 0; index < history.length; index += 1) {
    const log = history[index];
    const weight = maxWeight(log);
    const score = performanceScore(log);

    if (weight > bestWeightSoFar || score > bestScoreSoFar + 0.01) {
      lastImprovementIndex = index;
      bestWeightSoFar = Math.max(bestWeightSoFar, weight);
      bestScoreSoFar = Math.max(bestScoreSoFar, score);
    }
  }

  const entriesSinceImprovement = history.length - 1 - lastImprovementIndex;
  const weeksSinceImprovement = weeksBetween(
    history[lastImprovementIndex].date,
    latest.date,
  );

  if (entriesSinceImprovement >= 4 && weeksSinceImprovement >= 6) {
    return {
      exerciseId: exercise.id,
      kind: 'change',
      title: 'Quizás toca cambiar de ejercicio',
      message: `Llevas ${weeksSinceImprovement} semanas sin superar tu marca en ${exercise.name}. Prueba una variante, otro rango de reps o un deload del 10 %.`,
      suggestedWeight: null,
      priority: PRIORITY.change,
    };
  }

  if (entriesSinceImprovement >= 4) {
    return {
      exerciseId: exercise.id,
      kind: 'stagnant',
      title: 'Progreso estancado',
      message: `Tus últimas ${entriesSinceImprovement + 1} sesiones no superan tu mejor marca en ${exercise.name}. Añade una repetición o ajusta el peso.`,
      suggestedWeight: null,
      priority: PRIORITY.stagnant,
    };
  }

  if (performanceScore(latest) > performanceScore(previous) + 0.01) {
    return {
      exerciseId: exercise.id,
      kind: 'progress',
      title: 'Vas progresando',
      message: `Tu última sesión superó la anterior. Mantén el peso hasta llegar al tope de ${exercise.repMax} reps.`,
      suggestedWeight: null,
      priority: PRIORITY.progress,
    };
  }

  return {
    exerciseId: exercise.id,
    kind: 'steady',
    title: 'Mantén el ritmo',
    message: `Sin una nueva marca todavía en ${exercise.name}. Intenta sumar una repetición la próxima sesión.`,
    suggestedWeight: null,
    priority: PRIORITY.steady,
  };
}

export function getAllInsights(
  exercises: Exercise[],
  logs: LogEntry[],
): Insight[] {
  return exercises
    .filter((exercise) => !exercise.archived)
    .map((exercise) => analyzeExercise(exercise, logs))
    .filter((insight): insight is Insight => insight !== null)
    .sort(
      (a, b) =>
        a.priority - b.priority || a.exerciseId.localeCompare(b.exerciseId),
    );
}

export function isActionable(insight: Insight): boolean {
  return (
    insight.kind === 'increase' ||
    insight.kind === 'change' ||
    insight.kind === 'stagnant'
  );
}
