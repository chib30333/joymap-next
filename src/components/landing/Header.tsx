"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Icons, Logo } from "@/components/Icons";

type NavLink = {
  href: string;
  label: string;
};

const NAV_LINKS: NavLink[] = [
  { href: "#experiences", label: "Experiences" },
  { href: "#partners", label: "For partners" },
  { href: "#corporate", label: "Corporate" },
];

/** Width at which the links + auth buttons stop fitting next to the logo. */
const DESKTOP = 900;

export function Header() {
  const [open, setOpen] = useState(false);

  // Collapse the panel again once the viewport is wide enough for the inline nav,
  // otherwise it would linger as a stray block under the desktop header.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia(`(min-width: ${DESKTOP}px)`);
    const close = () => setOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur-[16px] border-b border-line">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center gap-4 md:gap-6 h-20">
        <Link className="flex items-center gap-2" href="/">
          <Logo />
        </Link>
        <nav className="flex gap-6 ms-2 max-[899px]:hidden">
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
          className="px-5 py-3 text-sm max-[899px]:hidden"
        >
          Sign in
        </Button>
        <Button
          ctx="lp"
          variant="primary"
          href="/auth"
          className="px-6 py-3 text-sm max-[899px]:hidden"
        >
          Get started
        </Button>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="lp-nav"
          onClick={() => setOpen((o) => !o)}
          className="grid min-[900px]:hidden w-11 h-11 flex-none place-items-center rounded-pill bg-surface border border-line-2 text-ink duration-[140ms] hover:border-ink-3"
        >
          {open ? <Icons.close size={20} /> : <Icons.menu size={20} />}
        </button>
      </div>

      {open && (
        <nav
          id="lp-nav"
          className="min-[900px]:hidden border-t border-line bg-bg px-5 sm:px-8 pt-2 pb-5 flex flex-col"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              className="font-semibold text-base text-ink-2 py-3 duration-[140ms] hover:text-coral-deep"
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2.5 mt-3 pt-4 border-t border-line">
            <Button
              ctx="lp"
              variant="ghost"
              href="/auth"
              className="w-full px-5 py-3 text-sm"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Button>
            <Button
              ctx="lp"
              variant="primary"
              href="/auth"
              className="w-full px-6 py-3 text-sm"
              onClick={() => setOpen(false)}
            >
              Get started
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
