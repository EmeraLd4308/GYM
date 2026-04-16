"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { todayDateInput, tomorrowDateInput, yesterdayDateInput } from "@/lib/date-local";
import { SbdLoadingPortal } from "@/components/SbdLoadingPortal";
import { templateOptionLabel } from "@/lib/template-author-label";
type Tpl = {
  id: string;
  name: string;
  userId: string;
  user: { login: string; nickname: string | null };
};

type TemplateSummary = { total: number; mine: number; others: number };

const field =
  "mt-2 w-full min-h-[52px] rounded-xl border border-white/10 bg-black/40 px-3 py-3 text-base text-zinc-100 outline-none transition focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/15 md:min-h-0 md:text-sm";

const label =
  "text-xs font-semibold uppercase tracking-wider text-zinc-500";

const chip =
  "inline-flex min-h-11 touch-manipulation items-center justify-center rounded-lg border border-white/[0.1] bg-white/[0.04] px-3.5 text-xs font-semibold text-zinc-300 transition hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10 hover:text-white active:scale-[0.98]";

const chipActive =
  "border-[#e31e24]/45 bg-[#e31e24]/15 text-white shadow-inner shadow-black/20";

export function NewWorkoutForm({
  templates,
  currentUserId,
  templateSummary,
}: {
  templates: Tpl[];
  currentUserId: string;
  templateSummary?: TemplateSummary;
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
        router.refresh();
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
        subMessage="Зачекай, відкриємо сторінку лише коли вона повністю завантажиться…"
      />
      <section className="rounded-xl border border-white/[0.06] bg-black/20 p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <span className={`${label} text-[#e31e24]/90`}>1</span>
            <h2
              id="new-wo-date-heading"
              className="mt-1 font-display text-base font-bold uppercase tracking-wide text-[var(--sbd-text)]"
            >
              Дата
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
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
        <label className={`mt-4 block ${label}`} htmlFor="wdate">
          Або обери в календарі
        </label>
        <input
          id="wdate"
          type="date"
          className={field}
          aria-labelledby="new-wo-date-heading"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </section>

      <section className="rounded-xl border border-white/[0.06] bg-black/20 p-4 sm:p-5">
        <span className={`${label} text-[#e31e24]/90`}>2</span>
        <h2
          id="new-wo-tpl-heading"
          className="mt-1 font-display text-base font-bold uppercase tracking-wide text-[var(--sbd-text)]"
        >
          Шаблон
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-zinc-500">
          Необовʼязково. Назва тренування підставиться з шаблону, якщо не вкажеш свою нижче.
        </p>
        {templateSummary && templateSummary.total > 0 ? (
          <p className="mt-1 text-[11px] text-zinc-500">
            У списку:{" "}
            <span className="text-zinc-500">
              {templateSummary.mine > 0 ? `${templateSummary.mine} твоїх` : null}
              {templateSummary.mine > 0 && templateSummary.others > 0 ? ", " : null}
              {templateSummary.others > 0 ? `${templateSummary.others} інших` : null}
            </span>
          </p>
        ) : null}
        <select
          id="tpl"
          className={`${field} mt-3`}
          aria-labelledby="new-wo-tpl-heading"
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          <option value="">Порожнє тренування (без вправ з шаблону)</option>
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
        <span className={`${label} text-[#e31e24]/90`}>3</span>
        <h2
          id="new-wo-title-heading"
          className="mt-1 font-display text-base font-bold uppercase tracking-wide text-[var(--sbd-text)]"
        >
          Назва
        </h2>
        <p className="mt-1 text-xs text-zinc-500">Необовʼязково — можна залишити порожнім.</p>
        <label className={`${label} mt-3 block`} htmlFor="title">
          Власна назва
        </label>
        <input
          id="title"
          className={`${field} mt-2`}
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <button
          type="button"
          disabled={loading}
          aria-busy={loading}
          className="inline-flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-xl bg-[#e31e24] px-6 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-red-950/30 transition hover:bg-[#c41a21] active:scale-[0.99] disabled:opacity-50 sm:w-auto sm:min-w-[200px]"
          onClick={submit}
        >
          Створити тренування
        </button>
      </div>
    </div>
  );
}
