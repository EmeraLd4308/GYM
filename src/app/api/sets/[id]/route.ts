import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const patchSchema = z.object({
  weightKg: z.number().optional(),
  reps: z.number().int().min(1).max(999).optional(),
  isWarmup: z.boolean().optional(),
  sortOrder: z.number().int().min(0).optional(),
  rpe: z.union([z.number().min(1).max(10), z.null()]).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id } = await ctx.params;
  const row = await prisma.exerciseSet.findFirst({
    where: { id },
    include: { workoutExercise: { include: { workout: true } } },
  });
  if (!row || row.workoutExercise.workout.userId !== user.id) {
    return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  }
  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані." }, { status: 400 });
    }
    const d = parsed.data;
    const set = await prisma.exerciseSet.update({
      where: { id },
      data: {
        ...(d.weightKg !== undefined ? { weightKg: new Prisma.Decimal(d.weightKg) } : {}),
        ...(d.reps !== undefined ? { reps: d.reps } : {}),
        ...(d.isWarmup !== undefined ? { isWarmup: d.isWarmup } : {}),
        ...(d.sortOrder !== undefined ? { sortOrder: d.sortOrder } : {}),
        ...(d.rpe !== undefined ? { rpe: d.rpe === null ? null : new Prisma.Decimal(d.rpe) } : {}),
      },
    });
    return NextResponse.json({ set });
  } catch {
    return NextResponse.json({ error: "Не вдалося оновити." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id } = await ctx.params;
  const row = await prisma.exerciseSet.findFirst({
    where: { id },
    include: { workoutExercise: { include: { workout: true } } },
  });
  if (!row || row.workoutExercise.workout.userId !== user.id) {
    return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  }
  await prisma.exerciseSet.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
