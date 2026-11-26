import {
  EQUIPMENT_TYPES,
  MUSCLE_GROUPS,
  type Equipment,
  type Exercise,
  type GymData,
  type LogEntry,
  type MuscleGroup,
  type Settings,
  type SetEntry,
} from '../types';
import { todayISO } from './date';
import { createId } from './ids';

const BACKUP_APP = 'dusko-gym';
const BACKUP_VERSION = 1;

export interface BackupFile {
  app: string;
  version: number;
  exportedAt: string;
  data: GymData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isMuscleGroup(value: unknown): value is MuscleGroup {
  return (
    typeof value === 'string' &&
    (MUSCLE_GROUPS as readonly string[]).includes(value)
  );
}

function isEquipment(value: unknown): value is Equipment {
  return (
    typeof value === 'string' &&
    (EQUIPMENT_TYPES as readonly string[]).includes(value)
  );
}

function isISODate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function normalizeExercise(value: unknown): Exercise | null {
  if (!isRecord(value)) return null;

  const name = asString(value.name).trim();
  if (!name) return null;

  const repMin = clamp(Math.round(asNumber(value.repMin, 8)), 1, 100);
  const repMax = Math.max(
    repMin,
    clamp(Math.round(asNumber(value.repMax, 12)), 1, 100),
  );

  return {
    id: asString(value.id) || createId(),
    name,
    muscleGroup: isMuscleGroup(value.muscleGroup) ? value.muscleGroup : 'Otro',
    equipment: isEquipment(value.equipment) ? value.equipment : 'Otro',
    targetSets: clamp(Math.round(asNumber(value.targetSets, 3)), 1, 12),
    repMin,
    repMax,
    incrementKg: clamp(asNumber(value.incrementKg, 2.5), 0, 100),
    notes: asString(value.notes),
    archived: value.archived === true,
    createdAt: asString(value.createdAt) || new Date().toISOString(),
  };
}

function normalizeSet(value: unknown): SetEntry | null {
  if (!isRecord(value)) return null;

  const weight = asNumber(value.weight, -1);
  const reps = asNumber(value.reps, -1);

  if (weight < 0 || reps < 1) return null;

  return {
    weight: Math.round(weight * 100) / 100,
    reps: Math.round(reps),
  };
}

function normalizeLog(value: unknown): LogEntry | null {
  if (!isRecord(value)) return null;

  const exerciseId = asString(value.exerciseId);
  if (!exerciseId) return null;

  const sets = Array.isArray(value.sets)
    ? value.sets
        .map(normalizeSet)
        .filter((set): set is SetEntry => set !== null)
    : [];

  if (sets.length === 0) return null;

  const rawDate = asString(value.date);
  const date = isISODate(rawDate) ? rawDate : todayISO();

  return {
    id: asString(value.id) || createId(),
    exerciseId,
    date,
    sets,
    notes: asString(value.notes),
    createdAt: asString(value.createdAt) || new Date().toISOString(),
  };
}

function normalizeSettings(value: unknown): Settings {
  if (isRecord(value) && value.theme === 'light') {
    return { theme: 'light' };
  }
  return { theme: 'dark' };
}

/**
 * Normaliza datos venidos de localStorage o de un backup. Devuelve `null` si
 * el valor no tiene la forma mínima esperada.
 */
export function sanitizeData(value: unknown): GymData | null {
  if (!isRecord(value)) return null;
  if (!Array.isArray(value.exercises) || !Array.isArray(value.logs)) {
    return null;
  }

  const seenExercises = new Set<string>();
  const exercises: Exercise[] = [];

  for (const raw of value.exercises) {
    const exercise = normalizeExercise(raw);
    if (!exercise || seenExercises.has(exercise.id)) continue;
    seenExercises.add(exercise.id);
    exercises.push(exercise);
  }

  const seenLogs = new Set<string>();
  const logs: LogEntry[] = [];

  for (const raw of value.logs) {
    const log = normalizeLog(raw);
    if (!log || seenLogs.has(log.id)) continue;
    if (!seenExercises.has(log.exerciseId)) continue;
    seenLogs.add(log.id);
    logs.push(log);
  }

  return {
    exercises,
    logs,
    settings: normalizeSettings(value.settings),
  };
}

export function createBackup(data: GymData): string {
  const backup: BackupFile = {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };

  return JSON.stringify(backup, null, 2);
}

export function downloadBackup(data: GymData): void {
  const blob = new Blob([createBackup(data)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = `dusko-gym-${todayISO()}.json`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function parseBackup(text: string): GymData {
  let parsed: unknown;

  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('El archivo no es un JSON válido.');
  }

  const rawData =
    isRecord(parsed) && isRecord(parsed.data) ? parsed.data : parsed;
  const data = sanitizeData(rawData);

  if (!data) {
    throw new Error(
      'El archivo no tiene el formato de backup de Dusko Gym o está dañado.',
    );
  }

  return data;
}
