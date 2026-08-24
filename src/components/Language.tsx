"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Icons } from "@/components/Icons";
import { DICTS } from "@/lib/language";

export type Lang = {
  code: string;
  name: string;
  native: string;
  flag: string;
  rtl?: boolean;
};
export const LANGS: readonly Lang[] = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
];

type LangCtx = { lang: string; setLang: (c: string) => void };
const Ctx = createContext<LangCtx>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("en");
  useEffect(() => {
    try {
      const saved = localStorage.getItem("jm_lang");
      if (saved) setLangState(saved);
    } catch {}
  }, []);
  // Keep the document in sync with the active language. `lang` drives locale
  // handling in screen readers and the browser's own font selection, so it has
  // to follow the switcher rather than stay pinned to the server-rendered "en".
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir =
      (LANGS.find((l) => l.code === lang)?.rtl ?? false) ? "rtl" : "ltr";
  }, [lang]);
  const setLang = useCallback((c: string) => {
    setLangState(c);
    try {
      localStorage.setItem("jm_lang", c);
    } catch {}
  }, []);
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

export function translate(s: string, lang: string) {
  return DICTS[lang]?.[s] ?? s;
}

export function useT() {
  const { lang } = useLang();
  return useCallback((s: string) => translate(s, lang), [lang]);
}

export function t(s: string) {
  return s;
}

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const cur = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <div className="relative flex-none">
      {/* The globe mark stands in for "language" on phones; the flag + code pair
          is the first thing to go when the header row runs out of width. */}
      <button
        aria-label={cur.name}
        className="inline-flex items-center gap-1.5 bg-surface border border-line rounded-pill h-10 sm:h-11 px-2.5 sm:px-3 text-sm font-bold text-ink-2 cursor-pointer duration-150 hover:border-line-2 hover:text-ink hover:bg-surface-2"
        onClick={() => setOpen((o) => !o)}
      >
        <Icons.globe size={16} />
        <span className="hidden xs:inline whitespace-nowrap">
          {cur.flag} {cur.code.toUpperCase()}
        </span>
      </button>
      {open && (
        <div
          className="absolute top-[calc(100%+8px)] end-0 bg-surface border border-line rounded-sm shadow-lg p-1.5 flex flex-col min-w-[150px] z-[60]"
          onMouseLeave={() => setOpen(false)}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={`flex items-center gap-2 py-2 px-3 rounded-md text-sm font-semibold cursor-pointer text-left duration-[120ms] hover:bg-surface-2 hover:text-ink ${
                l.code === lang ? "text-coral-deep font-extrabold" : "text-ink-2"
              }`}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
            >
              <span className="text-base">{l.flag}</span>
              {l.native}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
