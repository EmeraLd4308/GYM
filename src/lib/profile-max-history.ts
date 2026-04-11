import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ProfileMaxHistoryPoint = {
  recordedAtIso: string;
  pointLabel: string;
  totalKg: number;
};

function num(d: unknown): number {
  if (d == null) return 0;
  const n = Number(d);
  return Number.isFinite(n) ? n : 0;
}

function sameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function labelForPoint(rows: { recordedAt: Date }[], index: number): string {
  const d = new Date(rows[index].recordedAt);
  const base = d.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
  if (index > 0 && sameCalendarDay(new Date(rows[index - 1].recordedAt), d)) {
    return d.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" });
  }
  return base;
}

type MaxTriple = Pick<User, "glMaxSquatKg" | "glMaxBenchKg" | "glMaxDeadliftKg">;

export function maxTripleChanged(before: MaxTriple, after: MaxTriple): boolean {
  return (
    num(before.glMaxSquatKg) !== num(after.glMaxSquatKg) ||
    num(before.glMaxBenchKg) !== num(after.glMaxBenchKg) ||
    num(before.glMaxDeadliftKg) !== num(after.glMaxDeadliftKg)
  );
}

export async function recordProfileSbdMaxSnapshot(userId: string, max: MaxTriple): Promise<void> {
  await prisma.profileSbdMaxSnapshot.create({
    data: {
      userId,
      squatKg: max.glMaxSquatKg,
      benchKg: max.glMaxBenchKg,
      deadliftKg: max.glMaxDeadliftKg,
    },
  });
}

export async function getProfileMaxHistoryPoints(
  userId: string,
): Promise<ProfileMaxHistoryPoint[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      glMaxSquatKg: true,
      glMaxBenchKg: true,
      glMaxDeadliftKg: true,
    },
  });
  if (!user) return [];

  const hasAnyMax =
    num(user.glMaxSquatKg) > 0 || num(user.glMaxBenchKg) > 0 || num(user.glMaxDeadliftKg) > 0;

  let count = await prisma.profileSbdMaxSnapshot.count({ where: { userId } });
  if (count === 0 && hasAnyMax) {
    await prisma.profileSbdMaxSnapshot.create({
      data: {
        userId,
        recordedAt: user.createdAt,
        squatKg: user.glMaxSquatKg,
        benchKg: user.glMaxBenchKg,
        deadliftKg: user.glMaxDeadliftKg,
      },
    });
    count = 1;
  }

  const rows = await prisma.profileSbdMaxSnapshot.findMany({
    where: { userId },
    orderBy: { recordedAt: "asc" },
    select: {
      recordedAt: true,
      squatKg: true,
      benchKg: true,
      deadliftKg: true,
    },
  });

  return rows.map((r, i) => {
    const sq = num(r.squatKg);
    const bp = num(r.benchKg);
    const dl = num(r.deadliftKg);
    const totalKg = Math.round((sq + bp + dl) * 10) / 10;
    return {
      recordedAtIso: r.recordedAt.toISOString(),
      pointLabel: labelForPoint(rows, i),
      totalKg,
    };
  });
}
