import { NextResponse } from "next/server";
import { z } from "zod";
import type { BaseLift } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { getSessionUser } from "@/shared/lib/auth";
import { parseWorkoutDateInput } from "@/shared/lib/date-local";
import { rateLimitJson } from "@/shared/lib/rate-limit";
import { recalculateUserLiftRecords, recalculateWorkoutAutoTag } from "@/features/workouts/lib/lift-records";

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

  const workout = await prisma.$transaction(async (tx) => {
    const created = await tx.workout.create({
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
            parentId: null,
            sets: {
              create: ex.sets.map((s) => ({
                sortOrder: s.sortOrder,
                weightKg: s.weightKg,
                reps: s.reps,
                isWarmup: s.isWarmup,
                supersetGroup: s.supersetGroup,
                ...(s.rpe != null ? { rpe: s.rpe } : {}),
              })),
            },
          })),
        },
      },
      include: {
        exercises: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    const oldToNew = new Map<string, string>();
    for (let i = 0; i < source.exercises.length; i++) {
      oldToNew.set(source.exercises[i]!.id, created.exercises[i]!.id);
    }

    for (let i = 0; i < source.exercises.length; i++) {
      const src = source.exercises[i]!;
      if (!src.parentId) continue;
      const newParentId = oldToNew.get(src.parentId);
      const newId = oldToNew.get(src.id);
      if (!newParentId || !newId) continue;
      await tx.workoutExercise.update({
        where: { id: newId },
        data: { parentId: newParentId },
      });
    }

    return tx.workout.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        exercises: {
          orderBy: { sortOrder: "asc" },
          include: { sets: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
  });

  await Promise.all([recalculateWorkoutAutoTag(workout.id), recalculateUserLiftRecords(user.id)]);

  return NextResponse.json({ workout });
}
