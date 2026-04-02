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
