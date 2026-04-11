import { NextResponse } from "next/server";
import { z } from "zod";
import type { BaseLift } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  baseLift: z.enum(["NONE", "BENCH", "SQUAT", "DEADLIFT"]),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id: workoutId } = await ctx.params;
  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId: user.id },
    include: { exercises: true },
  });
  if (!workout) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані." }, { status: 400 });
    }
    const maxOrder = workout.exercises.reduce((m, e) => Math.max(m, e.sortOrder), -1);
    const exercise = await prisma.workoutExercise.create({
      data: {
        workoutId,
        sortOrder: maxOrder + 1,
        name: parsed.data.name,
        baseLift: parsed.data.baseLift as BaseLift,
      },
      include: { sets: true },
    });
    return NextResponse.json({ exercise });
  } catch {
    return NextResponse.json({ error: "Не вдалося додати вправу." }, { status: 500 });
  }
}
