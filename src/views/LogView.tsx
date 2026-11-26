import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  ArrowLeft,
  Dumbbell,
  Plus,
  RotateCcw,
  Save,
  Trophy,
} from 'lucide-react';
import { todayISO } from '../lib/date';
import { formatKg, formatVolume } from '../lib/format';
import { analyzeExercise } from '../lib/progression';
import { estimated1RM } from '../lib/stats';
import { useGymStore } from '../store/gymStore';
import { useUiStore } from '../store/uiStore';
import {
  useActiveExercises,
  useExerciseLogs,
  useExerciseSummaries,
  useLogs,
} from '../store/selectors';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Field, Input, Textarea } from '../components/ui/Field';
import { PageHeader, SectionHeader } from '../components/ui/PageHeader';
import { ExercisePicker } from '../components/workout/ExercisePicker';
import { LastPerformance } from '../components/workout/LastPerformance';
import { RecommendationBanner } from '../components/workout/RecommendationBanner';
import {
  EMPTY_SET,
  SetsEditor,
  draftVolume,
  fromDraftSets,
  toDraftSets,
  validateDraftSets,
  type DraftSet,
} from '../components/workout/SetsEditor';

export interface LogViewProps {
  initialExerciseId?: string;
  onGoToExercises: (openForm?: boolean) => void;
}

export function LogView({
  initialExerciseId,
  onGoToExercises,
}: LogViewProps) {
  const activeExercises = useActiveExercises();
  const logs = useLogs();
  const summaries = useExerciseSummaries();
  const addLog = useGymStore((state) => state.addLog);
  const pushToast = useUiStore((state) => state.pushToast);

  const [selectedId, setSelectedId] = useState<string | null>(
    initialExerciseId ?? null,
  );
  const [date, setDate] = useState(todayISO());
  const [sets, setSets] = useState<DraftSet[]>([{ ...EMPTY_SET }]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const history = useExerciseLogs(selectedId);
  const lastLog = history.at(-1) ?? null;
  const selectedExercise =
    activeExercises.find((exercise) => exercise.id === selectedId) ?? null;

  const insight = useMemo(
    () =>
      selectedExercise ? analyzeExercise(selectedExercise, logs) : null,
    [selectedExercise, logs],
  );

  useEffect(() => {
    if (
      initialExerciseId &&
      activeExercises.some((exercise) => exercise.id === initialExerciseId)
    ) {
      setSelectedId(initialExerciseId);
    }
  }, [initialExerciseId, activeExercises]);

  useEffect(() => {
    if (!selectedId) return;

    const exercise = activeExercises.find(
      (item) => item.id === selectedId,
    );
    if (!exercise) {
      setSelectedId(null);
      return;
    }

    const last = history.at(-1);
    setDate(todayISO());
    setNotes('');
    setError(null);
    setSets(last ? toDraftSets(last.sets) : [{ ...EMPTY_SET }]);
    // Solo al cambiar de ejercicio; no queremos pisar lo que el usuario escribe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const summary = selectedId ? summaries.get(selectedId) : undefined;
  const volume = draftVolume(sets);
  const draftBest = sets.reduce(
    (best, set) =>
      Math.max(
        best,
        estimated1RM(Number(set.weight) || 0, Number(set.reps) || 0),
      ),
    0,
  );
  const isNewPR =
    draftBest > 0 && summary !== undefined && draftBest > summary.prE1rm + 0.01;

  const handleUseLast = () => {
    if (!lastLog) return;
    setSets(toDraftSets(lastLog.sets));
    setError(null);
  };

  const handleClear = () => {
    setSets([{ ...EMPTY_SET }]);
    setError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedExercise) return;

    if (!date) {
      setError('Elige una fecha válida.');
      return;
    }

    const validation = validateDraftSets(sets);
    if (validation) {
      setError(validation);
      return;
    }

    addLog({
      exerciseId: selectedExercise.id,
      date,
      sets: fromDraftSets(sets),
      notes,
    });

    pushToast('Registro guardado');
    setSelectedId(null);
    setSets([{ ...EMPTY_SET }]);
    setNotes('');
    setError(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Registrar"
        title="Nueva sesión"
        description="Anota un ejercicio y sus series. Todo se guarda automáticamente en tu navegador."
        action={
          activeExercises.length > 0 ? (
            <Button variant="secondary" onClick={() => onGoToExercises(true)}>
              <Plus className="h-4 w-4" />
              Nuevo ejercicio
            </Button>
          ) : undefined
        }
      />

      {activeExercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Primero crea un ejercicio"
          description="Necesitas al menos un ejercicio o máquina en tu catálogo para empezar a registrar series."
          action={
            <Button onClick={() => onGoToExercises(true)}>
              <Plus className="h-4 w-4" />
              Crear ejercicio
            </Button>
          }
        />
      ) : !selectedExercise ? (
        <Card className="p-5 sm:p-6">
          <SectionHeader
            title="Elige un ejercicio"
            description="Busca entre tus ejercicios o filtra por grupo muscular."
          />
          <ExercisePicker
            exercises={activeExercises}
            summaries={summaries}
            onSelect={setSelectedId}
          />
        </Card>
      ) : (
        <>
          <Card className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
                <Dumbbell className="h-5 w-5" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="neutral">
                    {selectedExercise.muscleGroup}
                  </Badge>
                  <span className="text-xs text-faint">
                    {selectedExercise.equipment}
                  </span>
                </div>
                <h2 className="mt-1 font-display text-xl font-semibold text-ink">
                  {selectedExercise.name}
                </h2>
                <p className="mt-0.5 text-xs text-muted">
                  Objetivo: {selectedExercise.targetSets} series ×{' '}
                  {selectedExercise.repMin}-{selectedExercise.repMax} reps ·
                  Subir {formatKg(selectedExercise.incrementKg)}
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectedId(null)}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Cambiar
            </Button>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
            <Card className="p-5 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Fecha">
                    <Input
                      type="date"
                      value={date}
                      max={todayISO()}
                      onChange={(event) => setDate(event.target.value)}
                    />
                  </Field>

                  <div className="flex items-end gap-2 sm:justify-end">
                    {lastLog && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleUseLast}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Usar última
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={handleClear}>
                      Limpiar
                    </Button>
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-faint">
                      Series
                    </p>
                    {isNewPR && (
                      <Badge tone="positive">
                        <Trophy className="h-3 w-3" />
                        Nuevo PR
                      </Badge>
                    )}
                  </div>
                  <SetsEditor sets={sets} onChange={setSets} />
                </div>

                <Field label="Notas" hint="Opcional">
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Cómo te has sentido, ajustes de la máquina..."
                    maxLength={300}
                  />
                </Field>

                {error && (
                  <p className="rounded-lg border border-negative/20 bg-negative/10 px-3 py-2 text-xs font-medium text-negative">
                    {error}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-faint">
                    Volumen:{' '}
                    <span className="font-semibold text-muted tabular-nums">
                      {formatVolume(volume)}
                    </span>
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full sm:w-auto"
                  >
                    <Save className="h-4 w-4" />
                    Guardar registro
                  </Button>
                </div>
              </form>
            </Card>

            <div className="space-y-4">
              {insight && <RecommendationBanner insight={insight} />}
              <LastPerformance log={lastLog} />
              <Card className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
                  Cómo funciona
                </p>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  Cuando completes {selectedExercise.targetSets} series con{' '}
                  {selectedExercise.repMax}+ reps en dos sesiones seguidas, te
                  sugeriré subir {formatKg(selectedExercise.incrementKg)}.
                </p>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
