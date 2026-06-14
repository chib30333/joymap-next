"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  const t = useT();
  const [query, setQuery] = useState("");

  const search = (v: string) => {
    setQuery(v);
  };
  const submitSearch = () =>
    router.push(`/discover${query ? `?q=${encodeURIComponent(query)}` : ""}`);

  return (
    <header className="sticky top-0 z-40 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] [backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)] border-b border-line">
      <div className="flex items-center gap-4 py-[13px] px-[30px] max-[720px]:flex-wrap">
        <div className="flex items-center gap-[9px] flex-none">
          <Logo size={26} />
          <span className="inline-flex items-center gap-[5px] whitespace-nowrap bg-[color-mix(in_srgb,var(--orange)_16%,transparent)] text-orange-deep py-[3px] px-[9px] rounded-[99px] text-[10px] font-extrabold font-display">
            <span className="w-[6px] h-[6px] rounded-[99px] bg-orange" />
            Live now!
          </span>
        </div>
        <div className="flex-1 max-w-[460px] relative mx-[8px]">
          <span className="absolute text-ink-3 start-[15px] top-1/2 [transform:translateY(-50%)]">
            <Icons.search size={18} />
          </span>
          <Input
            placeholder={t("Search activities, moods, places…")}
            value={query}
            onChange={(e) => search(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitSearch();
            }}
            onFocus={() => {
              if (pathname !== "/discover") router.push("/discover");
            }}
            className="[padding-inline-start:44px] [border-radius:var(--r-pill)] [background:var(--surface)]"
          />
        </div>
        <div className="flex-1" />
        <CityMenu city={city} />
        <button
          className="w-[42px] h-[42px] rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
          onClick={() => router.push("/notifications")}
        >
          <Icons.bell size={19} />
          {unread > 0 && <span className="absolute top-[9px] right-[10px] w-2 h-2 rounded-full bg-coral border-2 border-surface" />}
        </button>
        <LangSwitcher />
        <AccountMenu user={user} />
      </div>
      <div className="flex items-center gap-[2px] px-[30px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {NAV.map((n) => {
          const I = Icons[n.icon];
          const b = (badges as Record<string, number | null>)[n.key];
          const on =
            pathname === n.href || (n.href === "/joymap" && pathname === "/");
          return (
            <button
              key={n.key}
              className={`inline-flex items-center gap-2 py-[13px] px-[15px] font-semibold text-[14px] whitespace-nowrap cursor-pointer relative [transition:0.14s] border-b-[2.5px] border-solid mb-[-1px] hover:text-ink ${on ? "text-coral border-coral [&_svg]:text-coral" : "text-ink-2 border-transparent"}`}
              onClick={() => router.push(n.href)}
            >
              <I size={18} />
              {t(n.label)}
              {b ? <span className="bg-coral text-white text-[10.5px] font-extrabold min-w-[17px] h-[17px] rounded-[99px] grid place-items-center px-1">{b}</span> : null}
            </button>
          );
        })}
      </div>
    </header>
  );
}

function CityMenu({ city }: { city: string }) {
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
    <div ref={ref} className="relative">
      <button
        className="inline-flex items-center gap-[7px] rounded-pill text-[13px] font-semibold border border-line-2 bg-surface text-ink-2 cursor-pointer [transition:0.14s] whitespace-nowrap hover:border-ink-3 hover:text-ink p-[10px_14px]"
        onClick={() => setOpen((o) => !o)}
      >
        <Icons.pin size={16} />
        {t(city)}
        <Icons.chevR
          size={14}
          className="[transform:rotate(90deg)] opacity-[0.6]"
        />
      </button>
      {open && (
        <div className="absolute end-0 top-[54px] bg-surface border border-line rounded shadow-lg p-2 z-[60] animate-anim-pop-app min-w-[180px]">
          {CITIES.map((c) => (
            <button
              key={c}
              className={`flex items-center gap-[11px] w-full py-[10px] px-[11px] rounded-sm text-[14px] font-semibold cursor-pointer [transition:0.12s] text-left ${c === city ? "bg-coral-soft text-coral-deep" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
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
  const logout = async () => {
    await rpc("logout");
    router.push("/auth");
  };
  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 cursor-pointer p-[3px] rounded-[99px] [transition:0.14s] hover:bg-surface-2" onClick={() => setOpen((o) => !o)}>
        <Avatar name={user.name} size={38} />
        <Icons.chevR
          size={15}
          className="[transform:rotate(90deg)] text-[var(--ink-3)]"
        />
      </div>
      {open && (
        <div className="absolute end-0 top-[54px] min-w-[248px] bg-surface border border-line rounded shadow-lg p-2 z-[60] animate-anim-pop-app">
          <div className="flex items-center gap-[11px] pt-[8px] px-[10px] pb-[12px]">
            <Avatar name={user.name} size={42} />
            <div className="min-w-0">
              <div className="font-extrabold font-display text-[15px]">
                {user.name}
              </div>
              <div className="text-[12px] text-[var(--orange)] font-bold inline-flex items-center gap-[4px]">
                <Icons.sparkle size={12} />
                {user.plan}
              </div>
            </div>
          </div>
          <button
            className="flex items-center gap-[11px] w-full py-[10px] px-[11px] rounded-sm text-[14px] font-semibold text-ink-2 cursor-pointer [transition:0.12s] text-left hover:bg-surface-2 hover:text-ink"
            onClick={() => {
              router.push("/profile");
              setOpen(false);
            }}
          >
            <Icons.user size={18} />
            {t("Your profile")}
          </button>
          <button
            className="flex items-center gap-[11px] w-full py-[10px] px-[11px] rounded-sm text-[14px] font-semibold text-ink-2 cursor-pointer [transition:0.12s] text-left hover:bg-surface-2 hover:text-ink"
            onClick={() => {
              router.push("/wallet");
              setOpen(false);
            }}
          >
            <Icons.wallet size={18} />
            {t("Wallet")}
          </button>
          <button
            className="flex items-center gap-[11px] w-full py-[10px] px-[11px] rounded-sm text-[14px] font-semibold text-ink-2 cursor-pointer [transition:0.12s] text-left hover:bg-surface-2 hover:text-ink"
            onClick={() => {
              router.push("/profile");
              setOpen(false);
            }}
          >
            <Icons.settings size={18} />
            {t("Settings")}
          </button>
          <div className="h-px bg-line my-[6px] mx-[4px]" />
          <button
            className="flex items-center gap-[11px] w-full py-[10px] px-[11px] rounded-sm text-[14px] font-semibold cursor-pointer [transition:0.12s] text-left hover:bg-surface-2 hover:text-ink text-[var(--ink-3)]"
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
