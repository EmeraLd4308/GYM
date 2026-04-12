import { NextResponse } from "next/server";
import { z } from "zod";
import type { BaseLift } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const exerciseSchema = z.object({
  name: z.string().trim().min(1).max(200),
  baseLift: z.enum(["NONE", "BENCH", "SQUAT", "DEADLIFT"]),
});

const createSchema = z.object({
  name: z.string().trim().min(1).max(120),
  exercises: z.array(exerciseSchema).min(1),
});

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const rawPs = parseInt(searchParams.get("pageSize") ?? "12", 10);
  const pageSize = Math.min(100, Math.max(1, Number.isFinite(rawPs) ? rawPs : 12));
  const [total, list] = await prisma.$transaction([
    prisma.workoutTemplate.count(),
    prisma.workoutTemplate.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        exercises: { orderBy: { sortOrder: "asc" } },
        user: { select: { id: true, login: true, nickname: true } },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  return NextResponse.json({ templates: list, total, page, pageSize, totalPages });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  try {
    const json = await req.json();
    const parsed = createSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані шаблону." }, { status: 400 });
    }
    const { name, exercises } = parsed.data;
    const created = await prisma.workoutTemplate.create({
      data: {
        userId: user.id,
        name,
        exercises: {
          create: exercises.map((e, i) => ({
            sortOrder: i,
            name: e.name,
            baseLift: e.baseLift as BaseLift,
          })),
        },
      },
      include: { exercises: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json({ template: created });
  } catch {
    return NextResponse.json({ error: "Не вдалося зберегти шаблон." }, { status: 500 });
  }
}
