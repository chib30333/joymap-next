"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icons, Logo } from "@/components/Icons";
import { LangSwitcher, useT } from "@/components/i18n";
import { Input } from "@/components/ui/input";
import { rpc } from "@/lib/client";

const A_MOODS: [string, string][] = [
  ["Calm", "#3FA89B"],
  ["Joy", "#E89015"],
  ["Energy", "#FF4D74"],
  ["Focus", "#5563D6"],
  ["Adventure", "#7B53F0"],
  ["Connection", "#FF8A4C"],
];
const A_TILES = [
  "linear-gradient(150deg,#6FD4C4,#2E8C80)",
  "linear-gradient(150deg,#FF6F8E,#D81E52)",
  "linear-gradient(150deg,#9E7BF6,#5B33C9)",
  "linear-gradient(150deg,#FBC15B,#E08B12)",
  "linear-gradient(150deg,#7E8BE6,#3F49B0)",
  "linear-gradient(150deg,#FF9A57,#E36A1E)",
];
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
    <label className="afield">
      <span className="afield-label">{label}</span>
      <span className="afield-wrap">
        {I && (
          <span className="afield-icon">
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
            className="afield-eye"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
          >
            {show ? "Hide" : "Show"}
          </button>
        }
      />
      {meter && value.length > 0 && (
        <div className="pwmeter">
          <div className="pwbar">
            <span style={{ width: `${score.pct}%`, background: score.color }} />
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
    <div className="code-row" onPaste={onPaste}>
      {Array.from({ length: len }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          className="code-box"
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
        <button className="auth-back" type="button" onClick={back}>
          <Icons.arrowL size={17} />
          Back
        </button>
      )}
      {(step === "sent" || step === "success") && (
        <div className={`reset-ic ${step === "success" ? "ok" : ""}`}>
          {step === "success" ? (
            <Icons.check size={34} />
          ) : (
            <Icons.mail size={32} />
          )}
        </div>
      )}
      <div
        className="auth-head"
        style={
          step === "sent" || step === "success"
            ? { textAlign: "center" }
            : undefined
        }
      >
        <h2>{titles[step][0]}</h2>
        <p>{titles[step][1]}</p>
      </div>

      {step === "forgot" && (
        <form
          className="auth-body"
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
            className="btn btn-primary btn-lg btn-block"
            disabled={email.length < 3 || busy}
            style={
              email.length < 3 ? { opacity: 0.5, boxShadow: "none" } : undefined
            }
          >
            {busy ? (
              <span className="spin" />
            ) : (
              <>
                Send reset code
                <Icons.arrowR size={19} />
              </>
            )}
          </button>
          <div className="auth-foot" style={{ marginTop: 4 }}>
            Remembered it?{" "}
            <a className="auth-link strong" onClick={onBackToLogin}>
              Back to log in
            </a>
          </div>
        </form>
      )}

      {step === "sent" && (
        <form
          className="auth-body"
          onSubmit={(e) => {
            e.preventDefault();
            run("reset");
          }}
        >
          <CodeInput value={code} onChange={setCode} />
          <button
            type="submit"
            className="btn btn-primary btn-lg btn-block"
            disabled={code.length < 6 || busy}
            style={
              code.length < 6 ? { opacity: 0.5, boxShadow: "none" } : undefined
            }
          >
            {busy ? (
              <span className="spin" />
            ) : (
              <>
                Verify code
                <Icons.arrowR size={19} />
              </>
            )}
          </button>
          <div className="auth-foot" style={{ marginTop: 4 }}>
            {resend > 0 ? (
              <span className="text-ink-3">
                Resend code in 0:{String(resend).padStart(2, "0")}
              </span>
            ) : (
              <>
                Didn&apos;t get it?{" "}
                <a className="auth-link strong" onClick={() => setStep("sent")}>
                  Resend code
                </a>
              </>
            )}
          </div>
        </form>
      )}

      {step === "reset" && (
        <form
          className="auth-body"
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
                className="match-row"
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
            className="btn btn-primary btn-lg btn-block"
            disabled={!(pwOK && matchOK) || busy}
            style={
              !(pwOK && matchOK)
                ? { opacity: 0.5, boxShadow: "none" }
                : undefined
            }
          >
            {busy ? (
              <span className="spin" />
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
        <div className="auth-body">
          <button
            className="btn btn-primary btn-lg btn-block"
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
    <div className="social-row">
      {items.map(([n, c, g]) => (
        <button
          key={n}
          type="button"
          className="social-btn"
          title={`Continue with ${n}`}
        >
          <span className="social-glyph" style={{ background: c }}>
            {g}
          </span>
          {n}
        </button>
      ))}
    </div>
  );
}

function Showcase() {
  return (
    <div className="auth-brand">
      <div className="auth-brand-inner">
        <div className="auth-brand-top" style={{ color: "#F6EAD9" }}>
          <Link
            href="/"
            title="Back to the Joymap site"
            className="inline-flex"
            style={{ textDecoration: "none" }}
          >
            <Logo size={30} mono />
          </Link>
          <span className="live-badge">
            <span className="live-dot" />
            Live now!
          </span>
        </div>
        <div className="auth-tiles" aria-hidden="true">
          {A_TILES.map((g, i) => (
            <span
              key={i}
              className="auth-tile"
              style={{ background: g, animationDelay: `${i * 0.4}s` }}
            />
          ))}
        </div>
        <div className="auth-hero">
          <h1>Turn this week into a week worth remembering.</h1>
          <p>
            Joymap reads your mood and books real-life experiences around it —
            from sunrise yoga to neon karting. One subscription, infinite joy.
          </p>
        </div>
        <div className="mood-row" aria-hidden="true">
          {A_MOODS.map(([n, c]) => (
            <span
              key={n}
              className="mood-pill"
              style={{
                background: `color-mix(in srgb,${c} 16%,transparent)`,
                color: c,
                borderColor: `color-mix(in srgb,${c} 35%,transparent)`,
              }}
            >
              <span
                className="w-[7px] h-[7px] rounded-[99px]"
                style={{ background: c }}
              />
              {n}
            </span>
          ))}
        </div>
        <div className="auth-quote">
          <div className="auth-stars">★★★★★</div>
          <p>
            &quot;It&apos;s like having a friend who always knows the perfect
            thing to do. I&apos;ve tried 14 new things in two months.&quot;
          </p>
          <div className="auth-quote-by">
            <span className="auth-quote-av">A</span>
            <div>
              <b>Anya K.</b>
              <span>Joy Map+ member · Moscow</span>
            </div>
          </div>
        </div>
      </div>
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
    <div className="auth-wrap fx">
      <Showcase />
      <div className="auth-form-col">
        <div className="auth-mobilebrand">
          <Link
            href="/"
            className="inline-flex"
            style={{ textDecoration: "none" }}
          >
            <Logo size={26} />
          </Link>
          <span className="live-badge">
            <span className="live-dot" />
            Live now!
          </span>
        </div>
        <div
          className="absolute top-[18px]"
          style={{ insetInlineEnd: 24, zIndex: 5 }}
        >
          <LangSwitcher />
        </div>

        <div className={`auth-card ${busy ? "is-busy" : ""}`}>
          {mode === "reset" ? (
            <ResetFlow
              initialEmail={email}
              onBackToLogin={() => setMode("login")}
            />
          ) : (
            <>
              <div className="auth-tabs">
                <button
                  className={mode === "login" ? "on" : ""}
                  onClick={() => setMode("login")}
                >
                  {t("Log in")}
                </button>
                <button
                  className={mode === "signup" ? "on" : ""}
                  onClick={() => setMode("signup")}
                >
                  {t("Sign up")}
                </button>
                <span
                  className="auth-tab-ind"
                  style={{
                    transform: `translateX(${mode === "login" ? 0 : 100}%)`,
                  }}
                />
              </div>

              <div className="auth-head">
                <h2>
                  {mode === "login"
                    ? t("Welcome back")
                    : t("Create your account")}
                </h2>
                <p>
                  {mode === "login"
                    ? t("Pick up your week of joy where you left off.")
                    : t("A minute to set up — then your first Joy Map is on us.")}
                </p>
              </div>

              <form onSubmit={submit} className="auth-body">
                {mode === "signup" && !admin && (
                  <div className="role-grid">
                    {Object.entries(ROLES).map(([k, r]) => {
                      const I = Icons[r.icon];
                      return (
                        <button
                          type="button"
                          key={k}
                          className={`role-card ${role === k ? "on" : ""}`}
                          onClick={() => setRole(k as "customer" | "provider")}
                        >
                          <span className="role-ic">
                            <I size={20} />
                          </span>
                          <span className="role-t">
                            {k === "customer"
                              ? t("I want to explore")
                              : t("I host experiences")}
                          </span>
                          <span className="role-s">{t(r.sub)}</span>
                          <span className="role-check">
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
                  <div className="auth-row">
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                      <span className="checkbox">
                        <Icons.check size={12} />
                      </span>
                      {t("Remember me")}
                    </label>
                    <a className="auth-link" onClick={() => setMode("reset")}>
                      {t("Forgot password?")}
                    </a>
                  </div>
                )}

                {mode === "signup" && !admin && (
                  <label className="check check-terms">
                    <input
                      type="checkbox"
                      checked={agree}
                      onChange={(e) => setAgree(e.target.checked)}
                    />
                    <span className="checkbox">
                      <Icons.check size={12} />
                    </span>
                    <span>
                      I agree to the <a className="auth-link">Terms</a> &amp;{" "}
                      <a className="auth-link">Privacy Policy</a>.
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
                  className="btn btn-primary btn-lg btn-block"
                  disabled={!canSubmit}
                  style={
                    !canSubmit ? { opacity: 0.5, boxShadow: "none" } : undefined
                  }
                >
                  {busy ? (
                    <span className="spin" />
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
                    <div className="auth-or">
                      <span>{t("or continue with")}</span>
                    </div>
                    <Social />
                  </>
                )}
              </form>

              <div className="auth-foot">
                {mode === "login" ? (
                  <>
                    {t("New to Joymap?")}{" "}
                    <a
                      className="auth-link strong"
                      onClick={() => setMode("signup")}
                    >
                      {t("Create an account")}
                    </a>
                  </>
                ) : (
                  <>
                    {t("Already have an account?")}{" "}
                    <a
                      className="auth-link strong"
                      onClick={() => setMode("login")}
                    >
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
            className="team-toggle"
            onClick={() => {
              setAdmin((a) => !a);
              setMode("login");
            }}
          >
            <Icons.settings size={15} />
            {admin ? "Back to member sign-in" : "Sign in as platform team"}
          </button>
        )}
        {mode !== "reset" && <DemoHint admin={admin} />}
      </div>
    </div>
  );
}

function DemoHint({ admin }: { admin: boolean }) {
  const rows = admin
    ? [["Platform team", "admin@joymap.ru", "JoymapAdmin!2026"]]
    : [
        ["Customer", "mira@joymap.ru", "JoymapDemo!2026"],
        ["Provider", "aether@joymap.ru", "JoymapDemo!2026"],
      ];
  return (
    <div
      className="w-full max-w-[420px] bg-surface-2 rounded px-[16px] py-[12px]"
      style={{ border: "1px dashed var(--line-2)" }}
    >
      <div className="text-[11.5px] font-extrabold tracking-[.06em] uppercase text-ink-3 mb-[8px]">
        Demo accounts (after seeding)
      </div>
      {rows.map(([l, e, p]) => (
        <div
          key={e}
          className="flex gap-[10px] text-[12.5px] font-semibold text-ink-2 px-0 py-[3px]"
        >
          <span className="w-[96px] text-ink-3">{l}</span>
          <b>{e}</b>
          <span className="ml-auto font-display">{p}</span>
        </div>
      ))}
    </div>
  );
}
