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
    <header className="topnav">
      <div className="tn-row1">
        <div
          className="tn-brand"
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
          <span className="tn-badge">
            <span className="ld" />
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
        <button className="icon-btn">
          <Icons.bell size={18} />
          <span className="dot-badge" />
        </button>
        <LangSwitcher />
        <AccountMenu name={name} />
      </div>
      <div className="tn-row2 no-scrollbar">
        {P_NAV.map((n, i) => {
          if (n.sec)
            return (
              <span key={`s${i}`} className="inline-flex items-center">
                {i > 0 && <span className="tn-sep" />}
                <span className="tn-grouplbl">{t(n.sec)}</span>
              </span>
            );
          const I = Icons[n.icon!];
          const b = (badges as Record<string, number | null>)[n.key!];
          const on = pathname === n.href;
          return (
            <button
              key={n.key}
              className={`tn-tab ${on ? "on" : ""}`}
              onClick={() => router.push(n.href!)}
            >
              <I size={17} />
              {t(n.label!)}
              {b ? <span className="tn-badge-n">{b}</span> : null}
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
      <div className="tn-avatar-btn" onClick={() => setOpen((o) => !o)}>
        <Avatar name={name} size={38} grad={grad} />
        <Icons.chevR
          size={15}
          style={{ transform: "rotate(90deg)", color: "var(--ink-3)" }}
        />
      </div>
      {open && (
        <div className="menu-pop anim-pop">
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
          <div className="menu-div" />
          <button
            className="menu-item"
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
