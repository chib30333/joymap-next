"use client";

import { useT } from "@/components/Language";

export function AuthTabs({
  mode,
  onMode,
}: {
  mode: "login" | "signup";
  onMode: (m: "login" | "signup") => void;
}) {
  const t = useT();
  return (
    <div className="relative grid grid-cols-2 bg-surface-2 border border-line rounded-pill p-[5px] mb-[22px]">
      <button
        className={`relative z-[2] py-[9px] rounded-pill font-bold text-[14px] [transition:0.2s] ${
          mode === "login" ? "text-white" : "text-ink-3"
        }`}
        onClick={() => onMode("login")}
      >
        {t("Log in")}
      </button>
      <button
        className={`relative z-[2] py-[9px] rounded-pill font-bold text-[14px] [transition:0.2s] ${
          mode === "signup" ? "text-white" : "text-ink-3"
        }`}
        onClick={() => onMode("signup")}
      >
        {t("Sign up")}
      </button>
      <span
        className={`absolute z-[1] top-[5px] left-[5px] w-[calc(50%-5px)] h-[calc(100%-10px)] rounded-pill bg-coral [transition:transform_0.25s_cubic-bezier(0.22,1,0.36,1)] ${
          mode === "login" ? "[transform:translateX(0%)]" : "[transform:translateX(100%)]"
        }`}
      />
    </div>
  );
}
