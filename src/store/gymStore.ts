import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { sanitizeData } from '../lib/backup';
import { todayISO } from '../lib/date';
import { createId } from '../lib/ids';
import type {
  Exercise,
  ExerciseInput,
  GymData,
  LogEntry,
  LogInput,
  Settings,
  Theme,
} from '../types';

interface GymStore extends GymData {
  addExercise: (input: ExerciseInput) => Exercise;
  updateExercise: (
    id: string,
    patch: Partial<ExerciseInput> & { archived?: boolean },
  ) => void;
  toggleArchiveExercise: (id: string) => void;
  deleteExercise: (id: string) => void;
  addLog: (input: LogInput) => LogEntry;
  updateLog: (
    id: string,
    patch: Partial<Pick<LogEntry, 'date' | 'sets' | 'notes'>>,
  ) => void;
  deleteLog: (id: string) => void;
  setTheme: (theme: Theme) => void;
  importData: (data: GymData) => void;
  resetData: () => void;
}

const initialSettings: Settings = { theme: 'dark' };

export const useGymStore = create<GymStore>()(
  persist(
    (set) => ({
      exercises: [],
      logs: [],
      settings: initialSettings,

      addExercise: (input) => {
        const exercise: Exercise = {
          ...input,
          id: createId(),
          archived: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ exercises: [...state.exercises, exercise] }));
        return exercise;
      },

      updateExercise: (id, patch) => {
        set((state) => ({
          exercises: state.exercises.map((exercise) =>
            exercise.id === id ? { ...exercise, ...patch } : exercise,
          ),
        }));
      },

      toggleArchiveExercise: (id) => {
        set((state) => ({
          exercises: state.exercises.map((exercise) =>
            exercise.id === id
              ? { ...exercise, archived: !exercise.archived }
              : exercise,
          ),
        }));
      },

      deleteExercise: (id) => {
        set((state) => ({
          exercises: state.exercises.filter(
            (exercise) => exercise.id !== id,
          ),
          logs: state.logs.filter((log) => log.exerciseId !== id),
        }));
      },

      addLog: (input) => {
        const log: LogEntry = {
          id: createId(),
          exerciseId: input.exerciseId,
          date: input.date || todayISO(),
          sets: input.sets,
          notes: input.notes?.trim() ?? '',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({ logs: [...state.logs, log] }));
        return log;
      },

      updateLog: (id, patch) => {
        set((state) => ({
          logs: state.logs.map((log) =>
            log.id === id ? { ...log, ...patch } : log,
          ),
        }));
      },

      deleteLog: (id) => {
        set((state) => ({
          logs: state.logs.filter((log) => log.id !== id),
        }));
      },

      setTheme: (theme) => {
        set((state) => ({ settings: { ...state.settings, theme } }));
      },

      importData: (data) => {
        set({
          exercises: data.exercises,
          logs: data.logs,
          settings: data.settings,
        });
      },

      resetData: () => {
        set({
          exercises: [],
          logs: [],
          settings: initialSettings,
        });
      },
    }),
    {
      name: 'dusko:gym',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        exercises: state.exercises,
        logs: state.logs,
        settings: state.settings,
      }),
      merge: (persistedState, currentState) => {
        const safe = sanitizeData(persistedState);
        if (!safe) return currentState;
        return { ...currentState, ...safe };
      },
    },
  ),
);
