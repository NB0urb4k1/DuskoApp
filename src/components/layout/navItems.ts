import {
  Dumbbell,
  History,
  Home,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { View } from '../../types';

export interface NavItem {
  view: View;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { view: 'dashboard', label: 'Inicio', icon: Home },
  { view: 'exercises', label: 'Ejercicios', icon: Dumbbell },
  { view: 'progress', label: 'Progreso', icon: TrendingUp },
  { view: 'history', label: 'Historial', icon: History },
];
