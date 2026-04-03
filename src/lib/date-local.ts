/** Локальна дата тренування: YYYY-MM-DD або ISO → Date (полудень локально для стабільності). */
export function parseWorkoutDateInput(value: string): Date {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split("-").map(Number);
    return new Date(y, m - 1, d, 12, 0, 0, 0);
  }
  const t = Date.parse(trimmed);
  if (Number.isNaN(t)) {
    throw new Error("Invalid date");
  }
  return new Date(t);
}

/** Для input type="date" з ISO з сервера. */
export function formatDateForInput(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function todayDateInput(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Межі календарного дня YYYY-MM-DD у локальному часі сервера (для Prisma `date` gte/lte). */
export function localDayBoundsFromInput(yyyyMmDd: string): { start: Date; end: Date } {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  const start = new Date(y, m - 1, d, 0, 0, 0, 0);
  const end = new Date(y, m - 1, d, 23, 59, 59, 999);
  return { start, end };
}

/** Вчора (локальний календар) — для дублювання тренування. */
export function yesterdayDateInput(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
