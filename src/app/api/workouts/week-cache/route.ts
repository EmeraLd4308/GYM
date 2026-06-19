import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { getSessionUser } from "@/shared/lib/auth";
import { calendarWeekBounds } from "@/shared/lib/calendar-week";
import { localDayBoundsFromInput } from "@/shared/lib/date-local";
import { getWorkoutSessionPayload } from "@/server/queries/workout-detail";

export const dynamic = "force-dynamic";
const noStoreHeaders = { "Cache-Control": "private, no-store" };

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Потрібен вхід." }, { status: 401, headers: noStoreHeaders });
  }

  const { weekStart, weekEnd } = calendarWeekBounds();
  const { start } = localDayBoundsFromInput(weekStart);
  const { end } = localDayBoundsFromInput(weekEnd);

  const rows = await prisma.workout.findMany({
    where: {
      userId: user.id,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "asc" },
    select: { id: true },
  });

  const workouts = (
    await Promise.all(rows.map((r) => getWorkoutSessionPayload(user.id, r.id)))
  ).filter((w): w is NonNullable<typeof w> => w != null);

  return NextResponse.json({ weekStart, weekEnd, workouts }, { headers: noStoreHeaders });
}
