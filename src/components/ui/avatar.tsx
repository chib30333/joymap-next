export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full font-extrabold text-white font-display shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: "linear-gradient(140deg,var(--coral),var(--orange))",
      }}
    >
      {(name || "?")[0]}
    </div>
  );
}
