import { useEffect, useState, type FormEvent } from 'react';
import { todayISO } from '../../lib/date';
import type { Exercise, LogEntry } from '../../types';
import { useGymStore } from '../../store/gymStore';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../ui/Button';
import { Field, Input, Textarea } from '../ui/Field';
import { Modal } from '../ui/Modal';
import {
  SetsEditor,
  fromDraftSets,
  toDraftSets,
  validateDraftSets,
  type DraftSet,
} from '../workout/SetsEditor';

export interface EditLogModalProps {
  open: boolean;
  onClose: () => void;
  log: LogEntry | null;
  exercise?: Exercise;
}

export function EditLogModal({
  open,
  onClose,
  log,
  exercise,
}: EditLogModalProps) {
  const updateLog = useGymStore((state) => state.updateLog);
  const pushToast = useUiStore((state) => state.pushToast);

  const [date, setDate] = useState(todayISO());
  const [sets, setSets] = useState<DraftSet[]>([{ weight: '', reps: '' }]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !log) return;
    setDate(log.date);
    setSets(toDraftSets(log.sets));
    setNotes(log.notes);
    setError(null);
  }, [open, log]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!log) return;

    if (!date) {
      setError('Elige una fecha válida.');
      return;
    }

    const validation = validateDraftSets(sets);
    if (validation) {
      setError(validation);
      return;
    }

    updateLog(log.id, {
      date,
      sets: fromDraftSets(sets),
      notes: notes.trim(),
    });
    pushToast('Registro actualizado');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Editar registro"
      description={exercise?.name}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="edit-log-form">
            Guardar cambios
          </Button>
        </>
      }
    >
      <form
        id="edit-log-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <Field label="Fecha">
          <Input
            type="date"
            value={date}
            max={todayISO()}
            onChange={(event) => setDate(event.target.value)}
          />
        </Field>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">
            Series
          </p>
          <SetsEditor sets={sets} onChange={setSets} />
        </div>

        <Field label="Notas">
          <Textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Sensaciones, ajustes de la máquina..."
            maxLength={300}
          />
        </Field>

        {error && (
          <p className="rounded-lg border border-negative/20 bg-negative/10 px-3 py-2 text-xs font-medium text-negative">
            {error}
          </p>
        )}
      </form>
    </Modal>
  );
}
