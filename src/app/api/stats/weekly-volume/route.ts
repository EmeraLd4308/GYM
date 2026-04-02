import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { buildWeeklyVolumeSeries } from "@/lib/weekly-volume";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
    include: {
      exercises: {
        include: { sets: true },
      },
    },
  });
  const series = buildWeeklyVolumeSeries(workouts);
  return NextResponse.json({ series });
}
