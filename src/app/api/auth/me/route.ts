import { NextResponse } from "next/server";
import { getSessionUser } from "@/shared/lib/auth";
import { rateLimitJson } from "@/shared/lib/rate-limit";

export async function GET(req: Request) {
  const limited = rateLimitJson(req, "auth-me", 200, 60_000);
  if (limited) return limited;

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: user.id, login: user.login } });
}
