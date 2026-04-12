import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { achievementTitleUk, syncUserAchievements } from "@/lib/achievements";
import { rateLimitJson } from "@/lib/rate-limit";

export async function GET(req: Request) {
  const limited = rateLimitJson(req, "achievements-pending", 120, 60_000);
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });

  await syncUserAchievements(user.id);
  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: { glSex: true },
  });
  const pending = await prisma.userAchievement.findMany({
    where: { userId: user.id, announcedAt: null },
    select: { achievementId: true },
    orderBy: { unlockedAt: "asc" },
  });
  const sex = row?.glSex ?? null;
  return NextResponse.json({
    pending: pending.map((p) => ({
      id: p.achievementId,
      title: achievementTitleUk(p.achievementId, sex),
    })),
  });
}
