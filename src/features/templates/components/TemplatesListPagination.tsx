import Link from "next/link";
import { uiButtonGhostSmClass, uiMutedTextClass } from "@/shared/ui/styles";

export function TemplatesListPagination({
  page,
  totalPages,
  total,
  pageSize,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const href = (p: number) => (p <= 1 ? "/templates" : `/templates?page=${p}`);

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--sbd-border)] px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className={`text-xs leading-relaxed ${uiMutedTextClass}`}>
        {total === 0 ? (
          "Шаблонів немає"
        ) : (
          <>
            Показано <span className="text-[var(--sbd-text)]">{from}</span>
            {" — "}
            <span className="text-[var(--sbd-text)]">{to}</span> з{" "}
            <span className="text-[var(--sbd-text)]">{total}</span>
            {totalPages > 1 ? (
              <>
                {" · "}
                сторінка {page} з {totalPages}
              </>
            ) : null}
          </>
        )}
      </p>
      {totalPages > 1 ? (
        <div className="flex flex-wrap gap-2">
          {prev != null ? (
            <Link href={href(prev)} className={uiButtonGhostSmClass}>
              Попередня
            </Link>
          ) : (
            <span className={`${uiButtonGhostSmClass} pointer-events-none opacity-40`} aria-disabled>
              Попередня
            </span>
          )}
          {next != null ? (
            <Link href={href(next)} className={uiButtonGhostSmClass}>
              Наступна
            </Link>
          ) : (
            <span className={`${uiButtonGhostSmClass} pointer-events-none opacity-40`} aria-disabled>
              Наступна
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
