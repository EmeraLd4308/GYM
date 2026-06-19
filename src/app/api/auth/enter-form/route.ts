import { NextResponse } from "next/server";
import { getSessionUser } from "@/shared/lib/auth";
import { redirectAuthFormError, redirectUrl } from "@/shared/lib/request-origin";
import { takeRateToken, clientIpFromRequest } from "@/shared/lib/rate-limit";
import { dbErrorMessageForUser, withDbRetry } from "@/shared/lib/db-errors";
import { enterUser, parseLoginField } from "@/features/auth/server/enter-user";
import { redirectWithSession } from "@/features/auth/server/session-response";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  const rl = takeRateToken(`auth-enter:${clientIpFromRequest(req)}`, 25, 60_000);
  if (!rl.ok) {
    return NextResponse.redirect(
      redirectUrl(
        req,
        "/?err=" + encodeURIComponent("Забагато спроб. Зачекай хвилину й спробуй знову."),
      ),
      303,
    );
  }

  try {
    let formData: FormData;
    try {
      formData = await req.formData();
    } catch {
      return NextResponse.redirect(
        redirectUrl(req, "/?err=" + encodeURIComponent("Некоректна форма")),
        303,
      );
    }

    const parsed = parseLoginField(formData.get("login"));
    if (!("login" in parsed)) {
      return NextResponse.redirect(
        redirectUrl(req, "/?err=" + encodeURIComponent(parsed.error)),
        303,
      );
    }
    const { login } = parsed;

    const existingSession = await withDbRetry(() => getSessionUser());
    if (existingSession?.login === login) {
      return NextResponse.redirect(redirectUrl(req, "/dashboard"), 303);
    }

    const result = await enterUser(login, "find-or-create");
    if (!result.ok) {
      return NextResponse.redirect(
        redirectUrl(req, "/?err=" + encodeURIComponent(result.error)),
        303,
      );
    }

    return redirectWithSession(req, result.userId);
  } catch (e) {
    console.error("[auth/enter-form]", e);
    return redirectAuthFormError(req, dbErrorMessageForUser(e));
  }
}
