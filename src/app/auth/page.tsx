"use client";

import { useEffect, useRef, useState } from "react";
import { btnCls } from "@/lib/btn";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icons, Logo } from "@/components/Icons";
import { LangSwitcher, useT } from "@/components/Language";
import { Input } from "@/components/ui/input";
import { rpc } from "@/lib/client";

const SPIN =
  "inline-block w-[19px] h-[19px] rounded-full border-[2.5px] border-white/40 border-t-white animate-jm-spin";
const BODY = "flex flex-col gap-[15px] mt-5";
const FOOT = "text-center mt-5 text-[14px] text-ink-2 font-semibold";
const LINK =
  "text-ink-2 text-[13.5px] font-bold cursor-pointer no-underline hover:text-coral-deep";
const LINK_STRONG =
  "text-coral-deep text-[13.5px] font-bold cursor-pointer no-underline hover:text-coral-deep";

const ROLES: Record<string, { sub: string; icon: keyof typeof Icons }> = {
  customer: {
    sub: "Find activities & build your weekly Joy Map",
    icon: "compass",
  },
  provider: { sub: "Manage bookings, calendar & payouts", icon: "grid" },
};

function pwScore(v: string) {
  let s = 0;
  if (v.length >= 8) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  if (v.length < 1) return { pct: 0, label: "", color: "transparent" };
  if (s <= 1) return { pct: 30, label: "Weak", color: "#FF4D74" };
  if (s === 2) return { pct: 60, label: "Okay", color: "#E89015" };
  if (s === 3) return { pct: 80, label: "Good", color: "#3FA89B" };
  return { pct: 100, label: "Strong", color: "#1FA46E" };
}

function Field({
  label,
  icon,
  type = "text",
  value,
  onChange,
  right,
  autoComplete,
  name,
}: {
  label: string;
  icon?: keyof typeof Icons;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  right?: React.ReactNode;
  autoComplete?: string;
  name?: string;
}) {
  const I = icon ? Icons[icon] : null;
  return (
    <label className="block">
      <span className="block text-[12.5px] font-bold text-ink-2 mb-[7px]">
        {label}
      </span>
      <span className="relative flex items-center">
        {I && (
          <span className="absolute left-[14px] text-ink-3 inline-flex pointer-events-none">
            <I size={18} />
          </span>
        )}
        <Input
          type={type}
          value={value}
          name={name}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          style={{ paddingLeft: I ? 44 : 16, paddingRight: right ? 46 : 16 }}
        />
        {right}
      </span>
    </label>
  );
}

function PwField({
  label,
  value,
  onChange,
  name,
  autoComplete,
  meter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  name?: string;
  autoComplete?: string;
  meter?: boolean;
}) {
  const [show, setShow] = useState(false);
  const score = pwScore(value);
  return (
    <div>
      <Field
        label={label}
        icon="lock"
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        name={name}
        autoComplete={autoComplete}
        right={
          <button
            type="button"
            className="absolute right-[12px] text-[12.5px] font-bold text-coral-deep cursor-pointer p-1"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
          >
            {show ? "Hide" : "Show"}
          </button>
        }
      />
      {meter && value.length > 0 && (
        <div className="flex items-center gap-[10px] mt-2">
          <div className="flex-1 h-[5px] rounded-full bg-line overflow-hidden">
            <span
              className="block h-full rounded-full [transition:0.3s]"
              style={{ width: `${score.pct}%`, background: score.color }}
            />
          </div>
          <span
            className="font-bold text-[12px]"
            style={{ color: score.color }}
          >
            {score.label}
          </span>
        </div>
      )}
    </div>
  );
}

