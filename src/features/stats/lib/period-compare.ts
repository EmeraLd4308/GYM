import type { WeeklySbdRpeRow } from "@/features/stats/lib/weekly-rpe";

type LiftTriplet = {
  bench: number | null;
  squat: number | null;
  deadlift: number | null;
};

export type PeriodCompare = {
  prev: LiftTriplet & { label: string };
  curr: LiftTriplet & { label: string };
};

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 1000) / 1000;
}

function trained(values: Array<number | null>): number[] {
  return values.filter((v): v is number => v != null && v > 0);
}

function summarize(rows: WeeklySbdRpeRow[]): LiftTriplet {
  return {
    bench: avg(trained(rows.map((r) => r.bench))),
    squat: avg(trained(rows.map((r) => r.squat))),
    deadlift: avg(trained(rows.map((r) => r.deadlift))),
  };
}

function byRange(rows: WeeklySbdRpeRow[], fromIso: string, toIso: string) {
  return rows.filter((r) => r.weekStartIso >= fromIso && r.weekStartIso <= toIso);
}

export function compareMonthVsPrevious(series: WeeklySbdRpeRow[]): PeriodCompare | null {
  if (series.length === 0) return null;
  const latest = new Date(series[series.length - 1].weekStartIso);
  const monthStart = new Date(latest.getFullYear(), latest.getMonth(), 1);
  const monthEnd = new Date(latest.getFullYear(), latest.getMonth() + 1, 0);
  const prevStart = new Date(latest.getFullYear(), latest.getMonth() - 1, 1);
  const prevEnd = new Date(latest.getFullYear(), latest.getMonth(), 0);
  const currRows = byRange(
    series,
    monthStart.toISOString().slice(0, 10),
    monthEnd.toISOString().slice(0, 10),
  );
  const prevRows = byRange(
    series,
    prevStart.toISOString().slice(0, 10),
    prevEnd.toISOString().slice(0, 10),
  );
  if (currRows.length === 0 || prevRows.length === 0) return null;
  return {
    prev: {
      ...summarize(prevRows),
      label: prevStart.toLocaleDateString("uk-UA", { month: "long", year: "numeric" }),
    },
    curr: {
      ...summarize(currRows),
      label: monthStart.toLocaleDateString("uk-UA", { month: "long", year: "numeric" }),
    },
  };
}

