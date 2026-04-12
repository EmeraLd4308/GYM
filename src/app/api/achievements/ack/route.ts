import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { acknowledgeAchievements } from "@/lib/achievements";
import { rateLimitJson } from "@/lib/rate-limit";

const bodySchema = z.object({
  ids: z.array(z.string().max(80)).max(32),
});

export async function POST(req: Request) {
  const limited = rateLimitJson(req, "achievements-ack", 60, 60_000);
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Потрібен вхід." }, { status: 401 });
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Некоректні дані." }, { status: 400 });
    }
    await acknowledgeAchievements(user.id, parsed.data.ids);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Не вдалося зберегти." }, { status: 500 });
  }
}
