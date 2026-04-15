import type { WeeklySbdRpeRow } from "@/lib/weekly-rpe";

export type LiftTriplet = {
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
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function byRange(rows: WeeklySbdRpeRow[], fromIso: string, toIso: string) {
  return rows.filter((r) => r.weekStartIso >= fromIso && r.weekStartIso <= toIso);
}

function summarize(rows: WeeklySbdRpeRow[]): LiftTriplet {
  return {
    bench: avg(rows.map((r) => r.bench).filter((v): v is number => v != null)),
    squat: avg(rows.map((r) => r.squat).filter((v): v is number => v != null)),
    deadlift: avg(rows.map((r) => r.deadlift).filter((v): v is number => v != null)),
  };
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

export function compareCustomBlocks(
  series: WeeklySbdRpeRow[],
  aFrom: string,
  aTo: string,
  bFrom: string,
  bTo: string,
): PeriodCompare | null {
  const aRows = byRange(series, aFrom, aTo);
  const bRows = byRange(series, bFrom, bTo);
  if (aRows.length === 0 || bRows.length === 0) return null;
  return {
    prev: { ...summarize(aRows), label: `Блок A (${aFrom}..${aTo})` },
    curr: { ...summarize(bRows), label: `Блок B (${bFrom}..${bTo})` },
  };
}

