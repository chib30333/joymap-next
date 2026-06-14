import Link from "next/link";
import { Button } from "@/components/ui";
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
        <Button
          ctx="lp"
          variant="ghost"
          href="/auth"
          className="[padding:11px_20px] text-[14px]"
        >
          Sign in
        </Button>
        <Button
          ctx="lp"
          variant="primary"
          href="/auth"
          className="[padding:12px_22px] text-[14px]"
        >
          Get started
        </Button>
      </div>
    </header>
  );
}
