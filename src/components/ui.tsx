// Shared UI primitives (Tailwind). Small, dependency-free building blocks the
// portal pages compose — Button, Card, Pill, Skeleton, MoodChip, etc.
import { clsx } from "@/lib/cx";
import { MOODS } from "@/lib/constants";

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
  const sizes = { sm: "px-4 py-2 text-[13px]", md: "px-5 py-2.5 text-sm", lg: "px-6 py-3.5 text-[15px]" };
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
        className
      )}
    >
      {busy && <span className="jm-spin" />}
      {children}
    </button>
  );
}

export function Card({ className, children, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...p} className={clsx("bg-surface border border-line rounded-lg", className)}>
      {children}
    </div>
  );
}

const STATUS: Record<string, [string, string]> = {
  confirmed: ["#1FA46E", "rgba(31,164,110,.13)"],
  pending: ["#E89015", "rgba(232,144,21,.14)"],
  cancelled: ["#E0212F", "rgba(224,33,47,.12)"],
  completed: ["#5563D6", "rgba(85,99,214,.13)"],
  active: ["#1FA46E", "rgba(31,164,110,.13)"],
  review: ["#E89015", "rgba(232,144,21,.14)"],
  rejected: ["#E0212F", "rgba(224,33,47,.12)"],
  paid: ["#1FA46E", "rgba(31,164,110,.13)"],
  vip: ["#7B53F0", "rgba(123,83,240,.14)"],
};
export function Pill({ status, label }: { status: string; label?: string }) {
  const [c, bg] = STATUS[status] ?? ["#6F5157", "rgba(120,80,90,.12)"];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-bold" style={{ color: c, background: bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {label ?? status}
    </span>
  );
}

export function MoodChip({ mood, active, onClick }: { mood: string; active?: boolean; onClick?: () => void }) {
  const m = MOODS[mood];
  if (!m) return null;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-[13px] font-bold transition"
      style={active ? { background: m.hex, color: "#fff", borderColor: m.hex } : { background: `color-mix(in srgb,${m.hex} 14%,transparent)`, color: m.hex, borderColor: "transparent" }}
    >
      <span className="h-2 w-2 rounded-full" style={{ background: active ? "#fff" : m.hex }} />
      {m.label}
    </button>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full font-extrabold text-white font-display shrink-0"
      style={{ width: size, height: size, fontSize: size * 0.42, background: "linear-gradient(140deg,var(--coral),var(--orange))" }}
    >
      {(name || "?")[0]}
    </div>
  );
}

export function Skeleton({ w = "100%", h = 14, r = 8, className }: { w?: number | string; h?: number; r?: number; className?: string }) {
  return <span className={clsx("skel block", className)} style={{ width: w, height: h, borderRadius: r }} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden">
      <Skeleton h={140} r={0} />
      <div className="p-4 flex flex-col gap-2.5">
        <Skeleton w="60%" h={20} r={99} />
        <Skeleton w="70%" h={13} />
        <Skeleton w="40%" h={18} />
      </div>
    </div>
  );
}
