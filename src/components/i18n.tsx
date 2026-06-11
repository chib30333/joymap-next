"use client";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Icons } from "@/components/Icons";

// Language layer — same language list, pill switcher, localStorage key ('jm_lang')
// and RTL handling as the prototype's i18n.jsx. Strings render from their English
// source (the prototype's t() also falls back to English source), so the default
// view is identical; switching language is wired and persisted.
export const LANGS = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "ru", name: "Russian", native: "Русский", flag: "🇷🇺" },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸" },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪" },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷" },
  { code: "zh", name: "Chinese", native: "中文", flag: "🇨🇳" },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦", rtl: true },
] as const;

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

// English-source passthrough (matches the prototype's default render).
export function t(s: string) {
  return s;
}

export function LangSwitcher() {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const cur = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <div style={{ position: "relative" }}>
      <button className="lang-switch" onClick={() => setOpen((o) => !o)}>
        <Icons.globe size={16} />
        {cur.flag} {cur.code.toUpperCase()}
      </button>
      {open && (
        <div className="lang-menu" onMouseLeave={() => setOpen(false)}>
          {LANGS.map((l) => (
            <button key={l.code} className={l.code === lang ? "on" : ""} onClick={() => { setLang(l.code); setOpen(false); }}>
              <span style={{ fontSize: 16 }}>{l.flag}</span>
              {l.native}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
