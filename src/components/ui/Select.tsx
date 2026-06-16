import { clsx } from "@/lib/cx";

export function Select({
  className,
  children,
  ...p
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...p}
      className={clsx(
        "w-full px-4 py-3.5 rounded-sm border border-line-2 bg-surface text-ink text-base outline-none duration-150 focus:border-coral focus:shadow-[0_0_0_3px_var(--coral-soft)] [.auth-wrap_&]:placeholder:text-ink-3 [.jmdash_&]:px-3.5 [.jmdash_&]:py-3 [.jmdash_&]:text-sm",
        className,
      )}
    >
      {children}
    </select>
  );
}
