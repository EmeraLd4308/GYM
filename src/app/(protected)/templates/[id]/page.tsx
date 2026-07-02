import { notFound } from "next/navigation";
import { prisma } from "@/shared/lib/prisma";
import { getSessionUser } from "@/shared/lib/auth";
import {
  TemplateAuthorInline,
  templateAuthorLabelClass,
} from "@/features/templates/components/TemplateAuthorByline";
import { TemplateEditor } from "@/features/templates/components/TemplateEditor";
import { baseLiftLabel } from "@/features/workouts/lib/base-lift";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { id } = await params;
  const template = await prisma.workoutTemplate.findFirst({
    where: { id },
    include: {
      exercises: { orderBy: { sortOrder: "asc" } },
      user: { select: { id: true, login: true, nickname: true } },
    },
  });
  if (!template) notFound();

  const isOwner = template.userId === user.id;
  if (!isOwner) {
    const authorNote = template.authorNote?.trim();
    const authorNick = template.user.login.trim();

    return (
      <div className="space-y-6">
        <p className="font-display text-lg font-semibold uppercase tracking-wide text-white">
          {template.name}
        </p>

        {authorNote ? (
          <div className="sbd-gl-preview relative overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--sbd-red),transparent_70%)] bg-[color-mix(in_oklab,var(--sbd-card)_15%,black)] px-4 py-5 shadow-xl shadow-black/50 sm:px-6 sm:py-5">
            <div
              className="sbd-gl-preview-deco pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[color-mix(in_oklab,var(--sbd-red),transparent_80%)] blur-3xl sm:-right-12 sm:-top-12 sm:h-40 sm:w-40"
              aria-hidden
            />
            <div
              className="sbd-gl-preview-deco pointer-events-none absolute -bottom-16 -left-10 h-28 w-28 rounded-full bg-[color-mix(in_oklab,var(--sbd-red),transparent_88%)] blur-3xl sm:h-32 sm:w-32"
              aria-hidden
            />
            <div className="relative">
              <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                <span className={templateAuthorLabelClass}>Уточнення від автора</span>
                {authorNick ? (
                  <>
                    <span className="text-[10px] text-[var(--sbd-muted)]" aria-hidden>
                      —
                    </span>
                    <TemplateAuthorInline user={template.user} />
                  </>
                ) : null}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--sbd-muted)]">
                {authorNote}
              </p>
            </div>
          </div>
        ) : null}

        <div className="sbd-card rounded-xl p-5 sm:p-6">
          <p className="mb-4 text-sm text-zinc-500">
            Чужий шаблон — лише перегляд. Використати при створенні тренування можна в розділі
            «Нове тренування».
          </p>
          <ul className="space-y-2">
            {template.exercises.map((e) => (
              <li key={e.id} className="flex flex-wrap justify-between gap-2 text-sm text-zinc-200">
                <span>{e.name}</span>
                <span className="text-zinc-500">{baseLiftLabel(e.baseLift)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const initialRows = template.exercises.map((e) => ({
    id: e.id,
    name: e.name,
    baseLift: e.baseLift,
  }));

  return (
    <div className="sbd-card rounded-xl p-5 sm:p-6">
      <TemplateEditor
        templateId={template.id}
        initialName={template.name}
        initialAuthorNote={template.authorNote ?? ""}
        initialRows={initialRows}
      />
    </div>
  );
}
