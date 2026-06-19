"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PresetAvatar } from "@/features/profile/components/PresetAvatar";
import { AchievementIcon } from "@/features/profile/components/AchievementIcon";
import type { LbRow } from "@/features/profile/lib/profile-types";
import { profileLbTabClass } from "@/features/profile/lib/profile-styles";
import { uiTextLinkClass } from "@/shared/ui/styles";
import { useToast } from "@/shared/shell/ToastProvider";

type Props = {
  login: string;
  achCatalog: { id: string; title: string }[];
  refreshToken?: number;
};

export function ProfileLeaderboard({ login, achCatalog, refreshToken = 0 }: Props) {
  const { error: toastError } = useToast();
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [lbBy, setLbBy] = useState<"total" | "bench">("total");
  const [lbRows, setLbRows] = useState<LbRow[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  const achTitleById = useMemo(() => {
    const m = new Map<string, string>();
    for (const a of achCatalog) m.set(a.id, a.title);
    return m;
  }, [achCatalog]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setVisible(true);
      },
      { rootMargin: "240px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const loadLb = useCallback(async () => {
    setLbLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?by=${encodeURIComponent(lbBy)}`);
      const data = (await res.json()) as { error?: string; rows?: LbRow[] };
      if (!res.ok) {
        toastError(data.error ?? "Не вдалося завантажити рейтинг.");
        setLbRows([]);
        return;
      }
      setLbRows(data.rows ?? []);
    } finally {
      setLbLoading(false);
    }
  }, [lbBy, toastError]);

  useEffect(() => {
    if (!visible) return;
    void loadLb();
  }, [visible, loadLb, refreshToken]);

  return (
    <section
      ref={sectionRef}
      className="sbd-card overflow-hidden rounded-2xl shadow-lg shadow-black/15"
      aria-labelledby="profile-lb-heading"
    >
      <div className="sbd-lb-toolbar px-5 py-5 sm:px-7">
        <h2
          id="profile-lb-heading"
          className="font-display text-lg font-bold uppercase tracking-wide text-[var(--sbd-text)]"
        >
          Рейтинг
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-[var(--sbd-muted)]">
          За офіційним GL. Потрібні вага, стать, екіпірування та максимуми.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(
            [
              ["total", "Сума SBD"],
              ["bench", "Жим"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={profileLbTabClass}
              data-active={lbBy === key ? "true" : "false"}
              onClick={() => setLbBy(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-5 sm:px-7 sm:py-6">
        {!visible ? (
          <p className="text-sm text-[var(--sbd-muted)]">Прокрути вниз, щоб завантажити рейтинг…</p>
        ) : lbLoading ? (
          <p className="text-sm text-[var(--sbd-muted)]">Завантаження…</p>
        ) : lbRows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--sbd-border)] bg-[var(--sbd-elevated)] px-4 py-10 text-center">
            <p className="font-display text-sm font-semibold text-[var(--sbd-text)]">
              Поки немає рядків у рейтингу
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm text-[var(--sbd-muted)]">
              Заповни профіль і збережи зміни.
            </p>
            <a href="#profile-edit" className={`${uiTextLinkClass} mt-5 inline-flex min-h-[44px] items-center justify-center`}>
              До блоку «Редагувати профіль»
            </a>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl ring-1 ring-[var(--sbd-border)]">
            <table className="w-full min-w-[400px] text-sm">
              <thead className="sbd-lb-thead">
                <tr className="text-left text-xs uppercase tracking-wider text-[var(--sbd-muted)]">
                  <th className="px-4 py-3 align-top font-semibold">#</th>
                  <th className="px-4 py-3 align-top font-semibold">Атлет</th>
                  <th
                    className="px-3 py-3 align-middle text-center font-semibold"
                    title="Закріплені досягнення"
                  >
                    Досягнення
                  </th>
                  <th
                    className="px-4 py-3 align-middle text-right font-semibold"
                    title="Рівень за GL-профілем"
                  >
                    Рівень
                  </th>
                  <th className="px-4 py-3 align-middle text-right font-semibold">GL</th>
                </tr>
              </thead>
              <tbody className="sbd-lb-tbody divide-y divide-[var(--sbd-border)] text-[var(--sbd-text)]">
                {lbRows.map((r) => (
                  <tr
                    key={`${r.place}-${r.login}`}
                    className={
                      r.login === login
                        ? "bg-[color-mix(in_oklab,var(--sbd-red),transparent_92%)]"
                        : "transition-colors hover:bg-[color-mix(in_oklab,var(--sbd-card)_50%,transparent)]"
                    }
                  >
                    <td className="px-4 py-3 align-middle tabular-nums leading-snug text-[var(--sbd-muted)]">
                      {r.place}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3">
                        <span className="shrink-0 translate-y-px">
                          <PresetAvatar decorative avatarId={r.avatarId} size={40} />
                        </span>
                        <div className="min-w-0 flex-1 pt-px">
                          <div
                            className={`truncate text-[15px] font-medium leading-snug ${r.login === login ? "text-[var(--sbd-red)]" : "text-[var(--sbd-text)]"}`}
                          >
                            {r.login}
                          </div>
                          {r.nickname?.trim() ? (
                            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                              <span className="shrink-0 rounded border border-[color-mix(in_oklab,var(--sbd-red),transparent_75%)] bg-[color-mix(in_oklab,var(--sbd-red),transparent_90%)] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[color-mix(in_oklab,var(--sbd-red),transparent_10%)]">
                                позивний
                              </span>
                              <span className="truncate text-sm leading-snug text-[var(--sbd-muted)]">
                                {r.nickname.trim()}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 align-middle text-center">
                      {(r.pinnedAchievementIds ?? []).length > 0 ? (
                        <div
                          className="flex flex-wrap items-center justify-center gap-1"
                          aria-label="Закріплені досягнення"
                        >
                          {(r.pinnedAchievementIds ?? []).map((pid) => (
                            <span
                              key={pid}
                              className="inline-flex rounded-md border border-[var(--sbd-border)] bg-[var(--sbd-elevated)] p-0.5"
                              title={achTitleById.get(pid) ?? pid}
                            >
                              <AchievementIcon achievementId={pid} size={20} />
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 align-middle text-right tabular-nums leading-snug text-[var(--sbd-text)]">
                      <span className="inline-flex min-h-[28px] items-center justify-end font-display font-semibold">
                        {r.profileLevel ?? 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-right tabular-nums leading-snug text-[var(--sbd-text)]">
                      <span className="inline-flex min-h-[28px] items-center justify-end">
                        {r.score.toFixed(3)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
