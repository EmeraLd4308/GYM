import { unstable_cache } from "next/cache";
import { prisma } from "@/shared/lib/prisma";
import { hasLeaderboardData, leaderboardScore, type LeaderboardSort } from "@/features/profile/lib/ipf-gl";
import {
  isValidAchievementId,
  parsePinnedIds,
  profileGlPointsForLevel,
  profileLevelFromGlPoints,
} from "@/features/profile/lib/achievements";

export type LeaderboardRow = {
  place: number;
  login: string;
  avatarId: string;
  nickname: string | null;
  score: number;
  profileLevel: number;
  pinnedAchievementIds: string[];
};

async function computeLeaderboardRows(by: LeaderboardSort): Promise<LeaderboardRow[]> {
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

  return rows
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
}

export function getCachedLeaderboardRows(by: LeaderboardSort) {
  return unstable_cache(() => computeLeaderboardRows(by), ["leaderboard", by], {
    revalidate: 60,
  })();
}
