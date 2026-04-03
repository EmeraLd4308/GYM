"use client";



import { arrayMove } from "@dnd-kit/sortable";

import { useRouter } from "next/navigation";

import { useState } from "react";

import { BASE_LIFT_OPTIONS } from "@/lib/base-lift";

import { ConfirmDialog } from "@/components/ConfirmDialog";

import { useToast } from "@/components/ToastProvider";



type Row = {

  /** Стабільний ключ для React (і id вправи з БД, якщо є). */

  clientKey: string;

  id?: string;

  name: string;

  baseLift: string;

};



const rowMoveBtn =

  "flex min-h-[40px] min-w-[40px] touch-manipulation items-center justify-center rounded border border-white/15 bg-black/40 text-base leading-none text-zinc-300 transition enabled:hover:border-[#e31e24]/35 enabled:hover:bg-[#e31e24]/10 enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-35";



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

    setRows((r) => [...r, { clientKey: `tpl-row-${Date.now()}-${r.length}`, name: "", baseLift: "NONE" }]);

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

    "mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2 text-zinc-100 outline-none focus:border-[#e31e24]/35";



  return (

    <div className="space-y-6">

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

        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500" htmlFor="tname">

          Назва шаблону

        </label>

        <input id="tname" className={field} value={name} onChange={(e) => setName(e.target.value)} />

      </div>



      <div className="space-y-3">

        <div className="flex items-center justify-between">

          <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">Вправи</h2>

          <button

            type="button"

            className="text-xs font-bold uppercase tracking-wider text-[#e31e24] hover:text-[#ff6b6b]"

            onClick={addRow}

          >

            + Додати вправу

          </button>

        </div>

        <ul className="space-y-3">

          {rows.map((row, i) => (

            <li

              key={row.clientKey}

              className="flex flex-col gap-2 rounded-xl border border-white/[0.07] bg-[#0c0c0c]/80 p-4 sm:flex-row sm:items-end"

            >

              <div className="flex shrink-0 items-stretch gap-2 sm:flex-col">

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

              <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-end">

                <div className="flex-1">

                  <label className="text-xs text-zinc-500">Назва</label>

                  <input

                    className={field}

                    value={row.name}

                    onChange={(e) => updateRow(i, { name: e.target.value })}

                    placeholder="Наприклад, Присід зі штангою"

                  />

                </div>

                <div className="w-full sm:w-48">

                  <label className="text-xs text-zinc-500">Базова для статистики</label>

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

                className="rounded-md border border-red-500/30 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-red-400 hover:bg-red-500/10"

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

        className="rounded-md bg-[#e31e24] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/30 hover:bg-[#c41a21] disabled:opacity-50"

        onClick={save}

      >

        Зберегти

      </button>

    </div>

  );

}


