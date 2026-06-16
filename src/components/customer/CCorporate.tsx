"use client";

import { useState } from "react";
import { Icons, Logo } from "@/components/Icons";
import {
  MOODS,
  MOOD_ORDER,
  fmt,
  Avatar,
  MoodChip,
  MoodDot,
  SectionHead,
  Modal,
  type Exp,
} from "./primitives";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { ServiceModal, type Slot } from "./ServiceModal";
import { useFav } from "@/hooks";
import { useT } from "@/components/Language";

const COMPANY = {
  name: "Acme Corp",
  letter: "A",
  plan: "Joymap for Teams",
  seats: 120,
  seatsUsed: 86,
  allowance: 5000,
  used: 2100,
  renews: "1 Jul 2026",
  since: "2025",
  hr: "People & Culture team",
};
const CORP_PERKS = [
  {
    icon: "sparkle",
    accent: "#7B53F0",
    title: "Joy Map+ membership",
    desc: "Fully sponsored by Acme Corp",
    value: "Active",
    tag: "Sponsored",
  },
  {
    icon: "wallet",
    accent: "#1FA46E",
    title: "Monthly experience credit",
    desc: "Resets on the 1st of each month",
    value: "2 900 ₽ left",
    tag: null,
  },
  {
    icon: "gift",
    accent: "#E89015",
    title: "Birthday experience",
    desc: "One free session in your birthday month",
    value: "Available",
    tag: null,
  },
  {
    icon: "heart",
    accent: "#FF4D74",
    title: "Bring a +1",
    desc: "Half-price guest seat on wellness sessions",
    value: "Unlimited",
    tag: null,
  },
] as const;
const TEAM_EVENTS = [
  {
    id: "te1",
    expId: "e12",
    day: 13,
    time: "18:00",
    title: "Summer Sail Social",
    team: "All hands",
    going: ["A", "M", "D", "S", "K", "R"],
    extra: 6,
    cap: 16,
    joined: false,
  },
  {
    id: "te2",
    expId: "e10",
    day: 18,
    time: "19:00",
    title: "Pasta Night · Design",
    team: "Design team",
    going: ["L", "P", "J"],
    extra: 9,
    cap: 12,
    joined: true,
  },
  {
    id: "te3",
    expId: "e2",
    day: 25,
    time: "15:00",
    title: "Karting Grand Prix",
    team: "Company-wide",
    going: ["A", "B", "C", "D", "E"],
    extra: 14,
    cap: 24,
    joined: false,
  },
];
const GIFT_DENOMS = [1000, 2500, 5000, 10000];
const CORP_INVOICES = [
  {
    id: "INV-2026-06",
    date: "1 Jun 2026",
    label: "June · 120 seats",
    amount: 59880,
    status: "paid",
  },
  {
    id: "INV-2026-05",
    date: "1 May 2026",
    label: "May · 118 seats",
    amount: 58882,
    status: "paid",
  },
  {
    id: "INV-2026-07",
    date: "1 Jul 2026",
    label: "July · 120 seats (est.)",
    amount: 59880,
    status: "upcoming",
  },
];
const CAL_WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const calDow = (day: number) => (day - 1) % 7;

