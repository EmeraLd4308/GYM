import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { formatWorkoutShareText } from "@/lib/workout-share-text";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id } = await ctx.params;

  const workout = await prisma.workout.findFirst({
    where: { id, userId: user.id },
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
        include: { sets: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!workout) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });

  const text = formatWorkoutShareText({
    title: workout.title,
    date: workout.date,
    notes: workout.notes,
    exercises: workout.exercises.map((e) => ({
      name: e.name,
      baseLift: e.baseLift,
      sets: e.sets.map((s) => ({
        weightKg: s.weightKg,
        reps: s.reps,
        isWarmup: s.isWarmup,
      })),
    })),
  });

  return new NextResponse(text, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
