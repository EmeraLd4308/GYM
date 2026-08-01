import type { BaseLift, ExerciseSet, Workout, WorkoutExercise } from "@prisma/client";
import { addDays, addWeeks, startOfWeek } from "date-fns";
import { estimateRpeFromProfileMax } from "@/features/workouts/lib/rpe-estimate";

type ExerciseWithSets = WorkoutExercise & { sets: ExerciseSet[] };
type WorkoutWithEx = Workout & { exercises: ExerciseWithSets[] };

export type WeeklySbdRpeRow = {
  weekStartIso: string;
  weekLabel: string;
  bench: number | null;
  squat: number | null;
  deadlift: number | null;
};

export type ProfileSbdMaxKg = {
  bench: number | null;
  squat: number | null;
  deadlift: number | null;
};

type LiftKey = keyof Pick<WeeklySbdRpeRow, "bench" | "squat" | "deadlift">;

const EXTRA_SESSION_FACTOR = 0.22;

export const MISSED_WEEK_RPE = 5;

function liftKey(l: BaseLift): LiftKey | null {
  if (l === "BENCH") return "bench";
  if (l === "SQUAT") return "squat";
  if (l === "DEADLIFT") return "deadlift";
  return null;
}

function maxForLift(key: LiftKey, maxes?: ProfileSbdMaxKg | null): number | null {
  if (!maxes) return null;
  const v = maxes[key];
  return v != null && Number.isFinite(v) && v > 0 ? v : null;
}

function setRpe(s: ExerciseSet, maxKg: number | null): number | null {
  if (s.rpe != null) {
    const x = Number(s.rpe);
    if (Number.isFinite(x) && x >= 1 && x <= 10) return x;
  }
  if (maxKg != null) {
    return estimateRpeFromProfileMax(Number(s.weightKg), s.reps, maxKg);
  }
  return null;
}

function weekLabelFor(weekStart: Date): string {
  return (
    weekStart.toLocaleDateString("uk-UA", { day: "2-digit", month: "short" }) +
    " — " +
    addDays(weekStart, 6).toLocaleDateString("uk-UA", {
      day: "2-digit",
      month: "short",
    })
  );
}

function weekKeyOf(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseWeekKey(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return startOfWeek(new Date(y!, (m ?? 1) - 1, d ?? 1), { weekStartsOn: 1 });
}

export function weeklyLiftRpeFromSessionTops(sessionTops: number[]): number | null {
  if (sessionTops.length === 0) return null;
  const sorted = [...sessionTops].sort((a, b) => b - a);
  let score = sorted[0];
  for (let i = 1; i < sorted.length; i++) {
    const extra = sorted[i];
    const room = 10 - score;
    if (room <= 0) break;
    score += room * (extra / 10) * EXTRA_SESSION_FACTOR;
  }
  return Math.round(Math.min(10, Math.max(1, score)) * 1000) / 1000;
}

export function fillMissedLiftWeeks(rows: WeeklySbdRpeRow[]): WeeklySbdRpeRow[] {
  if (rows.length === 0) return rows;

  const lifts: LiftKey[] = ["bench", "squat", "deadlift"];
  const ranges = Object.fromEntries(
    lifts.map((lift) => {
      const trained = rows.filter((r) => r[lift] != null);
      if (trained.length === 0) return [lift, null] as const;
      return [
        lift,
        { from: trained[0]!.weekStartIso, to: trained[trained.length - 1]!.weekStartIso },
      ] as const;
    }),
  ) as Record<LiftKey, { from: string; to: string } | null>;

  const byKey = new Map(rows.map((r) => [r.weekStartIso, r]));
  const first = parseWeekKey(rows[0]!.weekStartIso);
  const last = parseWeekKey(rows[rows.length - 1]!.weekStartIso);

  const out: WeeklySbdRpeRow[] = [];
  for (let d = first; d.getTime() <= last.getTime(); d = addWeeks(d, 1)) {
    const weekStartIso = weekKeyOf(d);
    const base = byKey.get(weekStartIso);
    const row: WeeklySbdRpeRow = {
      weekStartIso,
      weekLabel: base?.weekLabel ?? weekLabelFor(d),
      bench: base?.bench ?? null,
      squat: base?.squat ?? null,
      deadlift: base?.deadlift ?? null,
    };
    for (const lift of lifts) {
      const range = ranges[lift];
      if (!range) continue;
      if (row[lift] == null && weekStartIso >= range.from && weekStartIso <= range.to) {
        row[lift] = MISSED_WEEK_RPE;
      }
    }
    out.push(row);
  }
  return out;
}

export function buildWeeklySbdRpeSeries(
  workouts: WorkoutWithEx[],
  profileMaxKg?: ProfileSbdMaxKg | null,
): WeeklySbdRpeRow[] {
  const map = new Map<
    string,
    {
      weekStart: Date;
      bench: Map<string, number>;
      squat: Map<string, number>;
      deadlift: Map<string, number>;
    }
  >();

  for (const w of workouts) {
    const weekStart = startOfWeek(w.date, { weekStartsOn: 1 });
    const weekKey = weekKeyOf(weekStart);

    for (const ex of w.exercises) {
      if (ex.parentId) continue;
      const key = liftKey(ex.baseLift);
      if (!key) continue;
      const maxKg = maxForLift(key, profileMaxKg);

      let sessionTop: number | null = null;
      for (const s of ex.sets) {
        if (s.isWarmup) continue;
        const r = setRpe(s, maxKg);
        if (r == null) continue;
        sessionTop = sessionTop == null ? r : Math.max(sessionTop, r);
      }
      if (sessionTop == null) continue;

      let row = map.get(weekKey);
      if (!row) {
        row = {
          weekStart,
          bench: new Map(),
          squat: new Map(),
          deadlift: new Map(),
        };
        map.set(weekKey, row);
      }
      const sessions = row[key];
      const prev = sessions.get(w.id);
      sessions.set(w.id, prev == null ? sessionTop : Math.max(prev, sessionTop));
    }
  }

  const fromSessions = (sessions: Map<string, number>): number | null =>
    weeklyLiftRpeFromSessionTops([...sessions.values()]);

  const sparse = [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStartIso, row]) => ({
      weekStartIso,
      weekLabel: weekLabelFor(row.weekStart),
      bench: fromSessions(row.bench),
      squat: fromSessions(row.squat),
      deadlift: fromSessions(row.deadlift),
    }));

  return fillMissedLiftWeeks(sparse);
}
