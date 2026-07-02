"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "@/shared/ui/ConfirmDialog";
import { useToast } from "@/shared/shell/ToastProvider";

export function TemplateListRow({
  id,
  name,
  exerciseCount,
  isOwn,
  user,
}: {
  id: string;
  name: string;
  exerciseCount: number;
  isOwn: boolean;
  user: { login: string; nickname: string | null };
}) {
  const router = useRouter();
  const { error: toastError, success: toastSuccess } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function deleteTemplate() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/templates/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toastError((data as { error?: string }).error ?? "Не вдалося видалити.");
        return;
      }
      toastSuccess("Шаблон видалено.");
      setConfirmOpen(false);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <li
      className={`group sbd-template-list-row${isOwn ? " sbd-template-list-row--own" : ""}`}
    >
      <div className="flex items-center gap-2 pr-3 sm:pr-4">
        <Link
          href={`/templates/${id}`}
          className="sbd-template-row flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium text-[var(--sbd-text)]">{name}</p>
            <p className="mt-1 text-xs leading-snug text-zinc-500">
              {isOwn ? (
                <span className="font-medium text-zinc-400">мій</span>
              ) : (
                <span className="font-medium text-zinc-400">{user.login}</span>
              )}
            </p>
          </div>
          <div className="shrink-0 text-right text-xs tabular-nums text-zinc-500">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-600 sm:inline sm:mr-1.5">
              Вправ
            </span>
            <span className="text-sm font-semibold text-zinc-400">{exerciseCount}</span>
          </div>
        </Link>

        {isOwn ? (
          <>
            <button
              type="button"
              className="shrink-0 touch-manipulation rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 transition hover:bg-red-500/10 hover:text-red-400"
              onClick={() => setConfirmOpen(true)}
            >
              Видалити
            </button>
            <ConfirmDialog
              open={confirmOpen}
              onClose={() => setConfirmOpen(false)}
              title="Видалити шаблон?"
              description="Дію не скасувати. Усі вправи цього шаблону зникнуть."
              confirmLabel={deleting ? "…" : "Видалити"}
              cancelLabel="Скасувати"
              danger
              onConfirm={() => deleteTemplate()}
            />
          </>
        ) : null}
      </div>
    </li>
  );
}
