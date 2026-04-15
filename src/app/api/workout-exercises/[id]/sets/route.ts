import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { deriveSetRpe, sbdMaxKgFromUserRow } from "@/lib/derive-set-rpe";
import { recalculateUserLiftRecords, recalculateWorkoutAutoTag } from "@/lib/lift-records";

const bodySchema = z.object({
  weightKg: z.number(),
  reps: z.number().int().min(1).max(999),
  isWarmup: z.boolean().optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id: exerciseId } = await ctx.params;
  const exercise = await prisma.workoutExercise.findFirst({
    where: { id: exerciseId },
    include: { workout: true, sets: true },
  });
  if (!exercise || exercise.workout.userId !== user.id) {
    return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  }
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані підходу." }, { status: 400 });
    }
    const maxOrder = exercise.sets.reduce((m, s) => Math.max(m, s.sortOrder), -1);
    const isWarmup = parsed.data.isWarmup ?? false;
    const userMax = await prisma.user.findUnique({
      where: { id: user.id },
      select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
    });
    const maxes = sbdMaxKgFromUserRow(userMax);
    const rpeVal = deriveSetRpe(
      exercise.baseLift,
      isWarmup,
      parsed.data.weightKg,
      parsed.data.reps,
      maxes,
    );
    const set = await prisma.exerciseSet.create({
      data: {
        workoutExerciseId: exerciseId,
        sortOrder: maxOrder + 1,
        weightKg: new Prisma.Decimal(parsed.data.weightKg),
        reps: parsed.data.reps,
        isWarmup,
        ...(rpeVal != null ? { rpe: new Prisma.Decimal(rpeVal) } : {}),
      },
    });
    await recalculateWorkoutAutoTag(exercise.workout.id);
    await recalculateUserLiftRecords(user.id);
    return NextResponse.json({ set });
  } catch {
    return NextResponse.json({ error: "Не вдалося зберегти підхід." }, { status: 500 });
  }
}
