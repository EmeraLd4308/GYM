"use client";

import { arrayMove } from "@/shared/lib/array-move";

import { useRouter } from "next/navigation";

import { useState } from "react";

import { BASE_LIFT_OPTIONS } from "@/features/workouts/lib/base-lift";

import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import {
  uiBtnRowMobileStackClass,
  uiButtonDangerIconClass,
  uiButtonDangerTextClass,
  uiButtonIconClass,
  uiButtonPrimaryClass,
  uiFieldErrorClass,
  uiInputClass,
  uiLabelClass,
  uiSelectClass,
} from "@/shared/ui/styles";
import { IconArrowDown, IconArrowUp, IconClose } from "@/shared/ui/icons";

import { useToast } from "@/shared/shell/ToastProvider";

type Row = {
  clientKey: string;

  id?: string;

  name: string;

  baseLift: string;
};

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

  const { error: toastError, success: toastSuccess } = useToast();

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
  const [deleteTemplateOpen, setDeleteTemplateOpen] = useState(false);
  const [deletingTemplate, setDeletingTemplate] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [exerciseError, setExerciseError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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
    setNameError(null);
    setExerciseError(null);
    setSaveError(null);

    const exercises = rows

      .map((row) => ({
        name: row.name.trim(),

        baseLift: row.baseLift as "NONE" | "BENCH" | "SQUAT" | "DEADLIFT",
      }))

      .filter((e) => e.name.length > 0);

    if (!name.trim()) {
      const message = "Вкажіть назву шаблону.";
      setNameError(message);
      toastError(message);

      return;
    }

    if (exercises.length === 0) {
      const message = "Додайте хоча б одну вправу.";
      setExerciseError(message);
      toastError(message);

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
          const message = data.error ?? "Помилка збереження.";
          setSaveError(message);
          toastError(message);

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
          const message = data.error ?? "Помилка збереження.";
          setSaveError(message);
          toastError(message);

          return;
        }

        if (data.template?.id) {
          router.push(`/templates/${data.template.id}`);
          return;
        }
      }

      router.push("/templates");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTemplate() {
    if (!templateId) return;
    setDeletingTemplate(true);
    try {
      const res = await fetch(`/api/templates/${templateId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toastError((data as { error?: string }).error ?? "Не вдалося видалити.");
        return;
      }
      toastSuccess("Шаблон видалено.");
      setDeleteTemplateOpen(false);
      router.push("/templates");
    } finally {
      setDeletingTemplate(false);
    }
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <ConfirmDialog
        open={removeIndex !== null}
        onClose={() => setRemoveIndex(null)}
        title="Прибрати вправу зі списку?"
        description="Рядок зникне з чернетки."
        confirmLabel="Прибрати"
        cancelLabel="Скасувати"
        danger
        onConfirm={() => {
          if (removeIndex !== null) removeRow(removeIndex);
        }}
      />

      {templateId ? (
        <ConfirmDialog
          open={deleteTemplateOpen}
          onClose={() => setDeleteTemplateOpen(false)}
          title="Видалити весь шаблон?"
          description="Усі вправи та сам шаблон будуть видалені без відновлення."
          confirmLabel={deletingTemplate ? "…" : "Видалити"}
          cancelLabel="Скасувати"
          danger
          onConfirm={() => deleteTemplate()}
        />
      ) : null}

      <div>
        <label
          className={uiLabelClass}
          htmlFor="tname"
        >
          Назва шаблону
        </label>

        <input
          id="tname"
          className={`mt-1 ${uiInputClass}`}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError(null);
            if (saveError) setSaveError(null);
          }}
          aria-invalid={nameError ? "true" : "false"}
          aria-describedby={nameError ? "template-name-error" : undefined}
        />
        {nameError ? (
          <p id="template-name-error" className={uiFieldErrorClass} role="alert">
            {nameError}
          </p>
        ) : null}
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
              className="rounded-xl border border-[var(--sbd-border)] bg-[var(--sbd-card)] p-4 shadow-sm sm:p-5"
            >
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--sbd-border)] pb-3">
                <div className="flex items-center gap-2">
                  <p className={`${uiLabelClass} text-[10px]`}>Порядок</p>
                  <div className="flex flex-row gap-1">
                    <button
                      type="button"
                      className={uiButtonIconClass}
                      aria-label="Вправу вгору"
                      disabled={i === 0}
                      onClick={() => moveRow(i, -1)}
                    >
                      <IconArrowUp />
                    </button>
                    <button
                      type="button"
                      className={uiButtonIconClass}
                      aria-label="Вправу вниз"
                      disabled={i >= rows.length - 1}
                      onClick={() => moveRow(i, 1)}
                    >
                      <IconArrowDown />
                    </button>
                  </div>
                </div>
                <button
                  type="button"
                  className={uiButtonDangerIconClass}
                  aria-label="Видалити вправу"
                  onClick={() => setRemoveIndex(i)}
                >
                  <IconClose />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div className="min-w-0 w-full">
                  <label className="text-xs font-medium text-[var(--sbd-muted)]">Назва</label>
                  <input
                    className={`mt-1 ${uiInputClass} w-full`}
                    value={row.name}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    placeholder="Наприклад, Присід зі штангою"
                  />
                </div>

                <div className="min-w-0 w-full">
                  <label className="text-xs font-medium text-[var(--sbd-muted)]">
                    Базова для статистики
                  </label>
                  <select
                    className={`mt-1 ${uiSelectClass} w-full`}
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
            </li>
          ))}
        </ul>
        {exerciseError ? (
          <p className={uiFieldErrorClass} role="alert">
            {exerciseError}
          </p>
        ) : null}
      </div>

      <div className={`${uiBtnRowMobileStackClass} sm:flex-nowrap`}>
        {saveError ? (
          <p className={`${uiFieldErrorClass} basis-full`} role="alert">
            {saveError}
          </p>
        ) : null}
        <button
          type="button"
          disabled={loading}
          className={uiButtonPrimaryClass}
          onClick={save}
        >
          Зберегти
        </button>
        {templateId ? (
          <button
            type="button"
            disabled={loading || deletingTemplate}
            className={uiButtonDangerTextClass}
            onClick={() => setDeleteTemplateOpen(true)}
          >
            Видалити шаблон
          </button>
        ) : null}
      </div>
    </div>
  );
}
