import { describe, expect, it } from "vitest";
import {
  buildWeeklySbdRpeSeries,
  weeklyLiftRpeFromSessionTops,
} from "@/features/stats/lib/weekly-rpe";
import { Prisma, type BaseLift } from "@prisma/client";

function set(partial: {
  id: string;
  weightKg: number;
  reps: number;
  isWarmup?: boolean;
  rpe: number;
}) {
  return {
    id: partial.id,
    workoutExerciseId: "ex",
    sortOrder: 0,
    weightKg: new Prisma.Decimal(partial.weightKg),
    reps: partial.reps,
    isWarmup: partial.isWarmup ?? false,
    supersetGroup: null,
    rpe: new Prisma.Decimal(partial.rpe),
  };
}

function workout(args: {
  id: string;
  date: string;
  lift: BaseLift;
  sets: ReturnType<typeof set>[];
}) {
  return {
    id: args.id,
    userId: "u",
    date: new Date(args.date),
    title: null,
    notes: null,
    autoTag: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    exercises: [
      {
        id: `ex-${args.id}`,
        workoutId: args.id,
        sortOrder: 0,
        name: "Lift",
        baseLift: args.lift,
        parentId: null,
        sets: args.sets,
      },
    ],
  };
}

describe("weeklyLiftRpeFromSessionTops", () => {
  it("makes a week with an extra light session heavier than peak alone", () => {
    const one = weeklyLiftRpeFromSessionTops([8.9])!;
    const two = weeklyLiftRpeFromSessionTops([8.9, 7.2])!;
    expect(two).toBeGreaterThan(one);
  });
});

describe("buildWeeklySbdRpeSeries", () => {
  it("ranks heavy+light week above heavy-only week with the same heavy top", () => {
    const oneDay = [
      workout({
        id: "w1",
        date: "2026-07-06",
        lift: "SQUAT",
        sets: [set({ id: "s1", weightKg: 140, reps: 3, rpe: 8.9 })],
      }),
    ];
    const twoDays = [
      ...oneDay,
      workout({
        id: "w2",
        date: "2026-07-09",
        lift: "SQUAT",
        sets: [set({ id: "s2", weightKg: 100, reps: 5, rpe: 7.2 })],
      }),
    ];

    const one = buildWeeklySbdRpeSeries(oneDay as never);
    const two = buildWeeklySbdRpeSeries(twoDays as never);

    expect(one[0]?.squat).toBe(8.9);
    expect(two[0]?.squat).toBeGreaterThan(8.9);
  });

  it("leaves untrained lifts as null instead of zero", () => {
    const rows = buildWeeklySbdRpeSeries([
      workout({
        id: "w1",
        date: "2026-07-06",
        lift: "SQUAT",
        sets: [set({ id: "s1", weightKg: 140, reps: 3, rpe: 8 })],
      }),
    ] as never);

    expect(rows).toHaveLength(1);
    expect(rows[0]?.squat).toBe(8);
    expect(rows[0]?.bench).toBeNull();
    expect(rows[0]?.deadlift).toBeNull();
  });

  it("fills missed weeks between trained weeks with a low floor RPE", () => {
    const rows = buildWeeklySbdRpeSeries([
      workout({
        id: "w1",
        date: "2026-07-06",
        lift: "SQUAT",
        sets: [set({ id: "s1", weightKg: 140, reps: 3, rpe: 8.5 })],
      }),
      workout({
        id: "w2",
        date: "2026-07-20",
        lift: "SQUAT",
        sets: [set({ id: "s2", weightKg: 140, reps: 3, rpe: 8.2 })],
      }),
    ] as never);

    expect(rows.length).toBeGreaterThanOrEqual(3);
    const gap = rows.find((r) => r.squat === 5);
    expect(gap).toBeTruthy();
    expect(rows[0]?.squat).toBe(8.5);
    expect(rows[rows.length - 1]?.squat).toBe(8.2);
  });
});
