import type { ReactNode } from "react";

/**
 * Порожній стан: заголовок, пояснення, опційно кроки «що далі», дії ззовні (children).
 */
export function EmptyStateCallout({
  title,
  description,
  nextSteps,
  children,
  align = "center",
  className = "",
}: {
  title: string;
  description: string;
  nextSteps?: string[];
  children?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  const wrap =
    align === "center"
      ? "text-center [&_.sbd-empty-steps]:mx-auto [&_.sbd-empty-steps]:text-left"
      : "text-left";

  return (
    <div className={`${wrap} ${className}`}>
      <h2 className="font-display text-base font-semibold leading-snug text-[var(--sbd-text)] sm:text-lg">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--sbd-muted)] sm:text-[0.9375rem]">
        {description}
      </p>
      {nextSteps && nextSteps.length > 0 ? (
        <ul
          className="sbd-empty-steps mt-4 max-w-md space-y-2.5 text-sm text-[var(--sbd-muted)] sm:mt-5"
          aria-label="Що далі"
        >
          {nextSteps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span
                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--sbd-red)_16%,transparent)] text-[11px] font-bold tabular-nums text-[#e31e24]"
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="min-w-0 leading-snug">{step}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {children ? (
        <div
          className={
            align === "center"
              ? "mt-6 flex w-full flex-col items-center gap-3 sm:mt-7 [&>a]:w-full [&>a]:max-w-sm sm:[&>a]:w-auto"
              : "mt-6 flex w-full flex-col gap-3 sm:mt-7"
          }
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}
