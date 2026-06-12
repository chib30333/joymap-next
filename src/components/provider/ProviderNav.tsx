"use client";

import { useEffect, useRef, useState } from "react";
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
  const TITLES: Record<string, [string, string]> = {
    "/provider/overview": ["Overview", `${t("Welcome back")}, ${providerName}`],
    "/provider/calendar": ["Calendar", "Manage your weekly availability"],
    "/provider/bookings": ["Bookings", "Confirm, complete & track sessions"],
    "/provider/messages": ["Messages", "Chat with your customers"],
    "/provider/profile": ["Business profile", "How customers see you"],
    "/provider/services": ["Services", "Your catalogue of activities"],
    "/provider/pricing": ["Pricing", "Base prices & dynamic rules"],
    "/provider/gallery": ["Gallery", "Photos & videos of your experiences"],
    "/provider/analytics": ["Analytics", "Understand your performance"],
    "/provider/payouts": ["Payouts", "Platform commission & withdrawals"],
    "/provider/reviews": ["Reviews", "What customers are saying"],
    "/provider/marketing": ["Marketing", "Promo codes & growth"],
  };
  const [title, sub] = TITLES[pathname] || [
    "Overview",
    `${t("Welcome back")}, ${providerName}`,
  ];
  return (
    <header className="sticky top-0 z-40 bg-[color-mix(in_srgb,var(--bg)_82%,transparent)] [backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)] border-b border-line">
      <div className="flex items-center gap-4 py-[13px] px-[var(--pad)]">
        <div
          className="flex items-center gap-[9px] flex-none"
          role="button"
          tabIndex={0}
          style={{ cursor: "pointer" }}
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
          <span className="inline-flex items-center gap-[5px] whitespace-nowrap bg-[color-mix(in_srgb,var(--orange)_16%,transparent)] text-orange-deep py-[3px] px-[9px] rounded-[99px] text-[10px] font-extrabold font-display">
            <span className="w-[6px] h-[6px] rounded-[99px] bg-orange" />
            {t("Partner")}
          </span>
        </div>
        <div className="min-w-0" style={{ marginInlineStart: 6 }}>
          <h1 className="text-[18px] leading-[1.1]">{t(title)}</h1>
          {sub && (
            <div
              className="text-[12.5px] text-ink-3 font-semibold mt-[1px] whitespace-nowrap overflow-hidden"
              style={{ textOverflow: "ellipsis" }}
            >
              {t(sub)}
            </div>
          )}
        </div>
        <div className="flex-1" />
        <button className="w-10 h-10 rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2">
          <Icons.bell size={18} />
          <span className="absolute top-[9px] right-[10px] w-2 h-2 rounded-full bg-coral border-2 border-surface" />
        </button>
        <LangSwitcher />
        <AccountMenu name={name} />
      </div>
      <div className="flex items-center gap-[2px] px-[var(--pad)] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {P_NAV.map((n, i) => {
          if (n.sec)
            return (
              <span key={`s${i}`} className="inline-flex items-center">
                {i > 0 && <span className="w-px h-5 bg-line-2 mx-2 flex-none" />}
                <span className="text-[10px] font-extrabold tracking-[0.08em] uppercase text-ink-3 pl-[10px] pr-2 whitespace-nowrap">
                  {t(n.sec)}
                </span>
              </span>
            );
          const I = Icons[n.icon!];
          const b = (badges as Record<string, number | null>)[n.key!];
          const on = pathname === n.href;
          return (
            <button
              key={n.key}
              className={`inline-flex items-center gap-2 py-[13px] px-[15px] font-semibold text-[14px] whitespace-nowrap cursor-pointer relative [transition:0.14s] border-b-[2.5px] border-solid mb-[-1px] hover:text-ink ${on ? "text-coral border-coral [&_svg]:text-coral" : "text-ink-2 border-transparent"}`}
              onClick={() => router.push(n.href!)}
            >
              <I size={17} />
              {t(n.label!)}
              {b ? <span className="bg-coral text-white text-[10.5px] font-extrabold min-w-[17px] h-[17px] rounded-[99px] grid place-items-center px-1">{b}</span> : null}
            </button>
          );
        })}
      </div>
    </header>
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
      <div className="flex items-center gap-2 cursor-pointer p-[3px] rounded-[99px] [transition:0.14s] hover:bg-surface-2" onClick={() => setOpen((o) => !o)}>
        <Avatar name={name} size={38} grad={grad} />
        <Icons.chevR
          size={15}
          style={{ transform: "rotate(90deg)", color: "var(--ink-3)" }}
        />
      </div>
      {open && (
        <div className="absolute end-0 top-[54px] min-w-[248px] bg-surface border border-line rounded shadow-lg p-2 z-[60] animate-anim-pop-app">
          <div className="flex items-center gap-[11px] pt-[8px] px-[10px] pb-[12px]">
            <Avatar name={name} size={42} grad={grad} />
            <div className="min-w-0">
              <div className="font-extrabold font-display text-[15px]">
                {name}
              </div>
              <div className="text-[12px] text-ink-3 font-semibold">
                {t("Partner")}
              </div>
            </div>
          </div>
          <div className="h-px bg-line my-[6px] mx-[4px]" />
          <button
            className="flex items-center gap-[11px] w-full py-[10px] px-[11px] rounded-sm text-[14px] font-semibold text-ink-2 cursor-pointer [transition:0.12s] text-left hover:bg-surface-2 hover:text-ink"
            style={{ color: "var(--ink-3)" }}
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
