const DAY_MS = 86_400_000;

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(iso: string): Date {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeek(date: Date): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - offset);
  return result;
}

export function getWeekStartISO(iso: string): string {
  return toISODate(startOfWeek(parseISODate(iso)));
}

export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round(
    (parseISODate(toISO).getTime() - parseISODate(fromISO).getTime()) / DAY_MS,
  );
}

export function weeksBetween(fromISO: string, toISO: string): number {
  return Math.max(0, Math.floor(daysBetween(fromISO, toISO) / 7));
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatShortDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
  })
    .format(parseISODate(iso))
    .replace('.', '');
}

export function formatMonthShort(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', { month: 'short' })
    .format(parseISODate(iso))
    .replace('.', '');
}

export function formatLongDate(iso: string): string {
  return capitalize(
    new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(parseISODate(iso)),
  );
}

export function formatDateWithYear(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
    .format(parseISODate(iso))
    .replace('.', '');
}

export function formatRelativeDate(iso: string): string {
  const diff = daysBetween(iso, todayISO());

  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff > 1 && diff < 7) return `Hace ${diff} días`;
  return formatShortDate(iso);
}

export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 6) return 'Buenas noches';
  if (hour < 12) return 'Buenos días';
  if (hour < 20) return 'Buenas tardes';
  return 'Buenas noches';
}
