import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const bodySchema = z.object({
  weightKg: z.number(),
  reps: z.number().int().min(1).max(999),
  isWarmup: z.boolean().optional(),
  rpe: z.number().min(1).max(10).optional(),
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
    const set = await prisma.exerciseSet.create({
      data: {
        workoutExerciseId: exerciseId,
        sortOrder: maxOrder + 1,
        weightKg: new Prisma.Decimal(parsed.data.weightKg),
        reps: parsed.data.reps,
        isWarmup: parsed.data.isWarmup ?? false,
        ...(parsed.data.rpe !== undefined ? { rpe: new Prisma.Decimal(parsed.data.rpe) } : {}),
      },
    });
    return NextResponse.json({ set });
  } catch {
    return NextResponse.json({ error: "Не вдалося зберегти підхід." }, { status: 500 });
  }
}
