import { formatDateForInput } from "@/shared/lib/date-local";

export function calendarWeekBounds(anchor: Date = new Date()): {
  weekStart: string;
  weekEnd: string;
} {
  const d = new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate(), 12, 0, 0, 0);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    weekStart: formatDateForInput(monday.toISOString()),
    weekEnd: formatDateForInput(sunday.toISOString()),
  };
}

export function dateKeyInWeek(dateIso: string, weekStart: string, weekEnd: string): boolean {
  const key = formatDateForInput(dateIso);
  return key >= weekStart && key <= weekEnd;
}
