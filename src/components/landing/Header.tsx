import Link from "next/link";
import { Button } from "@/components/ui";
import { Logo } from "@/components/Icons";

type NavLink = {
  href: string;
  label: string;
};

const NAV_LINKS: NavLink[] = [
  { href: "#experiences", label: "Experiences" },
  { href: "#partners", label: "For partners" },
  { href: "#corporate", label: "Corporate" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur-[16px] border-b border-line">
      <div className="max-w-7xl mx-auto px-12 flex items-center gap-6 h-20">
        <Link className="flex items-center gap-2" href="/">
          <Logo />
        </Link>
        <nav className="flex gap-6 ms-2 max-[760px]:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className="font-semibold text-base text-ink-2 duration-[140ms] hover:text-coral-deep"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex-1" />
        <Button
          ctx="lp"
          variant="ghost"
          href="/auth"
          className="px-5 py-3 text-sm"
        >
          Sign in
        </Button>
        <Button
          ctx="lp"
          variant="primary"
          href="/auth"
          className="px-6 py-3 text-sm"
        >
          Get started
        </Button>
      </div>
    </header>
  );
}
