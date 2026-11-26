import { useEffect, useMemo, useState } from 'react';
import { Dumbbell, Plus, SearchX } from 'lucide-react';
import type { Exercise, MuscleGroup } from '../types';
import {
  useExerciseSummaries,
  useExercises,
  useInsightMap,
  useLogs,
} from '../store/selectors';
import { useGymStore } from '../store/gymStore';
import { useUiStore } from '../store/uiStore';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { ExerciseCard } from '../components/exercises/ExerciseCard';
import { ExerciseFilters } from '../components/exercises/ExerciseFilters';
import { ExerciseForm } from '../components/exercises/ExerciseForm';

export interface ExercisesViewProps {
  autoOpenForm?: boolean;
  onAutoOpenConsumed?: () => void;
  onLogExercise: (exerciseId: string) => void;
}

export function ExercisesView({
  autoOpenForm,
  onAutoOpenConsumed,
  onLogExercise,
}: ExercisesViewProps) {
  const exercises = useExercises();
  const logs = useLogs();
  const summaries = useExerciseSummaries();
  const insightMap = useInsightMap();
  const toggleArchiveExercise = useGymStore(
    (state) => state.toggleArchiveExercise,
  );
  const deleteExercise = useGymStore((state) => state.deleteExercise);
  const pushToast = useUiStore((state) => state.pushToast);

  const [search, setSearch] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | 'Todos'>(
    'Todos',
  );
  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deletingExercise, setDeletingExercise] = useState<Exercise | null>(
    null,
  );

  useEffect(() => {
    if (!autoOpenForm) return;
    setEditingExercise(null);
    setFormOpen(true);
    onAutoOpenConsumed?.();
  }, [autoOpenForm, onAutoOpenConsumed]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return exercises
      .filter((exercise) => (showArchived ? true : !exercise.archived))
      .filter(
        (exercise) =>
          muscleGroup === 'Todos' || exercise.muscleGroup === muscleGroup,
      )
      .filter(
        (exercise) =>
          !term ||
          `${exercise.name} ${exercise.equipment} ${exercise.muscleGroup}`
            .toLowerCase()
            .includes(term),
      )
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [exercises, search, muscleGroup, showArchived]);

  const deletingLogCount = deletingExercise
    ? logs.filter((log) => log.exerciseId === deletingExercise.id).length
    : 0;

  const openNew = () => {
    setEditingExercise(null);
    setFormOpen(true);
  };

  const openEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormOpen(true);
  };

  const handleArchive = (exercise: Exercise) => {
    toggleArchiveExercise(exercise.id);
    pushToast(
      exercise.archived ? 'Ejercicio restaurado' : 'Ejercicio archivado',
      'info',
    );
  };

  const confirmDelete = () => {
    if (!deletingExercise) return;
    deleteExercise(deletingExercise.id);
    pushToast('Ejercicio eliminado');
    setDeletingExercise(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catálogo"
        title="Tus ejercicios"
        description="Crea tus máquinas y ejercicios, define el objetivo de reps y ajusta cuánto peso sumar."
        action={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            Nuevo ejercicio
          </Button>
        }
      />

      <Card className="p-4">
        <ExerciseFilters
          search={search}
          onSearchChange={setSearch}
          muscleGroup={muscleGroup}
          onMuscleGroupChange={setMuscleGroup}
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
        />
      </Card>

      {exercises.length === 0 ? (
        <EmptyState
          icon={Dumbbell}
          title="Tu catálogo está vacío"
          description="Añade el primer ejercicio o máquina que uses en el gimnasio. Después podrás registrar series y recibir recomendaciones."
          action={
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" />
              Crear primer ejercicio
            </Button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="Sin resultados"
          description="No hay ejercicios que coincidan con la búsqueda o el filtro seleccionado."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('');
                setMuscleGroup('Todos');
                setShowArchived(false);
              }}
            >
              Limpiar filtros
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((exercise) => {
            const summary = summaries.get(exercise.id);
            if (!summary) return null;

            return (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                summary={summary}
                insight={insightMap.get(exercise.id)}
                onLog={() => onLogExercise(exercise.id)}
                onEdit={() => openEdit(exercise)}
                onArchive={() => handleArchive(exercise)}
                onDelete={() => setDeletingExercise(exercise)}
              />
            );
          })}
        </div>
      )}

      <ExerciseForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        exercise={editingExercise}
      />

      <ConfirmDialog
        open={deletingExercise !== null}
        onClose={() => setDeletingExercise(null)}
        onConfirm={confirmDelete}
        title="Eliminar ejercicio"
        description={
          deletingExercise
            ? deletingLogCount > 0
              ? `Se eliminará "${deletingExercise.name}" y también sus ${deletingLogCount} registros de progreso. Esta acción no se puede deshacer.`
              : `Se eliminará "${deletingExercise.name}". Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
      />
    </div>
  );
}