function CodeInput({
  value,
  onChange,
  len = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  len?: number;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const set = (i: number, ch: string) => {
    if (!/^\d?$/.test(ch)) return;
    const chars: string[] = [];
    for (let k = 0; k < len; k++) chars.push(k === i ? ch : value[k] || "");
    onChange(chars.join("").slice(0, len));
    if (ch && i < len - 1) refs.current[i + 1]?.focus();
  };
  const onKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !value[i] && i > 0)
      refs.current[i - 1]?.focus();
  };
  const onPaste = (e: React.ClipboardEvent) => {
    const tx = (e.clipboardData.getData("text") || "")
      .replace(/\D/g, "")
      .slice(0, len);
    if (tx) {
      e.preventDefault();
      onChange(tx);
      refs.current[Math.min(tx.length, len - 1)]?.focus();
    }
  };
  return (
    <div className="flex gap-[9px] justify-between" onPaste={onPaste}>
      {Array.from({ length: len }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="flex-1 min-w-0 aspect-[1/1.15] text-center font-display font-extrabold text-[24px] text-ink bg-surface border-[1.5px] border-line-2 rounded-sm outline-none [transition:0.15s] focus:border-coral focus:shadow-[0_0_0_3px_var(--coral-soft)]"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          aria-label={`Digit ${i + 1}`}
          onChange={(e) => set(i, e.target.value.slice(-1))}
          onKeyDown={(e) => onKey(i, e)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}

function ResetFlow({
  initialEmail,
  onBackToLogin,
}: {
  initialEmail: string;
  onBackToLogin: () => void;
}) {
  const [step, setStep] = useState<"forgot" | "sent" | "reset" | "success">(
    "forgot",
  );
  const [email, setEmail] = useState(initialEmail || "");
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [resend, setResend] = useState(0);

  useEffect(() => {
    if (step !== "sent") return;
    setResend(30);
    const tmr = setInterval(
      () =>
        setResend((r) => {
          if (r <= 1) {
            clearInterval(tmr);
            return 0;
          }
          return r - 1;
        }),
      1000,
    );
    return () => clearInterval(tmr);
  }, [step]);

  const run = (next: typeof step, ms = 750) => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep(next);
    }, ms);
  };
  const back = () => {
    if (step === "forgot") onBackToLogin();
    else if (step === "sent") setStep("forgot");
    else if (step === "reset") setStep("sent");
  };

  const titles: Record<string, [string, React.ReactNode]> = {
    forgot: [
      "Reset your password",
      "Enter the email tied to your account and we'll send a 6-digit code.",
    ],
    sent: [
      "Check your inbox",
      <>
        We sent a code to <b className="text-ink">{email || "your email"}</b>.
        It expires in 10 minutes.
      </>,
    ],
    reset: [
      "Set a new password",
      "Choose something strong — at least 8 characters.",
    ],
    success: [
      "Password updated",
      "Your password has been changed. You can sign in now.",
    ],
  };
  const pwOK = pwScore(pw).pct >= 60 && pw.length >= 8;
  const matchOK = pw2.length > 0 && pw === pw2;

  return (
    <>
      {step !== "success" && (
        <button
          className="inline-flex items-center gap-[5px] text-ink-3 text-[13px] font-bold px-[2px] py-1 mb-[14px] [transition:0.15s] hover:text-ink"
          type="button"
          onClick={back}
        >
          <Icons.arrowL size={17} />
          Back
        </button>
      )}
      {(step === "sent" || step === "success") && (
        <div
          className={`w-16 h-16 rounded-full mx-auto mt-1 mb-[18px] grid place-items-center animate-anim-cardin motion-reduce:animate-none ${
            step === "success"
              ? "bg-[color-mix(in_srgb,#1fa46e_16%,transparent)] text-[#1fa46e] shadow-[0_10px_28px_color-mix(in_srgb,#1fa46e_30%,transparent)]"
              : "bg-coral-soft text-coral-deep"
          }`}
        >
          {step === "success" ? (
            <Icons.check size={34} />
          ) : (
            <Icons.mail size={32} />
          )}
        </div>
      )}
      <div
        style={
          step === "sent" || step === "success"
            ? { textAlign: "center" }
            : undefined
        }
      >
        <h2 className="text-[25px]">{titles[step][0]}</h2>
        <p className="text-ink-2 text-[14.5px] mt-[6px] leading-[1.5]">
          {titles[step][1]}
        </p>
      </div>

      {step === "forgot" && (
        <form
          className={BODY}
          onSubmit={(e) => {
            e.preventDefault();
            run("sent");
          }}
        >
          <Field
            label="Email"
            icon="mail"
            type="email"
            value={email}
            onChange={setEmail}
            autoComplete="email"
          />
          <button
            type="submit"
            className={btnCls("auth", "primary", "lg", true)}
            disabled={email.length < 3 || busy}
            style={
              email.length < 3 ? { opacity: 0.5, boxShadow: "none" } : undefined
            }
          >
            {busy ? (
              <span className={SPIN} />
            ) : (
              <>
                Send reset code
                <Icons.arrowR size={19} />
              </>
            )}
          </button>
          <div className={FOOT} style={{ marginTop: 4 }}>
            Remembered it?{" "}
            <a className={LINK_STRONG} onClick={onBackToLogin}>
              Back to log in
            </a>
          </div>
        </form>
      )}

      {step === "sent" && (
        <form
          className={BODY}
          onSubmit={(e) => {
            e.preventDefault();
            run("reset");
          }}
        >
          <CodeInput value={code} onChange={setCode} />
          <button
            type="submit"
            className={btnCls("auth", "primary", "lg", true)}
            disabled={code.length < 6 || busy}
            style={
              code.length < 6 ? { opacity: 0.5, boxShadow: "none" } : undefined
            }
          >
            {busy ? (
              <span className={SPIN} />
            ) : (
              <>
                Verify code
                <Icons.arrowR size={19} />
              </>
            )}
          </button>
          <div className={FOOT} style={{ marginTop: 4 }}>
            {resend > 0 ? (
              <span className="text-ink-3">
                Resend code in 0:{String(resend).padStart(2, "0")}
              </span>
            ) : (
              <>
                Didn&apos;t get it?{" "}
                <a className={LINK_STRONG} onClick={() => setStep("sent")}>
                  Resend code
                </a>
              </>
            )}
          </div>
        </form>
      )}

      {step === "reset" && (
        <form
          className={BODY}
          onSubmit={(e) => {
            e.preventDefault();
            if (pwOK && matchOK) run("success");
          }}
        >
          <PwField
            label="New password"
            value={pw}
            onChange={setPw}
            meter
            autoComplete="new-password"
          />
          <div>
            <Field
              label="Confirm password"
              icon="lock"
              type="password"
              value={pw2}
              onChange={setPw2}
              autoComplete="new-password"
            />
            {pw2.length > 0 && (
              <div
                className="flex items-center gap-[6px] text-[12.5px] font-bold mt-2 whitespace-nowrap"
                style={{ color: matchOK ? "#1FA46E" : "#FF4D74" }}
              >
                {matchOK ? (
                  <>
                    <Icons.check size={13} />
                    Passwords match
                  </>
                ) : (
                  <>
                    <Icons.close size={13} />
                    Passwords don&apos;t match yet
                  </>
                )}
              </div>
            )}
          </div>
          <button
            type="submit"
            className={btnCls("auth", "primary", "lg", true)}
            disabled={!(pwOK && matchOK) || busy}
            style={
              !(pwOK && matchOK)
                ? { opacity: 0.5, boxShadow: "none" }
                : undefined
            }
          >
            {busy ? (
              <span className={SPIN} />
            ) : (
              <>
                Update password
                <Icons.check size={19} />
              </>
            )}
          </button>
        </form>
      )}

      {step === "success" && (
        <div className={BODY}>
          <button
            className={btnCls("auth", "primary", "lg", true)}
            onClick={onBackToLogin}
          >
            Back to log in
            <Icons.arrowR size={19} />
          </button>
        </div>
      )}
    </>
  );
}

