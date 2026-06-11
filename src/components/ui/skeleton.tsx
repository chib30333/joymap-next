// Skeleton / SkeletonCard — read-loading shimmer primitives. See guideline 02 / 06.
import { clsx } from "@/lib/cx";

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
