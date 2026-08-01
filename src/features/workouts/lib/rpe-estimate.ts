export function estimateRpeFromProfileMax(
  weightKg: number,
  reps: number,
  approximateOneRmKg: number,
): number | null {
  if (!(approximateOneRmKg > 0) || !(weightKg > 0) || reps < 1 || !Number.isFinite(weightKg))
    return null;

  const loadRatio = weightKg / approximateOneRmKg;
  if (!Number.isFinite(loadRatio) || loadRatio < 0.4) return null;

  if (loadRatio >= 1 && reps <= 2) return 10;
  if (loadRatio >= 0.98 && reps === 1) return 10;

  const e1rm = weightKg * (1 + reps / 34);
  const intensity = e1rm / approximateOneRmKg;
  if (!Number.isFinite(intensity) || intensity < 0.55) return null;

  const raw = intensityToRpe(intensity);
  return Math.round(Math.min(10, Math.max(5, raw)) * 1000) / 1000;
}

function intensityToRpe(intensity: number): number {
  if (intensity >= 1.1) return 10;
  if (intensity >= 1) {
    return 9.35 + ((intensity - 1) / 0.1) * 0.65;
  }
  if (intensity >= 0.9) {
    return 8.4 + ((intensity - 0.9) / 0.1) * 0.95;
  }
  return 5.5 + ((intensity - 0.55) / 0.35) * 2.9;
}
