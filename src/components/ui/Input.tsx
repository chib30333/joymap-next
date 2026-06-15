import { clsx } from "@/lib/cx";

export function Input({
  className,
  ...p
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...p}
      className={clsx(
        "w-full px-4 py-[13px] rounded-sm border border-line-2 bg-surface text-ink text-[15px] outline-none [transition:0.15s] focus:border-coral focus:shadow-[0_0_0_3px_var(--coral-soft)] [.auth-wrap_&]:placeholder:text-ink-3 [.jmdash_&]:px-[14px] [.jmdash_&]:py-[11px] [.jmdash_&]:text-[14.5px]",
        className,
      )}
    />
  );
}
