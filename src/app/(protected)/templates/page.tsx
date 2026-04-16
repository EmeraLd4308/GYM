import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { EmptyStateCallout } from "@/components/EmptyStateCallout";
import { TemplateListRow } from "@/components/TemplateListRow";
import { TemplatesListPagination } from "@/components/TemplatesListPagination";
const btnPrimary =
  "rounded-md bg-[#e31e24] px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-white shadow-lg shadow-red-950/25 transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:bg-[#c41a21] hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.48)] active:translate-y-0 active:scale-[0.98]";
const TEMPLATES_PAGE_SIZE = 12;

function getParam(
  sp: Record<string, string | string[] | undefined>,
  k: string,
): string | undefined {
  const v = sp[k];
  return typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;
}

export default async function TemplatesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const sp = await searchParams;
  const page = Math.max(1, parseInt(getParam(sp, "page") ?? "1", 10) || 1);

  const total = await prisma.workoutTemplate.count();
  const totalPages = Math.max(1, Math.ceil(total / TEMPLATES_PAGE_SIZE));
  const safePage = Math.min(Math.max(1, page), totalPages);
  if (page !== safePage) {
    redirect(safePage <= 1 ? "/templates" : `/templates?page=${safePage}`);
  }

  const templatesRaw = await prisma.workoutTemplate.findMany({
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * TEMPLATES_PAGE_SIZE,
    take: TEMPLATES_PAGE_SIZE,
    include: {
      exercises: true,
      user: { select: { id: true, login: true, nickname: true } },
    },
  });
  const templates = [...templatesRaw].sort((a, b) => {
    const ao = a.userId === user.id ? 0 : 1;
    const bo = b.userId === user.id ? 0 : 1;
    return ao - bo;
  });
  const pagePastEnd = templates.length === 0 && total > 0;

  return (
    <div className="sbd-stagger-children space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
            Шаблони тренувань
          </h1>
          <p className="mt-3 max-w-xl text-zinc-500">
            Усі бачать шаблони всіх; редагувати чи видаляти можна лише свої. Шаблон можна вибрати
            при створенні тренування.
          </p>
        </div>
        <Link
          href="/templates/new"
          className={`${btnPrimary} inline-flex min-h-[44px] shrink-0 items-center justify-center`}
        >
          Новий шаблон
        </Link>
      </div>

      {pagePastEnd ? (
        <div className="sbd-card rounded-xl p-6 sm:p-10">
          <EmptyStateCallout
            title="На цій сторінці нічого немає"
            description="Номер сторінки завеликий — повернись на початок списку шаблонів."
            nextSteps={["Усі шаблони починаються з першої сторінки — там актуальні записи."]}
          >
            <Link href="/templates" className={`${btnPrimary} inline-flex min-h-[48px] w-full max-w-sm items-center justify-center sm:w-auto`}>
              До початку списку
            </Link>
          </EmptyStateCallout>
        </div>
      ) : templates.length === 0 ? (
        <div className="sbd-card rounded-xl p-6 sm:p-10">
          <EmptyStateCallout
            title="Шаблонів поки немає"
            description="Шаблон зберігає набір вправ — його можна обрати при створенні тренування й не вводити все з нуля."
            nextSteps={[
              "Натисни «Новий шаблон», додай вправи й збережи.",
              "Потім у «Нове тренування» вибери цей шаблон зі списку.",
            ]}
          >
            <Link
              href="/templates/new"
              className={`${btnPrimary} inline-flex min-h-[52px] w-full max-w-sm items-center justify-center text-base sm:w-auto`}
            >
              Створити перший шаблон
            </Link>
            <Link
              href="/workouts/new"
              className="text-center text-sm font-semibold text-[#e31e24] underline-offset-2 hover:underline"
            >
              Або одразу нове тренування без шаблону
            </Link>
          </EmptyStateCallout>
        </div>
      ) : (
        <div className="sbd-card overflow-hidden rounded-xl shadow-2xl shadow-black/50">
          <ul className="sbd-card-interactive divide-y divide-white/[0.06]">
            {templates.map((t) => (
              <TemplateListRow
                key={t.id}
                id={t.id}
                name={t.name}
                exerciseCount={t.exercises.length}
                isOwn={t.userId === user.id}
                user={t.user}
              />
            ))}
          </ul>
          <TemplatesListPagination
            page={safePage}
            totalPages={totalPages}
            total={total}
            pageSize={TEMPLATES_PAGE_SIZE}
          />
        </div>
      )}
    </div>
  );
}
