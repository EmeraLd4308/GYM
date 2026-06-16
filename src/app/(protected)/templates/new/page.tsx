import { TemplateEditor } from "@/features/templates/components/TemplateEditor";

export default function NewTemplatePage() {
  return (
    <div className="sbd-card rounded-xl p-4 sm:p-6">
      <TemplateEditor initialName="" initialRows={[]} />
    </div>
  );
}
