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
    <div className="relative">
      <button
        className="inline-flex items-center gap-1.5 bg-surface border border-line rounded-pill py-2 px-3 text-sm font-bold text-ink-2 cursor-pointer duration-150 hover:border-line-2 hover:text-ink hover:bg-surface-2"
        onClick={() => setOpen((o) => !o)}
      >
        <Icons.globe size={16} />
        {cur.flag} {cur.code.toUpperCase()}
      </button>
      {open && (
        <div
          className="absolute top-12 end-0 bg-surface border border-line rounded-sm shadow-lg p-1.5 flex flex-col min-w-[150px] z-[60]"
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
