import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { hasLeaderboardData, leaderboardScore, type LeaderboardSort } from "@/lib/ipf-gl";
import {
  isValidAchievementId,
  parsePinnedIds,
  profileGlPointsForLevel,
  profileLevelFromGlPoints,
} from "@/lib/achievements";

export const dynamic = "force-dynamic";

const querySchema = z.object({
  by: z.enum(["total", "bench"]).optional(),
});

export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const parsed = querySchema.safeParse({ by: searchParams.get("by") ?? "total" });
  const by = (parsed.success ? parsed.data.by : "total") as LeaderboardSort;

  const rows = await prisma.user.findMany({
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
      pinnedAchievementIds: true,
    },
  });

  const scored = rows
    .filter((r) => hasLeaderboardData(by, r))
    .map((r) => {
      const score = leaderboardScore(by, {
        bodyweightKg: Number(r.glBodyweightKg),
        squatKg: Number(r.glMaxSquatKg),
        benchKg: Number(r.glMaxBenchKg),
        deadliftKg: Number(r.glMaxDeadliftKg),
        sex: r.glSex!,
        equipment: r.glEquipment!,
      });
      const glPts = profileGlPointsForLevel({
        glBodyweightKg: r.glBodyweightKg != null ? Number(r.glBodyweightKg) : null,
        glMaxSquatKg: r.glMaxSquatKg != null ? Number(r.glMaxSquatKg) : null,
        glMaxBenchKg: r.glMaxBenchKg != null ? Number(r.glMaxBenchKg) : null,
        glMaxDeadliftKg: r.glMaxDeadliftKg != null ? Number(r.glMaxDeadliftKg) : null,
        glSex: r.glSex,
        glEquipment: r.glEquipment,
      });
      const profileLevel = profileLevelFromGlPoints(glPts);
      return {
        login: r.login,
        avatarId: r.avatarId,
        nickname: r.nickname,
        score: score ?? 0,
        profileLevel,
        pinnedAchievementIds: parsePinnedIds(r.pinnedAchievementIds).filter((id) =>
          isValidAchievementId(id),
        ),
      };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 150)
    .map((x, i) => ({
      place: i + 1,
      login: x.login,
      avatarId: x.avatarId,
      nickname: x.nickname,
      score: x.score,
      profileLevel: x.profileLevel,
      pinnedAchievementIds: x.pinnedAchievementIds,
    }));

  return NextResponse.json({ by, rows: scored });
}
