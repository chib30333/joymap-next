"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";
import { Button, Checkbox } from "@/components/ui";
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
        <h2 className="text-2xl">{t("Welcome back")}</h2>
        <p className="text-ink-2 text-sm mt-1.5 leading-normal">
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

        <div className="flex items-center justify-between gap-3 -mt-0.5">
          <Checkbox
            checked={remember}
            onChange={setRemember}
            className="whitespace-nowrap"
          >
            {t("Remember me")}
          </Checkbox>
          <a className={`${LINK} whitespace-nowrap`} onClick={onForgot}>
            {t("Forgot password?")}
          </a>
        </div>

        {err && (
          <div className="flex gap-2 items-start px-3.5 py-2.5 rounded-sm bg-[color-mix(in_srgb,#E0212F_10%,transparent)] text-coral-deep font-bold text-sm leading-snug">
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
          className={!canSubmit ? "opacity-50 shadow-none" : ""}
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
            <div className="flex items-center gap-3.5 text-ink-3 text-xs font-semibold my-1 before:content-[''] before:flex-1 before:h-px before:bg-line after:content-[''] after:flex-1 after:h-px after:bg-line">
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
