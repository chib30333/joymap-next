import { clsx } from "@/lib/cx";

export function Select({
  className,
  children,
  ...p
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...p} className={clsx("field", className)}>
      {children}
    </select>
  );
}
