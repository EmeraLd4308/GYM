import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import type { BaseLift } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { deriveSetRpe, sbdMaxKgFromUserRow } from "@/lib/derive-set-rpe";

const patchSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  baseLift: z.enum(["NONE", "BENCH", "SQUAT", "DEADLIFT"]).optional(),
  sortOrder: z.number().int().min(0).optional(),
  planDone: z.boolean().optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id } = await ctx.params;
  const exercise = await prisma.workoutExercise.findFirst({
    where: { id },
    include: { workout: true },
  });
  if (!exercise || exercise.workout.userId !== user.id) {
    return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  }
  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані." }, { status: 400 });
    }
    const data = parsed.data;
    const updated = await prisma.workoutExercise.update({
      where: { id },
      data: {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.baseLift !== undefined ? { baseLift: data.baseLift as BaseLift } : {}),
        ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
        ...(data.planDone !== undefined ? { planDone: data.planDone } : {}),
      },
      include: { sets: { orderBy: { sortOrder: "asc" } }, workout: true },
    });
    if (data.baseLift !== undefined) {
      const userMax = await prisma.user.findUnique({
        where: { id: updated.workout.userId },
        select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
      });
      const maxes = sbdMaxKgFromUserRow(userMax);
      await prisma.$transaction(
        updated.sets.map((s) => {
          const rpeVal = deriveSetRpe(
            updated.baseLift,
            s.isWarmup,
            Number(s.weightKg),
            s.reps,
            maxes,
          );
          return prisma.exerciseSet.update({
            where: { id: s.id },
            data: { rpe: rpeVal != null ? new Prisma.Decimal(rpeVal) : null },
          });
        }),
      );
    }
    const nextExercise = await prisma.workoutExercise.findFirst({
      where: { id },
      include: { sets: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json({ exercise: nextExercise });
  } catch {
    return NextResponse.json({ error: "Не вдалося оновити." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id } = await ctx.params;
  const exercise = await prisma.workoutExercise.findFirst({
    where: { id },
    include: { workout: true },
  });
  if (!exercise || exercise.workout.userId !== user.id) {
    return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  }
  await prisma.workoutExercise.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
