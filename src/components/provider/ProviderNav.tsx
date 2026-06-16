"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icons, Logo } from "@/components/Icons";
import { LangSwitcher, useT } from "@/components/Language";
import { Avatar } from "@/components/dash/primitives";
import { rpc } from "@/lib/client";

type NavSection = { sec: string };

type NavLink = {
  key: string;
  label: string;
  icon: keyof typeof Icons;
  href: string;
};

type NavItem = NavSection | NavLink;

const isSection = (item: NavItem): item is NavSection => "sec" in item;

const P_NAV: NavItem[] = [
  { sec: "Workspace" },
  {
    key: "overview",
    label: "Overview",
    icon: "grid",
    href: "/provider/overview",
  },
  {
    key: "calendar",
    label: "Calendar",
    icon: "calendar",
    href: "/provider/calendar",
  },
  {
    key: "bookings",
    label: "Bookings",
    icon: "check",
    href: "/provider/bookings",
  },
  {
    key: "messages",
    label: "Messages",
    icon: "chat",
    href: "/provider/messages",
  },
  { sec: "Business" },
  {
    key: "profile",
    label: "Business profile",
    icon: "user",
    href: "/provider/profile",
  },
  {
    key: "services",
    label: "Services",
    icon: "compass",
    href: "/provider/services",
  },
  {
    key: "pricing",
    label: "Pricing",
    icon: "percent",
    href: "/provider/pricing",
  },
  {
    key: "gallery",
    label: "Gallery",
    icon: "image",
    href: "/provider/gallery",
  },
  { sec: "Growth" },
  {
    key: "analytics",
    label: "Analytics",
    icon: "flame",
    href: "/provider/analytics",
  },
  {
    key: "payouts",
    label: "Payouts",
    icon: "wallet",
    href: "/provider/payouts",
  },
  { key: "reviews", label: "Reviews", icon: "star", href: "/provider/reviews" },
  {
    key: "marketing",
    label: "Marketing",
    icon: "send",
    href: "/provider/marketing",
  },
];

export function ProviderNav({
  name,
  providerName,
  badges,
}: {
  name: string;
  providerName: string;
  badges: { bookings: number | null; messages: number | null };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();
  const welcome = `${t("Welcome back")}, ${providerName}`;
  const TITLES: Record<string, { title: string; sub: string }> = {
    "/provider/overview": { title: "Overview", sub: welcome },
    "/provider/calendar": {
      title: "Calendar",
      sub: "Manage your weekly availability",
    },
    "/provider/bookings": {
      title: "Bookings",
      sub: "Confirm, complete & track sessions",
    },
    "/provider/messages": { title: "Messages", sub: "Chat with your customers" },
    "/provider/profile": {
      title: "Business profile",
      sub: "How customers see you",
    },
    "/provider/services": {
      title: "Services",
      sub: "Your catalogue of activities",
    },
    "/provider/pricing": { title: "Pricing", sub: "Base prices & dynamic rules" },
    "/provider/gallery": {
      title: "Gallery",
      sub: "Photos & videos of your experiences",
    },
    "/provider/analytics": {
      title: "Analytics",
      sub: "Understand your performance",
    },
    "/provider/payouts": {
      title: "Payouts",
      sub: "Platform commission & withdrawals",
    },
    "/provider/reviews": { title: "Reviews", sub: "What customers are saying" },
    "/provider/marketing": { title: "Marketing", sub: "Promo codes & growth" },
  };
  const { title, sub } = TITLES[pathname] || { title: "Overview", sub: welcome };
  return (
    <header className="sticky top-0 z-40 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] [backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)] border-b border-line">
      <div className="flex items-center gap-4 py-3.5 px-[var(--pad)]">
        <div
          className="flex items-center gap-2 flex-none cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={() => router.push("/provider/overview")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              router.push("/provider/overview");
            }
          }}
          title={t("Go to Overview")}
        >
          <Logo size={25} />
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap bg-[color-mix(in_srgb,var(--orange)_16%,transparent)] text-orange-deep py-1 px-2 rounded-pill text-[10px] font-extrabold font-display">
            <span className="w-1.5 h-1.5 rounded-pill bg-orange" />
            {t("Partner")}
          </span>
        </div>
        <div className="min-w-0 ms-1.5">
          <h1 className="text-lg leading-none">{t(title)}</h1>
          {sub && (
            <div className="text-xs text-ink-3 font-semibold mt-px whitespace-nowrap overflow-hidden text-ellipsis">
              {t(sub)}
            </div>
          )}
        </div>
        <div className="flex-1" />
        <button className="w-10 h-10 rounded-pill grid place-items-center bg-surface border border-line text-ink-2 duration-150 relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2">
          <Icons.bell size={18} />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-coral border-2 border-surface" />
        </button>
        <LangSwitcher />
        <AccountMenu name={name} />
      </div>
      <div className="flex items-center gap-0.5 px-[var(--pad)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {P_NAV.map((n, i) => {
          if (isSection(n))
            return (
              <span key={`s${i}`} className="inline-flex items-center">
                {i > 0 && <span className="w-px h-5 bg-line-2 mx-2 flex-none" />}
                <span className="text-[10px] font-extrabold tracking-[0.08em] uppercase text-ink-3 pl-2.5 pr-2 whitespace-nowrap">
                  {t(n.sec)}
                </span>
              </span>
            );
          return (
            <NavTab
              key={n.key}
              item={n}
              active={pathname === n.href}
              badge={(badges as Record<string, number | null>)[n.key]}
              onSelect={() => router.push(n.href)}
            />
          );
        })}
      </div>
    </header>
  );
}

