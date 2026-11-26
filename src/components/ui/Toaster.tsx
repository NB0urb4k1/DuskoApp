import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useUiStore, type ToastTone } from '../../store/uiStore';

const tones: Record<ToastTone, string> = {
  success: 'border-positive/25 bg-surface text-ink',
  error: 'border-negative/30 bg-surface text-ink',
  info: 'border-info/25 bg-surface text-ink',
};

const icons: Record<ToastTone, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const iconTones: Record<ToastTone, string> = {
  success: 'text-positive',
  error: 'text-negative',
  info: 'text-info',
};

export function Toaster() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:left-auto sm:right-6 sm:items-end">
      {toasts.map((toast) => {
        const Icon = icons[toast.tone];

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex w-full max-w-sm animate-rise-in items-center gap-3 rounded-xl border px-4 py-3 shadow-2xl',
              tones[toast.tone],
            )}
          >
            <Icon className={cn('h-5 w-5 shrink-0', iconTones[toast.tone])} />
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-lg p-1 text-faint transition hover:bg-elevated hover:text-ink"
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
