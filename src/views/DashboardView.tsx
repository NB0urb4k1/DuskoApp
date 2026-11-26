import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Dumbbell,
  Flame,
  Plus,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { formatLongDate, formatRelativeDate, getGreeting, todayISO } from '../lib/date';
import { formatKg, formatVolume, pluralize } from '../lib/format';
import type { View } from '../types';
import {
  useActionableInsights,
  useActiveExercises,
  useDashboardStats,
  useExerciseMap,
  useExercises,
  useLogs,
  useRecentPRs,
} from '../store/selectors';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/PageHeader';
import { RecommendationCard } from '../components/dashboard/RecommendationCard';
import { StatCard } from '../components/dashboard/StatCard';
import { Heatmap } from '../components/dashboard/Heatmap';
import { RecentLogs } from '../components/dashboard/RecentLogs';

export interface DashboardViewProps {
  onNavigate: (view: View) => void;
  onLogExercise: (exerciseId: string) => void;
  onCreateExercise: () => void;
}

export function DashboardView({
  onNavigate,
  onLogExercise,
  onCreateExercise,
}: DashboardViewProps) {
  const exercises = useExercises();
  const activeExercises = useActiveExercises();
  const logs = useLogs();
  const insights = useActionableInsights();
  const stats = useDashboardStats();
  const recentPRs = useRecentPRs();
  const exerciseMap = useExerciseMap();

  const recommendations = insights
    .slice(0, 3)
    .flatMap((insight) => {
      const exercise = exerciseMap.get(insight.exerciseId);
      return exercise ? [{ insight, exercise }] : [];
    });

  return (
    <div className="space-y-7">
      <section className="hero-glow relative animate-rise-in overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm text-muted">{getGreeting()}, Dusko</p>
            <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              Tu progreso,{' '}
              <span className="text-gradient-accent">en números.</span>
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Registra lo que levantas y deja que la app te avise cuándo subir
              el peso o cambiar de ejercicio.
            </p>
            <p className="mt-3 text-xs text-faint">
              {formatLongDate(todayISO())}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="lg" onClick={() => onNavigate('log')}>
              <Plus className="h-4 w-4" />
              Registrar
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => onNavigate('progress')}
            >
              Ver progreso
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard
          icon={Dumbbell}
          label="Esta semana"
          value={String(stats.week.logs)}
          hint={`${stats.week.days} ${pluralize(
            stats.week.days,
            'día entrenado',
            'días entrenados',
          )} · ${stats.week.sets} series`}
        />
        <StatCard
          icon={Flame}
          label="Racha"
          value={`${stats.streak} ${pluralize(
            stats.streak,
            'semana',
            'semanas',
          )}`}
          hint="Semanas consecutivas entrenando"
          tone="warning"
        />
        <StatCard
          icon={BarChart3}
          label="Volumen semanal"
          value={formatVolume(stats.week.volume)}
          hint="Peso total levantado"
          tone="info"
        />
        <StatCard
          icon={Trophy}
          label="Registros"
          value={String(stats.total.logs)}
          hint={`${formatVolume(stats.total.volume)} acumulados`}
          tone="positive"
        />
      </section>

      {activeExercises.length === 0 ? (
        <Card className="hero-glow overflow-hidden p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge tone="accent">
                <Sparkles className="h-3 w-3" />
                Primeros pasos
              </Badge>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink">
                Empieza por tu primer ejercicio
              </h2>
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-muted">
                Añade la máquina o ejercicio que usas, define tu rango de
                repeticiones y registra tus series. Tras dos sesiones empezarás
                a recibir recomendaciones.
              </p>
            </div>
            <Button size="lg" onClick={onCreateExercise}>
              <Plus className="h-4 w-4" />
              Crear ejercicio
            </Button>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                icon: Dumbbell,
                title: 'Crea tus ejercicios',
                text: 'Nombre, grupo muscular, series y rango de reps.',
              },
              {
                icon: ClipboardList,
                title: 'Registra tus series',
                text: 'Peso y repeticiones de cada serie, en segundos.',
              },
              {
                icon: Sparkles,
                title: 'Recibe sugerencias',
                text: 'Avisos para subir peso o cambiar de ejercicio.',
              },
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-xl border border-line bg-canvas/40 p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">
                      Paso {index + 1}
                    </span>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-ink">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">
                    {step.text}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <section>
          <SectionHeader
            title="Sugerencias para ti"
            description="Basadas en tus últimas sesiones"
            action={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('exercises')}
                className="px-2"
              >
                Ver ejercicios
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            }
          />

          {recommendations.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {recommendations.map(({ insight, exercise }) => (
                <RecommendationCard
                  key={insight.exerciseId}
                  insight={insight}
                  exercise={exercise}
                  onLog={() => onLogExercise(exercise.id)}
                />
              ))}
            </div>
          ) : (
            <Card className="flex items-center gap-4 p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-positive/20 bg-positive/10 text-positive">
                <Sparkles className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">
                  Todo en orden
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {logs.length === 0
                    ? 'Registra tu primera sesión para empezar a recibir recomendaciones.'
                    : 'No hay ajustes pendientes ahora mismo. Sigue registrando y te avisaré cuando toque cambiar algo.'}
                </p>
              </div>
            </Card>
          )}
        </section>
      )}

      <section className="grid gap-4 xl:grid-cols-5">
        <Card className="p-5 xl:col-span-3">
          <SectionHeader
            title="Constancia"
            description="Volumen entrenado por día"
          />
          <Heatmap logs={logs} />
        </Card>

        <div className="xl:col-span-2">
          <RecentLogs
            logs={logs}
            exercises={exercises}
            onSeeAll={() => onNavigate('history')}
          />
        </div>
      </section>

      {recentPRs.length > 0 && (
        <section>
          <SectionHeader
            title="Récords recientes"
            description="Tus mejores marcas de los últimos 30 días"
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {recentPRs.map((pr) => {
              const exercise = exerciseMap.get(pr.exerciseId);
              if (!exercise) return null;

              return (
                <Card key={`${pr.exerciseId}-${pr.date}`} className="p-4">
                  <div className="flex items-center gap-2 text-warning">
                    <Trophy className="h-4 w-4 shrink-0" />
                    <p className="truncate text-xs font-medium text-muted">
                      {exercise.name}
                    </p>
                  </div>
                  <p className="mt-2 font-display text-xl font-semibold text-ink tabular-nums">
                    {pr.weight > 0
                      ? `${formatKg(pr.weight)} × ${pr.reps}`
                      : `${pr.reps} reps`}
                  </p>
                  <p className="mt-0.5 text-[11px] text-faint">
                    {formatRelativeDate(pr.date)}
                  </p>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
