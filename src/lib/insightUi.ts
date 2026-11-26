import {
  ArrowUpRight,
  Minus,
  RefreshCw,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react';
import type { BadgeTone } from '../components/ui/Badge';
import type { InsightKind } from './progression';

export interface InsightUi {
  label: string;
  tone: BadgeTone;
  icon: LucideIcon;
}

export const INSIGHT_UI: Record<InsightKind, InsightUi> = {
  increase: { label: 'Sube peso', tone: 'accent', icon: ArrowUpRight },
  change: { label: 'Cambia ejercicio', tone: 'warning', icon: RefreshCw },
  stagnant: { label: 'Estancado', tone: 'warning', icon: TriangleAlert },
  progress: { label: 'Progresando', tone: 'positive', icon: TrendingUp },
  steady: { label: 'Constante', tone: 'neutral', icon: Minus },
  baseline: { label: 'Nuevo', tone: 'info', icon: Sparkles },
};
