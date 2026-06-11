// Textarea — multiline-entry primitive. Renders the design's `.field` class (scoped
// per portal). Forwards all native props.
// Replaces hand-rolled `<textarea className="field">` in feature code (guideline 02).
import { clsx } from "@/lib/cx";

export function Textarea({ className, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={clsx("field", className)} />;
}
