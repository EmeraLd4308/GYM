import { NextResponse } from "next/server";
import { z } from "zod";
import type { BaseLift } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseWorkoutDateInput } from "@/lib/date-local";
import { parseStatsFiltersFromSearchParams } from "@/lib/stats-filters";
import { workoutListWhere } from "@/lib/workout-list-where";
import { rateLimitJson } from "@/lib/rate-limit";

const createSchema = z.object({
  templateId: z.string().cuid().optional(),
  title: z.string().trim().max(200).optional(),

  date: z.string().optional(),
});

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const filters = parseStatsFiltersFromSearchParams(Object.fromEntries(searchParams.entries()));
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const rawPs = parseInt(searchParams.get("pageSize") ?? "100", 10);
  const pageSize = Math.min(500, Math.max(1, Number.isFinite(rawPs) ? rawPs : 100));

  const where = workoutListWhere(user.id, filters);
  const [total, workouts] = await prisma.$transaction([
    prisma.workout.count({ where }),
    prisma.workout.findMany({
      where,
      orderBy: { date: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        exercises: {
          orderBy: { sortOrder: "asc" },
          select: {
            _count: { select: { sets: true } },
          },
        },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return NextResponse.json({ workouts, total, page, pageSize, totalPages });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });

  const limited = rateLimitJson(req, "workouts-create", 40, 60_000);
  if (limited) return limited;

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
