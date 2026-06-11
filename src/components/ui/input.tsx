import { clsx } from "@/lib/cx";

export function Input({
  className,
  ...p
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className={clsx("field", className)} />;
}
