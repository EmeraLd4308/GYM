import { NextResponse } from "next/server";
import { z } from "zod";
import type { BaseLift } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseWorkoutDateInput } from "@/lib/date-local";

const createSchema = z.object({
  templateId: z.string().cuid().optional(),
  title: z.string().trim().max(200).optional(),
  /** YYYY-MM-DD або повний ISO — день тренування (можна наперед). */
  date: z.string().optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 50,
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
        include: { sets: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  return NextResponse.json({ workouts });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  try {
    const json = await req.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані." }, { status: 400 });
    }
    const { templateId, title, date: dateRaw } = parsed.data;

    let workoutDate = new Date();
    if (dateRaw?.trim()) {
      try {
        workoutDate = parseWorkoutDateInput(dateRaw);
      } catch {
        return NextResponse.json({ error: "Некоректна дата." }, { status: 400 });
      }
    }

    if (templateId) {
      const template = await prisma.workoutTemplate.findFirst({
        where: { id: templateId, userId: user.id },
        include: { exercises: { orderBy: { sortOrder: "asc" } } },
      });
      if (!template) {
        return NextResponse.json({ error: "Шаблон не знайдено." }, { status: 404 });
      }
      const workout = await prisma.workout.create({
        data: {
          userId: user.id,
          date: workoutDate,
          title: title ?? template.name,
          templateId: template.id,
          exercises: {
            create: template.exercises.map((e) => ({
              sortOrder: e.sortOrder,
              name: e.name,
              baseLift: e.baseLift as BaseLift,
            })),
          },
        },
        include: {
          exercises: { orderBy: { sortOrder: "asc" }, include: { sets: true } },
        },
      });
      return NextResponse.json({ workout });
    }

    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        date: workoutDate,
        title: title ?? null,
      },
      include: {
        exercises: { orderBy: { sortOrder: "asc" }, include: { sets: true } },
      },
    });
    return NextResponse.json({ workout });
  } catch {
    return NextResponse.json({ error: "Не вдалося створити тренування." }, { status: 500 });
  }
}
