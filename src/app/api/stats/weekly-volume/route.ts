import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { buildWeeklySbdRpeSeries } from "@/lib/weekly-rpe";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const [workouts, profile] = await Promise.all([
    prisma.workout.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
      include: {
        exercises: {
          include: { sets: true },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: { glMaxBenchKg: true, glMaxSquatKg: true, glMaxDeadliftKg: true },
    }),
  ]);
  const profileMaxKg = {
    bench: profile?.glMaxBenchKg != null ? Number(profile.glMaxBenchKg) : null,
    squat: profile?.glMaxSquatKg != null ? Number(profile.glMaxSquatKg) : null,
    deadlift: profile?.glMaxDeadliftKg != null ? Number(profile.glMaxDeadliftKg) : null,
  };
  const series = buildWeeklySbdRpeSeries(workouts, profileMaxKg);
  return NextResponse.json({ series });
}
