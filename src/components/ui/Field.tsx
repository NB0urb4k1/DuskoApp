import type { ComponentProps, ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/cn';

const fieldBase =
  'w-full rounded-xl border border-line bg-canvas/60 text-sm text-ink transition placeholder:text-faint focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50';

export interface FieldProps {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function Field({ label, hint, error, className, children }: FieldProps) {
  return (
    <label className={cn('block space-y-1.5', className)}>
      {label && (
        <span className="block text-xs font-medium uppercase tracking-wider text-faint">
          {label}
        </span>
      )}
      {children}
      {error ? (
        <span className="block text-xs font-medium text-negative">{error}</span>
      ) : hint ? (
        <span className="block text-xs text-faint">{hint}</span>
      ) : null}
    </label>
  );
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(fieldBase, 'h-11 px-3.5', className)}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(fieldBase, 'min-h-24 resize-y px-3.5 py-3', className)}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: ComponentProps<'select'>) {
  return (
    <div className="relative">
      <select
        className={cn(
          fieldBase,
          'h-11 appearance-none px-3.5 pr-9',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
      />
    </div>
  );
}
