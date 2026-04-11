import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { parseWorkoutDateInput } from "@/lib/date-local";

const patchSchema = z.object({
  title: z.string().trim().max(200).nullable().optional(),

  date: z.string().optional(),
  notes: z.string().max(8000).nullable().optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id } = await ctx.params;
  const workout = await prisma.workout.findFirst({
    where: { id, userId: user.id },
    include: {
      exercises: {
        orderBy: { sortOrder: "asc" },
        include: { sets: { orderBy: { sortOrder: "asc" } } },
      },
    },
  });
  if (!workout) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  return NextResponse.json({ workout });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id } = await ctx.params;
  const existing = await prisma.workout.findFirst({ where: { id, userId: user.id } });
  if (!existing) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані." }, { status: 400 });
    }
    const { title, date: dateRaw, notes } = parsed.data;
    let nextDate: Date | undefined;
    if (dateRaw !== undefined && dateRaw.trim() !== "") {
      try {
        nextDate = parseWorkoutDateInput(dateRaw);
      } catch {
        return NextResponse.json({ error: "Некоректна дата." }, { status: 400 });
      }
    }
    const workout = await prisma.workout.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(nextDate !== undefined ? { date: nextDate } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: {
        exercises: {
          orderBy: { sortOrder: "asc" },
          include: { sets: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    return NextResponse.json({ workout });
  } catch {
    return NextResponse.json({ error: "Не вдалося оновити." }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const { id } = await ctx.params;
  const res = await prisma.workout.deleteMany({ where: { id, userId: user.id } });
  if (res.count === 0) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
