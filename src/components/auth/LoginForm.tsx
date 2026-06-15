"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";
import { Button } from "@/components/ui";
import { rpc } from "@/lib/client";
import { Field, PwField } from "./Field";
import { Social } from "./Social";
import { BODY, FOOT, LINK, LINK_STRONG, SPIN } from "@/lib/auth";

export function LoginForm({
  email,
  setEmail,
  pw,
  setPw,
  busy,
  err,
  admin,
  runAuth,
  onForgot,
  onSignup,
}: {
  email: string;
  setEmail: (v: string) => void;
  pw: string;
  setPw: (v: string) => void;
  busy: boolean;
  err: string | null;
  admin: boolean;
  runAuth: (p: Promise<{ role: string }>) => void;
  onForgot: () => void;
  onSignup: () => void;
}) {
  const t = useT();
  const [remember, setRemember] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    runAuth(
      rpc<{ role: string }>("login", { email, pw }).then((u) => {
        if (admin && u.role !== "admin")
          throw new Error("This account is not on the platform team.");
        return u;
      }),
    );
  };

  const canSubmit = email.length > 2 && pw.length > 0;

  return (
    <>
      <div>
        <h2 className="text-[25px]">{t("Welcome back")}</h2>
        <p className="text-ink-2 text-[14.5px] mt-[6px] leading-[1.5]">
          {t("Pick up your week of joy where you left off.")}
        </p>
      </div>

      <form onSubmit={submit} className={BODY}>
        <Field
          label={t("Email")}
          icon="mail"
          type="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />
        <PwField
          label={t("Password")}
          value={pw}
          onChange={setPw}
          autoComplete="current-password"
        />

        <div className="flex items-center justify-between gap-3 -mt-[2px]">
          <label className="flex items-center gap-[9px] text-[13.5px] font-semibold text-ink-2 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              className="peer absolute opacity-0 w-0 h-0"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="w-[19px] h-[19px] rounded-[6px] border-[1.5px] border-line-2 grid place-items-center text-white flex-none [transition:0.15s] peer-checked:bg-coral peer-checked:border-coral [&_svg]:opacity-0 [&_svg]:[transition:0.15s] peer-checked:[&_svg]:opacity-100">
              <Icons.check size={12} />
            </span>
            {t("Remember me")}
          </label>
          <a className={`${LINK} whitespace-nowrap`} onClick={onForgot}>
            {t("Forgot password?")}
          </a>
        </div>

        {err && (
          <div className="flex gap-[9px] items-start px-[14px] py-[11px] rounded-sm bg-[color-mix(in_srgb,#E0212F_10%,transparent)] text-coral-deep font-bold text-[13.5px] leading-[1.4]">
            <Icons.flame size={16} className="flex-none mt-px" />
            {err}
          </div>
        )}

        <Button
          ctx="auth"
          variant="primary"
          size="lg"
          block
          type="submit"
          disabled={!canSubmit}
          className={!canSubmit ? "opacity-[0.5] shadow-none" : ""}
        >
          {busy ? (
            <span className={SPIN} />
          ) : (
            <>
              {admin ? t("Enter admin panel") : t("Log in")}
              <Icons.arrowR size={19} />
            </>
          )}
        </Button>

        {!admin && (
          <>
            <div className="flex items-center gap-[14px] text-ink-3 text-[12.5px] font-semibold my-1 before:content-[''] before:flex-1 before:h-px before:bg-line after:content-[''] after:flex-1 after:h-px after:bg-line">
              <span>{t("or continue with")}</span>
            </div>
            <Social />
          </>
        )}
      </form>

      <div className={FOOT}>
        {t("New to Joymap?")}{" "}
        <a className={LINK_STRONG} onClick={onSignup}>
          {t("Create an account")}
        </a>
      </div>
    </>
  );
}
