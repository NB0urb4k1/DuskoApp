import { Plus } from 'lucide-react';
import type { View } from '../../types';
import { cn } from '../../lib/cn';
import { NAV_ITEMS } from './navItems';

export interface BottomNavProps {
  view: View;
  onNavigate: (view: View) => void;
  onNewLog: () => void;
}

export function BottomNav({ view, onNavigate, onNewLog }: BottomNavProps) {
  const left = NAV_ITEMS.slice(0, 2);
  const right = NAV_ITEMS.slice(2);

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto grid h-16 max-w-md grid-cols-5 items-center px-2">
        {left.map((item) => (
          <NavButton
            key={item.view}
            item={item}
            active={view === item.view}
            onClick={() => onNavigate(item.view)}
          />
        ))}

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={onNewLog}
            aria-label="Registrar entrenamiento"
            aria-current={view === 'log' ? 'page' : undefined}
            className={cn(
              '-mt-6 flex h-13 w-13 items-center justify-center rounded-2xl bg-accent text-accent-ink shadow-lg shadow-accent/30 transition active:scale-95',
              view === 'log' && 'ring-2 ring-accent/40 ring-offset-2 ring-offset-surface',
            )}
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {right.map((item) => (
          <NavButton
            key={item.view}
            item={item}
            active={view === item.view}
            onClick={() => onNavigate(item.view)}
          />
        ))}
      </div>
    </nav>
  );
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex flex-col items-center justify-center gap-1 rounded-xl py-1.5 text-[10px] font-medium transition',
        active ? 'text-accent' : 'text-faint hover:text-muted',
      )}
    >
      <Icon className="h-5 w-5" />
      {item.label}
    </button>
  );
}
