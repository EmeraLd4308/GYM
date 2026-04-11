"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { todayDateInput } from "@/lib/date-local";

type Tpl = { id: string; name: string };

const field =
  "mt-1 w-full rounded-md border border-white/10 bg-black/40 px-3 py-2.5 text-zinc-100 outline-none transition focus:border-[#e31e24]/40 focus:ring-2 focus:ring-[#e31e24]/15";

export function NewWorkoutForm({ templates }: { templates: Tpl[] }) {
  const router = useRouter();
  const [templateId, setTemplateId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(todayDateInput);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
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
        return;
      }
      if (data.workout?.id) {
        router.push(`/workouts/${data.workout.id}`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <label
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
          htmlFor="wdate"
        >
          Дата тренування
        </label>
        <input
          id="wdate"
          type="date"
          className={field}
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-zinc-600">
          Можна обрати будь-який день — у тому числі наперед. Статистика йде за цією датою.
        </p>
      </div>
      <div>
        <label
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
          htmlFor="tpl"
        >
          Шаблон (необов&apos;язково)
        </label>
        <select
          id="tpl"
          className={field}
          value={templateId}
          onChange={(e) => setTemplateId(e.target.value)}
        >
          <option value="">— Порожнє тренування —</option>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          className="text-xs font-semibold uppercase tracking-wider text-zinc-500"
          htmlFor="title"
        >
          Назва (необов&apos;язково)
        </label>
        <input
          id="title"
          className={field}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Наприклад, Понеділок — ноги"
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        type="button"
        disabled={loading}
        className="rounded-md bg-[#e31e24] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/30 transition hover:bg-[#c41a21] disabled:opacity-50"
        onClick={submit}
      >
        Створити
      </button>
    </div>
  );
}
