import { clsx } from "@/lib/cx";

export function Textarea({
  className,
  ...p
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className={clsx("field", className)} />;
}
