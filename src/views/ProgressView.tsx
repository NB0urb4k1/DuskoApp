import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  CalendarDays,
  Dumbbell,
  Plus,
  Trophy,
  Zap,
} from 'lucide-react';
import {
  formatLongDate,
  formatRelativeDate,
  formatShortDate,
} from '../lib/date';
import {
  formatKg,
  formatSetCompact,
  formatVolume,
} from '../lib/format';
import {
  bestE1rm,
  logVolume,
  maxWeight,
} from '../lib/stats';
import {
  useExerciseLogs,
  useExerciseSummaries,
  useExercises,
  useLogs,
} from '../store/selectors';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Field';
import { PageHeader, SectionHeader } from '../components/ui/PageHeader';
import { SegmentedControl } from '../components/ui/SegmentedControl';
import { StatCard } from '../components/dashboard/StatCard';
import { ProgressChart } from '../components/progress/ProgressChart';

type Metric = 'weight' | 'e1rm' | 'volume';

export interface ProgressViewProps {
  onNewLog: () => void;
}

export function ProgressView({ onNewLog }: ProgressViewProps) {
  const exercises = useExercises();
  const logs = useLogs();
  const summaries = useExerciseSummaries();

  const exercisesWithLogs = useMemo(() => {
    const ids = new Set(logs.map((log) => log.exerciseId));
    return exercises
      .filter((exercise) => ids.has(exercise.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [exercises, logs]);

  // Por defecto mostramos el ejercicio con más sesiones registradas.
  const defaultId = useMemo(() => {
    const counts = new Map<string, number>();
    for (const log of logs) {
      counts.set(log.exerciseId, (counts.get(log.exerciseId) ?? 0) + 1);
    }

    return (
      [...exercisesWithLogs].sort(
        (a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0),
      )[0]?.id ?? null
    );
  }, [exercisesWithLogs, logs]);

  const [selectedId, setSelectedId] = useState<string | null>(defaultId);
  const [metric, setMetric] = useState<Metric>('weight');

  useEffect(() => {
    if (exercisesWithLogs.length === 0) {
      setSelectedId(null);
      return;
    }
    if (
      !selectedId ||
      !exercisesWithLogs.some((exercise) => exercise.id === selectedId)
    ) {
      setSelectedId(defaultId);
    }
  }, [exercisesWithLogs, selectedId, defaultId]);

  const history = useExerciseLogs(selectedId);
  const selectedExercise =
    exercisesWithLogs.find((exercise) => exercise.id === selectedId) ?? null;
  const summary = selectedId ? summaries.get(selectedId) : undefined;

  const points = useMemo(
    () =>
      history.map((log) => ({
        date: log.date,
        label: formatShortDate(log.date),
        value:
          metric === 'weight'
            ? maxWeight(log)
            : metric === 'e1rm'
              ? bestE1rm(log)
              : logVolume(log),
      })),
    [history, metric],
  );

  const formatValue = (value: number) =>
    metric === 'volume' ? formatVolume(value) : formatKg(value);

  if (exercisesWithLogs.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="Progreso"
          title="Tu evolución"
          description="Consulta cómo mejoran tus marcas sesión a sesión."
          action={
            <Button onClick={onNewLog}>
              <Plus className="h-4 w-4" />
              Registrar
            </Button>
          }
        />
        <EmptyState
          icon={BarChart3}
          title="Aún no hay datos que mostrar"
          description="Registra al menos una sesión para ver gráficos, récords y la evolución de cada ejercicio."
          action={
            <Button onClick={onNewLog}>
              <Plus className="h-4 w-4" />
              Registrar primera sesión
            </Button>
          }
        />
      </div>
    );
  }

  if (!selectedExercise || !summary) return null;

  const prLabel =
    summary.prWeight > 0
      ? `${formatKg(summary.prWeight)} × ${summary.prWeightReps}`
      : `${summary.prReps} reps`;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Progreso"
        title="Tu evolución"
        description="Compara peso máximo, 1RM estimado y volumen por sesión."
        action={
          <Button onClick={onNewLog}>
            <Plus className="h-4 w-4" />
            Registrar
          </Button>
        }
      />

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
          <Dumbbell className="h-4 w-4" />
          Ejercicio
        </div>
        <div className="sm:w-72">
          <Select
            value={selectedId ?? ''}
            onChange={(event) => setSelectedId(event.target.value)}
            aria-label="Elegir ejercicio"
          >
            {exercisesWithLogs.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={Trophy}
          label="Mejor serie"
          value={prLabel}
          hint="Peso máximo registrado"
          tone="positive"
        />
        <StatCard
          icon={Zap}
          label="1RM estimado"
          value={summary.prE1rm > 0 ? formatKg(summary.prE1rm) : '—'}
          hint={
            summary.prE1rmDate
              ? formatRelativeDate(summary.prE1rmDate)
              : 'Sin datos'
          }
          tone="accent"
        />
        <StatCard
          icon={BarChart3}
          label="Volumen total"
          value={formatVolume(summary.totalVolume)}
          hint={`${summary.totalLogs} registros`}
          tone="info"
        />
        <StatCard
          icon={CalendarDays}
          label="Última sesión"
          value={
            summary.lastDate ? formatRelativeDate(summary.lastDate) : '—'
          }
          hint={
            summary.lastDate ? formatLongDate(summary.lastDate) : 'Sin datos'
          }
          tone="warning"
        />
      </section>

      <Card className="p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold text-ink">
              {selectedExercise.name}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {selectedExercise.muscleGroup} ·{' '}
              {selectedExercise.equipment}
            </p>
          </div>
          <SegmentedControl
            ariaLabel="Métrica del gráfico"
            value={metric}
            onChange={setMetric}
            options={[
              { value: 'weight', label: 'Peso', icon: Dumbbell },
              { value: 'e1rm', label: '1RM est.', icon: Zap },
              { value: 'volume', label: 'Volumen', icon: BarChart3 },
            ]}
          />
        </div>

        <div className="mt-5">
          <ProgressChart points={points} formatValue={formatValue} />
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader
          title="Últimos registros"
          description="Las sesiones que alimentan este gráfico."
        />
        <div className="divide-y divide-line">
          {history
            .slice(-6)
            .reverse()
            .map((log) => (
              <div
                key={log.id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {formatLongDate(log.date)}
                  </p>
                  <p className="mt-0.5 text-xs text-faint">
                    {log.sets.map((set) => formatSetCompact(set)).join(' · ')}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-semibold text-ink tabular-nums">
                    {formatVolume(logVolume(log))}
                  </p>
                  <p className="text-[11px] text-faint">
                    {log.sets.length} series
                  </p>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
