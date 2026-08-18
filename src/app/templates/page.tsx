import { PageTransition } from "@/components/providers/page-transition";
import { TemplatePicker } from "@/components/tools/template-picker";

export default function TemplatesPage() {
  return (
    <PageTransition>
      <TemplatePicker />
    </PageTransition>
  );
}
