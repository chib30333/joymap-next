"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Icons, Logo } from "@/components/Icons";
import { LangSwitcher } from "@/components/Language";
import { Button } from "@/components/ui";
import { AuthTabs } from "../../components/auth/AuthTabs";
import { LoginForm } from "../../components/auth/LoginForm";
import { SignupForm } from "../../components/auth/SignupForm";
import { ResetFlow } from "../../components/auth/ResetFlow";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup" | "reset">("login");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
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

  // Shared submit driver: flip busy/err, navigate on success.
  const runAuth = (p: Promise<{ role: string }>) => {
    setBusy(true);
    setErr(null);
    p.then((u) => {
      setTimeout(() => router.push(dest(u)), 250);
    }).catch((er: Error) => {
      setBusy(false);
      setErr(er.message || "Something went wrong.");
    });
  };

  return (
    <div className="auth-wrap">
      <div className="flex flex-col items-center justify-center gap-4 px-8 py-10 relative bg-bg">
        <div className="flex items-center justify-between w-full max-w-[420px] mb-1">
          <Link href="/" className="inline-flex no-underline">
            <Logo size={26} />
          </Link>
        </div>
        <div className="absolute top-5 [inset-inline-end:24px] z-10">
          <LangSwitcher />
        </div>

        <div
          className={`w-full max-w-[420px] bg-surface border border-line rounded-xl shadow-lg pt-6 px-6 pb-6 animate-anim-cardin motion-reduce:animate-none ${
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
              <AuthTabs mode={mode} onMode={setMode} />
              {mode === "login" ? (
                <LoginForm
                  email={email}
                  setEmail={setEmail}
                  pw={pw}
                  setPw={setPw}
                  busy={busy}
                  err={err}
                  admin={admin}
                  runAuth={runAuth}
                  onForgot={() => setMode("reset")}
                  onSignup={() => setMode("signup")}
                />
              ) : (
                <SignupForm
                  email={email}
                  setEmail={setEmail}
                  pw={pw}
                  setPw={setPw}
                  busy={busy}
                  err={err}
                  admin={admin}
                  runAuth={runAuth}
                  onLogin={() => setMode("login")}
                />
              )}
            </>
          )}
        </div>

        {mode !== "reset" && (
          <Button
            ctx="auth"
            icon={<Icons.settings size={15} />}
            className="text-ink-3 px-3 py-2 hover:text-ink hover:bg-surface-2"
            onClick={() => {
              setAdmin((a) => !a);
              setMode("login");
            }}
          >
            {admin ? "Back to member sign-in" : "Sign in as platform team"}
          </Button>
        )}
      </div>
    </div>
  );
}
