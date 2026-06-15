import { clsx } from "@/lib/cx";

export function Card({
  className,
  children,
  ...p
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...p}
      className={clsx("bg-surface border border-line rounded-lg", className)}
    >
      {children}
    </div>
  );
}
