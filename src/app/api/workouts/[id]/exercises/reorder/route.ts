import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/lib/prisma";
import { getSessionUser } from "@/shared/lib/auth";
import { applyOrderedSortOrderUpdates } from "@/shared/lib/sort-order-update";

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
  const byId = new Map(workout.exercises.map((e) => [e.id, e]));
  const existing = new Set(byId.keys());

  if (orderedIds.length !== existing.size || !orderedIds.every((id) => existing.has(id))) {
    return NextResponse.json({ error: "Список вправ має збігатися з поточним." }, { status: 400 });
  }

  const parentOf = new Map(
    workout.exercises.filter((e) => e.parentId).map((e) => [e.id, e.parentId!]),
  );
  for (let i = 0; i < orderedIds.length; i++) {
    const childParent = parentOf.get(orderedIds[i]!);
    if (!childParent) continue;
    const parentIdx = orderedIds.indexOf(childParent);
    if (parentIdx < 0) continue;
    if (i < parentIdx) {
      return NextResponse.json(
        { error: "Дочірня вправа має йти після батьківської." },
        { status: 400 },
      );
    }
  }

  await applyOrderedSortOrderUpdates(orderedIds, (exerciseId, sortOrder) =>
    prisma.workoutExercise.update({
      where: { id: exerciseId },
      data: { sortOrder },
    }),
  );

  return NextResponse.json({ ok: true });
}