export function CCorporate({
  catalog,
  favs,
  slotsByService,
  wallet,
}: {
  catalog: Exp[];
  favs: string[];
  slotsByService: Record<string, Slot[]>;
  wallet: number;
}) {
  const t = useT();
  const byId = (id: string) => catalog.find((e) => e.id === id) || null;
  const [modal, setModal] = useState<"quote" | "gift" | null>(null);
  const [open, setOpen] = useState<Exp | null>(null);
  const onFav = useFav();
  const remaining = COMPANY.allowance - COMPANY.used;
  const pct = Math.round((remaining / COMPANY.allowance) * 100);
  const openExp = (id: string) => {
    const e = byId(id) || catalog[0];
    if (e) setOpen(e);
  };

  return (
    <div className="animate-anim-fade-app [--gold:#e6a23c]">
      <div className="relative overflow-hidden rounded-xl text-[#f4e9d8] min-h-[430px] flex items-end [background-image:linear-gradient(95deg,rgba(24,5,7,0.98)_0%,rgba(40,8,11,0.95)_40%,rgba(40,8,11,0.72)_64%,rgba(40,8,11,0.5)_100%),url('/images/corporate-hero.jpg')] bg-cover [background-position:right_28%] py-10 px-11 before:content-[''] before:absolute before:inset-0 before:opacity-30 before:[mix-blend-mode:overlay] before:[background-image:radial-gradient(rgba(255,255,255,0.5)_0.6px,transparent_0.6px)] before:[background-size:10px_10px] before:pointer-events-none [&_h1]:[text-shadow:0_2px_18px_rgba(20,4,6,0.5)] [&_p]:[text-shadow:0_2px_18px_rgba(20,4,6,0.5)]">
        <div className="relative flex gap-8 items-center flex-wrap">
          <div className="flex-1 min-w-[280px] max-w-[560px]">
            <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-[var(--gold)] mb-4">
              {t("Corporate wellbeing")}
            </div>
            <div className="inline-flex items-center gap-3.5 mb-5">
              <span className="w-12 h-12 rounded-md [background:linear-gradient(140deg,#fff,#f4e9d8)] text-[#5e1014] grid place-items-center font-display font-extrabold text-2xl flex-none">
                {COMPANY.letter}
              </span>
              <span className="text-lg opacity-50 font-light">×</span>
              <Logo size={30} mono />
            </div>
            <h1 className="text-[#FFF3E4] leading-none [font-size:clamp(28px,3.4vw,40px)] max-w-[14ch]">
              {t("Your wellbeing, on the house.")}
            </h1>
            <p className="text-[rgba(244,233,216,.8)] text-base leading-relaxed mt-3.5 max-w-[52ch]">
              {COMPANY.name} {t("sponsors your Joymap experiences. Spend your monthly credit on anything that brings you joy — no receipts, no approvals.")}
            </p>
            <div className="flex gap-2.5 mt-6 flex-wrap">
              <Button
                ctx="app"
                size="lg"
                className="[background:var(--gold)] text-[#3a0a0d] font-extrabold"
                onClick={() => openExp("e1")}
              >
                {t("Spend my credit")}
                <Icons.arrowR size={18} />
              </Button>
              <Button
                ctx="app"
                size="lg"
                className="bg-white/10 text-[#F4E9D8] [backdrop-filter:blur(4px)]"
                onClick={() => setModal("quote")}
              >
                {t("Plan a team event")}
              </Button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3.5">
            <div
              className="w-[118px] h-[118px] rounded-pill flex-none [background:conic-gradient(var(--gold)_calc(var(--p)*1%),rgba(255,255,255,0.14)_0)] grid place-items-center"
              style={{ ["--p"]: pct } as React.CSSProperties}
            >
              <div className="w-24 h-24 rounded-pill bg-[rgba(30,8,9,0.72)] backdrop-blur-[4px] grid place-items-center text-center">
                <div>
                  <div className="font-display font-extrabold text-2xl text-[#FFF3E4] leading-none">
                    {fmt(remaining)}
                  </div>
                  <div className="text-xs text-[rgba(244,233,216,.7)] font-bold tracking-[.04em] mt-1">
                    {t("LEFT THIS MONTH")}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-xs text-[rgba(244,233,216,.7)] font-semibold">
              {fmt(COMPANY.used)} {t("of")} {fmt(COMPANY.allowance)} {t("used")}
              <br />
              {t("Renews")} {COMPANY.renews}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-9 mx-0 mb-3.5">
        <SectionHead
          eyebrow={t("Included with your plan")}
          title={t("Your perks")}
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(238px,1fr))] gap-[var(--gap)]">
        {CORP_PERKS.map((p) => {
          const I = Icons[p.icon];
          return (
            <div
              key={p.title}
              className="bg-surface border border-line rounded-lg p-6 duration-[180ms] hover:-translate-y-1 hover:shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className="w-12 h-12 rounded-md grid place-items-center [background:var(--accent-bg)] [color:var(--accent)]"
                  style={
                    {
                      "--accent-bg": `color-mix(in srgb,${p.accent} 15%,transparent)`,
                      "--accent": p.accent,
                    } as React.CSSProperties
                  }
                >
                  <I size={23} />
                </span>
                {p.tag && (
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-semibold bg-surface-2 text-ink-2 border border-line [background:color-mix(in_srgb,var(--gold)_16%,transparent)] text-[#B97714] border-none"
                  >
                    {t(p.tag)}
                  </span>
                )}
              </div>
              <h3 className="text-base mb-1">{t(p.title)}</h3>
              <p className="text-sm text-ink-3 font-semibold mt-0 mx-0 mb-3.5 leading-normal">
                {t(p.desc)}
              </p>
              <div
                className="inline-flex items-center gap-1.5 font-extrabold font-display text-base [color:var(--accent)]"
                style={{ ["--accent"]: p.accent } as React.CSSProperties}
              >
                <span
                  className="w-2 h-2 rounded-pill [background:var(--accent)]"
                  style={{ ["--accent"]: p.accent } as React.CSSProperties}
                />
                {t(p.value)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10 mx-0 mb-3.5">
        <SectionHead
          eyebrow={t("With your colleagues")}
          title={t("Team-building events")}
          action={
            <Button
              ctx="app"
              variant="ghost"
              size="md"
              onClick={() => openExp("e9")}
              iconR={<Icons.arrowR size={17} />}
            >
              {t("Browse team experiences")}
            </Button>
          }
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[var(--gap)]">
        {TEAM_EVENTS.map((ev) => (
          <TeamEventCard key={ev.id} ev={ev} byId={byId} onOpen={setOpen} />
        ))}
      </div>

      <div className="grid grid-cols-[1.3fr_1fr] gap-[var(--gap)] mt-10 mx-0 mb-0 items-stretch">
        <div
          className="relative overflow-hidden rounded-lg text-[#f4e9d8] cursor-pointer [background:linear-gradient(135deg,#5e1014,#2a0709)] border border-[color-mix(in_srgb,#e6a23c_40%,transparent)] p-5 duration-[180ms] hover:-translate-y-1 hover:shadow-lg"
          onClick={() => setModal("gift")}
        >
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-extrabold tracking-[0.18em] uppercase text-[var(--gold)]">
                {t("Joymap gift card")}
              </span>
              <Icons.gift size={26} className="text-[var(--gold)]" />
            </div>
            <h3 className="text-2xl text-[#FFF3E4] mb-2 max-w-[16ch]">
              {t("Share the joy with a colleague.")}
            </h3>
            <p className="text-[rgba(244,233,216,.78)] text-sm leading-normal mb-5 max-w-[46ch]">
              {t("Send an experience gift card by email — they pick what brings them joy.")}
            </p>
            <div className="flex gap-2 mt-auto flex-wrap">
              {GIFT_DENOMS.map((d) => (
                <span
                  key={d}
                  className="py-2 px-3 rounded-pill border border-[color-mix(in_srgb,var(--gold)_45%,transparent)] font-extrabold text-sm font-display"
                >
                  {fmt(d)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="border border-line rounded-lg p-6 duration-[180ms] flex flex-col justify-center gap-3.5 bg-[var(--surface-2)]">
          <span className="w-12 h-12 rounded-md grid place-items-center bg-surface shadow-[var(--sh-sm)] text-coral-deep">
            <Icons.sparkle size={24} />
          </span>
          <div>
            <h3 className="text-lg mb-1.5">
              {t("Something bigger in mind?")}
            </h3>
            <p className="text-sm text-ink-2 leading-normal m-0">
              {t("Off-sites, launches, away-days — our team curates a custom experience for any group size.")}
            </p>
          </div>
          <Button
            ctx="app"
            variant="primary"
            size="md"
            onClick={() => setModal("quote")}
            icon={<Icons.briefcase size={17} />}
          >
            {t("Request a quote")}
          </Button>
        </div>
      </div>

      <div
        className="relative overflow-hidden rounded-xl min-h-[340px] flex items-end text-white [background-image:linear-gradient(0deg,rgba(20,8,6,0.82)_0%,rgba(20,8,6,0.25)_55%,rgba(20,8,6,0.45)_100%),url('/images/corporate-team-strategy.jpg')] bg-cover [background-position:center_32%] py-9 px-9 [margin-top:calc(var(--gap)_+_16px)]"
      >
        <div className="relative max-w-[560px]">
          <div className="text-xs font-extrabold tracking-[0.18em] uppercase text-[var(--gold)] mb-3">
            {t("Off-sites & away-days")}
          </div>
          <h2 className="text-white leading-none mb-3 [font-size:clamp(24px,3vw,34px)]">
            {t("Bring the whole team together.")}
          </h2>
          <p className="text-[rgba(255,255,255,.85)] text-base leading-relaxed mb-5 max-w-[48ch]">
            {t("From strategy days to celebration nights, our events team curates a custom experience for any group size — fully handled, beautifully run.")}
          </p>
          <Button
            ctx="app"
            size="lg"
            className="[background:var(--gold)] text-[#3a0a0d] font-extrabold"
            onClick={() => setModal("quote")}
          >
            <Icons.briefcase size={18} />
            {t("Plan a team event")}
          </Button>
        </div>
      </div>

      <div className="mt-10 mx-0 mb-3.5">
        <SectionHead
          eyebrow={t("Managed by your company")}
          title={t("Your company plan")}
        />
      </div>
      <div className="grid grid-cols-[1fr_1.25fr] gap-[var(--gap)] items-start">
        <div className="bg-surface border border-line rounded-lg p-6 duration-[180ms]">
          <div className="flex items-center gap-3 mb-5">
            <span className="grid place-items-center font-display font-extrabold flex-none w-11 h-11 text-xl [background:linear-gradient(140deg,var(--red),var(--orange))] text-white rounded-md">
              {COMPANY.letter}
            </span>
            <div>
              <div className="font-extrabold font-display text-base">
                {COMPANY.name}
              </div>
              <div className="text-xs text-ink-3 font-semibold">
                {COMPANY.plan} · {t("since")} {COMPANY.since}
              </div>
            </div>
          </div>
          <div className="mb-2 flex justify-between text-sm font-bold">
            <span className="text-ink-2">{t("Seats in use")}</span>
            <span>
              {COMPANY.seatsUsed} / {COMPANY.seats}
            </span>
          </div>
          <div className="h-2 rounded-pill bg-surface-2 overflow-hidden mb-5">
            <div
              className="h-full [width:var(--w)] [background:linear-gradient(90deg,var(--coral),var(--orange))] rounded-pill"
              style={
                {
                  ["--w"]: `${(COMPANY.seatsUsed / COMPANY.seats) * 100}%`,
                } as React.CSSProperties
              }
            />
          </div>
          <div className="flex items-center gap-2 py-3 px-3.5 rounded-sm bg-surface-2 text-xs text-ink-2 font-semibold">
            <Icons.building size={16} className="text-ink-3" />
            {t("Managed by")} {COMPANY.hr}.{" "}
            {t("Need a seat changed? Contact your admin.")}
          </div>
        </div>
        <div className="bg-surface border border-line rounded-lg duration-[180ms] p-0 overflow-hidden">
          <div className="flex items-center justify-between py-5 px-6">
            <h3 className="text-base">{t("Billing & invoices")}</h3>
            <span className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-semibold border border-line bg-[var(--surface-2)] text-[var(--ink-3)]">
              {t("View only")}
            </span>
          </div>
          {CORP_INVOICES.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center gap-3.5 py-3.5 px-6 border-t border-line"
            >
              <span
                className={`w-9 h-9 rounded-md flex-none grid place-items-center ${
                  inv.status === "paid"
                    ? "[background:color-mix(in_srgb,#1FA46E_13%,transparent)] text-[#1FA46E]"
                    : "[background:color-mix(in_srgb,var(--orange)_14%,transparent)] text-[var(--orange-deep)]"
                }`}
              >
                <Icons.wallet size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm">{inv.id}</div>
                <div className="text-xs text-ink-3 font-semibold">
                  {inv.label} · {inv.date}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-sm">
                  {fmt(inv.amount)}
                </div>
                <span
                  className={`text-xs font-extrabold uppercase tracking-[.04em] ${
                    inv.status === "paid"
                      ? "text-[#1FA46E]"
                      : "text-[var(--orange-deep)]"
                  }`}
                >
                  {t(inv.status)}
                </span>
              </div>
              <button className="rounded-pill grid place-items-center bg-surface border border-line text-ink-2 duration-150 relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2 w-9 h-9">
                <Icons.download size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {modal === "quote" && <QuoteModal onClose={() => setModal(null)} />}
      {modal === "gift" && <GiftModal onClose={() => setModal(null)} />}
      {open && (
        <ServiceModal
          exp={open}
          slots={slotsByService[open.id] || []}
          wallet={wallet}
          fav={favs.includes(open.id)}
          onFav={onFav}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function TeamEventCard({
  ev,
  byId,
  onOpen,
}: {
  ev: (typeof TEAM_EVENTS)[number];
  byId: (id: string) => Exp | null;
  onOpen: (e: Exp) => void;
}) {
  const t = useT();
  const e = byId(ev.expId);
  const [joined, setJoined] = useState(ev.joined);
  if (!e) return null;
  const m = MOODS[e.mood];
  return (
    <div className="bg-surface border border-line rounded-lg overflow-hidden">
      <div
        className="relative h-[120px] [background:var(--bg)]"
        style={{ ["--bg"]: e.gradient } as React.CSSProperties}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.4))]" />
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-[rgba(255,255,255,.92)] text-[#241C2E] py-1 px-3 rounded-pill text-xs font-extrabold">
            {t(CAL_WD[calDow(ev.day)])} {ev.day} {t("Jun")} · {ev.time}
          </span>
        </div>
        <span className="absolute bottom-3 left-3.5 text-white font-display font-extrabold text-lg [text-shadow:0_1px_10px_rgba(0,0,0,.4)]">
          {t(ev.title)}
        </span>
      </div>
      <div className="py-4 px-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-pill text-xs font-semibold border border-line bg-[var(--surface-2)] text-[var(--ink-2)]">
            <Icons.briefcase size={12} className="mr-1" />
            {t(ev.team)}
          </span>
          <span
            className="inline-flex items-center gap-2 rounded-pill font-bold cursor-pointer duration-[140ms] border-2 border-solid border-transparent [background:var(--bg)] [color:var(--fg)] px-2 py-1 text-xs"
            style={{ ["--bg"]: m.soft, ["--fg"]: m.color } as React.CSSProperties}
          >
            <MoodDot mood={e.mood} size={6} />
            {t(m.label)}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex [&>*]:-ml-2.5 [&>*]:border-2 [&>*]:border-surface [&>*:first-child]:ml-0">
            {ev.going.slice(0, 5).map((a, i) => (
              <Avatar key={i} name={a} size={28} />
            ))}
            <span className="-ml-2.5 w-7 h-7 rounded-pill bg-surface-2 border-2 border-surface grid place-items-center text-xs font-extrabold text-ink-2">
              +{ev.extra}
            </span>
          </div>
          <span className="text-xs text-ink-3 font-bold">
            {ev.going.length + ev.extra}/{ev.cap} {t("going")}
          </span>
          <Button
            ctx="app"
            variant={joined ? "soft" : "primary"}
            size="sm"
            className="ml-auto"
            onClick={() => setJoined((j) => !j)}
          >
            {joined ? (
              <>
                <Icons.check size={15} />
                {t("Going")}
              </>
            ) : (
              t("Join")
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold text-ink-2 mb-2">
      {children}
    </div>
  );
}

function QuoteModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const [size, setSize] = useState(12);
  const [vibe, setVibe] = useState("joy");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("mid");
  const [note, setNote] = useState("");
  return (
    <Modal onClose={onClose} maxWidth={500}>
      {step === 0 ? (
        <div className="py-7 px-6">
          <div className="text-xs font-extrabold tracking-[0.18em] uppercase mb-2 text-[var(--coral-deep)]">
            {t("Custom team event")}
          </div>
          <h2 className="text-2xl mb-1.5">{t("Tell us your vision")}</h2>
          <p className="text-ink-2 text-sm mt-0 mx-0 mb-5">
            {t("Our events team replies within one business day with a tailored plan.")}
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <Lbl>
                {t("Team size")} —{" "}
                <b className="text-coral-deep">
                  {size} {t("people")}
                </b>
              </Lbl>
              <input
                type="range"
                min={4}
                max={80}
                value={size}
                onChange={(e) => setSize(+e.target.value)}
                className="w-full [accent-color:var(--coral)]"
              />
            </div>
            <div>
              <Lbl>{t("Vibe")}</Lbl>
              <div className="flex flex-wrap gap-2">
                {MOOD_ORDER.map((k) => (
                  <MoodChip
                    key={k}
                    mood={k}
                    active={vibe === k}
                    onClick={() => setVibe(k)}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <Lbl>{t("Preferred date")}</Lbl>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Lbl>{t("Budget / person")}</Lbl>
                <div className="relative block">
                  <Select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="appearance-none"
                  >
                    <option value="low">{t("Up to 2 000 ₽")}</option>
                    <option value="mid">{t("2 000–5 000 ₽")}</option>
                    <option value="high">{t("5 000 ₽+")}</option>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Lbl>{t("Anything else?")}</Lbl>
              <Textarea
                rows={3}
                placeholder={t("Dietary needs, accessibility, the occasion…")}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-y"
              />
            </div>
          </div>
          <div className="flex gap-2.5 mt-6">
            <Button
              ctx="app"
              variant="ghost"
              size="md"
              block
              onClick={onClose}
            >
              {t("Cancel")}
            </Button>
            <Button ctx="app" variant="primary" size="md" block onClick={() => setStep(1)}>
              {t("Send request")}
              <Icons.send size={16} />
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-9 px-8 text-center">
          <div className="w-16 h-16 rounded-pill bg-[color-mix(in_srgb,#1FA46E_14%,transparent)] text-[#1FA46E] grid place-items-center mt-0 mx-auto mb-5">
            <Icons.check size={34} />
          </div>
          <h2 className="text-2xl mb-2">{t("Request sent ✦")}</h2>
          <p className="text-ink-2 text-sm mt-0 mx-auto mb-6 leading-normal max-w-[36ch]">
            {t("Our events team will email you a tailored plan for")}{" "}
            <b>
              {size} {t("people")}
            </b>{" "}
            {t("within one business day.")}
          </p>
          <Button ctx="app" variant="primary" size="md" onClick={onClose}>
            {t("Done")}
          </Button>
        </div>
      )}
    </Modal>
  );
}

function GiftModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [amt, setAmt] = useState(2500);
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Modal onClose={onClose} maxWidth={460}>
      {!sent ? (
        <div className="py-7 px-6">
          <div className="text-xs font-extrabold tracking-[0.18em] uppercase mb-2 text-[#B97714]">
            {t("Joymap gift card")}
          </div>
          <h2 className="text-2xl mb-5">{t("Send the joy")}</h2>
          <div className="relative overflow-hidden rounded-lg text-[#f4e9d8] [background:linear-gradient(135deg,#5e1014,#2a0709)] border border-[color-mix(in_srgb,#e6a23c_40%,transparent)] p-5 mb-5 cursor-default">
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-xs tracking-widest opacity-70 font-bold">
                  {t("JOYMAP GIFT")}
                </div>
                <div className="font-display font-extrabold text-3xl text-[#FFF3E4] mt-1">
                  {fmt(amt)}
                </div>
              </div>
              <Icons.gift size={34} className="text-[var(--gold)]" />
            </div>
          </div>
          <Lbl>{t("Amount")}</Lbl>
          <div className="grid grid-cols-[repeat(4,1fr)] gap-2 mb-4">
            {GIFT_DENOMS.map((d) => (
              <div
                key={d}
                className={`border-2 rounded py-4 px-2.5 text-center cursor-pointer duration-150 bg-surface hover:border-[#e6a23c] ${
                  amt === d
                    ? "border-[#e6a23c] bg-[color-mix(in_srgb,#e6a23c_12%,transparent)]"
                    : "border-line-2"
                }`}
                onClick={() => setAmt(d)}
              >
                <div className="font-display font-extrabold text-base">
                  {fmt(d)}
                </div>
              </div>
            ))}
          </div>
          <Lbl>{t("Colleague's email")}</Lbl>
          <Input
            type="email"
            placeholder="name@acme.com"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mb-3.5"
          />
          <Lbl>{t("Message (optional)")}</Lbl>
          <Textarea
            rows={2}
            placeholder={t("Thanks for everything — enjoy! 🎉")}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            className="resize-y mb-5"
          />
          <div className="flex gap-2.5">
            <Button
              ctx="app"
              variant="ghost"
              size="md"
              block
              onClick={onClose}
            >
              {t("Cancel")}
            </Button>
            <Button
              ctx="app"
              variant="primary"
              size="md"
              block
              onClick={() => setSent(true)}
              className={!to ? "opacity-50" : undefined}
            >
              <Icons.gift size={16} />
              {t("Send")} {fmt(amt)}
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-9 px-8 text-center">
          <div className="w-16 h-16 rounded-pill bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-[#B97714] grid place-items-center mt-0 mx-auto mb-5">
            <Icons.gift size={32} />
          </div>
          <h2 className="text-2xl mb-2">{t("Gift on its way 🎁")}</h2>
          <p className="text-ink-2 text-sm mt-0 mx-auto mb-6 leading-normal max-w-[34ch]">
            {t("A Joymap gift card of")} <b>{fmt(amt)}</b> {t("is heading to")}{" "}
            {to || t("your colleague")}.
          </p>
          <Button ctx="app" variant="primary" size="md" onClick={onClose}>
            {t("Done")}
          </Button>
        </div>
      )}
    </Modal>
  );
}
