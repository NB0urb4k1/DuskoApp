import type { ReactNode } from 'react';
import type { Theme, View } from '../../types';
import { BottomNav } from './BottomNav';
import { MobileHeader } from './MobileHeader';
import { Sidebar } from './Sidebar';

export interface AppShellProps {
  view: View;
  theme: Theme;
  onNavigate: (view: View) => void;
  onNewLog: () => void;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
  children: ReactNode;
}

export function AppShell({
  view,
  theme,
  onNavigate,
  onNewLog,
  onOpenSettings,
  onToggleTheme,
  children,
}: AppShellProps) {
  return (
    <div className="min-h-dvh bg-canvas">
      <Sidebar
        view={view}
        theme={theme}
        onNavigate={onNavigate}
        onNewLog={onNewLog}
        onOpenSettings={onOpenSettings}
        onToggleTheme={onToggleTheme}
      />

      <div className="lg:pl-64">
        <MobileHeader
          theme={theme}
          onOpenSettings={onOpenSettings}
          onToggleTheme={onToggleTheme}
        />

        <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-10">
          {children}
        </main>
      </div>

      <BottomNav view={view} onNavigate={onNavigate} onNewLog={onNewLog} />
    </div>
  );
}
