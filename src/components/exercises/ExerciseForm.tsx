import { useEffect, useState, type FormEvent } from 'react';
import {
  EQUIPMENT_TYPES,
  MUSCLE_GROUPS,
  type Exercise,
  type ExerciseInput,
} from '../../types';
import { useGymStore } from '../../store/gymStore';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../ui/Button';
import { Field, Input, Select, Textarea } from '../ui/Field';
import { Modal } from '../ui/Modal';

const emptyForm: ExerciseInput = {
  name: '',
  muscleGroup: 'Pecho',
  equipment: 'Máquina',
  targetSets: 3,
  repMin: 8,
  repMax: 12,
  incrementKg: 2.5,
  notes: '',
};

type FormErrors = Partial<Record<keyof ExerciseInput, string>>;

export interface ExerciseFormProps {
  open: boolean;
  onClose: () => void;
  exercise?: Exercise | null;
}

export function ExerciseForm({
  open,
  onClose,
  exercise,
}: ExerciseFormProps) {
  const addExercise = useGymStore((state) => state.addExercise);
  const updateExercise = useGymStore((state) => state.updateExercise);
  const pushToast = useUiStore((state) => state.pushToast);

  const [form, setForm] = useState<ExerciseInput>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!open) return;

    if (exercise) {
      setForm({
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
        targetSets: exercise.targetSets,
        repMin: exercise.repMin,
        repMax: exercise.repMax,
        incrementKg: exercise.incrementKg,
        notes: exercise.notes,
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
  }, [open, exercise]);

  const update = <K extends keyof ExerciseInput>(
    key: K,
    value: ExerciseInput[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};

    if (form.name.trim().length < 2) {
      nextErrors.name = 'Ponle un nombre de al menos 2 caracteres.';
    }
    if (form.targetSets < 1 || form.targetSets > 12) {
      nextErrors.targetSets = 'Entre 1 y 12 series.';
    }
    if (form.repMin < 1 || form.repMin > 100) {
      nextErrors.repMin = 'Entre 1 y 100 reps.';
    }
    if (form.repMax < form.repMin || form.repMax > 100) {
      nextErrors.repMax = 'Debe ser mayor o igual al mínimo.';
    }
    if (form.incrementKg < 0 || form.incrementKg > 100) {
      nextErrors.incrementKg = 'Usa un incremento entre 0 y 100 kg.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: ExerciseInput = {
      ...form,
      name: form.name.trim(),
      notes: form.notes.trim(),
    };

    if (exercise) {
      updateExercise(exercise.id, payload);
      pushToast('Ejercicio actualizado');
    } else {
      addExercise(payload);
      pushToast('Ejercicio creado');
    }

    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={exercise ? 'Editar ejercicio' : 'Nuevo ejercicio'}
      description={
        exercise
          ? 'Ajusta el objetivo y el incremento de peso.'
          : 'Define el ejercicio o la máquina que vas a usar.'
      }
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form="exercise-form">
            {exercise ? 'Guardar cambios' : 'Crear ejercicio'}
          </Button>
        </>
      }
    >
      <form
        id="exercise-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <Field label="Nombre" error={errors.name}>
          <Input
            value={form.name}
            onChange={(event) => update('name', event.target.value)}
            placeholder="Ej. Prensa de piernas"
            autoFocus
            maxLength={60}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Grupo muscular">
            <Select
              value={form.muscleGroup}
              onChange={(event) =>
                update('muscleGroup', event.target.value as ExerciseInput['muscleGroup'])
              }
            >
              {MUSCLE_GROUPS.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Equipo">
            <Select
              value={form.equipment}
              onChange={(event) =>
                update('equipment', event.target.value as ExerciseInput['equipment'])
              }
            >
              {EQUIPMENT_TYPES.map((equipment) => (
                <option key={equipment} value={equipment}>
                  {equipment}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="space-y-4 rounded-xl border border-line bg-canvas/30 p-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Objetivo y progresión
            </p>
            <p className="mt-0.5 text-xs text-faint">
              Se usan para saber cuándo recomendarte subir el peso.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Series objetivo"
              hint="Series por sesión"
              error={errors.targetSets}
            >
              <Input
                type="number"
                min={1}
                max={12}
                value={form.targetSets}
                onChange={(event) =>
                  update('targetSets', Number(event.target.value))
                }
              />
            </Field>

            <Field
              label="Incremento (kg)"
              hint="Cuánto sumar al subir"
              error={errors.incrementKg}
            >
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={form.incrementKg}
                onChange={(event) =>
                  update('incrementKg', Number(event.target.value))
                }
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Reps mínimo" error={errors.repMin}>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.repMin}
                onChange={(event) =>
                  update('repMin', Number(event.target.value))
                }
              />
            </Field>

            <Field label="Reps máximo" error={errors.repMax}>
              <Input
                type="number"
                min={1}
                max={100}
                value={form.repMax}
                onChange={(event) =>
                  update('repMax', Number(event.target.value))
                }
              />
            </Field>
          </div>
        </div>

        <Field label="Notas" hint="Opcional: ajustes de la máquina, técnica...">
          <Textarea
            value={form.notes}
            onChange={(event) => update('notes', event.target.value)}
            placeholder="Ej. Asiento en posición 3, agarre medio..."
            maxLength={300}
          />
        </Field>
      </form>
    </Modal>
  );
}
