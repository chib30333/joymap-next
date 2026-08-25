"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Icons, Logo } from "@/components/Icons";
import { LangSwitcher, useT } from "@/components/Language";
import { Avatar, CITIES } from "@/components/customer/primitives";
import { Input } from "@/components/ui";
import { rpc } from "@/lib/client";

const NAV: {
  key: string;
  href: string;
  label: string;
  icon: keyof typeof Icons;
}[] = [
  { key: "joymap", href: "/joymap", label: "Joy Map", icon: "map" },
  { key: "catalog", href: "/discover", label: "Discover", icon: "compass" },
  { key: "calendar", href: "/calendar", label: "Calendar", icon: "schedule" },
  { key: "bookings", href: "/bookings", label: "Bookings", icon: "calendar" },
  { key: "messages", href: "/messages", label: "Messages", icon: "chat" },
  { key: "favorites", href: "/favorites", label: "Favorites", icon: "heart" },
  { key: "wallet", href: "/wallet", label: "Wallet", icon: "wallet" },
  {
    key: "corporate",
    href: "/corporate",
    label: "Corporate",
    icon: "briefcase",
  },
];

export function TopNav({
  user,
  badges,
  unread,
  city,
}: {
  user: { name: string; plan: string };
  badges: { bookings: number | null; messages: number | null };
  unread: number;
  city: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const t = useT();
  const urlQuery = params.get("q") || "";
  const [query, setQuery] = useState(urlQuery);

  // The field mirrors the URL. Arriving on /discover?q=… from the landing hero,
  // or stepping back through history, has to leave the box showing the term the
  // results are actually filtered on.
  useEffect(() => {
    setQuery(urlQuery);
  }, [urlQuery]);

  const submitSearch = () => {
    const q = query.trim();
    router.push(`/discover${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };
  const clearSearch = () => {
    setQuery("");
    router.push("/discover");
  };

  return (
    <header className="sticky top-0 z-40 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] [backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)] border-b border-line">
      {/* Wrapping row: on phones and tablets the search box drops to a
          full-width line of its own (order-last) so the brand and the account
          controls still fit across a 320px screen. Only from lg up — where the
          row is wide enough for a usable field — does it sit inline. Below sm
          the city picker rides along on that second line, which is what buys
          the first row enough width to keep the account controls together. */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 lg:gap-4 py-3 px-[var(--pad)]">
        <div className="flex items-center gap-2.5 flex-none">
          <Logo size={26} />
          <span className="hidden sm:inline-flex items-center gap-1.5 whitespace-nowrap bg-[color-mix(in_srgb,var(--orange)_16%,transparent)] text-orange-deep py-1 px-2 rounded-pill text-[10px] font-extrabold font-display">
            <span className="w-1.5 h-1.5 rounded-pill bg-orange" />
            Live now!
          </span>
        </div>
        <div className="order-last flex w-full min-w-0 items-center gap-2 lg:order-none lg:w-auto lg:flex-1 lg:max-w-[460px] lg:mx-2">
          <CityMenu city={city} className="sm:hidden" />
          <div className="relative flex-1 min-w-0">
            <span className="absolute text-ink-3 start-[15px] top-1/2 [transform:translateY(-50%)]">
              <Icons.search size={18} />
            </span>
            <Input
              type="search"
              enterKeyHint="search"
              placeholder={t("Search activities, moods, places…")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitSearch();
                if (e.key === "Escape" && query) clearSearch();
              }}
              onFocus={() => {
                if (pathname !== "/discover") router.push("/discover");
              }}
              className="[padding-inline-start:44px] [padding-inline-end:40px] [border-radius:var(--r-pill)] [background:var(--surface)] [&::-webkit-search-cancel-button]:hidden"
            />
            {/* Our own clear control rather than the native one: the term has to
                come out of the URL too, not just out of the box. */}
            {query && (
              <button
                aria-label={t("Clear search")}
                className="absolute end-[6px] top-1/2 [transform:translateY(-50%)] w-8 h-8 rounded-pill grid place-items-center text-ink-3 cursor-pointer duration-[140ms] hover:text-ink hover:bg-surface-2"
                onClick={clearSearch}
              >
                <Icons.close size={16} />
              </button>
            )}
          </div>
        </div>
        <div className="flex-1" />
        {/* The account controls travel as one unbreakable cluster: the avatar
            has to stay next to the language switcher, never drop to its own
            line, however narrow the screen gets. */}
        <div className="flex flex-none items-center gap-2 sm:gap-3 lg:gap-4">
          <CityMenu city={city} className="hidden sm:block" />
          <button
            aria-label={t("Notifications")}
            className="w-10 h-10 sm:w-11 sm:h-11 flex-none rounded-pill grid place-items-center bg-surface border border-line text-ink-2 duration-150 relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
            onClick={() => router.push("/notifications")}
          >
            <Icons.bell size={19} />
            {unread > 0 && <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 w-2 h-2 rounded-full bg-coral border-2 border-surface" />}
          </button>
          <LangSwitcher />
          <AccountMenu user={user} />
        </div>
      </div>
      <div className="rail flex items-center gap-0.5 px-[var(--pad)]">
        {NAV.map((n) => {
          const I = Icons[n.icon];
          const b = (badges as Record<string, number | null>)[n.key];
          const on =
            pathname === n.href || (n.href === "/joymap" && pathname === "/");
          return (
            <button
              key={n.key}
              className={`inline-flex items-center gap-2 py-3 sm:py-3.5 px-3 sm:px-4 font-semibold text-sm whitespace-nowrap cursor-pointer relative duration-[140ms] border-b-[2.5px] border-solid mb-[-1px] hover:text-ink ${on ? "text-coral border-coral [&_svg]:text-coral" : "text-ink-2 border-transparent"}`}
              onClick={() => router.push(n.href)}
            >
              <I size={18} />
              {t(n.label)}
              {b ? <span className="bg-coral text-white text-[10.5px] font-extrabold min-w-[17px] h-[17px] rounded-pill grid place-items-center px-1">{b}</span> : null}
            </button>
          );
        })}
      </div>
    </header>
  );
}

function CityMenu({ city, className = "" }: { city: string; className?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useT();
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const pick = (c: string) => {
    document.cookie = `jm_city=${encodeURIComponent(c)};path=/;max-age=31536000`;
    setOpen(false);
    router.refresh();
  };
  return (
    <div ref={ref} className={`relative flex-none ${className}`.trimEnd()}>
      {/* Phones show the pin alone — the city name costs ~60px that the search
          field next to it needs, and the open menu marks the current city
          anyway. */}
      <button
        aria-label={t(city)}
        className="inline-flex items-center gap-2 rounded-pill text-sm font-semibold border border-line-2 bg-surface text-ink-2 cursor-pointer duration-[140ms] whitespace-nowrap hover:border-ink-3 hover:text-ink h-11 px-3 sm:px-3.5"
        onClick={() => setOpen((o) => !o)}
      >
        <Icons.pin size={16} />
        <span className="hidden sm:inline max-w-[10ch] truncate">{t(city)}</span>
        <Icons.chevR
          size={14}
          className="[transform:rotate(90deg)] opacity-60"
        />
      </button>
      {open && (
        <div className="absolute start-0 sm:start-auto sm:end-0 top-[calc(100%+8px)] bg-surface border border-line rounded shadow-lg p-2 z-[60] animate-anim-pop-app min-w-[180px] max-w-[calc(100vw-2*var(--pad))]">
          {CITIES.map((c) => (
            <button
              key={c}
              className={`flex items-center gap-3 w-full py-2.5 px-3 rounded-sm text-sm font-semibold cursor-pointer duration-[120ms] text-left ${c === city ? "bg-coral-soft text-coral-deep" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
              onClick={() => pick(c)}
            >
              <Icons.pin size={16} />
              {t(c)}
              {c === city && (
                <span className="text-coral ms-auto">
                  <Icons.check size={16} />
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AccountMenu({ user }: { user: { name: string; plan: string } }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const t = useT();
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  // Full document load, not router.push: dropping the session invalidates every
  // page this tab has cached, and a client-side push would happily re-render
  // the signed-in shell from that stale cache.
  const logout = async () => {
    await rpc("logout");
    window.location.assign("/auth");
  };
  return (
    <div ref={ref} className="relative flex-none">
      <div className="flex items-center gap-1.5 cursor-pointer p-1 rounded-pill duration-[140ms] hover:bg-surface-2" onClick={() => setOpen((o) => !o)}>
        <Avatar name={user.name} size={36} />
        <Icons.chevR
          size={15}
          className="[transform:rotate(90deg)] text-[var(--ink-3)] hidden sm:block"
        />
      </div>
      {open && (
        <div className="absolute end-0 top-[calc(100%+8px)] w-[248px] max-w-[calc(100vw-2*var(--pad))] bg-surface border border-line rounded shadow-lg p-2 z-[60] animate-anim-pop-app">
          <div className="flex items-center gap-3 pt-2 px-2.5 pb-3">
            <Avatar name={user.name} size={42} />
            <div className="min-w-0">
              <div className="font-extrabold font-display text-[15px]">
                {user.name}
              </div>
              <div className="text-xs text-[var(--orange)] font-bold inline-flex items-center gap-1">
                <Icons.sparkle size={12} />
                {user.plan}
              </div>
            </div>
          </div>
          <button
            className="flex items-center gap-3 w-full py-2.5 px-3 rounded-sm text-sm font-semibold text-ink-2 cursor-pointer duration-[120ms] text-left hover:bg-surface-2 hover:text-ink"
            onClick={() => {
              router.push("/profile");
              setOpen(false);
            }}
          >
            <Icons.user size={18} />
            {t("Your profile")}
          </button>
          <button
            className="flex items-center gap-3 w-full py-2.5 px-3 rounded-sm text-sm font-semibold text-ink-2 cursor-pointer duration-[120ms] text-left hover:bg-surface-2 hover:text-ink"
            onClick={() => {
              router.push("/wallet");
              setOpen(false);
            }}
          >
            <Icons.wallet size={18} />
            {t("Wallet")}
          </button>
          <button
            className="flex items-center gap-3 w-full py-2.5 px-3 rounded-sm text-sm font-semibold text-ink-2 cursor-pointer duration-[120ms] text-left hover:bg-surface-2 hover:text-ink"
            onClick={() => {
              router.push("/profile");
              setOpen(false);
            }}
          >
            <Icons.settings size={18} />
            {t("Settings")}
          </button>
          <div className="h-px bg-line my-1.5 mx-1" />
          <button
            className="flex items-center gap-3 w-full py-2.5 px-3 rounded-sm text-sm font-semibold cursor-pointer duration-[120ms] text-left hover:bg-surface-2 hover:text-ink text-[var(--ink-3)]"
            onClick={logout}
          >
            <Icons.logout size={18} />
            {t("Log out")}
          </button>
        </div>
      )}
    </div>
  );
}
