export const MUSCLE_GROUPS = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Hombros',
  'Bíceps',
  'Tríceps',
  'Core',
  'Cardio',
  'Otro',
] as const;

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT_TYPES = [
  'Máquina',
  'Barra',
  'Mancuernas',
  'Polea',
  'Peso corporal',
  'Banda',
  'Kettlebell',
  'Otro',
] as const;

export type Equipment = (typeof EQUIPMENT_TYPES)[number];

export type Theme = 'dark' | 'light';

export type View = 'dashboard' | 'exercises' | 'log' | 'progress' | 'history';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  targetSets: number;
  repMin: number;
  repMax: number;
  incrementKg: number;
  notes: string;
  archived: boolean;
  createdAt: string;
}

export type ExerciseInput = Omit<Exercise, 'id' | 'createdAt' | 'archived'>;

export interface SetEntry {
  weight: number;
  reps: number;
}

export interface LogEntry {
  id: string;
  exerciseId: string;
  date: string;
  sets: SetEntry[];
  notes: string;
  createdAt: string;
}

export interface LogInput {
  exerciseId: string;
  date: string;
  sets: SetEntry[];
  notes?: string;
}

export interface Settings {
  theme: Theme;
}

export interface GymData {
  exercises: Exercise[];
  logs: LogEntry[];
  settings: Settings;
}
