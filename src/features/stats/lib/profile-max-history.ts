import type { User } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";

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

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function endOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
}

function labelForDate(d: Date): string {
  return d
    .toLocaleDateString("uk-UA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .replace(/\s*р\.?\s*$/u, "");
}

type SnapshotRow = {
  recordedAt: Date;
  squatKg: unknown;
  benchKg: unknown;
  deadliftKg: unknown;
};

function collapseSameDaySnapshots(rows: SnapshotRow[]): SnapshotRow[] {
  const out: SnapshotRow[] = [];
  for (const row of rows) {
    const prev = out[out.length - 1];
    if (prev && sameCalendarDay(prev.recordedAt, row.recordedAt)) {
      out[out.length - 1] = row;
    } else {
      out.push(row);
    }
  }
  return out;
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
  const now = new Date();
  const existing = await prisma.profileSbdMaxSnapshot.findFirst({
    where: {
      userId,
      recordedAt: { gte: startOfLocalDay(now), lte: endOfLocalDay(now) },
    },
    orderBy: { recordedAt: "desc" },
    select: { id: true },
  });

  if (existing) {
    await prisma.profileSbdMaxSnapshot.update({
      where: { id: existing.id },
      data: {
        squatKg: max.glMaxSquatKg,
        benchKg: max.glMaxBenchKg,
        deadliftKg: max.glMaxDeadliftKg,
        recordedAt: now,
      },
    });
    await prisma.profileSbdMaxSnapshot.deleteMany({
      where: {
        userId,
        id: { not: existing.id },
        recordedAt: { gte: startOfLocalDay(now), lte: endOfLocalDay(now) },
      },
    });
    return;
  }

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

  return collapseSameDaySnapshots(rows).map((r) => {
    const sq = num(r.squatKg);
    const bp = num(r.benchKg);
    const dl = num(r.deadliftKg);
    const totalKg = Math.round((sq + bp + dl) * 10) / 10;
    return {
      recordedAtIso: r.recordedAt.toISOString(),
      pointLabel: labelForDate(r.recordedAt),
      totalKg,
    };
  });
}
