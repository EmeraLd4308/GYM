export const REST_TIMER_DEFAULT_SEC = 180;
export const REST_TIMER_PRESETS = [60, 90, 120, 180, 300, 420] as const;

export function parseMinutesInput(raw: string): number | null {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) return null;
  const n = parseFloat(trimmed);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function minutesToSec(min: number): number {
  return Math.max(1, Math.round(min * 60));
}

export function commitRestDurationFromMinutesField(raw: string, fallbackSec: number): number {
  const min = parseMinutesInput(raw);
  if (min == null) return fallbackSec > 0 ? fallbackSec : REST_TIMER_DEFAULT_SEC;
  return minutesToSec(min);
}

export function formatMinutesForInput(sec: number): string {
  const min = sec / 60;
  if (Number.isInteger(min)) return String(min);
  return min.toFixed(2).replace(/\.?0+$/, "");
}

export function isRestTimerPreset(sec: number): boolean {
  return (REST_TIMER_PRESETS as readonly number[]).includes(sec);
}

export function readStoredRestDurationSec(): number {
  if (typeof window === "undefined") return REST_TIMER_DEFAULT_SEC;
  const raw = localStorage.getItem("sbd-rest-duration-sec");
  const n = raw ? parseInt(raw, 10) : REST_TIMER_DEFAULT_SEC;
  if (!Number.isFinite(n) || n < 1) return REST_TIMER_DEFAULT_SEC;
  return n;
}

export function formatRestTimerMmSs(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function formatRestTimerPresetLabel(sec: number): string {
  if (sec < 60) return `${sec} с`;
  return `${sec / 60} хв`;
}
