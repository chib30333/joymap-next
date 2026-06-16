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
    <aside className="sticky top-0 h-screen bg-surface border-r border-line flex flex-col px-3.5 py-5 gap-1.5 z-20">
      <div className="pt-1.5 px-2.5 pb-4 flex items-center gap-2.5 flex-wrap">
        <Logo size={25} />
        <span className="inline-flex items-center gap-1 whitespace-nowrap bg-[color-mix(in_srgb,var(--orange)_18%,transparent)] text-[var(--orange)] px-2.5 py-1 rounded-pill text-[10px] font-extrabold font-display">
          Admin
        </span>
      </div>
      <nav className="flex flex-col gap-1">
        {A_NAV.map((n, i) => {
          if (n.sec)
            return (
              <div
                key={`s${i}`}
                className="text-xs font-extrabold tracking-widest uppercase text-ink-3 pt-3.5 px-3.5 pb-1.5"
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
              className={`flex items-center gap-3 py-2.5 px-3.5 rounded-sm font-semibold text-sm duration-150 cursor-pointer bg-none border-none w-full text-left ${
                on
                  ? "bg-[color-mix(in_srgb,var(--red)_14%,transparent)] text-coral"
                  : "text-ink-2 hover:bg-surface-2 hover:text-ink"
              }`}
              onClick={() => router.push(n.href!)}
            >
              <I size={19} />
              {t(n.label!)}
              {b ? (
                <span className="ml-auto bg-coral text-white text-xs font-bold min-w-[19px] h-5 rounded-pill grid place-items-center px-1.5">
                  {b}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>
      <div className="mt-auto pt-2.5">
        <button
          className="flex items-center gap-3 py-2.5 px-3.5 rounded-sm font-semibold text-sm duration-150 cursor-pointer bg-none border-none w-full text-left hover:bg-surface-2 hover:text-ink text-[var(--ink-3)]"
          onClick={logout}
        >
          <Icons.logout size={19} />
          {t("Log out")}
        </button>
      </div>
    </aside>
  );
}

type PageTitle = { title: string; sub: string };
const DEFAULT_PAGE_TITLE: PageTitle = {
  title: "Dashboard",
  sub: "Platform health at a glance",
};
const PAGE_TITLES: Record<string, PageTitle> = {
  "/admin": DEFAULT_PAGE_TITLE,
  "/admin/providers": { title: "Providers", sub: "Manage marketplace partners" },
  "/admin/moderation": {
    title: "Moderation",
    sub: "Review providers & new services",
  },
  "/admin/content": { title: "Content", sub: "Moderate reviews, photos & promos" },
  "/admin/customers": { title: "Customers", sub: "LTV & retention" },
  "/admin/financials": {
    title: "Financials",
    sub: "Revenue, commission & payouts",
  },
  "/admin/marketing": {
    title: "Marketing",
    sub: "Campaigns, promos & experiments",
  },
};

export function AdminTopbar({
  name,
  unread,
}: {
  name: string;
  unread: number;
}) {
  const pathname = usePathname();
  const t = useT();
  const { title, sub } = PAGE_TITLES[pathname] ?? DEFAULT_PAGE_TITLE;
  return (
    <div className="sticky top-0 bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)] z-[15] flex items-center gap-3.5 py-4 px-[var(--pad)] border-b border-line">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl leading-none">{t(title)}</h1>
        {sub && (
          <div className="text-sm text-ink-3 font-semibold mt-0.5">
            {t(sub)}
          </div>
        )}
      </div>
      <LangSwitcher />
      <button className="w-10 h-10 rounded-pill grid place-items-center bg-surface border border-line text-ink-2 duration-150 relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2">
        <Icons.bell size={18} />
        {unread > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-coral border-2 border-surface" />}
      </button>
      <Avatar
        name={name}
        size={40}
        grad="linear-gradient(140deg,var(--ink),#3742A8)"
      />
    </div>
  );
}
