import { clsx } from "@/lib/cx";

export function Skeleton({
  w = "100%",
  h = 14,
  r = 8,
  className,
}: {
  w?: number | string;
  h?: number;
  r?: number;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "relative overflow-hidden block bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] after:content-[''] after:absolute after:inset-0 after:-translate-x-full after:bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--surface)_75%,transparent),transparent)] after:animate-sweep motion-reduce:after:animate-none w-[var(--sk-w)] h-[var(--sk-h)] rounded-[var(--sk-r)]",
        className,
      )}
      style={
        {
          "--sk-w": typeof w === "number" ? w + "px" : w,
          "--sk-h": h + "px",
          "--sk-r": r + "px",
        } as React.CSSProperties
      }
    />
  );
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
