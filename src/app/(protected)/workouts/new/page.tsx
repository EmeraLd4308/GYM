import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { NewWorkoutForm } from "@/components/NewWorkoutForm";

const btnGhost =
  "inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/[0.12] bg-white/[0.04] px-4 text-sm font-semibold text-zinc-200 transition hover:border-[#e31e24]/35 hover:bg-[#e31e24]/10";

export default async function NewWorkoutPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const templates = await prisma.workoutTemplate.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      userId: true,
      user: { select: { login: true, nickname: true } },
    },
  });

  const mineCount = templates.filter((t) => t.userId === user.id).length;
  const othersCount = templates.length - mineCount;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-sm leading-relaxed text-zinc-500 md:text-base">
            Обери дату (можна наперед), за потреби шаблон — після створення додаси вправи та підходи.
            Шаблони доступні всім; у формі нижче свої та чужі згруповані окремо.
          </p>
        </div>
        <Link href="/templates/new" className={`${btnGhost} shrink-0 self-start`}>
          Новий шаблон
        </Link>
      </div>

      <div className="sbd-card overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
        <div className="border-b border-white/[0.06] bg-[#e31e24]/[0.08] px-5 py-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Крок 1 — параметри
          </p>
          <p className="mt-1 text-sm text-zinc-400">
            {templates.length === 0
              ? "Шаблонів ще немає — тренування буде порожнім, вправи додаси вручну."
              : mineCount > 0 && othersCount > 0
                ? `Доступно шаблонів: ${mineCount} твоїх, ${othersCount} від інших.`
                : mineCount > 0
                  ? `Усі ${mineCount} шаблон(ів) на сторінці — твої.`
                  : `${othersCount} шаблон(ів) від інших авторів.`}
          </p>
        </div>
        <div className="p-5 sm:p-6 md:p-8">
          <NewWorkoutForm
            templates={templates}
            currentUserId={user.id}
            templateSummary={{ total: templates.length, mine: mineCount, others: othersCount }}
          />
        </div>
      </div>
    </div>
  );
}
