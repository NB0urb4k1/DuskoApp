import { useEffect, useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { SettingsModal } from './components/settings/SettingsModal';
import { Toaster } from './components/ui/Toaster';
import { useGymStore } from './store/gymStore';
import type { View } from './types';
import { DashboardView } from './views/DashboardView';
import { ExercisesView } from './views/ExercisesView';
import { HistoryView } from './views/HistoryView';
import { LogView } from './views/LogView';
import { ProgressView } from './views/ProgressView';

export default function App() {
  const theme = useGymStore((state) => state.settings.theme);
  const setTheme = useGymStore((state) => state.setTheme);

  const [view, setView] = useState<View>('dashboard');
  const [logExerciseId, setLogExerciseId] = useState<string | undefined>();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [autoOpenExerciseForm, setAutoOpenExerciseForm] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigate = (next: View) => {
    if (next !== 'log') setLogExerciseId(undefined);
    setView(next);
    scrollToTop();
  };

  const openLog = (exerciseId?: string) => {
    setLogExerciseId(exerciseId);
    setView('log');
    scrollToTop();
  };

  const goToExercises = (openForm = false) => {
    if (openForm) setAutoOpenExerciseForm(true);
    setView('exercises');
    scrollToTop();
  };

  const createExercise = () => {
    setAutoOpenExerciseForm(true);
    setView('exercises');
    scrollToTop();
  };

  return (
    <>
      <AppShell
        view={view}
        theme={theme}
        onNavigate={navigate}
        onNewLog={() => openLog()}
        onOpenSettings={() => setSettingsOpen(true)}
        onToggleTheme={() =>
          setTheme(theme === 'dark' ? 'light' : 'dark')
        }
      >
        {view === 'dashboard' && (
          <DashboardView
            onNavigate={navigate}
            onLogExercise={openLog}
            onCreateExercise={createExercise}
          />
        )}

        {view === 'exercises' && (
          <ExercisesView
            autoOpenForm={autoOpenExerciseForm}
            onAutoOpenConsumed={() => setAutoOpenExerciseForm(false)}
            onLogExercise={openLog}
          />
        )}

        {view === 'log' && (
          <LogView
            initialExerciseId={logExerciseId}
            onGoToExercises={goToExercises}
          />
        )}

        {view === 'progress' && (
          <ProgressView onNewLog={() => openLog()} />
        )}

        {view === 'history' && <HistoryView onNewLog={() => openLog()} />}
      </AppShell>

      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <Toaster />
    </>
  );
}
