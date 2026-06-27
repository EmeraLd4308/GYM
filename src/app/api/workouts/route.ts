import { NextResponse } from "next/server";
import { z } from "zod";
import type { BaseLift } from "@prisma/client";
import { prisma } from "@/shared/lib/prisma";
import { getSessionUser } from "@/shared/lib/auth";
import { parseWorkoutDateInput } from "@/shared/lib/date-local";
import { parseStatsFiltersFromSearchParams } from "@/features/stats/lib/stats-filters";
import { workoutListWhere } from "@/features/workouts/lib/workout-list-where";
import { parseWorkoutListPageSize } from "@/features/workouts/lib/workout-list-page-size";
import { rateLimitJson } from "@/shared/lib/rate-limit";
import { findLastExerciseSets, setsCreateFromSnapshot } from "@/features/workouts/lib/exercise-last-sets";

export const dynamic = "force-dynamic";
const noStoreHeaders = { "Cache-Control": "private, no-store" };

const createSchema = z
  .object({
    templateId: z.string().cuid().optional(),
    templateExerciseIds: z.array(z.string().cuid()).optional(),
    title: z.string().trim().max(200).optional(),
    date: z.string().optional(),
    exercises: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(200),
          baseLift: z.enum(["NONE", "BENCH", "SQUAT", "DEADLIFT"]),
        }),
      )
      .optional(),
  })
  .refine((data) => !(data.templateId && data.exercises?.length), {
    message: "Не можна одночасно передати шаблон і список вправ.",
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
    const { templateId, templateExerciseIds, title, date: dateRaw, exercises } = parsed.data;

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

      const templateExerciseIdSet = new Set(template.exercises.map((e) => e.id));
      if (templateExerciseIds) {
        const unknown = templateExerciseIds.filter((id) => !templateExerciseIdSet.has(id));
        if (unknown.length > 0) {
          return NextResponse.json(
            { error: "Обрано вправи, яких немає в шаблоні." },
            { status: 400, headers: noStoreHeaders },
          );
        }
        if (templateExerciseIds.length === 0) {
          return NextResponse.json(
            { error: "Оберіть хоча б одну вправу з шаблону." },
            { status: 400, headers: noStoreHeaders },
          );
        }
      }

      const selectedIds = templateExerciseIds
        ? new Set(templateExerciseIds)
        : templateExerciseIdSet;
      const selectedExercises = template.exercises.filter((e) => selectedIds.has(e.id));

      const exerciseCreates = await Promise.all(
        selectedExercises.map(async (e, index) => {
          const lastSets =
            e.baseLift === "NONE" ? await findLastExerciseSets(user.id, e.name) : null;
          return {
            sortOrder: index,
            name: e.name,
            baseLift: e.baseLift as BaseLift,
            ...(lastSets?.length
              ? { sets: { create: setsCreateFromSnapshot(lastSets) } }
              : {}),
          };
        }),
      );

      const workout = await prisma.workout.create({
        data: {
          userId: user.id,
          date: workoutDate,
          title: title ?? template.name,
          templateId: template.id,
          exercises: { create: exerciseCreates },
        },
        include: {
          exercises: {
            orderBy: { sortOrder: "asc" },
            include: { sets: { orderBy: { sortOrder: "asc" } } },
          },
        },
      });
      return NextResponse.json({ workout }, { headers: noStoreHeaders });
    }

    const exerciseCreatesFromInput = exercises?.length
      ? await Promise.all(
          exercises.map(async (e, index) => {
            const lastSets =
              e.baseLift === "NONE" ? await findLastExerciseSets(user.id, e.name) : null;
            return {
              sortOrder: index,
              name: e.name,
              baseLift: e.baseLift as BaseLift,
              ...(lastSets?.length
                ? { sets: { create: setsCreateFromSnapshot(lastSets) } }
                : {}),
            };
          }),
        )
      : null;

    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        date: workoutDate,
        title: title ?? null,
        ...(exerciseCreatesFromInput?.length
          ? { exercises: { create: exerciseCreatesFromInput } }
          : {}),
      },
      include: {
        exercises: {
          orderBy: { sortOrder: "asc" },
          include: { sets: { orderBy: { sortOrder: "asc" } } },
        },
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
