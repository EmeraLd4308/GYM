import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { getSessionUser } from "@/shared/lib/auth";
import { deriveSetRpe, sbdMaxKgFromUserRow } from "@/features/workouts/lib/derive-set-rpe";
import { scheduleWorkoutMetricsRefresh } from "@/shared/lib/schedule-metrics-refresh";

export const dynamic = "force-dynamic";
const noStoreHeaders = { "Cache-Control": "private, no-store" };

const bodySchema = z.object({
  weightKg: z.number(),
  reps: z.number().int().min(1).max(999),
  isWarmup: z.boolean().optional(),
  count: z.number().int().min(1).max(10).optional(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user)
    return NextResponse.json({ error: "Потрібен вхід." }, { status: 401, headers: noStoreHeaders });
  const { id: exerciseId } = await ctx.params;
  const exercise = await prisma.workoutExercise.findFirst({
    where: { id: exerciseId },
    include: { workout: true, sets: true },
  });
  if (!exercise || exercise.workout.userId !== user.id) {
    return NextResponse.json({ error: "Не знайдено." }, { status: 404, headers: noStoreHeaders });
  }
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Некоректні дані підходу." },
        { status: 400, headers: noStoreHeaders },
      );
    }
    const count = parsed.data.count ?? 1;
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
    const sets = await prisma.$transaction(
      Array.from({ length: count }, (_, i) =>
        prisma.exerciseSet.create({
          data: {
            workoutExerciseId: exerciseId,
            sortOrder: maxOrder + 1 + i,
            weightKg: new Prisma.Decimal(parsed.data.weightKg),
            reps: parsed.data.reps,
            isWarmup,
            ...(rpeVal != null ? { rpe: new Prisma.Decimal(rpeVal) } : {}),
          },
        }),
      ),
    );
    scheduleWorkoutMetricsRefresh(user.id, exercise.workout.id, exercise.baseLift);
    return NextResponse.json({ sets, set: sets[0] ?? null }, { headers: noStoreHeaders });
  } catch {
    return NextResponse.json(
      { error: "Не вдалося зберегти підхід." },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
