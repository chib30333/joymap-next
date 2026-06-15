"use client";

import { useRef } from "react";

export function CodeInput({
  value,
  onChange,
  len = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  len?: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const set = (i: number, ch: string) => {
    if (!/^\d?$/.test(ch)) return;
    const chars: string[] = [];
    for (let k = 0; k < len; k++) chars.push(k === i ? ch : value[k] || "");
    onChange(chars.join("").slice(0, len));
    if (ch && i < len - 1) refs.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0)
      refs.current[i - 1]?.focus();
  };
  const onPaste = (e: React.ClipboardEvent) => {
    const tx = (e.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, len);
    if (tx) {
      e.preventDefault();
      onChange(tx);
      refs.current[Math.min(tx.length, len - 1)]?.focus();
    }
  };
  return (
    <div className="flex gap-[9px] justify-between" onPaste={onPaste}>
      {Array.from({ length: len }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="flex-1 min-w-0 aspect-[1/1.15] text-center font-display font-extrabold text-[24px] text-ink bg-surface border-[1.5px] border-line-2 rounded-sm outline-none [transition:0.15s] focus:border-coral focus:shadow-[0_0_0_3px_var(--coral-soft)]"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => set(i, e.target.value.slice(-1))}
          onKeyDown={(e) => onKey(i, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
