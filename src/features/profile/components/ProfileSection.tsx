import type { ReactNode } from "react";

export function ProfileSection({
  sectionId,
  title,
  description,
  children,
  withDivider = false,
}: {
  sectionId: string;
  title: string;
  description?: ReactNode;
  children: ReactNode;
  withDivider?: boolean;
}) {
  const hid = `${sectionId}-heading`;
  return (
    <section
      className={withDivider ? "border-t border-[color:var(--sbd-border)] pt-8 md:pt-10" : ""}
      aria-labelledby={hid}
    >
      <h2
        id={hid}
        className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--sbd-muted)]"
      >
        {title}
      </h2>
      {description != null ? (
        <div className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--sbd-muted)]">
          {description}
        </div>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}
