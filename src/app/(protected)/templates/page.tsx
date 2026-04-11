import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

const btnPrimary =
  "rounded-md bg-[#e31e24] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/25 transition hover:bg-[#c41a21] active:scale-[0.98]";

export default async function TemplatesPage() {
  const user = await getSessionUser();
  if (!user) return null;

  const templates = await prisma.workoutTemplate.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { exercises: true },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
            Шаблони тренувань
          </h1>
          <p className="mt-3 max-w-xl text-zinc-500">
            Структура на тиждень або окремі дні — як зручно. Шаблон можна вибрати при створенні
            тренування.
          </p>
        </div>
        <Link
          href="/templates/new"
          className={`${btnPrimary} inline-flex min-h-[44px] shrink-0 items-center justify-center`}
        >
          Новий шаблон
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="sbd-card rounded-xl p-8 text-center text-zinc-500">
          Шаблонів ще немає — створи перший кнопкою справа.
        </div>
      ) : (
        <ul className="sbd-card sbd-card-interactive divide-y divide-white/[0.06] overflow-hidden rounded-xl shadow-2xl shadow-black/50">
          {templates.map((t) => (
            <li key={t.id}>
              <Link
                href={`/templates/${t.id}`}
                className="flex flex-col gap-1 px-4 py-4 transition-colors duration-200 hover:bg-white/[0.04] sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="font-medium text-zinc-100">{t.name}</span>
                <span className="text-sm text-zinc-500">Вправ: {t.exercises.length}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
