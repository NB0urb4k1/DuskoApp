import {
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from 'react';
import {
  Database,
  Download,
  Moon,
  RotateCcw,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { downloadBackup, parseBackup } from '../../lib/backup';
import type { GymData } from '../../types';
import { useGymStore } from '../../store/gymStore';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../ui/Button';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Modal } from '../ui/Modal';
import { SegmentedControl } from '../ui/SegmentedControl';

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const exercises = useGymStore((state) => state.exercises);
  const logs = useGymStore((state) => state.logs);
  const settings = useGymStore((state) => state.settings);
  const setTheme = useGymStore((state) => state.setTheme);
  const importData = useGymStore((state) => state.importData);
  const resetData = useGymStore((state) => state.resetData);
  const pushToast = useUiStore((state) => state.pushToast);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImport, setPendingImport] = useState<GymData | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [resetOpen, setResetOpen] = useState(false);

  const handleExport = () => {
    downloadBackup({ exercises, logs, settings });
    pushToast('Backup descargado');
  };

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const data = parseBackup(text);
      setPendingImport(data);
      setFileError(null);
    } catch (error) {
      setFileError(
        error instanceof Error
          ? error.message
          : 'No se pudo leer el archivo.',
      );
    }
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    importData(pendingImport);
    setPendingImport(null);
    pushToast('Backup importado correctamente');
    onClose();
  };

  const confirmReset = () => {
    resetData();
    setResetOpen(false);
    pushToast('Todos los datos han sido eliminados', 'info');
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        title="Ajustes"
        description="Preferencias y copia de seguridad"
        footer={
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
        }
      >
        <div className="space-y-7">
          <section>
            <SectionTitle
              icon={<Sun className="h-4 w-4" />}
              title="Apariencia"
              description="Elige el tema de la app."
            />
            <SegmentedControl
              ariaLabel="Tema de la aplicación"
              value={settings.theme}
              onChange={setTheme}
              options={[
                { value: 'dark', label: 'Oscuro', icon: Moon },
                { value: 'light', label: 'Claro', icon: Sun },
              ]}
              className="mt-3"
            />
          </section>

          <section>
            <SectionTitle
              icon={<Database className="h-4 w-4" />}
              title="Tus datos"
              description="Todo se guarda en el localStorage de este navegador."
            />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-line bg-canvas/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
                  Ejercicios
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink tabular-nums">
                  {exercises.length}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-canvas/40 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">
                  Registros
                </p>
                <p className="mt-1 font-display text-2xl font-semibold text-ink tabular-nums">
                  {logs.length}
                </p>
              </div>
            </div>
          </section>

          <section>
            <SectionTitle
              icon={<ShieldCheck className="h-4 w-4" />}
              title="Copia de seguridad"
              description="Exporta un JSON para no perder tu progreso si borras los datos del navegador."
            />
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" onClick={handleExport}>
                <Download className="h-4 w-4" />
                Exportar backup
              </Button>
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Importar backup
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={handleFile}
              />
            </div>
            {fileError && (
              <p className="mt-2 rounded-lg border border-negative/20 bg-negative/10 px-3 py-2 text-xs font-medium text-negative">
                {fileError}
              </p>
            )}
          </section>

          <section className="rounded-xl border border-negative/20 bg-negative/5 p-4">
            <SectionTitle
              icon={<RotateCcw className="h-4 w-4" />}
              title="Zona de peligro"
              description="Borra todos los ejercicios y registros de este navegador."
            />
            <Button
              variant="danger"
              size="sm"
              className="mt-3"
              onClick={() => setResetOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Borrar todos los datos
            </Button>
          </section>
        </div>
      </Modal>

      <ConfirmDialog
        open={pendingImport !== null}
        onClose={() => setPendingImport(null)}
        onConfirm={confirmImport}
        title="Importar backup"
        description={
          pendingImport
            ? `Se reemplazarán tus ${exercises.length} ejercicios y ${logs.length} registros actuales por ${pendingImport.exercises.length} ejercicios y ${pendingImport.logs.length} registros. ¿Quieres continuar?`
            : ''
        }
        confirmLabel="Importar y reemplazar"
        tone="primary"
      />

      <ConfirmDialog
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onConfirm={confirmReset}
        title="Borrar todos los datos"
        description="Se eliminarán todos tus ejercicios y registros de este navegador. Esta acción no se puede deshacer. Si quieres conservarlos, exporta un backup antes."
        confirmLabel="Sí, borrar todo"
      />
    </>
  );
}

function SectionTitle({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-muted">{icon}</span>
      <div>
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
