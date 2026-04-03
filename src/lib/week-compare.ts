import type { WeeklyVolumeRow } from "@/lib/weekly-volume";

export type WeekVolumeCompare = {
  prev: { bench: number; squat: number; deadlift: number; weekLabel: string };
  curr: { bench: number; squat: number; deadlift: number; weekLabel: string };
};

/** Порівняння останнього повного тижня в серії з попереднім (потребує ≥2 тижнів даних). */
export function compareLastTwoWeeks(series: WeeklyVolumeRow[]): WeekVolumeCompare | null {
  if (series.length < 2) return null;
  const curr = series[series.length - 1];
  const prev = series[series.length - 2];
  return {
    prev: {
      bench: prev.bench,
      squat: prev.squat,
      deadlift: prev.deadlift,
      weekLabel: prev.weekLabel,
    },
    curr: {
      bench: curr.bench,
      squat: curr.squat,
      deadlift: curr.deadlift,
      weekLabel: curr.weekLabel,
    },
  };
}
