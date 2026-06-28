import { NextResponse } from "next/server";
import { prisma } from "@/shared/lib/prisma";
import { getSessionUser } from "@/shared/lib/auth";
import { calendarWeekBounds } from "@/shared/lib/calendar-week";
import { localDayBoundsFromInput, parseWorkoutDateInput } from "@/shared/lib/date-local";
import { formatWeekProgramText } from "@/features/workouts/lib/week-program-text";

export const dynamic = "force-dynamic";
const noStoreHeaders = { "Cache-Control": "private, no-store" };

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Потрібен вхід." }, { status: 401, headers: noStoreHeaders });
  }

  const weekRaw = new URL(req.url).searchParams.get("week")?.trim();
  let anchor = new Date();
  if (weekRaw) {
    try {
      anchor = parseWorkoutDateInput(weekRaw);
    } catch {
      return NextResponse.json(
        { error: "Некоректна дата тижня." },
        { status: 400, headers: noStoreHeaders },
      );
    }
  }

  const { weekStart, weekEnd } = calendarWeekBounds(anchor);
  const { start } = localDayBoundsFromInput(weekStart);
  const { end } = localDayBoundsFromInput(weekEnd);

  const workouts = await prisma.workout.findMany({
    where: {
      userId: user.id,
      date: { gte: start, lte: end },
    },
    orderBy: [{ date: "asc" }, { createdAt: "asc" }],
    select: {
      date: true,
      title: true,
      exercises: {
        orderBy: { sortOrder: "asc" },
        select: { name: true },
      },
    },
  });

  const text = formatWeekProgramText(weekStart, weekEnd, workouts);

  return new NextResponse(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      ...noStoreHeaders,
    },
  });
}
