export function TemplateAuthorNote({
  text,
  compact,
}: {
  text: string;
  compact?: boolean;
}) {
  const trimmed = text.trim();
  if (!trimmed) return null;

  return (
    <div
      className={`rounded-lg border border-white/[0.08] bg-white/[0.03] ${
        compact ? "px-3 py-2.5" : "px-4 py-3"
      }`}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#e31e24]/90">
        Уточнення від автора
      </p>
      <p
        className={`mt-1.5 whitespace-pre-wrap text-zinc-300 ${
          compact ? "line-clamp-2 text-xs leading-snug" : "text-sm leading-relaxed"
        }`}
      >
        {trimmed}
      </p>
    </div>
  );
}
