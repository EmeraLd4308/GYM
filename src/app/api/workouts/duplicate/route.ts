import { NextResponse } from "next/server";
import { z } from "zod";
import type { BaseLift } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseWorkoutDateInput } from "@/lib/date-local";
import { rateLimitJson } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  sourceWorkoutId: z.string().cuid(),

  targetDate: z.string().optional(),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });

  const limited = rateLimitJson(req, "workouts-duplicate", 20, 60_000);
  if (limited) return limited;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Некоректний JSON." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Некоректні дані." }, { status: 400 });
  }

  const { sourceWorkoutId, targetDate: targetRaw } = parsed.data;

  const source = await prisma.workout.findFirst({
    where: { id: sourceWorkoutId, userId: user.id },
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
        include: { sets: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  if (!source) {
    return NextResponse.json({ error: "Тренування не знайдено." }, { status: 404 });
  }

  let workoutDate = new Date();
  if (targetRaw?.trim()) {
    try {
      workoutDate = parseWorkoutDateInput(targetRaw.trim());
    } catch {
      return NextResponse.json({ error: "Некоректна дата." }, { status: 400 });
    }
  }

  const title = source.title ? `${source.title} (копія)` : "Копія тренування";

  const workout = await prisma.workout.create({
    data: {
      userId: user.id,
      date: workoutDate,
      title,
      notes: null,
      templateId: null,
      exercises: {
        create: source.exercises.map((ex) => ({
          sortOrder: ex.sortOrder,
          name: ex.name,
          baseLift: ex.baseLift as BaseLift,
          planDone: ex.planDone,
          sets: {
            create: ex.sets.map((s) => ({
              sortOrder: s.sortOrder,
              weightKg: s.weightKg,
              reps: s.reps,
              isWarmup: s.isWarmup,
              ...(s.rpe != null ? { rpe: s.rpe } : {}),
            })),
          },
        })),
      },
    },
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
        include: { sets: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });

  return NextResponse.json({ workout });
}
