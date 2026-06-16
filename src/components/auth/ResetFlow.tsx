"use client";

import { useEffect, useState } from "react";
import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui";
import { Field, PwField } from "./Field";
import { CodeInput } from "./CodeInput";
import { BODY, FOOT, LINK_STRONG, SPIN, pwScore } from "@/lib/auth";

export function ResetFlow({
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

  const titles: Record<
    typeof step,
    { title: string; body: React.ReactNode }
  > = {
    forgot: {
      title: "Reset your password",
      body: "Enter the email tied to your account and we'll send a 6-digit code.",
    },
    sent: {
      title: "Check your inbox",
      body: (
        <>
          We sent a code to <b className="text-ink">{email || "your email"}</b>.
          It expires in 10 minutes.
        </>
      ),
    },
    reset: {
      title: "Set a new password",
      body: "Choose something strong — at least 8 characters.",
    },
    success: {
      title: "Password updated",
      body: "Your password has been changed. You can sign in now.",
    },
  };
  const pwOK = pwScore(pw).pct >= 60 && pw.length >= 8;
  const matchOK = pw2.length > 0 && pw === pw2;

  return (
    <>
      {step !== "success" && (
        <button
          className="inline-flex items-center gap-1 text-ink-3 text-sm font-bold px-0.5 py-1 mb-3.5 duration-150 hover:text-ink"
          type="button"
          onClick={back}
        >
          <Icons.arrowL size={17} />
          Back
        </button>
      )}
      {(step === "sent" || step === "success") && (
        <div
          className={`w-16 h-16 rounded-full mx-auto mt-1 mb-4 grid place-items-center animate-anim-cardin motion-reduce:animate-none ${
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
        className={step === "sent" || step === "success" ? "text-center" : ""}
      >
        <h2 className="text-2xl">{titles[step].title}</h2>
        <p className="text-ink-2 text-sm mt-1.5 leading-normal">
          {titles[step].body}
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
          <Button
            ctx="auth"
            variant="primary"
            size="lg"
            block
            type="submit"
            disabled={email.length < 3 || busy}
            className={email.length < 3 ? "opacity-50 shadow-none" : ""}
          >
            {busy ? (
              <span className={SPIN} />
            ) : (
              <>
                Send reset code
                <Icons.arrowR size={19} />
              </>
            )}
          </Button>
          <div className={`${FOOT} [margin-top:4px]`}>
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
          <Button
            ctx="auth"
            variant="primary"
            size="lg"
            block
            type="submit"
            disabled={code.length < 6 || busy}
            className={code.length < 6 ? "opacity-50 shadow-none" : ""}
          >
            {busy ? (
              <span className={SPIN} />
            ) : (
              <>
                Verify code
                <Icons.arrowR size={19} />
              </>
            )}
          </Button>
          <div className={`${FOOT} mt-1`}>
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
                className={`flex items-center gap-1.5 text-sm font-bold mt-2 whitespace-nowrap ${matchOK ? "text-[#1FA46E]" : "text-[#FF4D74]"}`}
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
          <Button
            ctx="auth"
            variant="primary"
            size="lg"
            block
            type="submit"
            disabled={!(pwOK && matchOK) || busy}
            className={!(pwOK && matchOK) ? "opacity-50 shadow-none" : ""}
          >
            {busy ? (
              <span className={SPIN} />
            ) : (
              <>
                Update password
                <Icons.check size={19} />
              </>
            )}
          </Button>
        </form>
      )}

      {step === "success" && (
        <div className={BODY}>
          <Button
            ctx="auth"
            variant="primary"
            size="lg"
            block
            onClick={onBackToLogin}
          >
            Back to log in
            <Icons.arrowR size={19} />
          </Button>
        </div>
      )}
    </>
  );
}
