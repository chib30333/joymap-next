"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";
import { Button } from "@/components/ui";
import { rpc } from "@/lib/client";
import { Field, PwField } from "./Field";
import { Social } from "./Social";
import { BODY, FOOT, LINK, LINK_STRONG, SPIN } from "@/lib/auth";

const ROLES: Record<string, { sub: string; icon: keyof typeof Icons }> = {
  customer: {
    sub: "Find activities & build your weekly Joy Map",
    icon: "compass",
  },
  provider: { sub: "Manage bookings, calendar & payouts", icon: "grid" },
};

export function SignupForm({
  email,
  setEmail,
  pw,
  setPw,
  busy,
  err,
  admin,
  runAuth,
  onLogin,
}: {
  email: string;
  setEmail: (v: string) => void;
  pw: string;
  setPw: (v: string) => void;
  busy: boolean;
  err: string | null;
  admin: boolean;
  runAuth: (p: Promise<{ role: string }>) => void;
  onLogin: () => void;
}) {
  const t = useT();
  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [name, setName] = useState("");
  const [biz, setBiz] = useState("");
  const [agree, setAgree] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    runAuth(rpc<{ role: string }>("signup", { name, email, pw, role, biz }));
  };

  const canSubmit =
    email.length > 2 &&
    pw.length > 0 &&
    name.length > 1 &&
    agree &&
    (role !== "provider" || biz.length > 1);

  return (
    <>
      <div>
        <h2 className="text-[25px]">{t("Create your account")}</h2>
        <p className="text-ink-2 text-[14.5px] mt-[6px] leading-[1.5]">
          {t("A minute to set up — then your first Joy Map is on us.")}
        </p>
      </div>

      <form onSubmit={submit} className={BODY}>
        {!admin && (
          <div className="grid grid-cols-2 gap-[10px] mb-[2px] max-[420px]:grid-cols-1">
            {Object.entries(ROLES).map(([k, r]) => {
              const I = Icons[r.icon];
              const on = role === k;
              return (
                <button
                  type="button"
                  key={k}
                  className={`relative text-left p-[14px] rounded border-[1.5px] cursor-pointer [transition:0.16s] flex flex-col gap-1 ${
                    on
                      ? "border-coral bg-coral-soft"
                      : "border-line-2 bg-surface hover:border-ink-3"
                  }`}
                  onClick={() => setRole(k as "customer" | "provider")}
                >
                  <span
                    className={`w-9 h-9 rounded-[10px] grid place-items-center mb-1 ${
                      on ? "bg-coral text-white" : "bg-surface-2 text-ink-2"
                    }`}
                  >
                    <I size={20} />
                  </span>
                  <span className="font-extrabold font-display text-[14.5px] text-ink">
                    {k === "customer"
                      ? t("I want to explore")
                      : t("I host experiences")}
                  </span>
                  <span className="text-[12px] text-ink-3 font-semibold leading-[1.35]">
                    {t(r.sub)}
                  </span>
                  <span
                    className={`absolute top-3 right-3 w-5 h-5 rounded-full bg-coral text-white grid place-items-center [transition:0.16s] ${
                      on ? "opacity-100 scale-100" : "opacity-0 scale-[0.6]"
                    }`}
                  >
                    <Icons.check size={13} />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {!admin && (
          <Field
            label={t("Full name")}
            icon="user"
            value={name}
            onChange={setName}
            autoComplete="name"
          />
        )}
        {role === "provider" && !admin && (
          <Field
            label={t("Business name")}
            icon="grid"
            value={biz}
            onChange={setBiz}
          />
        )}

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
          meter
          autoComplete="new-password"
        />

        {!admin && (
          <label className="flex items-start gap-[9px] text-[13.5px] font-semibold text-ink-2 cursor-pointer leading-[1.45]">
            <input
              type="checkbox"
              className="peer absolute opacity-0 w-0 h-0"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
            />
            <span className="w-[19px] h-[19px] mt-[1px] rounded-[6px] border-[1.5px] border-line-2 grid place-items-center text-white flex-none [transition:0.15s] peer-checked:bg-coral peer-checked:border-coral [&_svg]:opacity-0 [&_svg]:[transition:0.15s] peer-checked:[&_svg]:opacity-100">
              <Icons.check size={12} />
            </span>
            <span>
              I agree to the <a className={LINK}>Terms</a> &amp;{" "}
              <a className={LINK}>Privacy Policy</a>.
            </span>
          </label>
        )}

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
              {t("Create account")}
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
        {t("Already have an account?")}{" "}
        <a className={LINK_STRONG} onClick={onLogin}>
          {t("Log in")}
        </a>
      </div>
    </>
  );
}
