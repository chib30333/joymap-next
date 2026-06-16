"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { rpc } from "@/lib/client";
import { Avatar } from "@/components/ui";
import { clsx } from "@/lib/cx";

function NavTab({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={clsx(
        "whitespace-nowrap rounded-pill px-3.5 py-2 text-sm font-bold transition",
        active
          ? "bg-coral-soft text-coral-deep"
          : "text-ink-2 hover:bg-surface-2",
      )}
    >
      {label}
    </Link>
  );
}

export function PortalNav({
  brandTag,
  name,
  tabs,
}: {
  brandTag: string;
  name: string;
  tabs: string[][];
}) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await rpc("logout");
    router.push("/auth");
  }
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
        <Link href={tabs[0][0]} className="font-display text-xl font-extrabold">
          joymap
        </Link>
        <span className="rounded-pill bg-orange/20 px-2.5 py-1 font-display text-[10px] font-extrabold text-orange">
          {brandTag}
        </span>
        <nav className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden ml-2 flex flex-1 items-center gap-1 overflow-x-auto">
          {tabs.map(([href, label]) => (
            <NavTab key={href} href={href} label={label} active={pathname === href} />
          ))}
        </nav>
        <button
          onClick={logout}
          className="text-sm font-bold text-ink-3 hover:text-ink"
        >
          Log out
        </button>
        <Avatar name={name} size={38} />
      </div>
    </header>
  );
}
