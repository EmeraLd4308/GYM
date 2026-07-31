import { NextResponse } from "next/server";
import { z } from "zod";
import type { BaseLift } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { getSessionUser } from "@/shared/lib/auth";
import { findLastExerciseSets, setsCreateFromSnapshot } from "@/features/workouts/lib/exercise-last-sets";

const TEMP_OFFSET = 1_000_000;

const bodySchema = z.object({
  name: z.string().trim().min(1).max(200),
  baseLift: z.enum(["NONE", "BENCH", "SQUAT", "DEADLIFT"]).default("NONE"),
  parentId: z.string().cuid().optional().nullable(),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id: workoutId } = await ctx.params;
  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId: user.id },
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });
  if (!workout) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані." }, { status: 400 });
    }

    const parentId: string | null = parsed.data.parentId ?? null;
    let baseLift = parsed.data.baseLift as BaseLift;

    if (parentId) {
      const parent = workout.exercises.find((e) => e.id === parentId);
      if (!parent) {
        return NextResponse.json({ error: "Батьківську вправу не знайдено." }, { status: 400 });
      }
      if (parent.baseLift === "NONE") {
        return NextResponse.json(
          { error: "Дочірню вправу можна додати лише до базової (жим/присяд/тяга)." },
          { status: 400 },
        );
      }
      if (parent.parentId) {
        return NextResponse.json(
          { error: "Не можна додати дочірню до іншої дочірньої вправи." },
          { status: 400 },
        );
      }
      baseLift = "NONE";
    }

    const lastSets =
      baseLift === "NONE"
        ? await findLastExerciseSets(user.id, parsed.data.name, { excludeWorkoutId: workoutId })
        : null;

    const exercise = await prisma.$transaction(async (tx) => {
      let sortOrder: number;

      if (parentId) {
        const parent = workout.exercises.find((e) => e.id === parentId)!;
        const siblings = workout.exercises.filter((e) => e.parentId === parentId);
        const insertAfter = Math.max(parent.sortOrder, ...siblings.map((s) => s.sortOrder));
        const ordered = [...workout.exercises];

        for (let i = 0; i < ordered.length; i++) {
          await tx.workoutExercise.update({
            where: { id: ordered[i]!.id },
            data: { sortOrder: TEMP_OFFSET + i },
          });
        }

        let pos = 0;
        sortOrder = -1;
        for (const e of ordered) {
          await tx.workoutExercise.update({
            where: { id: e.id },
            data: { sortOrder: pos },
          });
          pos += 1;
          if (e.sortOrder === insertAfter) {
            sortOrder = pos;
            pos += 1;
          }
        }
        if (sortOrder < 0) sortOrder = pos;
      } else {
        sortOrder = workout.exercises.reduce((m, e) => Math.max(m, e.sortOrder), -1) + 1;
      }

      return tx.workoutExercise.create({
        data: {
          workoutId,
          sortOrder,
          name: parsed.data.name,
          baseLift,
          parentId,
          ...(lastSets?.length ? { sets: { create: setsCreateFromSnapshot(lastSets) } } : {}),
        },
        include: { sets: { orderBy: { sortOrder: "asc" } } },
      });
    });

    return NextResponse.json({ exercise });
  } catch {
    return NextResponse.json({ error: "Не вдалося додати вправу." }, { status: 500 });
  }
}
