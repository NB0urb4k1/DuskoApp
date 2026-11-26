import { Plus, Trash2 } from 'lucide-react';
import { formatVolume } from '../../lib/format';
import type { SetEntry } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Field';

export interface DraftSet {
  weight: string;
  reps: string;
}

export const EMPTY_SET: DraftSet = { weight: '', reps: '' };

export function toDraftSets(sets: SetEntry[]): DraftSet[] {
  return sets.map((set) => ({
    weight: String(set.weight),
    reps: String(set.reps),
  }));
}

export function fromDraftSets(sets: DraftSet[]): SetEntry[] {
  return sets.map((set) => ({
    weight: Number(set.weight),
    reps: Math.round(Number(set.reps)),
  }));
}

export function draftVolume(sets: DraftSet[]): number {
  return sets.reduce(
    (total, set) =>
      total + (Number(set.weight) || 0) * (Number(set.reps) || 0),
    0,
  );
}

export function validateDraftSets(sets: DraftSet[]): string | null {
  if (sets.length === 0) return 'Añade al menos una serie.';

  for (let index = 0; index < sets.length; index += 1) {
    const set = sets[index];
    const weight = Number(set.weight);
    const reps = Number(set.reps);

    if (set.weight.trim() === '' || !Number.isFinite(weight) || weight < 0) {
      return `El peso de la serie ${index + 1} no es válido.`;
    }
    if (
      set.reps.trim() === '' ||
      !Number.isFinite(reps) ||
      reps < 1 ||
      reps > 200
    ) {
      return `Las repeticiones de la serie ${index + 1} deben estar entre 1 y 200.`;
    }
  }

  return null;
}

export interface SetsEditorProps {
  sets: DraftSet[];
  onChange: (sets: DraftSet[]) => void;
}

export function SetsEditor({ sets, onChange }: SetsEditorProps) {
  const updateSet = (index: number, patch: Partial<DraftSet>) => {
    onChange(
      sets.map((set, currentIndex) =>
        currentIndex === index ? { ...set, ...patch } : set,
      ),
    );
  };

  const addSet = () => {
    const last = sets[sets.length - 1];
    onChange([
      ...sets,
      last ? { weight: last.weight, reps: last.reps } : { ...EMPTY_SET },
    ]);
  };

  const removeSet = (index: number) => {
    if (sets.length === 1) return;
    onChange(sets.filter((_, currentIndex) => currentIndex !== index));
  };

  const volume = draftVolume(sets);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-faint">
        <span>#</span>
        <span>Peso (kg)</span>
        <span>Reps</span>
        <span />
      </div>

      <div className="space-y-2">
        {sets.map((set, index) => (
          <div
            key={index}
            className="grid grid-cols-[2rem_1fr_1fr_2.5rem] items-center gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-elevated/50 text-xs font-semibold text-muted tabular-nums">
              {index + 1}
            </span>

            <Input
              type="number"
              inputMode="decimal"
              min={0}
              step={0.5}
              value={set.weight}
              onChange={(event) =>
                updateSet(index, { weight: event.target.value })
              }
              placeholder="kg"
              className="h-10 text-center tabular-nums"
              aria-label={`Peso de la serie ${index + 1}`}
            />

            <Input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={set.reps}
              onChange={(event) =>
                updateSet(index, { reps: event.target.value })
              }
              placeholder="reps"
              className="h-10 text-center tabular-nums"
              aria-label={`Repeticiones de la serie ${index + 1}`}
            />

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 hover:text-negative"
              onClick={() => removeSet(index)}
              disabled={sets.length === 1}
              aria-label={`Eliminar serie ${index + 1}`}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <Button variant="secondary" size="sm" onClick={addSet}>
          <Plus className="h-3.5 w-3.5" />
          Añadir serie
        </Button>
        <p className="text-xs text-faint">
          Volumen:{' '}
          <span className="font-semibold text-muted tabular-nums">
            {formatVolume(volume)}
          </span>
        </p>
      </div>
    </div>
  );
}
