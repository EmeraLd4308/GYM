import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { AVATAR_IDS } from "@/lib/avatars";
import { normalizeLogin } from "@/lib/login-normalize";
import { maxTripleChanged, recordProfileSbdMaxSnapshot } from "@/lib/profile-max-history";
import { rateLimitJson } from "@/lib/rate-limit";

const numOrNull = z.union([z.number(), z.null()]);

const avatarIdSchema = z.enum(AVATAR_IDS);

const patchSchema = z.object({
  login: z.string().min(2).max(40).optional(),
  glBodyweightKg: numOrNull.optional(),
  glMaxSquatKg: numOrNull.optional(),
  glMaxBenchKg: numOrNull.optional(),
  glMaxDeadliftKg: numOrNull.optional(),
  glSex: z.enum(["MALE", "FEMALE"]).nullable().optional(),
  glEquipment: z.enum(["CLASSIC", "EQUIPPED"]).nullable().optional(),
  avatarId: avatarIdSchema.optional(),
  nickname: z.union([z.string().max(40), z.null()]).optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  const row = await prisma.user.findFirst({
    where: { id: user.id },
    select: {
      login: true,
      avatarId: true,
      nickname: true,
      glBodyweightKg: true,
      glMaxSquatKg: true,
      glMaxBenchKg: true,
      glMaxDeadliftKg: true,
      glSex: true,
      glEquipment: true,
    },
  });
  if (!row) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
  const profile = {
    ...row,
    glBodyweightKg: row.glBodyweightKg != null ? Number(row.glBodyweightKg) : null,
    glMaxSquatKg: row.glMaxSquatKg != null ? Number(row.glMaxSquatKg) : null,
    glMaxBenchKg: row.glMaxBenchKg != null ? Number(row.glMaxBenchKg) : null,
    glMaxDeadliftKg: row.glMaxDeadliftKg != null ? Number(row.glMaxDeadliftKg) : null,
  };
  return NextResponse.json({ profile });
}

export async function PATCH(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });

  const limited = rateLimitJson(req, "profile-patch", 40, 60_000);
  if (limited) return limited;

  try {
    const json = await req.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані профілю." }, { status: 400 });
    }
    const d = parsed.data;

    let loginNext: string | undefined;
    if (d.login !== undefined) {
      const normalized = normalizeLogin(d.login);
      if (!/^[\p{L}0-9_]+$/u.test(normalized)) {
        return NextResponse.json(
          { error: "Логін: лише літери, цифри та підкреслення, 2–40 символів." },
          { status: 400 },
        );
      }
      if (normalized !== normalizeLogin(user.login)) {
        const taken = await prisma.user.findFirst({
          where: { login: normalized, NOT: { id: user.id } },
        });
        if (taken) {
          return NextResponse.json(
            { error: "Цей логін уже зайнятий іншим користувачем. Обери інший." },
            { status: 409 },
          );
        }
        loginNext = normalized;
      }
    }

    let nicknameNext: string | null | undefined;
    if (d.nickname !== undefined) {
      if (d.nickname === null) nicknameNext = null;
      else {
        const t = d.nickname.trim();
        nicknameNext = t === "" ? null : t;
      }
    }

    const beforeMax = await prisma.user.findUnique({
      where: { id: user.id },
      select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
    });

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(loginNext !== undefined ? { login: loginNext } : {}),
        ...(d.glBodyweightKg !== undefined ? { glBodyweightKg: d.glBodyweightKg } : {}),
        ...(d.glMaxSquatKg !== undefined ? { glMaxSquatKg: d.glMaxSquatKg } : {}),
        ...(d.glMaxBenchKg !== undefined ? { glMaxBenchKg: d.glMaxBenchKg } : {}),
        ...(d.glMaxDeadliftKg !== undefined ? { glMaxDeadliftKg: d.glMaxDeadliftKg } : {}),
        ...(d.glSex !== undefined ? { glSex: d.glSex } : {}),
        ...(d.glEquipment !== undefined ? { glEquipment: d.glEquipment } : {}),
        ...(d.avatarId !== undefined ? { avatarId: d.avatarId } : {}),
        ...(d.nickname !== undefined ? { nickname: nicknameNext } : {}),
        glDiscipline: null,
      },
      select: {
        login: true,
        avatarId: true,
        nickname: true,
        glBodyweightKg: true,
        glMaxSquatKg: true,
        glMaxBenchKg: true,
        glMaxDeadliftKg: true,
        glSex: true,
        glEquipment: true,
      },
    });
    const profile = {
      ...updated,
      glBodyweightKg: updated.glBodyweightKg != null ? Number(updated.glBodyweightKg) : null,
      glMaxSquatKg: updated.glMaxSquatKg != null ? Number(updated.glMaxSquatKg) : null,
      glMaxBenchKg: updated.glMaxBenchKg != null ? Number(updated.glMaxBenchKg) : null,
      glMaxDeadliftKg: updated.glMaxDeadliftKg != null ? Number(updated.glMaxDeadliftKg) : null,
    };

    if (
      beforeMax &&
      maxTripleChanged(beforeMax, {
        glMaxSquatKg: updated.glMaxSquatKg,
        glMaxBenchKg: updated.glMaxBenchKg,
        glMaxDeadliftKg: updated.glMaxDeadliftKg,
      })
    ) {
      await recordProfileSbdMaxSnapshot(user.id, {
        glMaxSquatKg: updated.glMaxSquatKg,
        glMaxBenchKg: updated.glMaxBenchKg,
        glMaxDeadliftKg: updated.glMaxDeadliftKg,
      });
    }

    return NextResponse.json({ profile });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return NextResponse.json(
        { error: "Цей логін уже зайнятий іншим користувачем. Обери інший." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Не вдалося зберегти." }, { status: 500 });
  }
}
