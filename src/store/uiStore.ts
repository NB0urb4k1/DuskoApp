import { create } from 'zustand';
import { createId } from '../lib/ids';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  tone: ToastTone;
}

interface UiStore {
  toasts: ToastItem[];
  pushToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
}

export const useUiStore = create<UiStore>((set) => ({
  toasts: [],

  pushToast: (message, tone = 'success') => {
    const id = createId();
    set((state) => ({
      toasts: [...state.toasts, { id, message, tone }],
    }));

    window.setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, 3800);
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
