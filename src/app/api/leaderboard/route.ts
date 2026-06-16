import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/shared/lib/auth";
import type { LeaderboardSort } from "@/features/profile/lib/ipf-gl";
import { getCachedLeaderboardRows } from "@/server/queries/leaderboard";

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

  const rows = await getCachedLeaderboardRows(by);

  return NextResponse.json(
    { by, rows },
    { headers: { "Cache-Control": "private, max-age=30" } },
  );
}
