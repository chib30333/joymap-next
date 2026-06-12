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
  // { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  // { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  // { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  // { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
  // { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦", rtl: true },
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
  const setLang = useCallback((c: string) => {
    setLangState(c);
    try {
      localStorage.setItem("jm_lang", c);
    } catch {}
    const rtl = LANGS.find((l) => l.code === c)?.rtl ?? false;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
  }, []);
  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export function useLang() {
  return useContext(Ctx);
}

// Core lookup: returns the translation for the current language, falling back
// to the English source string when there is no entry (or when lang is "en").
export function translate(s: string, lang: string) {
  return DICTS[lang]?.[s] ?? s;
}

// Reactive translator hook. Components call `const t = useT()` once, then use
// `t("English source")`; subscribing to the lang context makes them re-render
// (and re-translate) the moment the LangSwitcher changes language.
export function useT() {
  const { lang } = useLang();
  return useCallback((s: string) => translate(s, lang), [lang]);
}

// Non-reactive passthrough for server components / non-React call sites. Always
// renders the English source. Prefer useT() in client components.
export function t(s: string) {
  return s;
}

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const cur = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <div className="relative">
      <button
        className="inline-flex items-center gap-[6px] bg-surface border border-line rounded-pill py-[9px] px-[12px] text-[13px] font-bold text-ink-2 cursor-pointer [transition:0.15s] hover:border-line-2 hover:text-ink hover:bg-surface-2"
        onClick={() => setOpen((o) => !o)}
      >
        <Icons.globe size={16} />
        {cur.flag} {cur.code.toUpperCase()}
      </button>
      {open && (
        <div
          className="absolute top-[46px] end-0 bg-surface border border-line rounded-sm shadow-lg p-[6px] flex flex-col min-w-[150px] z-[60]"
          onMouseLeave={() => setOpen(false)}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              className={`flex items-center gap-[9px] py-[9px] px-[11px] rounded-[9px] text-[13.5px] font-semibold cursor-pointer text-left [transition:0.12s] hover:bg-surface-2 hover:text-ink ${
                l.code === lang ? "text-coral-deep font-extrabold" : "text-ink-2"
              }`}
              onClick={() => {
                setLang(l.code);
                setOpen(false);
              }}
            >
              <span className="text-[16px]">{l.flag}</span>
              {l.native}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
