import { MOODS } from "@/lib/constants";

export function MoodChip({
  mood,
  active,
  onClick,
}: {
  mood: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const m = MOODS[mood];
  if (!m) return null;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-[13px] font-bold transition"
      style={
        active
          ? { background: m.hex, color: "#fff", borderColor: m.hex }
          : {
              background: `color-mix(in srgb,${m.hex} 14%,transparent)`,
              color: m.hex,
              borderColor: "transparent",
            }
      }
    >
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: active ? "#fff" : m.hex }}
      />
      {m.label}
    </button>
  );
}
