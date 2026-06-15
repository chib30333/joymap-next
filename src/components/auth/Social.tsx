"use client";

type SocialProvider = { name: string; color: string; glyph: string };

const SOCIAL_PROVIDERS: SocialProvider[] = [
  { name: "Yandex", color: "#FC3F1D", glyph: "Я" },
  { name: "VK", color: "#0077FF", glyph: "VK" },
  { name: "Google", color: "#4285F4", glyph: "G" },
];

export function Social() {
  return (
    <div className="grid grid-cols-3 gap-[9px]">
      {SOCIAL_PROVIDERS.map(({ name, color, glyph }) => (
        <button
          key={name}
          type="button"
          className="flex items-center justify-center gap-2 px-2 py-[11px] rounded-sm border border-line-2 bg-surface text-ink font-bold text-[13px] cursor-pointer [transition:0.15s] hover:border-ink-3 hover:bg-surface-2"
          title={`Continue with ${name}`}
        >
          <span
            className="w-5 h-5 rounded-[6px] grid place-items-center text-white font-extrabold text-[11px] font-display [background:var(--soc-bg)]"
            style={{ "--soc-bg": color } as React.CSSProperties}
          >
            {glyph}
          </span>
          {name}
        </button>
      ))}
    </div>
  );
}
