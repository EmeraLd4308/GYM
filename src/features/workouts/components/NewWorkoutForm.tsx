"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { todayDateInput, tomorrowDateInput, yesterdayDateInput } from "@/shared/lib/date-local";
import { SbdLoadingPortal } from "@/shared/ui/SbdLoadingPortal";
import { templateOptionLabel } from "@/features/templates/lib/template-author-label";
import { baseLiftLabel } from "@/features/workouts/lib/base-lift";
import {
  NewWorkoutCustomExercises,
  parseDraftExercises,
  type DraftExercise,
} from "@/features/workouts/components/NewWorkoutCustomExercises";
import { useToast } from "@/shared/shell/ToastProvider";
import type { BaseLift } from "@prisma/client";
import {
  uiBtnRowClass,
  uiBtnRowMobileStackClass,
  uiFormActionsEndClass,
  uiButtonPrimaryLgClass,
  uiButtonGhostSmClass,
  uiButtonSecondaryClass,
  uiChipClass,
  uiCheckboxLgClass,
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

type TemplateExerciseRow = {
  id: string;
  name: string;
  baseLift: BaseLift;
  sortOrder: number;
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
  const { success: toastSuccess } = useToast();
  const pendingWorkoutId = useRef<string | null>(null);
  const [templateId, setTemplateId] = useState<string>("");
  const [customExercises, setCustomExercises] = useState<DraftExercise[]>([]);
  const [templateExercises, setTemplateExercises] = useState<TemplateExerciseRow[]>([]);
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<Set<string>>(new Set());
  const [loadingTemplate, setLoadingTemplate] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayDateInput);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    const id = pendingWorkoutId.current;
    if (!id || !loading) return;
    if (pathname === `/workouts/${id}`) {
      pendingWorkoutId.current = null;
      setLoading(false);
    }
  }, [pathname, loading]);

  useEffect(() => {
    if (!templateId) {
      setTemplateExercises([]);
      setSelectedExerciseIds(new Set());
      setLoadingTemplate(false);
      return;
    }

    let cancelled = false;
    setLoadingTemplate(true);
    setTemplateExercises([]);
    setSelectedExerciseIds(new Set());

    void fetch(`/api/templates/${templateId}`)
      .then(async (res) => {
        const data = (await res.json()) as {
          template?: { exercises: TemplateExerciseRow[] };
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Не вдалося завантажити шаблон.");
        return data.template?.exercises ?? [];
      })
      .then((exercises) => {
        if (cancelled) return;
        setTemplateExercises(exercises);
        setSelectedExerciseIds(new Set(exercises.map((e) => e.id)));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Не вдалося завантажити шаблон.");
      })
      .finally(() => {
        if (!cancelled) setLoadingTemplate(false);
      });

    return () => {
      cancelled = true;
    };
  }, [templateId]);

  const mine = templates
    .filter((t) => t.userId === currentUserId)
    .sort((a, b) => a.name.localeCompare(b.name, "uk"));
  const others = templates
    .filter((t) => t.userId !== currentUserId)
    .sort((a, b) => a.name.localeCompare(b.name, "uk"));

  const today = todayDateInput();
  const yesterday = yesterdayDateInput();
  const tomorrow = tomorrowDateInput();

  const allSelected =
    templateExercises.length > 0 && selectedExerciseIds.size === templateExercises.length;
  const noneSelected = selectedExerciseIds.size === 0;

  function toggleExercise(id: string, checked: boolean) {
    setSelectedExerciseIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function setAllExercises(selected: boolean) {
    if (selected) {
      setSelectedExerciseIds(new Set(templateExercises.map((e) => e.id)));
    } else {
      setSelectedExerciseIds(new Set());
    }
  }

  function customExercisePayload() {
    return parseDraftExercises(customExercises);
  }

  async function saveAsNewTemplate() {
    setError(null);
    const exercises = customExercisePayload();
    if (exercises.length === 0) {
      setError("Додай хоча б одну вправу, щоб зберегти шаблон.");
      return;
    }
    const templateName = title.trim();
    if (!templateName) {
      setError("Вкажи назву шаблону в полі «Назва».");
      return;
    }

    setSavingTemplate(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: templateName, exercises }),
      });
      const data = (await res.json()) as { template?: { id: string }; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Не вдалося зберегти шаблон.");
        return;
      }
      const tid = data.template?.id;
      if (!tid) {
        setError("Шаблон збережено, але не вдалося відкрити його.");
        return;
      }
      toastSuccess("Шаблон збережено");
      router.push(`/templates/${tid}`);
    } catch {
      setError("Не вдалося з’єднатися з сервером.");
    } finally {
      setSavingTemplate(false);
    }
  }

  async function submit() {
    setError(null);
    if (templateId && templateExercises.length > 0 && selectedExerciseIds.size === 0) {
      setError("Оберіть хоча б одну вправу з шаблону.");
      return;
    }
    setLoading(true);
    pendingWorkoutId.current = null;
    try {
      const body: {
        templateId?: string;
        templateExerciseIds?: string[];
        exercises?: Array<{ name: string; baseLift: BaseLift }>;
        title?: string;
        date: string;
      } = { date };
      if (templateId) {
        body.templateId = templateId;
        body.templateExerciseIds = Array.from(selectedExerciseIds);
      } else {
        const exercises = customExercisePayload();
        if (exercises.length > 0) body.exercises = exercises;
      }
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
          onChange={(e) => {
            const next = e.target.value;
            setTemplateId(next);
            if (next) setCustomExercises([]);
          }}
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

        {templateId ? (
          <div className="mt-4 border-t border-white/[0.06] pt-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3
                id="new-wo-tpl-ex-heading"
                className="text-sm font-semibold text-[var(--sbd-text)]"
              >
                Вправи з шаблону
              </h3>
              {templateExercises.length > 0 ? (
                <div className={`${uiBtnRowMobileStackClass} shrink-0`}>
                  <button
                    type="button"
                    className={uiButtonGhostSmClass}
                    disabled={allSelected}
                    onClick={() => setAllExercises(true)}
                  >
                    Усі
                  </button>
                  <button
                    type="button"
                    className={uiButtonGhostSmClass}
                    disabled={noneSelected}
                    onClick={() => setAllExercises(false)}
                  >
                    Жодної
                  </button>
                </div>
              ) : null}
            </div>

            {loadingTemplate ? (
              <p className="mt-3 text-sm text-[var(--sbd-muted)]">Завантажуємо вправи…</p>
            ) : templateExercises.length === 0 ? (
              <p className="mt-3 text-sm text-[var(--sbd-muted)]">У шаблоні немає вправ.</p>
            ) : (
              <ul
                className="mt-3 space-y-2"
                role="group"
                aria-labelledby="new-wo-tpl-ex-heading"
              >
                {templateExercises.map((ex) => (
                  <li key={ex.id}>
                    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-white/[0.06] bg-black/15 px-3 py-2.5 touch-manipulation transition-colors hover:bg-white/[0.03]">
                      <input
                        type="checkbox"
                        className={uiCheckboxLgClass}
                        checked={selectedExerciseIds.has(ex.id)}
                        onChange={(e) => toggleExercise(ex.id, e.target.checked)}
                      />
                      <span className="min-w-0 flex-1 text-sm text-[var(--sbd-text)]">
                        {ex.name}
                      </span>
                      {ex.baseLift !== "NONE" ? (
                        <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs text-[var(--sbd-muted)]">
                          {baseLiftLabel(ex.baseLift)}
                        </span>
                      ) : null}
                    </label>
                  </li>
                ))}
              </ul>
            )}

            {templateExercises.length > 0 && noneSelected ? (
              <p className="mt-2 text-sm text-[color-mix(in_oklab,var(--sbd-red),white_22%)]">
                Оберіть хоча б одну вправу.
              </p>
            ) : null}

            {templateExercises.length > 0 ? (
              <p className="mt-3 text-xs text-[var(--sbd-muted)]">
                Для небазових вправ ваги та повтори підставляться з останнього запису в історії.
              </p>
            ) : null}
          </div>
        ) : (
          <NewWorkoutCustomExercises rows={customExercises} onChange={setCustomExercises} />
        )}
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
        {!templateId ? (
          <p className="mt-2 text-xs text-[var(--sbd-muted)]">
            Для збереження шаблону вкажи назву тут — вона стане назвою шаблону.
          </p>
        ) : null}
      </section>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/35 bg-red-950/40 px-4 py-3 text-sm text-red-200"
        >
          {error}
        </div>
      ) : null}

      <div className={`${uiFormActionsEndClass} flex-col gap-3 sm:flex-row`}>
        {!templateId ? (
          <button
            type="button"
            disabled={loading || savingTemplate || loadingTemplate}
            aria-busy={savingTemplate}
            className={`${uiButtonSecondaryClass} min-h-12 w-full rounded-xl px-5 text-sm font-semibold sm:w-auto`}
            onClick={() => void saveAsNewTemplate()}
          >
            {savingTemplate ? "Зберігаємо шаблон…" : "Зберегти як новий шаблон"}
          </button>
        ) : null}
        <button
          type="button"
          disabled={loading || savingTemplate || loadingTemplate}
          aria-busy={loading}
          className={`${uiButtonPrimaryLgClass} w-full sm:w-auto`}
          onClick={submit}
        >
          Створити тренування
        </button>
      </div>
    </div>
  );
}
