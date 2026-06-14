export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full font-extrabold text-white font-display shrink-0 w-[var(--s)] h-[var(--s)] text-[length:var(--fs)] [background:linear-gradient(140deg,var(--coral),var(--orange))]"
      style={
        {
          "--s": size + "px",
          "--fs": size * 0.42 + "px",
        } as React.CSSProperties
      }
    >
      {(name || "?")[0]}
    </div>
  );
}
