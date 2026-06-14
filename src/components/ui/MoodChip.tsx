"use client";

import { MOODS } from "@/constants";
import { useT } from "@/components/Language";

export function MoodChip({
  mood,
  active,
  onClick,
}: {
  mood: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const t = useT();
  const m = MOODS[mood];
  if (!m) return null;
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-pill border px-3 py-1.5 text-[13px] font-bold transition bg-[var(--mc-bg)] text-[var(--mc-fg)] border-[var(--mc-bd)]"
      style={
        (active
          ? { "--mc-bg": m.hex, "--mc-fg": "#fff", "--mc-bd": m.hex }
          : {
              "--mc-bg": `color-mix(in srgb,${m.hex} 14%,transparent)`,
              "--mc-fg": m.hex,
              "--mc-bd": "transparent",
            }) as React.CSSProperties
      }
    >
      <span
        className="h-2 w-2 rounded-full bg-[var(--mc-dot)]"
        style={{ "--mc-dot": active ? "#fff" : m.hex } as React.CSSProperties}
      />
      {t(m.label)}
    </button>
  );
}
