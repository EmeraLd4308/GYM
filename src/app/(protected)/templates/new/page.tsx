import { TemplateEditor } from "@/components/TemplateEditor";

export default function NewTemplatePage() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <p className="text-sm leading-relaxed text-[var(--sbd-muted)] sm:text-base">
        Додай вправи та познач базові (жим / присяд / тяга) для графіків.
      </p>
      <div className="sbd-card rounded-xl p-4 sm:p-6">
        <TemplateEditor initialName="" initialRows={[]} />
      </div>
    </div>
  );
}
