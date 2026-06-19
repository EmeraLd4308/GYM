"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { todayDateInput, tomorrowDateInput, yesterdayDateInput } from "@/shared/lib/date-local";
import { SbdLoadingPortal } from "@/shared/ui/SbdLoadingPortal";
import { templateOptionLabel } from "@/features/templates/lib/template-author-label";
import {
  uiBtnRowClass,
  uiButtonPrimaryLgClass,
  uiChipClass,
  uiDateClass,
  uiInputClass,
  uiLabelClass,
  uiSelectMdClass,
} from "@/shared/ui/styles";

type Tpl = {
  id: string;
  name: string;
  userId: string;
  user: { login: string; nickname: string | null };
};

const chip = uiChipClass;

const chipActive =
  "border-[color-mix(in_oklab,var(--sbd-red),transparent_52%)] bg-[color-mix(in_oklab,var(--sbd-red),transparent_82%)] text-[var(--sbd-text)] shadow-inner shadow-black/20";

export function NewWorkoutForm({
  templates,
  currentUserId,
}: {
  templates: Tpl[];
  currentUserId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const pendingWorkoutId = useRef<string | null>(null);
  const [templateId, setTemplateId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayDateInput);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const id = pendingWorkoutId.current;
    if (!id || !loading) return;
    if (pathname === `/workouts/${id}`) {
      pendingWorkoutId.current = null;
      setLoading(false);
    }
  }, [pathname, loading]);

  const mine = templates
    .filter((t) => t.userId === currentUserId)
    .sort((a, b) => a.name.localeCompare(b.name, "uk"));
  const others = templates
    .filter((t) => t.userId !== currentUserId)
    .sort((a, b) => a.name.localeCompare(b.name, "uk"));

  const today = todayDateInput();
  const yesterday = yesterdayDateInput();
  const tomorrow = tomorrowDateInput();

  async function submit() {
    setError(null);
    setLoading(true);
    pendingWorkoutId.current = null;
    try {
      const body: { templateId?: string; title?: string; date: string } = {
        date,
      };
      if (templateId) body.templateId = templateId;
      if (title.trim()) body.title = title.trim();
      const res = await fetch("/api/workouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Помилка.");
        setLoading(false);
        return;
      }
      const wid = data.workout?.id as string | undefined;
      if (wid) {
        pendingWorkoutId.current = wid;
        router.push(`/workouts/${wid}`);
        window.setTimeout(() => {
          if (pendingWorkoutId.current === wid) {
            pendingWorkoutId.current = null;
            setLoading(false);
            setError(
              "Сторінка тренування не відкрилася вчасно. Перевір мережу або знайди запис у «Тренуваннях».",
            );
          }
        }, 40_000);
        return;
      }
      setLoading(false);
    } catch {
      setError("Не вдалося з’єднатися з сервером.");
      setLoading(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-xl space-y-8">
      <SbdLoadingPortal
        open={loading}
        message="Створюємо тренування"
        subMessage="Відкриваємо сторінку тренування…"
      />
      <section className="rounded-xl border border-white/[0.06] bg-black/20 p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div>
            <span className={`${uiLabelClass} text-[var(--sbd-red)]/90`}>1</span>
            <h2
              id="new-wo-date-heading"
              className="mt-1 font-display text-base font-bold uppercase tracking-wide text-[var(--sbd-text)]"
            >
              Дата
            </h2>
          </div>
          <div className={uiBtnRowClass}>
            <button
              type="button"
              className={`${chip} ${date === yesterday ? chipActive : ""}`}
              onClick={() => setDate(yesterday)}
            >
              Вчора
            </button>
            <button
              type="button"
              className={`${chip} ${date === today ? chipActive : ""}`}
              onClick={() => setDate(today)}
            >
              Сьогодні
            </button>
            <button
              type="button"
              className={`${chip} ${date === tomorrow ? chipActive : ""}`}
              onClick={() => setDate(tomorrow)}
            >
              Завтра
            </button>
          </div>
        </div>
        <label className={`mt-4 block ${uiLabelClass} sr-only`} htmlFor="wdate">
          Дата в календарі
        </label>
        <input
          id="wdate"
          type="date"
          className={`${uiDateClass} mt-2`}
          aria-labelledby="new-wo-date-heading"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </section>

      <section className="rounded-xl border border-white/[0.06] bg-black/20 p-4 sm:p-5">
        <span className={`${uiLabelClass} text-[var(--sbd-red)]/90`}>2</span>
        <h2
          id="new-wo-tpl-heading"
          className="mt-1 font-display text-base font-bold uppercase tracking-wide text-[var(--sbd-text)]"
        >
          Шаблон
        </h2>
        <select
          id="tpl"
          className={`${uiSelectMdClass} mt-3`}
          aria-labelledby="new-wo-tpl-heading"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          <option value="">Без шаблону</option>
          {mine.length > 0 ? (
            <optgroup label="Мої шаблони">
              {mine.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </optgroup>
          ) : null}
          {others.length > 0 ? (
            <optgroup label="Інші автори">
              {others.map((t) => (
                <option key={t.id} value={t.id}>
                  {templateOptionLabel(t.name, t.user)}
                </option>
              ))}
            </optgroup>
          ) : null}
        </select>
      </section>

      <section className="rounded-xl border border-white/[0.06] bg-black/20 p-4 sm:p-5">
        <span className={`${uiLabelClass} text-[var(--sbd-red)]/90`}>3</span>
        <h2
          id="new-wo-title-heading"
          className="mt-1 font-display text-base font-bold uppercase tracking-wide text-[var(--sbd-text)]"
        >
          Назва
        </h2>
        <label className={`${uiLabelClass} mt-3 block sr-only`} htmlFor="title">
          Власна назва
        </label>
        <input
          id="title"
          className={`${uiInputClass} mt-2`}
          aria-labelledby="new-wo-title-heading"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Наприклад: Понеділок — ноги"
          maxLength={200}
        />
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      ) : null}

      <div className={`flex flex-col gap-3 sm:flex-row sm:justify-end ${uiBtnRowClass}`}>
        <button
          type="button"
          disabled={loading}
          aria-busy={loading}
          className={`${uiButtonPrimaryLgClass} w-full sm:w-auto sm:min-w-[12rem]`}
          onClick={submit}
        >
          Створити тренування
        </button>
      </div>
    </div>
  );
}
