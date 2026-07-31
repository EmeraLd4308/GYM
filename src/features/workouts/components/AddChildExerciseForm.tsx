"use client";

import { useState } from "react";
import {
  uiButtonGhostSmClass,
  uiButtonPrimarySmClass,
  uiInputClass,
} from "@/shared/ui/styles";

export function AddChildExerciseForm({
  onAdd,
}: {
  onAdd: (name: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-dashed border-[color-mix(in_oklab,var(--sbd-red),transparent_50%)] bg-[color-mix(in_oklab,var(--sbd-red),transparent_95%)] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[var(--sbd-red)] transition hover:border-[var(--sbd-red)] hover:bg-[color-mix(in_oklab,var(--sbd-red),transparent_88%)]"
        onClick={() => setOpen(true)}
      >
        <PlusIcon />
        Дочірня вправа
      </button>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-dashed border-[color-mix(in_oklab,var(--sbd-red),transparent_60%)] bg-[color-mix(in_oklab,var(--sbd-card)_80%,transparent)] p-2.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <label htmlFor="child-ex-name" className="sr-only">
          Назва дочірньої вправи
        </label>
        <input
          id="child-ex-name"
          className={`${uiInputClass} min-w-0 flex-1`}
          placeholder="Назва дочірньої вправи"
          value={name}
          autoFocus
          disabled={busy}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submit();
            }
            if (e.key === "Escape") {
              setOpen(false);
              setName("");
            }
          }}
        />
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            className={uiButtonPrimarySmClass}
            disabled={busy}
            onClick={() => void submit()}
          >
            {busy ? "…" : "Додати"}
          </button>
          <button
            type="button"
            className={uiButtonGhostSmClass}
            disabled={busy}
            onClick={() => {
              setOpen(false);
              setName("");
            }}
          >
            Скасувати
          </button>
        </div>
      </div>
    </div>
  );

  async function submit() {
    if (busy) return;
    setBusy(true);
    try {
      const ok = await onAdd(name);
      if (ok) {
        setName("");
        setOpen(false);
      }
    } finally {
      setBusy(false);
    }
  }
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
