export function estimateRpeFromProfileMax(
  weightKg: number,
  reps: number,
  approximateOneRmKg: number,
): number | null {
  if (!(approximateOneRmKg > 0) || !(weightKg > 0) || reps < 1 || !Number.isFinite(weightKg))
    return null;
  const e1rm = weightKg * (1 + reps / 30);
  const ratio = e1rm / approximateOneRmKg;
  if (!Number.isFinite(ratio) || ratio < 0.42) return null;
  const r = Math.min(1.06, ratio);
  const t = (Math.max(0.5, r) - 0.5) / 0.5;
  const raw = 6 + Math.min(1, Math.max(0, t)) * 4;
  return Math.min(10, Math.max(6, raw));
}
