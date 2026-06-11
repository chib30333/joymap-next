"use client";
// AdminSidebar + Topbar — 1:1 port of dash.jsx Sidebar/Topbar/PortalSwitcher (admin).
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Icons, Logo } from "@/components/Icons";
import { LangSwitcher, t } from "@/components/i18n";
import { Avatar } from "@/components/dash/primitives";
import { rpc } from "@/lib/client";

type NavItem = { sec?: string; key?: string; label?: string; icon?: keyof typeof Icons; href?: string; badge?: number | null };
const A_NAV: NavItem[] = [
  { sec: "Overview" },
  { key: "dashboard", label: "Dashboard", icon: "grid", href: "/admin" },
  { sec: "Operate" },
  { key: "providers", label: "Providers", icon: "compass", href: "/admin/providers" },
  { key: "moderation", label: "Moderation", icon: "checkCirc", href: "/admin/moderation" },
  { key: "content", label: "Content", icon: "image", href: "/admin/content" },
  { key: "customers", label: "Customers", icon: "user", href: "/admin/customers" },
  { sec: "Money & growth" },
  { key: "financials", label: "Financials", icon: "wallet", href: "/admin/financials" },
  { key: "marketing", label: "Marketing", icon: "flame", href: "/admin/marketing" },
];

export function AdminSidebar({ badges }: { badges: { moderation: number | null; content: number | null } }) {
  const router = useRouter();
  const pathname = usePathname();
  const logout = async () => { await rpc("logout"); router.push("/auth"); };
  return (
    <aside className="side">
      <div className="side-brand" style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
        <Logo size={25} />
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", background: "color-mix(in srgb,var(--orange) 18%,transparent)", color: "var(--orange)", padding: "3px 9px", borderRadius: 99, fontSize: 10, fontWeight: 800, fontFamily: "var(--display)" }}>Admin</span>
      </div>
      <nav style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {A_NAV.map((n, i) => {
          if (n.sec) return <div key={`s${i}`} className="nav-sec">{t(n.sec)}</div>;
          const I = Icons[n.icon!];
          const b = (badges as Record<string, number | null>)[n.key!];
          const on = pathname === n.href;
          return <button key={n.key} className={`nav-item ${on ? "on" : ""}`} onClick={() => router.push(n.href!)}><I size={19} />{t(n.label!)}{b ? <span className="nav-badge">{b}</span> : null}</button>;
        })}
      </nav>
      <div className="side-foot">
        <div className="card" style={{ padding: 6, background: "var(--surface-2)" }}>
          <div className="nav-sec" style={{ padding: "6px 10px 6px" }}>{t("Switch portal")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Link className="nav-item" href="/joymap"><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--ink-3)" }} />{t("Customer")}</Link>
            <Link className="nav-item" href="/provider"><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--ink-3)" }} />{t("Provider")}</Link>
            <span className="nav-item on" style={{ cursor: "default" }}><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--coral)" }} />{t("Admin")}<span style={{ marginInlineStart: "auto", fontSize: 11, color: "var(--coral)", fontWeight: 700 }}>{t("You")}</span></span>
          </div>
        </div>
        <button className="nav-item" style={{ color: "var(--ink-3)", marginTop: 6 }} onClick={logout}><Icons.logout size={19} />{t("Log out")}</button>
      </div>
    </aside>
  );
}

export function AdminTopbar({ name, unread }: { name: string; unread: number }) {
  const pathname = usePathname();
  const TITLES: Record<string, [string, string]> = {
    "/admin": ["Dashboard", "Platform health at a glance"],
    "/admin/providers": ["Providers", "Manage marketplace partners"],
    "/admin/moderation": ["Moderation", "Review providers & new services"],
    "/admin/content": ["Content", "Moderate reviews, photos & promos"],
    "/admin/customers": ["Customers", "LTV & retention"],
    "/admin/financials": ["Financials", "Revenue, commission & payouts"],
    "/admin/marketing": ["Marketing", "Campaigns, promos & experiments"],
  };
  const [title, sub] = TITLES[pathname] || ["Dashboard", "Platform health at a glance"];
  return (
    <div className="topbar">
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1 style={{ fontSize: 20, lineHeight: 1.1 }}>{t(title)}</h1>
        {sub && <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginTop: 2 }}>{t(sub)}</div>}
      </div>
      <LangSwitcher />
      <button className="icon-btn"><Icons.bell size={18} />{unread > 0 && <span className="dot-badge" />}</button>
      <Avatar name={name} size={40} grad="linear-gradient(140deg,var(--ink),#3742A8)" />
    </div>
  );
}
