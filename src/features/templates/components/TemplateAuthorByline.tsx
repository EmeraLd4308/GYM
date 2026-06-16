export function TemplateAuthorByline({
  user,
}: {
  user: { login: string; nickname: string | null };
}) {
  const nick = user.nickname?.trim();

  return (
    <p className="text-xs leading-relaxed text-zinc-500">
      <span className="font-semibold uppercase tracking-wider text-zinc-600">Автор</span>
      {nick ? (
        <>
          {" — "}
          <span className="text-zinc-300">{nick}</span>
          <span className="text-zinc-600"> · </span>
          <span className="font-mono text-[11px] text-zinc-600">{user.login}</span>
        </>
      ) : (
        <>
          {" — "}
          <span className="font-mono text-[11px] text-zinc-400">{user.login}</span>
        </>
      )}
    </p>
  );
}
