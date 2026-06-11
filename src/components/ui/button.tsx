import { clsx } from "@/lib/cx";

export function Button({
  variant = "primary",
  size = "md",
  busy,
  className,
  children,
  ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft";
  size?: "sm" | "md" | "lg";
  busy?: boolean;
}) {
  const sizes = {
    sm: "px-4 py-2 text-[13px]",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-[15px]",
  };
  const variants = {
    primary: "bg-coral text-white shadow-coral hover:bg-coral-deep",
    ghost: "bg-surface text-ink border border-line-2 hover:bg-surface-2",
    soft: "bg-coral-soft text-coral-deep hover:brightness-95",
  };
  return (
    <button
      {...p}
      disabled={busy || p.disabled}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-pill font-bold transition disabled:opacity-50 disabled:cursor-not-allowed",
        sizes[size],
        variants[variant],
        className,
      )}
    >
      {busy && <span className="jm-spin" />}
      {children}
    </button>
  );
}
