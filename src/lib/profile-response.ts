import { prisma } from "@/lib/prisma";
import {
  ACHIEVEMENT_ORDER,
  achievementTitleUk,
  parsePinnedIds,
  profileGlPointsForLevel,
  profileLevelFromGlPoints,
  isValidAchievementId,
} from "@/lib/achievements";

function orderIndex(id: string): number {
  const i = ACHIEVEMENT_ORDER.indexOf(id);
  return i === -1 ? 999 : i;
}

export async function buildProfileApiPayload(userId: string) {
  const row = await prisma.user.findUnique({
    where: { id: userId },
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
      achievements: { select: { achievementId: true, announcedAt: true } },
      liftRecords: {
        select: {
          baseLift: true,
          topWeightKg: true,
          topVolumeKg: true,
          estOneRmKg: true,
          manualTopWeightKg: true,
          manualTopVolumeKg: true,
          manualEstOneRmKg: true,
        },
      },
    },
  });
  if (!row) return null;

  const glBodyweightKg = row.glBodyweightKg != null ? Number(row.glBodyweightKg) : null;
  const glMaxSquatKg = row.glMaxSquatKg != null ? Number(row.glMaxSquatKg) : null;
  const glMaxBenchKg = row.glMaxBenchKg != null ? Number(row.glMaxBenchKg) : null;
  const glMaxDeadliftKg = row.glMaxDeadliftKg != null ? Number(row.glMaxDeadliftKg) : null;

  const unlocked = [...new Set(row.achievements.map((a) => a.achievementId))].sort(
    (a, b) => orderIndex(a) - orderIndex(b),
  );
  const pendingAnnouncementIds = row.achievements
    .filter((a) => a.announcedAt == null)
    .map((a) => a.achievementId);
  const pinnedAchievementIds = parsePinnedIds(row.pinnedAchievementIds).filter((id) =>
    isValidAchievementId(id),
  );

  const glPoints = profileGlPointsForLevel({
    glBodyweightKg,
    glMaxSquatKg,
    glMaxBenchKg,
    glMaxDeadliftKg,
    glSex: row.glSex,
    glEquipment: row.glEquipment,
  });
  const profileLevel = profileLevelFromGlPoints(glPoints);

  const achievementsCatalog = ACHIEVEMENT_ORDER.map((id) => ({
    id,
    title: achievementTitleUk(id, row.glSex),
    unlocked: unlocked.includes(id),
  }));

  return {
    login: row.login,
    avatarId: row.avatarId,
    nickname: row.nickname,
    glBodyweightKg,
    glMaxSquatKg,
    glMaxBenchKg,
    glMaxDeadliftKg,
    glSex: row.glSex,
    glEquipment: row.glEquipment,
    pinnedAchievementIds,
    achievementsUnlocked: unlocked,
    pendingAnnouncementIds,
    achievementsCatalog,
    profileLevel,
    glPoints,
    liftRecords: row.liftRecords.map((r) => ({
      baseLift: r.baseLift,
      topWeightKg: r.topWeightKg != null ? Number(r.topWeightKg) : null,
      topVolumeKg: r.topVolumeKg != null ? Number(r.topVolumeKg) : null,
      estOneRmKg: r.estOneRmKg != null ? Number(r.estOneRmKg) : null,
      manualTopWeightKg: r.manualTopWeightKg,
      manualTopVolumeKg: r.manualTopVolumeKg,
      manualEstOneRmKg: r.manualEstOneRmKg,
    })),
  };
}

export function normalizePinnedForUser(
  requested: string[],
  unlockedIds: Set<string>,
): string[] {
  const out: string[] = [];
  for (const id of requested) {
    if (!isValidAchievementId(id)) continue;
    if (!unlockedIds.has(id)) continue;
    out.push(id);
    if (out.length >= 3) break;
  }
  return out;
}
