export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const WEEKDAY_LETTERS = ["D", "L", "M", "M", "J", "V", "S"];

export function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function toISODate(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

export function parseISODate(iso: string): { year: number; month: number; day: number } {
  const [y, m, d] = iso.split("-").map(Number);
  return { year: y, month: m, day: d };
}

export function todayISO(): string {
  const now = new Date();
  return toISODate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function tomorrowISO(): string {
  const now = new Date();
  now.setDate(now.getDate() + 1);
  return toISODate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export function isSameMonth(year1: number, month1: number, year2: number, month2: number): boolean {
  return year1 === year2 && month1 === month2;
}

export function isPastISO(iso: string): boolean {
  return iso < todayISO();
}

export function formatToAMPM(time: string): string {
  const parts = time.split(":");
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  if (isNaN(hours) || !minutes) return time;
  const period = hours >= 12 ? "PM" : "AM";
  const h12 = hours % 12 || 12;
  return `${h12}:${minutes} ${period}`;
}
