import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { deriveSetRpe, sbdMaxKgFromUserRow } from "@/lib/derive-set-rpe";
import { recalculateUserLiftRecordForLift, recalculateWorkoutAutoTag } from "@/lib/lift-records";

export const dynamic = "force-dynamic";
const noStoreHeaders = { "Cache-Control": "private, no-store" };

const patchSchema = z.object({
  weightKg: z.number().optional(),
  reps: z.number().int().min(1).max(999).optional(),
  isWarmup: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user)
    return NextResponse.json({ error: "Потрібен вхід." }, { status: 401, headers: noStoreHeaders });
  const { id } = await ctx.params;
  const row = await prisma.exerciseSet.findFirst({
    where: { id },
    include: { workoutExercise: { include: { workout: true } } },
  });
  if (!row || row.workoutExercise.workout.userId !== user.id) {
    return NextResponse.json({ error: "Не знайдено." }, { status: 404, headers: noStoreHeaders });
  }
  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані." }, { status: 400, headers: noStoreHeaders });
    }
    const d = parsed.data;
    const nextWeight = d.weightKg !== undefined ? d.weightKg : Number(row.weightKg);
    const nextReps = d.reps !== undefined ? d.reps : row.reps;
    const nextWarmup = d.isWarmup !== undefined ? d.isWarmup : row.isWarmup;
    const userMax = await prisma.user.findUnique({
      where: { id: row.workoutExercise.workout.userId },
      select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
    });
    const maxes = sbdMaxKgFromUserRow(userMax);
    const rpeVal = deriveSetRpe(
      row.workoutExercise.baseLift,
      nextWarmup,
      nextWeight,
      nextReps,
      maxes,
    );
    const set = await prisma.exerciseSet.update({
      where: { id },
      data: {
        ...(d.weightKg !== undefined ? { weightKg: new Prisma.Decimal(d.weightKg) } : {}),
        ...(d.reps !== undefined ? { reps: d.reps } : {}),
        ...(d.isWarmup !== undefined ? { isWarmup: d.isWarmup } : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
        rpe: rpeVal != null ? new Prisma.Decimal(rpeVal) : null,
      },
    });
    await Promise.all([
      recalculateWorkoutAutoTag(row.workoutExercise.workout.id),
      recalculateUserLiftRecordForLift(user.id, row.workoutExercise.baseLift),
    ]);
    return NextResponse.json({ set }, { headers: noStoreHeaders });
  } catch {
    return NextResponse.json(
      { error: "Не вдалося оновити." },
      { status: 500, headers: noStoreHeaders },
    );
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user)
    return NextResponse.json({ error: "Потрібен вхід." }, { status: 401, headers: noStoreHeaders });
  const { id } = await ctx.params;
  const row = await prisma.exerciseSet.findFirst({
    where: { id },
    include: { workoutExercise: { include: { workout: true } } },
  });
  if (!row || row.workoutExercise.workout.userId !== user.id) {
    return NextResponse.json({ error: "Не знайдено." }, { status: 404, headers: noStoreHeaders });
  }
  await prisma.exerciseSet.delete({ where: { id } });
  await Promise.all([
    recalculateWorkoutAutoTag(row.workoutExercise.workout.id),
    recalculateUserLiftRecordForLift(user.id, row.workoutExercise.baseLift),
  ]);
  return NextResponse.json({ ok: true }, { headers: noStoreHeaders });
}
