import Link from "next/link";

const mineBadge =
  "sbd-mine-badge shrink-0 rounded-full border border-[#e31e24]/40 bg-[#e31e24]/[0.14] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-red-200";

export function TemplateListRow({
  id,
  name,
  exerciseCount,
  isOwn,
  user,
}: {
  id: string;
  name: string;
  exerciseCount: number;
  isOwn: boolean;
  user: { login: string; nickname: string | null };
}) {
  const nick = user.nickname?.trim();

  return (
    <li>
      <Link
        href={`/templates/${id}`}
        className={`sbd-template-row flex gap-3 px-4 py-4 transition-colors duration-200 hover:bg-white/[0.04] sm:items-center ${
          isOwn
            ? "border-l-[3px] border-l-[#e31e24] bg-gradient-to-r from-[#e31e24]/[0.07] to-transparent"
            : "border-l-[3px] border-l-transparent"
        }`}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {isOwn ? <span className={mineBadge}>Мій</span> : null}
            <span className="text-base font-medium text-[var(--sbd-text)]">{name}</span>
          </div>
          {!isOwn ? (
            <p className="mt-1.5 text-xs leading-snug text-zinc-500">
              {nick ? (
                <>
                  <span className="font-medium text-zinc-400">{nick}</span>
                  <span className="text-zinc-600"> · </span>
                  <span className="font-mono text-[11px] text-zinc-600">{user.login}</span>
                </>
              ) : (
                <span className="font-mono text-[11px] text-zinc-500">{user.login}</span>
              )}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 self-start pt-0.5 text-right text-xs tabular-nums text-zinc-500 sm:self-center sm:pt-0">
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-600 sm:inline sm:mr-1">
            Вправ
          </span>
          <span className="text-sm font-semibold text-zinc-400">{exerciseCount}</span>
        </div>
      </Link>
    </li>
  );
}
