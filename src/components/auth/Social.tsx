"use client";

type SocialProvider = { name: string; color: string; glyph: string };

const SOCIAL_PROVIDERS: SocialProvider[] = [
  { name: "Yandex", color: "#FC3F1D", glyph: "Я" },
  { name: "VK", color: "#0077FF", glyph: "VK" },
  { name: "Google", color: "#4285F4", glyph: "G" },
];

export function Social() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {SOCIAL_PROVIDERS.map(({ name, color, glyph }) => (
        <button
          key={name}
          type="button"
          className="flex items-center justify-center gap-2 px-2 py-2.5 rounded-sm border border-line-2 bg-surface text-ink font-bold text-sm cursor-pointer duration-150 hover:border-ink-3 hover:bg-surface-2"
          title={`Continue with ${name}`}
        >
          <span
            className="w-5 h-5 rounded-md grid place-items-center text-white font-extrabold text-2.5 font-display [background:var(--soc-bg)]"
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
