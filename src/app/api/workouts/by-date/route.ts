import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseWorkoutDateInput } from "@/lib/date-local";

export const dynamic = "force-dynamic";
const noStoreHeaders = { "Cache-Control": "private, no-store" };

const querySchema = z.object({
  day: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user)
    return NextResponse.json({ error: "Потрібен вхід." }, { status: 401, headers: noStoreHeaders });

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ day: searchParams.get("day") ?? "" });
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Потрібен параметр day=YYYY-MM-DD." },
      { status: 400, headers: noStoreHeaders },
    );
  }

  try {
    const anchor = parseWorkoutDateInput(parsed.data.day);
    const dayStart = new Date(
      anchor.getFullYear(),
      anchor.getMonth(),
      anchor.getDate(),
      0,
      0,
      0,
      0,
    );
    const dayEnd = new Date(
      anchor.getFullYear(),
      anchor.getMonth(),
      anchor.getDate(),
      23,
      59,
      59,
      999,
    );

    const workout = await prisma.workout.findFirst({
      where: {
        userId: user.id,
        date: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });

    return NextResponse.json({ workout: workout ? { id: workout.id } : null }, { headers: noStoreHeaders });
  } catch {
    return NextResponse.json({ error: "Некоректна дата." }, { status: 400, headers: noStoreHeaders });
  }
}
