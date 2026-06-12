"use client";

import { useRouter, usePathname } from "next/navigation";
import { Icons, Logo } from "@/components/Icons";
import { LangSwitcher, useT } from "@/components/Language";
import { Avatar } from "@/components/dash/primitives";
import { rpc } from "@/lib/client";

type NavItem = {
  sec?: string;
  key?: string;
  label?: string;
  icon?: keyof typeof Icons;
  href?: string;
  badge?: number | null;
};
const A_NAV: NavItem[] = [
  { sec: "Overview" },
  { key: "dashboard", label: "Dashboard", icon: "grid", href: "/admin" },
  { sec: "Operate" },
  {
    key: "providers",
    label: "Providers",
    icon: "compass",
    href: "/admin/providers",
  },
  {
    key: "moderation",
    label: "Moderation",
    icon: "checkCirc",
    href: "/admin/moderation",
  },
  { key: "content", label: "Content", icon: "image", href: "/admin/content" },
  {
    key: "customers",
    label: "Customers",
    icon: "user",
    href: "/admin/customers",
  },
  { sec: "Money & growth" },
  {
    key: "financials",
    label: "Financials",
    icon: "wallet",
    href: "/admin/financials",
  },
  {
    key: "marketing",
    label: "Marketing",
    icon: "flame",
    href: "/admin/marketing",
  },
];

export function AdminSidebar({
  badges,
}: {
  badges: { moderation: number | null; content: number | null };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();
  const logout = async () => {
    await rpc("logout");
    router.push("/auth");
  };
  return (
    <aside className="sticky top-0 h-screen bg-surface border-r border-line flex flex-col p-[20px_14px] gap-[5px] z-20">
      <div
        className="pt-[6px] px-[10px] pb-[16px]"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          flexWrap: "wrap",
        }}
      >
        <Logo size={25} />
        <span className="inline-flex items-center gap-[5px] whitespace-nowrap bg-[color-mix(in_srgb,var(--orange)_18%,transparent)] text-[var(--orange)] px-[9px] py-[3px] rounded-[99px] text-[10px] font-extrabold font-display">
          Admin
        </span>
      </div>
      <nav className="flex flex-col gap-[3px]">
        {A_NAV.map((n, i) => {
          if (n.sec)
            return (
              <div
                key={`s${i}`}
                className="text-[11px] font-extrabold tracking-[0.1em] uppercase text-ink-3 pt-[14px] px-[13px] pb-[6px]"
              >
                {t(n.sec)}
              </div>
            );
          const I = Icons[n.icon!];
          const b = (badges as Record<string, number | null>)[n.key!];
          const on = pathname === n.href;
          return (
            <button
              key={n.key}
              className={`flex items-center gap-[12px] py-[10px] px-[13px] rounded-sm font-semibold text-[14px] [transition:0.15s] cursor-pointer bg-none border-none w-full text-left ${
                on
                  ? "bg-[color-mix(in_srgb,var(--red)_14%,transparent)] text-coral"
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
              onClick={() => router.push(n.href!)}
            >
              <I size={19} />
              {t(n.label!)}
              {b ? (
                <span className="ml-auto bg-coral text-white text-[11px] font-bold min-w-[19px] h-[19px] rounded-[99px] grid place-items-center px-[5px]">
                  {b}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto pt-[10px]">
        <button
          className="flex items-center gap-[12px] py-[10px] px-[13px] rounded-sm font-semibold text-[14px] [transition:0.15s] cursor-pointer bg-none border-none w-full text-left hover:bg-surface-2 hover:text-ink"
          style={{ color: "var(--ink-3)" }}
          onClick={logout}
        >
          <Icons.logout size={19} />
          {t("Log out")}
        </button>
      </div>
    </aside>
  );
}

export function AdminTopbar({
  name,
  unread,
}: {
  name: string;
  unread: number;
}) {
  const pathname = usePathname();
  const t = useT();
  const TITLES: Record<string, [string, string]> = {
    "/admin": ["Dashboard", "Platform health at a glance"],
    "/admin/providers": ["Providers", "Manage marketplace partners"],
    "/admin/moderation": ["Moderation", "Review providers & new services"],
    "/admin/content": ["Content", "Moderate reviews, photos & promos"],
    "/admin/customers": ["Customers", "LTV & retention"],
    "/admin/financials": ["Financials", "Revenue, commission & payouts"],
    "/admin/marketing": ["Marketing", "Campaigns, promos & experiments"],
  };
  const [title, sub] = TITLES[pathname] || [
    "Dashboard",
    "Platform health at a glance",
  ];
  return (
    <div className="sticky top-0 bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)] z-[15] flex items-center gap-[14px] py-[16px] px-[var(--pad)] border-b border-line">
      <div className="flex-1 min-w-0">
        <h1 className="text-[20px] leading-[1.1]">{t(title)}</h1>
        {sub && (
          <div className="text-[13px] text-ink-3 font-semibold mt-[2px]">
            {t(sub)}
          </div>
        )}
      </div>
      <LangSwitcher />
      <button className="w-10 h-10 rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2">
        <Icons.bell size={18} />
        {unread > 0 && <span className="absolute top-[9px] right-[10px] w-2 h-2 rounded-full bg-coral border-2 border-surface" />}
      </button>
      <Avatar
        name={name}
        size={40}
        grad="linear-gradient(140deg,var(--ink),#3742A8)"
      />
    </div>
  );
}