function NavTab({
  item,
  active,
  badge,
  onSelect,
}: {
  item: NavLink;
  active: boolean;
  badge: number | null | undefined;
  onSelect: () => void;
}) {
  const t = useT();
  const Icon = Icons[item.icon];
  return (
    <button
      className={`inline-flex items-center gap-2 py-3.5 px-4 font-semibold text-sm whitespace-nowrap cursor-pointer relative duration-[140ms] border-b-2 border-solid -mb-px hover:text-ink ${active ? "text-coral border-coral [&_svg]:text-coral" : "text-ink-2 border-transparent"}`}
      onClick={onSelect}
    >
      <Icon size={17} />
      {t(item.label)}
      {badge ? <span className="bg-coral text-white text-[10.5px] font-extrabold min-w-[17px] h-[17px] rounded-pill grid place-items-center px-1">{badge}</span> : null}
    </button>
  );
}

function AccountMenu({ name }: { name: string }) {
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
  const grad = "linear-gradient(140deg,var(--m-calm),#2E8C80)";
  const logout = async () => {
    await rpc("logout");
    router.push("/auth");
  };
  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-2 cursor-pointer p-1 rounded-pill duration-[140ms] hover:bg-surface-2" onClick={() => setOpen((o) => !o)}>
        <Avatar name={name} size={38} grad={grad} />
        <Icons.chevR
          size={15}
          className="[transform:rotate(90deg)] text-ink-3"
        />
      </div>
      {open && (
        <div className="absolute end-0 top-14 min-w-[248px] bg-surface border border-line rounded shadow-lg p-2 z-[60] animate-anim-pop-app">
          <div className="flex items-center gap-3 pt-2 px-2.5 pb-3">
            <Avatar name={name} size={42} grad={grad} />
            <div className="min-w-0">
              <div className="font-extrabold font-display text-base">
                {name}
              </div>
              <div className="text-xs text-ink-3 font-semibold">
                {t("Partner")}
              </div>
            </div>
          </div>
          <div className="h-px bg-line my-1.5 mx-1" />
          <button
            className="flex items-center gap-3 w-full py-2.5 px-3 rounded-sm text-sm font-semibold cursor-pointer duration-[120ms] text-left hover:bg-surface-2 hover:text-ink !text-ink-3"
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
