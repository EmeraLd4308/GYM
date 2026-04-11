import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { TemplateEditor } from "@/components/TemplateEditor";

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return null;
  const { id } = await params;
  const template = await prisma.workoutTemplate.findFirst({
    where: { id, userId: user.id },
    include: { exercises: { orderBy: { sortOrder: "asc" } } },
  });
  if (!template) notFound();

  const initialRows = template.exercises.map((e) => ({
    id: e.id,
    name: e.name,
    baseLift: e.baseLift,
  }));

  return (
    <div className="space-y-6">
      <p className="text-sm text-zinc-400">{template.name}</p>
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
