import { TemplateEditor } from "@/components/TemplateEditor";

export default function NewTemplatePage() {
  return (
    <div className="space-y-6">
      <p className="text-zinc-500">
        Додай вправи та познач базові (жим / присяд / тяга) для графіків.
      </p>
      <div className="sbd-card rounded-xl p-5 sm:p-6">
        <TemplateEditor initialName="" initialRows={[]} />
      </div>
    </div>
  );
}
