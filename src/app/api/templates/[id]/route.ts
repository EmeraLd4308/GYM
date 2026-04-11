import { NextResponse } from "next/server";
import { z } from "zod";
import type { BaseLift } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const exerciseSchema = z.object({
  name: z.string().trim().min(1).max(200),
  baseLift: z.enum(["NONE", "BENCH", "SQUAT", "DEADLIFT"]),
});

const patchSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  exercises: z.array(exerciseSchema).min(1).optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id } = await ctx.params;
  const template = await prisma.workoutTemplate.findFirst({
    where: { id, userId: user.id },
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });
  if (!template) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  return NextResponse.json({ template });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await prisma.workoutTemplate.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані." }, { status: 400 });
    }
    const { name, exercises } = parsed.data;
    if (exercises) {
      await prisma.$transaction(async (tx) => {
        await tx.templateExercise.deleteMany({ where: { templateId: id } });
        await tx.workoutTemplate.update({
          where: { id },
          data: {
            ...(name !== undefined ? { name } : {}),
            exercises: {
              create: exercises.map((e, i) => ({
                sortOrder: i,
                name: e.name,
                baseLift: e.baseLift as BaseLift,
              })),
            },
          },
        });
      });
    } else if (name !== undefined) {
      await prisma.workoutTemplate.update({ where: { id }, data: { name } });
    }
    const template = await prisma.workoutTemplate.findFirst({
      where: { id, userId: user.id },
      include: { exercises: { orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json({ template });
  } catch {
    return NextResponse.json({ error: "Не вдалося оновити." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id } = await ctx.params;
  const res = await prisma.workoutTemplate.deleteMany({
    where: { id, userId: user.id },
  });
  if (res.count === 0) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
