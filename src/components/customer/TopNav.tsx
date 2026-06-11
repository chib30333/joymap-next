"use client";
// TopNav — 1:1 port of shell.jsx (customer portal top navigation).
// Tab switching maps to routes; active state keys off the current pathname.
import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Icons, Logo } from "@/components/Icons";
import { LangSwitcher, t } from "@/components/i18n";
import { Avatar, CITIES } from "@/components/customer/primitives";
import { rpc } from "@/lib/client";

const NAV: { key: string; href: string; label: string; icon: keyof typeof Icons }[] = [
  { key: "joymap", href: "/joymap", label: "Joy Map", icon: "map" },
  { key: "catalog", href: "/discover", label: "Discover", icon: "compass" },
  { key: "calendar", href: "/calendar", label: "Calendar", icon: "schedule" },
  { key: "bookings", href: "/bookings", label: "Bookings", icon: "calendar" },
  { key: "messages", href: "/messages", label: "Messages", icon: "chat" },
  { key: "favorites", href: "/favorites", label: "Favorites", icon: "heart" },
  { key: "wallet", href: "/wallet", label: "Wallet", icon: "wallet" },
  { key: "corporate", href: "/corporate", label: "Corporate", icon: "briefcase" },
];

export function TopNav({ user, badges, unread, city }: {
  user: { name: string; plan: string };
  badges: { bookings: number | null; messages: number | null };
  unread: number;
  city: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const search = (v: string) => {
    setQuery(v);
  };
  const submitSearch = () => router.push(`/discover${query ? `?q=${encodeURIComponent(query)}` : ""}`);

  return (
    <header className="topnav">
      <div className="tn-row1">
        <div className="tn-brand">
          <Logo size={26} />
          <span className="tn-badge"><span className="ld" />Live now!</span>
        </div>
        <div style={{ flex: 1, maxWidth: 460, position: "relative", marginInline: 8 }}>
          <span style={{ position: "absolute", insetInlineStart: 15, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }}><Icons.search size={18} /></span>
          <input className="field" placeholder={t("Search activities, moods, places…")} value={query}
            onChange={(e) => search(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submitSearch(); }}
            onFocus={() => { if (pathname !== "/discover") router.push("/discover"); }}
            style={{ paddingInlineStart: 44, borderRadius: "var(--r-pill)", background: "var(--surface)" }} />
        </div>
        <div style={{ flex: 1 }} />
        <CityMenu city={city} />
        <button className="icon-btn" onClick={() => router.push("/notifications")}><Icons.bell size={19} />{unread > 0 && <span className="dot-badge" />}</button>
        <LangSwitcher />
        <AccountMenu user={user} />
      </div>
      <div className="tn-row2 no-scrollbar">
        {NAV.map((n) => {
          const I = Icons[n.icon];
          const b = (badges as Record<string, number | null>)[n.key];
          const on = pathname === n.href || (n.href === "/joymap" && pathname === "/");
          return (
            <button key={n.key} className={`tn-tab ${on ? "on" : ""}`} onClick={() => router.push(n.href)}>
              <I size={18} />{t(n.label)}{b ? <span className="tn-badge-n">{b}</span> : null}
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
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const pick = (c: string) => {
    document.cookie = `jm_city=${encodeURIComponent(c)};path=/;max-age=31536000`;
    setOpen(false);
    router.refresh();
  };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button className="chip" onClick={() => setOpen((o) => !o)} style={{ padding: "10px 14px" }}>
        <Icons.pin size={16} />{city}<Icons.chevR size={14} style={{ transform: "rotate(90deg)", opacity: 0.6 }} />
      </button>
      {open && (
        <div className="menu-pop anim-pop" style={{ minWidth: 180 }}>
          {CITIES.map((c) => (
            <button key={c} className={`menu-item ${c === city ? "on" : ""}`} onClick={() => pick(c)}>
              <Icons.pin size={16} />{c}{c === city && <span style={{ marginInlineStart: "auto", color: "var(--coral)" }}><Icons.check size={16} /></span>}
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
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const logout = async () => { await rpc("logout"); router.push("/auth"); };
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div className="tn-avatar-btn" onClick={() => setOpen((o) => !o)}>
        <Avatar name={user.name} size={38} />
        <Icons.chevR size={15} style={{ transform: "rotate(90deg)", color: "var(--ink-3)" }} />
      </div>
      {open && (
        <div className="menu-pop anim-pop">
          <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "8px 10px 12px" }}>
            <Avatar name={user.name} size={42} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontFamily: "var(--display)", fontSize: 15 }}>{user.name}</div>
              <div style={{ fontSize: 12, color: "var(--orange)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}><Icons.sparkle size={12} />{user.plan}</div>
            </div>
          </div>
          <button className="menu-item" onClick={() => { router.push("/profile"); setOpen(false); }}><Icons.user size={18} />{t("Your profile")}</button>
          <button className="menu-item" onClick={() => { router.push("/wallet"); setOpen(false); }}><Icons.wallet size={18} />{t("Wallet")}</button>
          <button className="menu-item" onClick={() => { router.push("/profile"); setOpen(false); }}><Icons.settings size={18} />{t("Settings")}</button>
          <div className="menu-div" />
          <div className="menu-sec">{t("Switch portal")}</div>
          <a className="menu-item on" style={{ cursor: "default" }}><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--coral)" }} />{t("Customer")}<span style={{ marginInlineStart: "auto", fontSize: 11, fontWeight: 700 }}>{t("You")}</span></a>
          <Link className="menu-item" href="/provider"><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--ink-3)" }} />{t("Provider")}</Link>
          <Link className="menu-item" href="/admin"><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--ink-3)" }} />{t("Admin")}</Link>
          <div className="menu-div" />
          <button className="menu-item" style={{ color: "var(--ink-3)" }} onClick={logout}><Icons.logout size={18} />{t("Log out")}</button>
        </div>
      )}
    </div>
  );
}
