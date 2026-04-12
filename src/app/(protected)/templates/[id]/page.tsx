import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { TemplateAuthorByline } from "@/components/TemplateAuthorByline";
import { TemplateEditor } from "@/components/TemplateEditor";
import { baseLiftLabel } from "@/lib/base-lift";
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
    return (
      <div className="space-y-6">
        <div>
          <p className="font-display text-lg font-semibold uppercase tracking-wide text-white">
            {template.name}
          </p>
          <TemplateAuthorByline user={template.user} />
        </div>
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
        <Link
          href="/templates"
          className="text-sm text-[#e31e24] underline-offset-2 hover:underline"
        >
          Усі шаблони
        </Link>
      </div>
    );
  }

  const initialRows = template.exercises.map((e) => ({
    id: e.id,
    name: e.name,
    baseLift: e.baseLift,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="font-display text-lg font-semibold uppercase tracking-wide text-white">
          {template.name}
        </p>
        <span className="rounded-full border border-[#e31e24]/40 bg-[#e31e24]/[0.14] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#ffc9c9]">
          Мій
        </span>
      </div>
      <div className="sbd-card rounded-xl p-5 sm:p-6">
        <TemplateEditor
          templateId={template.id}
          initialName={template.name}
          initialRows={initialRows}
        />
      </div>
    </div>
  );
}
