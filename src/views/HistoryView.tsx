import { useMemo, useState } from 'react';
import { History, Plus } from 'lucide-react';
import { formatDateWithYear, formatRelativeDate } from '../lib/date';
import { formatVolume, pluralize } from '../lib/format';
import { logVolume, sortLogsDesc } from '../lib/stats';
import {
  useExerciseMap,
  useExercises,
  useLogs,
} from '../store/selectors';
import { useGymStore } from '../store/gymStore';
import { useUiStore } from '../store/uiStore';
import type { LogEntry } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Field';
import { PageHeader } from '../components/ui/PageHeader';
import { EditLogModal } from '../components/history/EditLogModal';
import { LogItem } from '../components/history/LogItem';

export interface HistoryViewProps {
  onNewLog: () => void;
}

export function HistoryView({ onNewLog }: HistoryViewProps) {
  const exercises = useExercises();
  const logs = useLogs();
  const exerciseMap = useExerciseMap();
  const deleteLog = useGymStore((state) => state.deleteLog);
  const pushToast = useUiStore((state) => state.pushToast);

  const [filterId, setFilterId] = useState('all');
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [deletingLog, setDeletingLog] = useState<LogEntry | null>(null);

  const exercisesWithLogs = useMemo(() => {
    const ids = new Set(logs.map((log) => log.exerciseId));
    return exercises
      .filter((exercise) => ids.has(exercise.id))
      .sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }, [exercises, logs]);

  const groups = useMemo(() => {
    const filtered =
      filterId === 'all'
        ? logs
        : logs.filter((log) => log.exerciseId === filterId);
    const sorted = sortLogsDesc(filtered);
    const map = new Map<string, LogEntry[]>();

    for (const log of sorted) {
      const entries = map.get(log.date) ?? [];
      entries.push(log);
      map.set(log.date, entries);
    }

    return [...map.entries()];
  }, [logs, filterId]);

  const confirmDelete = () => {
    if (!deletingLog) return;
    deleteLog(deletingLog.id);
    pushToast('Registro eliminado', 'info');
    setDeletingLog(null);
  };

  const deletingExercise = deletingLog
    ? exerciseMap.get(deletingLog.exerciseId)
    : undefined;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Historial"
        title="Tu historial"
        description="Todos tus registros, agrupados por fecha. Puedes editar o borrar cualquier sesión."
        action={
          <Button onClick={onNewLog}>
            <Plus className="h-4 w-4" />
            Registrar
          </Button>
        }
      />

      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
          <History className="h-4 w-4" />
          Filtrar
        </div>
        <div className="sm:w-72">
          <Select
            value={filterId}
            onChange={(event) => setFilterId(event.target.value)}
            aria-label="Filtrar por ejercicio"
          >
            <option value="all">Todos los ejercicios</option>
            {exercisesWithLogs.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="Tu historial está vacío"
          description="Cuando registres tus primeras series, aparecerán aquí agrupadas por fecha."
          action={
            <Button onClick={onNewLog}>
              <Plus className="h-4 w-4" />
              Registrar primera sesión
            </Button>
          }
        />
      ) : groups.length === 0 ? (
        <EmptyState
          icon={History}
          title="Sin registros para este ejercicio"
          description="Prueba a elegir otro ejercicio o vuelve a ver todos los registros."
          action={
            <Button variant="secondary" onClick={() => setFilterId('all')}>
              Ver todos
            </Button>
          }
        />
      ) : (
        <div className="space-y-7">
          {groups.map(([date, entries]) => {
            const totalVolume = entries.reduce(
              (total, log) => total + logVolume(log),
              0,
            );

            return (
              <section key={date}>
                <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h2 className="font-display text-base font-semibold text-ink">
                      {formatRelativeDate(date)}
                    </h2>
                    <span className="text-xs text-faint">
                      {formatDateWithYear(date)}
                    </span>
                  </div>
                  <p className="text-xs text-faint">
                    {entries.length}{' '}
                    {pluralize(entries.length, 'ejercicio', 'ejercicios')} ·{' '}
                    {formatVolume(totalVolume)}
                  </p>
                </div>

                <div className="space-y-2">
                  {entries.map((log) => {
                    const exercise = exerciseMap.get(log.exerciseId);
                    if (!exercise) return null;

                    return (
                      <LogItem
                        key={log.id}
                        log={log}
                        exercise={exercise}
                        onEdit={() => setEditingLog(log)}
                        onDelete={() => setDeletingLog(log)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <EditLogModal
        open={editingLog !== null}
        onClose={() => setEditingLog(null)}
        log={editingLog}
        exercise={
          editingLog ? exerciseMap.get(editingLog.exerciseId) : undefined
        }
      />

      <ConfirmDialog
        open={deletingLog !== null}
        onClose={() => setDeletingLog(null)}
        onConfirm={confirmDelete}
        title="Eliminar registro"
        description={
          deletingLog && deletingExercise
            ? `Se eliminará el registro de ${deletingExercise.name} del ${formatDateWithYear(
                deletingLog.date,
              )}. Esta acción no se puede deshacer.`
            : ''
        }
        confirmLabel="Eliminar"
      />
    </div>
  );
}
