/** Клієнтське дублювання cookie — на частині моб. браузерів Set-Cookie з fetch не застосовується, document.cookie — так. */

export const SESSION_COOKIE_NAME = "gym_session";
const SESSION_MAX_AGE_SEC = 4 * 60 * 60;

export function persistSessionCookie(token: string): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:";
  const parts = [
    `${SESSION_COOKIE_NAME}=${token}`,
    "Path=/",
    `Max-Age=${SESSION_MAX_AGE_SEC}`,
    "SameSite=Lax",
  ];
  if (secure) parts.push("Secure");
  document.cookie = parts.join("; ");
}

export function clearSessionCookieClient(): void {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:";
  const parts = [`${SESSION_COOKIE_NAME}=`, "Path=/", "Max-Age=0", "SameSite=Lax"];
  if (secure) parts.push("Secure");
  document.cookie = parts.join("; ");
}
