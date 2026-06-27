export function templateOptionLabel(
  name: string,
  u: { login: string; nickname: string | null },
): string {
  const nick = u.nickname?.trim();
  if (nick) return `${name} — ${nick} (${u.login})`;
  return `${name} — ${u.login}`;
}
