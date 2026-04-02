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

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const list = await prisma.workoutTemplate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      exercises: { orderBy: { sortOrder: "asc" } },
    },
  });
  return NextResponse.json({ templates: list });
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
