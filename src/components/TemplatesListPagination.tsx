import Link from "next/link";

const btn =
  "inline-flex min-h-[44px] items-center justify-center rounded-md border border-white/15 px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:bg-white/10";

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
    <div className="flex flex-col gap-3 border-t border-white/[0.06] px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <p className="text-xs leading-relaxed text-zinc-500">
        {total === 0 ? (
          "Шаблонів немає"
        ) : (
          <>
            Показано <span className="text-zinc-400">{from}</span>
            {" — "}
            <span className="text-zinc-400">{to}</span> з{" "}
            <span className="text-zinc-400">{total}</span>
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
            <Link href={href(prev)} className={btn}>
              Попередня
            </Link>
          ) : (
            <span className={`${btn} pointer-events-none opacity-40`} aria-disabled>
              Попередня
            </span>
          )}
          {next != null ? (
            <Link href={href(next)} className={btn}>
              Наступна
            </Link>
          ) : (
            <span className={`${btn} pointer-events-none opacity-40`} aria-disabled>
              Наступна
            </span>
          )}
        </div>
      ) : null}
    </div>
  );
}
