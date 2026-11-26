import { Moon, Plus, Settings, Sun } from 'lucide-react';
import type { Theme, View } from '../../types';
import { cn } from '../../lib/cn';
import { Button } from '../ui/Button';
import { Brand } from './Brand';
import { NAV_ITEMS } from './navItems';

export interface SidebarProps {
  view: View;
  theme: Theme;
  onNavigate: (view: View) => void;
  onNewLog: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
}

export function Sidebar({
  view,
  theme,
  onNavigate,
  onNewLog,
  onOpenSettings,
  onToggleTheme,
}: SidebarProps) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-surface/60 p-5 backdrop-blur-xl lg:flex">
      <div className="px-1">
        <Brand />
      </div>

      <Button
        className="mt-8 w-full"
        size="md"
        onClick={onNewLog}
        variant={view === 'log' ? 'secondary' : 'primary'}
      >
        <Plus className="h-4 w-4" />
        Registrar
      </Button>

      <nav className="mt-8 space-y-1" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = view === item.view;

          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                active
                  ? 'border-accent/15 bg-accent/10 text-ink'
                  : 'border-transparent text-muted hover:bg-elevated/60 hover:text-ink',
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 transition',
                  active
                    ? 'text-accent'
                    : 'text-faint group-hover:text-muted',
                )}
              />
              {item.label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-3 border-t border-line pt-4">
        <div className="rounded-xl border border-line bg-canvas/40 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">
            Consejo
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Registra incluso las sesiones ligeras. La constancia es lo que hace
            funcionar las recomendaciones.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleTheme}
            className="justify-center px-2"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
            {theme === 'dark' ? 'Claro' : 'Oscuro'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenSettings}
            className="justify-center px-2"
          >
            <Settings className="h-4 w-4" />
            Ajustes
          </Button>
        </div>
      </div>
    </aside>
  );
}
