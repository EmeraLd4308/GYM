import type { WeeklySbdPeakRow } from "@/features/stats/lib/weekly-volume";
import type { WeeklySbdRpeRow } from "@/features/stats/lib/weekly-rpe";

export type WeekLiftMetric = {
  bench: number | null;
  squat: number | null;
  deadlift: number | null;
  weekLabel: string;
};

export type WeekVolumeCompare = {
  prev: WeekLiftMetric;
  curr: WeekLiftMetric;
};

export function compareLastTwoWeeks(series: WeeklySbdPeakRow[]): WeekVolumeCompare | null {
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

export function compareLastTwoWeeksRpe(series: WeeklySbdRpeRow[]): WeekVolumeCompare | null {
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
