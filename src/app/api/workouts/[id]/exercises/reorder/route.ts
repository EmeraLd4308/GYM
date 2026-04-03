import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
});

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });

  const { id: workoutId } = await ctx.params;

  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId: user.id },
    include: { exercises: true },
  });

  if (!workout) {
    return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  }

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

  const { orderedIds } = parsed.data;
  const existing = new Set(workout.exercises.map((e) => e.id));

  if (orderedIds.length !== existing.size || !orderedIds.every((id) => existing.has(id))) {
    return NextResponse.json({ error: "Список вправ має збігатися з поточним." }, { status: 400 });
  }

  await prisma.$transaction(
    orderedIds.map((exerciseId, index) =>
      prisma.workoutExercise.update({
        where: { id: exerciseId },
        data: { sortOrder: index },
      }),
    ),
  );

  return NextResponse.json({ ok: true });
}
