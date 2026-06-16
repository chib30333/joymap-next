"use client";

import { useT } from "@/components/Language";
import { Button } from "@/components/ui";

export function AuthTabs({
  mode,
  onMode,
}: {
  mode: "login" | "signup";
  onMode: (m: "login" | "signup") => void;
}) {
  const t = useT();
  return (
    <div className="relative grid grid-cols-2 bg-surface-2 border border-line rounded-pill p-1 mb-5">
      <Button
        ctx="auth"
        className={`relative z-[2] py-3 ${
          mode === "login" ? "text-white" : "text-ink-3"
        }`}
        onClick={() => onMode("login")}
      >
        {t("Log in")}
      </Button>
      <Button
        ctx="auth"
        className={`relative z-[2] py-3 ${
          mode === "signup" ? "text-white" : "text-ink-3"
        }`}
        onClick={() => onMode("signup")}
      >
        {t("Sign up")}
      </Button>

      <span
        className={`absolute z-[1] top-1 left-1 w-[calc(50%-5px)] h-[calc(100%-8px)] rounded-pill bg-coral [transition:transform_0.25s_cubic-bezier(0.22,1,0.36,1)] ${
          mode === "login" ? "[transform:translateX(0%)]" : "[transform:translateX(100%)]"
        }`}
      />
    </div>
  );
}