function Social() {
  const items: [string, string, string][] = [
    ["Yandex", "#FC3F1D", "Я"],
    ["VK", "#0077FF", "VK"],
    ["Google", "#4285F4", "G"],
  ];
  return (
    <div className="grid grid-cols-3 gap-[9px]">
      {items.map(([n, c, g]) => (
        <button
          key={n}
          type="button"
          className="flex items-center justify-center gap-2 px-2 py-[11px] rounded-sm border border-line-2 bg-surface text-ink font-bold text-[13px] cursor-pointer [transition:0.15s] hover:border-ink-3 hover:bg-surface-2"
          title={`Continue with ${n}`}
        >
          <span
            className="w-5 h-5 rounded-[6px] grid place-items-center text-white font-extrabold text-[11px] font-display"
            style={{ background: c }}
          >
            {g}
          </span>
          {n}
        </button>
      ))}
    </div>
  );
}

export default function AuthPage() {
  const router = useRouter();
  const t = useT();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [role, setRole] = useState<"customer" | "provider">("customer");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [biz, setBiz] = useState("");
  const [remember, setRemember] = useState(true);
  const [agree, setAgree] = useState(false);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setErr(null);
  }, [mode, admin]);

  const dest = (u: { role: string }) =>
    u.role === "admin"
      ? "/admin"
      : u.role === "provider"
        ? "/provider"
        : "/joymap";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    const p =
      mode === "login"
        ? rpc<{ role: string }>("login", { email, pw }).then((u) => {
            if (admin && u.role !== "admin")
              throw new Error("This account is not on the platform team.");
            return u;
          })
        : rpc<{ role: string }>("signup", { name, email, pw, role, biz });
    p.then((u) => {
      setTimeout(() => router.push(dest(u)), 250);
    }).catch((er: Error) => {
      setBusy(false);
      setErr(er.message || "Something went wrong.");
    });
  };

  const canSubmit =
    mode === "login"
      ? email.length > 2 && pw.length > 0
      : email.length > 2 &&
        pw.length > 0 &&
        name.length > 1 &&
        agree &&
        (role !== "provider" || biz.length > 1);

  return (
    <div className="auth-wrap">
      <div className="flex flex-col items-center justify-center gap-4 px-7 py-10 relative bg-bg">
        <div className="hidden max-[920px]:flex items-center justify-between w-full max-w-[420px] mb-1">
          <Link
            href="/"
            className="inline-flex"
            style={{ textDecoration: "none" }}
          >
            <Logo size={26} />
          </Link>
        </div>
        <div
          className="absolute top-[18px]"
          style={{ insetInlineEnd: 24, zIndex: 5 }}
        >
          <LangSwitcher />
        </div>

        <div
          className={`w-full max-w-[420px] bg-surface border border-line rounded-xl shadow-lg pt-[30px] px-[30px] pb-[26px] animate-anim-cardin motion-reduce:animate-none ${
            busy ? "pointer-events-none" : ""
          }`}
        >
          {mode === "reset" ? (
            <ResetFlow
              initialEmail={email}
              onBackToLogin={() => setMode("login")}
            />
          ) : (
            <>
              <div className="relative grid grid-cols-2 bg-surface-2 border border-line rounded-pill p-[5px] mb-[22px]">
                <button
                  className={`relative z-[2] py-[9px] rounded-pill font-bold text-[14px] [transition:0.2s] ${
                    mode === "login" ? "text-white" : "text-ink-3"
                  }`}
                  onClick={() => setMode("login")}
                >
                  {t("Log in")}
                </button>
                <button
                  className={`relative z-[2] py-[9px] rounded-pill font-bold text-[14px] [transition:0.2s] ${
                    mode === "signup" ? "text-white" : "text-ink-3"
                  }`}
                  onClick={() => setMode("signup")}
                >
                  {t("Sign up")}
                </button>
                <span
                  className="absolute z-[1] top-[5px] left-[5px] w-[calc(50%-5px)] h-[calc(100%-10px)] rounded-pill bg-coral shadow-coral [transition:transform_0.25s_cubic-bezier(0.22,1,0.36,1)]"
                  style={{
                    transform: `translateX(${mode === "login" ? 0 : 100}%)`,
                  }}
                />
              </div>

              <div>
                <h2 className="text-[25px]">
                  {mode === "login"
                    ? t("Welcome back")
                    : t("Create your account")}
                </h2>
                <p className="text-ink-2 text-[14.5px] mt-[6px] leading-[1.5]">
                  {mode === "login"
                    ? t("Pick up your week of joy where you left off.")
                    : t("A minute to set up — then your first Joy Map is on us.")}
                </p>
              </div>

              <form onSubmit={submit} className={BODY}>
                {mode === "signup" && !admin && (
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

                {mode === "signup" && !admin && (
                  <Field
                    label={t("Full name")}
                    icon="user"
                    value={name}
                    onChange={setName}
                    autoComplete="name"
                  />
                )}
                {mode === "signup" && role === "provider" && !admin && (
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
                  meter={mode === "signup"}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                />

                {mode === "login" && (
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
                    <a
                      className={`${LINK} whitespace-nowrap`}
                      onClick={() => setMode("reset")}
                    >
                      {t("Forgot password?")}
                    </a>
                  </div>
                )}

                {mode === "signup" && !admin && (
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
                    <Icons.flame
                      size={16}
                      style={{ flex: "none", marginTop: 1 }}
                    />
                    {err}
                  </div>
                )}

                <button
                  type="submit"
                  className={btnCls("auth", "primary", "lg", true)}
                  disabled={!canSubmit}
                  style={
                    !canSubmit ? { opacity: 0.5, boxShadow: "none" } : undefined
                  }
                >
                  {busy ? (
                    <span className={SPIN} />
                  ) : (
                    <>
                      {mode === "login"
                        ? admin
                          ? t("Enter admin panel")
                          : t("Log in")
                        : t("Create account")}
                      <Icons.arrowR size={19} />
                    </>
                  )}
                </button>

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
                {mode === "login" ? (
                  <>
                    {t("New to Joymap?")}{" "}
                    <a className={LINK_STRONG} onClick={() => setMode("signup")}>
                      {t("Create an account")}
                    </a>
                  </>
                ) : (
                  <>
                    {t("Already have an account?")}{" "}
                    <a className={LINK_STRONG} onClick={() => setMode("login")}>
                      {t("Log in")}
                    </a>
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {mode !== "reset" && (
          <button
            className="inline-flex items-center gap-[7px] text-ink-3 text-[13px] font-bold px-[14px] py-2 rounded-full [transition:0.15s] hover:text-ink hover:bg-surface-2"
            onClick={() => {
              setAdmin((a) => !a);
              setMode("login");
            }}
          >
            <Icons.settings size={15} />
            {admin ? "Back to member sign-in" : "Sign in as platform team"}
          </button>
        )}
      </div>
    </div>
  );
}
