import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { AVATAR_IDS } from "@/lib/avatars";
import { normalizeLogin } from "@/lib/login-normalize";
import { maxTripleChanged, recordProfileSbdMaxSnapshot } from "@/lib/profile-max-history";
import { rateLimitJson } from "@/lib/rate-limit";
import { buildProfileApiPayload, normalizePinnedForUser } from "@/lib/profile-response";
import { syncUserAchievements } from "@/lib/achievements";
import { recalculateUserDerivedMetricsFromProfile } from "@/lib/lift-records";

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
  pinnedAchievementIds: z.array(z.string().max(80)).max(3).optional(),
  liftRecords: z
    .array(
      z.object({
        baseLift: z.enum(["BENCH", "SQUAT", "DEADLIFT"]),
        topWeightKg: numOrNull.optional(),
        topVolumeKg: numOrNull.optional(),
        estOneRmKg: numOrNull.optional(),
      }),
    )
    .max(3)
    .optional(),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  await syncUserAchievements(user.id);
  const profile = await buildProfileApiPayload(user.id);
  if (!profile) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
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
    const { pinnedAchievementIds, liftRecords, ...rest } = d;
    const hasRest = Object.values(rest).some((v) => v !== undefined);
    const hasPins = pinnedAchievementIds !== undefined;
    const hasLiftRecords = Array.isArray(liftRecords);
    if (!hasRest && !hasPins && !hasLiftRecords) {
      return NextResponse.json({ error: "Немає полів для оновлення." }, { status: 400 });
    }

    let loginNext: string | undefined;
    if (rest.login !== undefined) {
      const normalized = normalizeLogin(rest.login);
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
    if (rest.nickname !== undefined) {
      if (rest.nickname === null) nicknameNext = null;
      else {
        const t = rest.nickname.trim();
        nicknameNext = t === "" ? null : t;
      }
    }

    const beforeMax = hasRest
      ? await prisma.user.findUnique({
          where: { id: user.id },
          select: { glMaxSquatKg: true, glMaxBenchKg: true, glMaxDeadliftKg: true },
        })
      : null;

    if (hasRest) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(loginNext !== undefined ? { login: loginNext } : {}),
          ...(rest.glBodyweightKg !== undefined ? { glBodyweightKg: rest.glBodyweightKg } : {}),
          ...(rest.glMaxSquatKg !== undefined ? { glMaxSquatKg: rest.glMaxSquatKg } : {}),
          ...(rest.glMaxBenchKg !== undefined ? { glMaxBenchKg: rest.glMaxBenchKg } : {}),
          ...(rest.glMaxDeadliftKg !== undefined ? { glMaxDeadliftKg: rest.glMaxDeadliftKg } : {}),
          ...(rest.glSex !== undefined ? { glSex: rest.glSex } : {}),
          ...(rest.glEquipment !== undefined ? { glEquipment: rest.glEquipment } : {}),
          ...(rest.avatarId !== undefined ? { avatarId: rest.avatarId } : {}),
          ...(rest.nickname !== undefined ? { nickname: nicknameNext } : {}),
          glDiscipline: null,
        },
      });
    }

    const afterUpdate = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        glMaxSquatKg: true,
        glMaxBenchKg: true,
        glMaxDeadliftKg: true,
      },
    });

    if (
      hasRest &&
      beforeMax &&
      afterUpdate &&
      maxTripleChanged(beforeMax, {
        glMaxSquatKg: afterUpdate.glMaxSquatKg,
        glMaxBenchKg: afterUpdate.glMaxBenchKg,
        glMaxDeadliftKg: afterUpdate.glMaxDeadliftKg,
      })
    ) {
      await recordProfileSbdMaxSnapshot(user.id, {
        glMaxSquatKg: afterUpdate.glMaxSquatKg,
        glMaxBenchKg: afterUpdate.glMaxBenchKg,
        glMaxDeadliftKg: afterUpdate.glMaxDeadliftKg,
      });
      await recalculateUserDerivedMetricsFromProfile(user.id);
    }

    await syncUserAchievements(user.id);

    if (pinnedAchievementIds !== undefined) {
      const unlockedRows = await prisma.userAchievement.findMany({
        where: { userId: user.id },
        select: { achievementId: true },
      });
      const unlocked = new Set(unlockedRows.map((r) => r.achievementId));
      const pins = normalizePinnedForUser(pinnedAchievementIds, unlocked);
      await prisma.user.update({
        where: { id: user.id },
        data: { pinnedAchievementIds: pins },
      });
    }

    if (liftRecords) {
      for (const row of liftRecords) {
        await prisma.userLiftRecord.upsert({
          where: { userId_baseLift: { userId: user.id, baseLift: row.baseLift } },
          update: {
            ...(row.topWeightKg !== undefined
              ? {
                  topWeightKg: row.topWeightKg,
                  manualTopWeightKg: true,
                }
              : {}),
            ...(row.topVolumeKg !== undefined
              ? {
                  topVolumeKg: row.topVolumeKg,
                  manualTopVolumeKg: true,
                }
              : {}),
            ...(row.estOneRmKg !== undefined
              ? {
                  estOneRmKg: row.estOneRmKg,
                  manualEstOneRmKg: true,
                }
              : {}),
          },
          create: {
            userId: user.id,
            baseLift: row.baseLift,
            topWeightKg: row.topWeightKg ?? null,
            topVolumeKg: row.topVolumeKg ?? null,
            estOneRmKg: row.estOneRmKg ?? null,
            manualTopWeightKg: row.topWeightKg !== undefined,
            manualTopVolumeKg: row.topVolumeKg !== undefined,
            manualEstOneRmKg: row.estOneRmKg !== undefined,
          },
        });
      }
    }

    const profile = await buildProfileApiPayload(user.id);
    if (!profile) return NextResponse.json({ error: "Не знайдено." }, { status: 404 });
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
