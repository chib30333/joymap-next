"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icons, Logo } from "@/components/Icons";
import { LangSwitcher, useT } from "@/components/Language";
import { Avatar } from "@/components/dash/primitives";
import { rpc } from "@/lib/client";

/** Width at which the sidebar stops being a drawer and sits beside the content. */
const DESKTOP = 900;

const DrawerCtx = createContext<{
  open: boolean;
  setOpen: (v: boolean) => void;
}>({ open: false, setOpen: () => {} });

/**
 * Shell wrapper that lets the topbar's menu button drive the sidebar drawer —
 * the two live in different branches of the layout tree.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Navigating from the drawer should dismiss it.
  useEffect(() => setOpen(false), [pathname]);

  // Back on desktop the sidebar is permanent, so drop any leftover open state.
  useEffect(() => {
    if (!open) return;
    const mq = window.matchMedia(`(min-width: ${DESKTOP}px)`);
    const close = () => setOpen(false);
    mq.addEventListener("change", close);
    return () => mq.removeEventListener("change", close);
  }, [open]);

  return (
    <DrawerCtx.Provider value={{ open, setOpen }}>
      <div className="app jmdash fx">{children}</div>
    </DrawerCtx.Provider>
  );
}

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
  const { open, setOpen } = useContext(DrawerCtx);
  const logout = async () => {
    await rpc("logout");
    router.push("/auth");
  };
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[60] bg-[rgba(20,8,12,0.5)] backdrop-blur-[3px] min-[900px]:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`sticky top-0 h-screen bg-surface border-r border-line flex flex-col px-3.5 py-5 gap-1.5 z-20 overflow-y-auto max-[899px]:fixed max-[899px]:inset-y-0 max-[899px]:start-0 max-[899px]:z-[70] max-[899px]:w-[264px] max-[899px]:shadow-lg max-[899px]:[transition:transform_.24s_ease] ${
          open ? "max-[899px]:translate-x-0" : "max-[899px]:-translate-x-full"
        }`}
      >
        <div className="pt-1.5 px-2.5 pb-4 flex items-center gap-2.5 flex-wrap">
          <Logo size={25} />
          <span className="inline-flex items-center gap-1 whitespace-nowrap bg-[color-mix(in_srgb,var(--orange)_18%,transparent)] text-[var(--orange)] px-2.5 py-1 rounded-pill text-[10px] font-extrabold font-display">
            Admin
          </span>
          <button
            aria-label={t("Close menu")}
            className="ms-auto w-9 h-9 rounded-pill grid place-items-center text-ink-2 hover:bg-surface-2 hover:text-ink min-[900px]:hidden"
            onClick={() => setOpen(false)}
          >
            <Icons.close size={18} />
          </button>
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
    </>
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
  const { setOpen } = useContext(DrawerCtx);
  const { title, sub } = PAGE_TITLES[pathname] ?? DEFAULT_PAGE_TITLE;
  return (
    <div className="sticky top-0 bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] [backdrop-filter:blur(12px)] [-webkit-backdrop-filter:blur(12px)] z-[15] flex items-center gap-3.5 py-4 px-[var(--pad)] border-b border-line">
      <button
        aria-label={t("Open menu")}
        className="w-10 h-10 flex-none rounded-pill grid min-[900px]:hidden place-items-center bg-surface border border-line text-ink-2 duration-150 cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
        onClick={() => setOpen(true)}
      >
        <Icons.menu size={18} />
      </button>
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
