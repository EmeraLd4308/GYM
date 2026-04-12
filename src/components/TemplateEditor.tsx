"use client";

import { arrayMove } from "@dnd-kit/sortable";

import { useRouter } from "next/navigation";

import { useState } from "react";

import { BASE_LIFT_OPTIONS } from "@/lib/base-lift";

import { ConfirmDialog } from "@/components/ConfirmDialog";

import { useToast } from "@/components/ToastProvider";

type Row = {
  clientKey: string;

  id?: string;

  name: string;

  baseLift: string;
};

const rowMoveBtn =
  "flex min-h-[40px] min-w-[40px] touch-manipulation items-center justify-center rounded border border-[var(--sbd-border)] bg-[var(--sbd-elevated)] text-base leading-none text-[var(--sbd-muted)] transition enabled:hover:border-[#e31e24]/35 enabled:hover:bg-[#e31e24]/10 enabled:hover:text-[var(--sbd-text)] disabled:cursor-not-allowed disabled:opacity-35";

export function TemplateEditor({
  templateId,

  initialName,

  initialRows,
}: {
  templateId?: string;

  initialName: string;

  initialRows: Array<{ id?: string; name: string; baseLift: string }>;
}) {
  const router = useRouter();

  const { error: toastError } = useToast();

  const [name, setName] = useState(initialName);

  const [rows, setRows] = useState<Row[]>(() => {
    if (initialRows.length) {
      return initialRows.map((r, i) => ({
        id: r.id,

        clientKey: r.id ?? `tpl-row-${i}`,

        name: r.name,

        baseLift: r.baseLift,
      }));
    }

    return [{ clientKey: "tpl-row-0", name: "", baseLift: "NONE" }];
  });

  const [loading, setLoading] = useState(false);

  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  function addRow() {
    setRows((r) => [
      ...r,
      { clientKey: `tpl-row-${Date.now()}-${r.length}`, name: "", baseLift: "NONE" },
    ]);
  }

  function removeRow(i: number) {
    setRows((r) => r.filter((_, j) => j !== i));
  }

  function moveRow(i: number, delta: -1 | 1) {
    const j = i + delta;

    if (j < 0 || j >= rows.length) return;

    setRows((r) => arrayMove(r, i, j));
  }

  function updateRow(i: number, patch: Partial<Pick<Row, "name" | "baseLift">>) {
    setRows((r) => r.map((row, j) => (j === i ? { ...row, ...patch } : row)));
  }

  async function save() {
    const exercises = rows

      .map((row) => ({
        name: row.name.trim(),

        baseLift: row.baseLift as "NONE" | "BENCH" | "SQUAT" | "DEADLIFT",
      }))

      .filter((e) => e.name.length > 0);

    if (!name.trim()) {
      toastError("Вкажіть назву шаблону.");

      return;
    }

    if (exercises.length === 0) {
      toastError("Додайте хоча б одну вправу.");

      return;
    }

    setLoading(true);

    try {
      if (templateId) {
        const res = await fetch(`/api/templates/${templateId}`, {
          method: "PATCH",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ name: name.trim(), exercises }),
        });

        const data = await res.json();

        if (!res.ok) {
          toastError(data.error ?? "Помилка збереження.");

          return;
        }
      } else {
        const res = await fetch("/api/templates", {
          method: "POST",

          headers: { "Content-Type": "application/json" },

          body: JSON.stringify({ name: name.trim(), exercises }),
        });

        const data = await res.json();

        if (!res.ok) {
          toastError(data.error ?? "Помилка збереження.");

          return;
        }

        if (data.template?.id) {
          router.push(`/templates/${data.template.id}`);

          router.refresh();

          return;
        }
      }

      router.push("/templates");

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  const field =
    "mt-1 w-full rounded-md border border-[var(--sbd-border)] bg-[var(--sbd-elevated)] px-3 py-2 text-[var(--sbd-text)] outline-none focus:border-[#e31e24]/40 focus:ring-1 focus:ring-[#e31e24]/15";

  return (
    <div className="space-y-6 sm:space-y-8">
      <ConfirmDialog
        open={removeIndex !== null}
        onClose={() => setRemoveIndex(null)}
        title="Прибрати вправу зі списку?"
        description="Рядок зникне з чернетки. Щоб зміни потрапили в збережений шаблон, натисни «Зберегти»."
        confirmLabel="Прибрати"
        cancelLabel="Скасувати"
        danger
        onConfirm={() => {
          if (removeIndex !== null) removeRow(removeIndex);
        }}
      />

      <div>
        <label
          className="text-xs font-semibold uppercase tracking-wider text-[var(--sbd-muted)]"
          htmlFor="tname"
        >
          Назва шаблону
        </label>

        <input
          id="tname"
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-[var(--sbd-text)]">
            Вправи
          </h2>

          <button
            type="button"
            className="min-h-[44px] touch-manipulation self-start rounded-lg px-1 text-left text-xs font-bold uppercase tracking-wider text-[#e31e24] hover:bg-[#e31e24]/[0.08] hover:text-[#c41a21] sm:min-h-0 sm:self-auto sm:px-0 sm:text-right"
            onClick={addRow}
          >
            + Додати вправу
          </button>
        </div>

        <ul className="space-y-4">
          {rows.map((row, i) => (
            <li
              key={row.clientKey}
              className="flex flex-col gap-4 rounded-xl border border-[var(--sbd-border)] bg-[var(--sbd-card)] p-4 shadow-sm sm:flex-row sm:items-end sm:gap-3 sm:p-5"
            >
              <div className="flex shrink-0 flex-row justify-center gap-2 sm:flex-col sm:justify-start">
                <button
                  type="button"
                  className={rowMoveBtn}
                  aria-label="Вправу вгору"
                  disabled={i === 0}
                  onClick={() => moveRow(i, -1)}
                >
                  ↑
                </button>

                <button
                  type="button"
                  className={rowMoveBtn}
                  aria-label="Вправу вниз"
                  disabled={i >= rows.length - 1}
                  onClick={() => moveRow(i, 1)}
                >
                  ↓
                </button>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-[var(--sbd-muted)]">Назва</label>

                  <input
                    className={field}
                    value={row.name}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    placeholder="Наприклад, Присід зі штангою"
                  />
                </div>

                <div className="w-full sm:w-48">
                  <label className="text-xs font-medium text-[var(--sbd-muted)]">
                    Базова для статистики
                  </label>

                  <select
                    className={field}
                    value={row.baseLift}
                    onChange={(e) => updateRow(i, { baseLift: e.target.value })}
                  >
                    {BASE_LIFT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="min-h-[44px] w-full rounded-md border border-red-500/40 bg-transparent px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-red-500 transition hover:bg-red-500/10 sm:min-h-0 sm:w-auto sm:self-end sm:px-3 sm:py-2"
                onClick={() => setRemoveIndex(i)}
              >
                Видалити
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        disabled={loading}
        className="w-full min-h-[52px] rounded-xl bg-[#e31e24] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/30 transition hover:bg-[#c41a21] active:scale-[0.99] disabled:opacity-50 sm:w-auto sm:min-h-0 sm:rounded-md"
        onClick={save}
      >
        Зберегти
      </button>
    </div>
  );
}
