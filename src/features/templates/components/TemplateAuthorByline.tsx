export const templateAuthorLabelClass =
  "text-[10px] font-bold uppercase tracking-wider text-[#e31e24]/90";

export function TemplateAuthorInline({
  user,
}: {
  user: { login: string; nickname: string | null };
}) {
  const nick = user.login.trim();
  if (!nick) return null;
  return <span className={templateAuthorLabelClass}>{nick}</span>;
}
