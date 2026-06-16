import { z } from "zod";
import { rateLimitJson } from "@/shared/lib/rate-limit";
import { suggestAvailableLogins } from "@/shared/lib/login-utils";
import { enterUser, parseLoginField } from "@/features/auth/server/enter-user";
import { jsonAuthError, jsonWithSession } from "@/features/auth/server/session-response";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  login: z.string().trim().min(2).max(40),
});

/** JSON API: register new user only. */
export async function POST(req: Request) {
  const limited = rateLimitJson(req, "auth-register", 15, 60_000);
  if (limited) return limited;

  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonAuthError("Некоректний логін.", 400);
    }

    const field = parseLoginField(parsed.data.login);
    if (!("login" in field)) {
      return jsonAuthError(field.error, field.httpStatus ?? 400);
    }
    const { login } = field;

    const result = await enterUser(login, "register-only");
    if (!result.ok) {
      const suggestions =
        result.httpStatus === 409 ? await suggestAvailableLogins(login) : undefined;
      return jsonAuthError(result.error, result.httpStatus ?? 409, { suggestions });
    }

    return jsonWithSession(req, { id: result.userId, login: result.login });
  } catch {
    return jsonAuthError("Помилка сервера.", 500);
  }
}
