import { Moon, Settings, Sun } from 'lucide-react';
import type { Theme } from '../../types';
import { Button } from '../ui/Button';
import { Brand } from './Brand';

export interface MobileHeaderProps {
  theme: Theme;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
}

export function MobileHeader({
  theme,
  onOpenSettings,
  onToggleTheme,
}: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Brand compact />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            aria-label={
              theme === 'dark' ? 'Activar tema claro' : 'Activar tema oscuro'
            }
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpenSettings}
            aria-label="Abrir ajustes"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
