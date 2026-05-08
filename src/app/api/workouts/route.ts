import { NextResponse } from "next/server";
import { z } from "zod";
import type { BaseLift } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseWorkoutDateInput } from "@/lib/date-local";
import { parseStatsFiltersFromSearchParams } from "@/lib/stats-filters";
import { workoutListWhere } from "@/lib/workout-list-where";
import { parseWorkoutListPageSize } from "@/lib/workout-list-page-size";
import { rateLimitJson } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const noStoreHeaders = { "Cache-Control": "private, no-store" };

const createSchema = z.object({
  templateId: z.string().cuid().optional(),
  title: z.string().trim().max(200).optional(),

  date: z.string().optional(),
});

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user)
    return NextResponse.json({ error: "Потрібен вхід." }, { status: 401, headers: noStoreHeaders });

  const { searchParams } = new URL(req.url);
  const filters = parseStatsFiltersFromSearchParams(Object.fromEntries(searchParams.entries()));
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = parseWorkoutListPageSize(searchParams.get("pageSize") ?? undefined);

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
  return NextResponse.json({ workouts, total, page, pageSize, totalPages }, { headers: noStoreHeaders });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user)
    return NextResponse.json({ error: "Потрібен вхід." }, { status: 401, headers: noStoreHeaders });

  const limited = rateLimitJson(req, "workouts-create", 40, 60_000);
  if (limited) return limited;

  try {
    const json = await req.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані." }, { status: 400, headers: noStoreHeaders });
    }
    const { templateId, title, date: dateRaw } = parsed.data;

    let workoutDate = new Date();
    if (dateRaw?.trim()) {
      try {
        workoutDate = parseWorkoutDateInput(dateRaw);
      } catch {
        return NextResponse.json({ error: "Некоректна дата." }, { status: 400, headers: noStoreHeaders });
      }
    }

    if (templateId) {
      const template = await prisma.workoutTemplate.findFirst({
        where: { id: templateId },
        include: { exercises: { orderBy: { sortOrder: "asc" } } },
      });
      if (!template) {
        return NextResponse.json({ error: "Шаблон не знайдено." }, { status: 404, headers: noStoreHeaders });
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
      return NextResponse.json({ workout }, { headers: noStoreHeaders });
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
    return NextResponse.json({ workout }, { headers: noStoreHeaders });
  } catch {
    return NextResponse.json(
      { error: "Не вдалося створити тренування." },
      { status: 500, headers: noStoreHeaders },
    );
  }
}
