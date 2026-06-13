import Link from "next/link";
import { btnCls } from "@/lib/btn";
import { Logo } from "@/components/Icons";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur-[16px] border-b border-line">
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-6 h-20">
        <Link className="flex items-center gap-2" href="/">
          <Logo />
        </Link>
        <nav className="flex gap-6 ms-2 max-[760px]:hidden">
          <Link className="font-semibold text-base text-ink-2 [transition:0.14s] hover:text-coral-deep" href="#experiences">Experiences</Link>
          <Link className="font-semibold text-base text-ink-2 [transition:0.14s] hover:text-coral-deep" href="#partners">For partners</Link>
          <Link className="font-semibold text-base text-ink-2 [transition:0.14s] hover:text-coral-deep" href="#corporate">Corporate</Link>
        </nav>
        <div className="flex-1" />
        <Link
          className={btnCls("lp", "ghost")}
          href="/auth"
          style={{ padding: "11px 20px", fontSize: 14 }}
        >
          Sign in
        </Link>
        <Link
          className={btnCls("lp", "primary")}
          href="/auth"
          style={{ padding: "12px 22px", fontSize: 14 }}
        >
          Get started
        </Link>
      </div>
    </header>
  );
}
