"use client";

import { useState } from "react";
import { btnCls } from "@/lib/btn";
import { Icons, Logo } from "@/components/Icons";
import {
  MOODS,
  MOOD_ORDER,
  fmt,
  Avatar,
  Btn,
  MoodChip,
  MoodDot,
  SectionHead,
  Modal,
  type Exp,
} from "./primitives";
import { Input, Select, Textarea } from "@/components/ui";
import { ServiceModal, type Slot } from "./ServiceModal";
import { useFav } from "./useFav";
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
    <div className="animate-anim-fade-app corp">
      <div className="corp-hero">
        <div className="relative flex gap-[30px] items-center flex-wrap">
          <div className="flex-1 min-w-[280px] max-w-[560px]">
            <div className="corp-eyebrow" style={{ marginBottom: 16 }}>
              {t("Corporate wellbeing")}
            </div>
            <div className="corp-lockup" style={{ marginBottom: 18 }}>
              <span className="corp-logo">{COMPANY.letter}</span>
              <span className="corp-x">×</span>
              <Logo size={30} mono />
            </div>
            <h1
              className="text-[#FFF3E4] leading-[1.05]"
              style={{ fontSize: "clamp(28px,3.4vw,40px)", maxWidth: "14ch" }}
            >
              {t("Your wellbeing, on the house.")}
            </h1>
            <p
              className="text-[rgba(244,233,216,.8)] text-[15.5px] leading-[1.6] mt-[14px]"
              style={{ maxWidth: "52ch" }}
            >
              {COMPANY.name} {t("sponsors your Joymap experiences. Spend your monthly credit on anything that brings you joy — no receipts, no approvals.")}
            </p>
            <div className="flex gap-[10px] mt-[24px] flex-wrap">
              <button
                className={btnCls("app", undefined, "lg")}
                style={{
                  background: "var(--gold)",
                  color: "#3a0a0d",
                  fontWeight: 800,
                }}
                onClick={() => openExp("e1")}
              >
                {t("Spend my credit")}
                <Icons.arrowR size={18} />
              </button>
              <button
                className={btnCls("app", undefined, "lg")}
                style={{
                  background: "rgba(255,255,255,.1)",
                  color: "#F4E9D8",
                  backdropFilter: "blur(4px)",
                }}
                onClick={() => setModal("quote")}
              >
                {t("Plan a team event")}
              </button>
            </div>
          </div>
          <div className="flex flex-col items-center gap-[14px]">
            <div className="ring" style={{ ["--p" as any]: pct }}>
              <div className="hole">
                <div>
                  <div className="font-display font-extrabold text-[24px] text-[#FFF3E4] leading-[1]">
                    {fmt(remaining)}
                  </div>
                  <div className="text-[10.5px] text-[rgba(244,233,216,.7)] font-bold tracking-[.04em] mt-[3px]">
                    {t("LEFT THIS MONTH")}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center text-[12.5px] text-[rgba(244,233,216,.7)] font-semibold">
              {fmt(COMPANY.used)} {t("of")} {fmt(COMPANY.allowance)} {t("used")}
              <br />
              {t("Renews")} {COMPANY.renews}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-[34px] mx-0 mb-[14px]">
        <SectionHead
          eyebrow={t("Included with your plan")}
          title={t("Your perks")}
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(238px,1fr))] gap-[var(--gap)]">
        {CORP_PERKS.map((p) => {
          const I = Icons[p.icon];
          return (
            <div key={p.title} className="corp-card corp-perk">
              <div className="flex items-start justify-between mb-[16px]">
                <span
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: 13,
                    display: "grid",
                    placeItems: "center",
                    background: `color-mix(in srgb,${p.accent} 15%,transparent)`,
                    color: p.accent,
                  }}
                >
                  <I size={23} />
                </span>
                {p.tag && (
                  <span
                    className="tag"
                    style={{
                      background:
                        "color-mix(in srgb,var(--gold) 16%,transparent)",
                      color: "#B97714",
                      border: "none",
                    }}
                  >
                    {t(p.tag)}
                  </span>
                )}
              </div>
              <h3 className="text-[16.5px] mb-[5px]">{t(p.title)}</h3>
              <p className="text-[13px] text-ink-3 font-semibold mt-0 mx-0 mb-[14px] leading-[1.45]">
                {t(p.desc)}
              </p>
              <div
                className="inline-flex items-center gap-[6px] font-extrabold font-display text-[15px]"
                style={{ color: p.accent }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 99,
                    background: p.accent,
                  }}
                />
                {t(p.value)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-[40px] mx-0 mb-[14px]">
        <SectionHead
          eyebrow={t("With your colleagues")}
          title={t("Team-building events")}
          action={
            <Btn
              variant="ghost"
              size="md"
              onClick={() => openExp("e9")}
              iconR={<Icons.arrowR size={17} />}
            >
              {t("Browse team experiences")}
            </Btn>
          }
        />
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-[var(--gap)]">
        {TEAM_EVENTS.map((ev) => (
          <TeamEventCard key={ev.id} ev={ev} byId={byId} onOpen={setOpen} />
        ))}
      </div>

      <div className="grid grid-cols-[1.3fr_1fr] gap-[var(--gap)] mt-[40px] mx-0 mb-0 items-stretch">
        <div className="corp-gift" onClick={() => setModal("gift")}>
          <div className="relative flex flex-col h-full">
            <div className="flex items-center justify-between mb-[18px]">
              <span className="corp-eyebrow" style={{ color: "var(--gold)" }}>
                {t("Joymap gift card")}
              </span>
              <Icons.gift size={26} style={{ color: "var(--gold)" }} />
            </div>
            <h3
              className="text-[24px] text-[#FFF3E4] mb-[8px]"
              style={{ maxWidth: "16ch" }}
            >
              {t("Share the joy with a colleague.")}
            </h3>
            <p
              className="text-[rgba(244,233,216,.78)] text-[14px] leading-[1.55] mb-[20px]"
              style={{ maxWidth: "46ch" }}
            >
              {t("Send an experience gift card by email — they pick what brings them joy.")}
            </p>
            <div className="flex gap-[8px] mt-auto flex-wrap">
              {GIFT_DENOMS.map((d) => (
                <span
                  key={d}
                  className="py-[7px] px-[13px] rounded-[99px] border border-[color-mix(in_srgb,var(--gold)_45%,transparent)] font-extrabold text-[13px] font-display"
                >
                  {fmt(d)}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div
          className="corp-card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 14,
            background: "var(--surface-2)",
          }}
        >
          <span className="w-[48px] h-[48px] rounded-[13px] grid place-items-center bg-surface shadow-[var(--sh-sm)] text-coral-deep">
            <Icons.sparkle size={24} />
          </span>
          <div>
            <h3 className="text-[18px] mb-[6px]">
              {t("Something bigger in mind?")}
            </h3>
            <p className="text-[13.5px] text-ink-2 leading-[1.5] m-0">
              {t("Off-sites, launches, away-days — our team curates a custom experience for any group size.")}
            </p>
          </div>
          <Btn
            size="md"
            onClick={() => setModal("quote")}
            icon={<Icons.briefcase size={17} />}
          >
            {t("Request a quote")}
          </Btn>
        </div>
      </div>

      <div
        className="corp-feature"
        style={{ marginTop: "calc(var(--gap) + 16px)" }}
      >
        <div className="relative max-w-[560px]">
          <div className="corp-eyebrow" style={{ marginBottom: 12 }}>
            {t("Off-sites & away-days")}
          </div>
          <h2
            className="text-[#fff] leading-[1.06] mb-[12px]"
            style={{ fontSize: "clamp(24px,3vw,34px)" }}
          >
            {t("Bring the whole team together.")}
          </h2>
          <p
            className="text-[rgba(255,255,255,.85)] text-[15px] leading-[1.6] mb-[20px]"
            style={{ maxWidth: "48ch" }}
          >
            {t("From strategy days to celebration nights, our events team curates a custom experience for any group size — fully handled, beautifully run.")}
          </p>
          <button
            className={btnCls("app", undefined, "lg")}
            style={{
              background: "var(--gold)",
              color: "#3a0a0d",
              fontWeight: 800,
            }}
            onClick={() => setModal("quote")}
          >
            <Icons.briefcase size={18} />
            {t("Plan a team event")}
          </button>
        </div>
      </div>

      <div className="mt-[40px] mx-0 mb-[14px]">
        <SectionHead
          eyebrow={t("Managed by your company")}
          title={t("Your company plan")}
        />
      </div>
      <div className="grid grid-cols-[1fr_1.25fr] gap-[var(--gap)] items-start">
        <div className="corp-card">
          <div className="flex items-center gap-[12px] mb-[18px]">
            <span
              className="corp-logo"
              style={{
                width: 42,
                height: 42,
                fontSize: 20,
                background: "linear-gradient(140deg,var(--red),var(--orange))",
                color: "#fff",
                borderRadius: 12,
              }}
            >
              {COMPANY.letter}
            </span>
            <div>
              <div className="font-extrabold font-display text-[16px]">
                {COMPANY.name}
              </div>
              <div className="text-[12.5px] text-ink-3 font-semibold">
                {COMPANY.plan} · {t("since")} {COMPANY.since}
              </div>
            </div>
          </div>
          <div className="mb-[8px] flex justify-between text-[13px] font-bold">
            <span className="text-ink-2">{t("Seats in use")}</span>
            <span>
              {COMPANY.seatsUsed} / {COMPANY.seats}
            </span>
          </div>
          <div className="h-[8px] rounded-[99px] bg-surface-2 overflow-hidden mb-[18px]">
            <div
              style={{
                height: "100%",
                width: `${(COMPANY.seatsUsed / COMPANY.seats) * 100}%`,
                background: "linear-gradient(90deg,var(--coral),var(--orange))",
                borderRadius: 99,
              }}
            />
          </div>
          <div className="flex items-center gap-[9px] py-[12px] px-[14px] rounded-sm bg-surface-2 text-[12.5px] text-ink-2 font-semibold">
            <Icons.building size={16} style={{ color: "var(--ink-3)" }} />
            {t("Managed by")} {COMPANY.hr}.{" "}
            {t("Need a seat changed? Contact your admin.")}
          </div>
        </div>
        <div className="corp-card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="flex items-center justify-between py-[18px] px-[22px]">
            <h3 className="text-[16px]">{t("Billing & invoices")}</h3>
            <span
              className="tag"
              style={{ background: "var(--surface-2)", color: "var(--ink-3)" }}
            >
              {t("View only")}
            </span>
          </div>
          {CORP_INVOICES.map((inv) => (
            <div
              key={inv.id}
              className="flex items-center gap-[14px] py-[14px] px-[22px] border-t border-line"
            >
              <span
                className="w-[38px] h-[38px] rounded-[11px] flex-none grid place-items-center"
                style={{
                  background:
                    inv.status === "paid"
                      ? "color-mix(in srgb,#1FA46E 13%,transparent)"
                      : "color-mix(in srgb,var(--orange) 14%,transparent)",
                  color:
                    inv.status === "paid" ? "#1FA46E" : "var(--orange-deep)",
                }}
              >
                <Icons.wallet size={18} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px]">{inv.id}</div>
                <div className="text-[12.5px] text-ink-3 font-semibold">
                  {inv.label} · {inv.date}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-[14px]">
                  {fmt(inv.amount)}
                </div>
                <span
                  className="text-[11.5px] font-extrabold uppercase tracking-[.04em]"
                  style={{
                    color:
                      inv.status === "paid" ? "#1FA46E" : "var(--orange-deep)",
                  }}
                >
                  {t(inv.status)}
                </span>
              </div>
              <button className="w-[42px] h-[42px] rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2" style={{ width: 34, height: 34 }}>
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
    <div className="bg-surface border border-line rounded-lg" style={{ overflow: "hidden" }}>
      <div className="relative h-[120px]" style={{ background: e.gradient }}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.4))]" />
        <div className="absolute top-[12px] left-[12px] flex gap-[7px]">
          <span className="bg-[rgba(255,255,255,.92)] text-[#241C2E] py-[5px] px-[11px] rounded-[99px] text-[11.5px] font-extrabold">
            {t(CAL_WD[calDow(ev.day)])} {ev.day} {t("Jun")} · {ev.time}
          </span>
        </div>
        <span
          className="absolute bottom-[12px] left-[14px] text-[#fff] font-display font-extrabold text-[18px]"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,.4)" }}
        >
          {t(ev.title)}
        </span>
      </div>
      <div className="py-[15px] px-[17px]">
        <div className="flex items-center gap-[8px] mb-[12px]">
          <span
            className="tag"
            style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}
          >
            <Icons.briefcase size={12} style={{ marginRight: 4 }} />
            {t(ev.team)}
          </span>
          <span
            className="mood-chip"
            style={{
              background: m.soft,
              color: m.color,
              padding: "4px 10px 4px 8px",
              fontSize: 11,
            }}
          >
            <MoodDot mood={e.mood} size={6} />
            {t(m.label)}
          </span>
        </div>
        <div className="flex items-center gap-[10px]">
          <div className="av-stack">
            {ev.going.slice(0, 5).map((a, i) => (
              <Avatar key={i} name={a} size={28} />
            ))}
            <span className="ml-[-9px] w-[28px] h-[28px] rounded-[99px] bg-surface-2 border-2 border-surface grid place-items-center text-[11px] font-extrabold text-ink-2">
              +{ev.extra}
            </span>
          </div>
          <span className="text-[12.5px] text-ink-3 font-bold">
            {ev.going.length + ev.extra}/{ev.cap} {t("going")}
          </span>
          <button
            className={btnCls("app", joined ? "soft" : "primary", "sm")}
            style={{ marginLeft: "auto" }}
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
          </button>
        </div>
      </div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
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
        <div className="py-[26px] px-[28px]">
          <div
            className="corp-eyebrow"
            style={{ marginBottom: 8, color: "var(--coral-deep)" }}
          >
            {t("Custom team event")}
          </div>
          <h2 className="text-[23px] mb-[6px]">{t("Tell us your vision")}</h2>
          <p className="text-ink-2 text-[14px] mt-0 mx-0 mb-[20px]">
            {t("Our events team replies within one business day with a tailored plan.")}
          </p>
          <div className="flex flex-col gap-[16px]">
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
                className="w-full"
                style={{ accentColor: "var(--coral)" }}
              />
            </div>
            <div>
              <Lbl>{t("Vibe")}</Lbl>
              <div className="flex flex-wrap gap-[8px]">
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
            <div className="flex gap-[12px]">
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
                <div className="cal-sel" style={{ display: "block" }}>
                  <Select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    style={{ appearance: "none" }}
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
                style={{ resize: "vertical" }}
              />
            </div>
          </div>
          <div className="flex gap-[10px] mt-[22px]">
            <button
              className={btnCls("app", "ghost", "md", true)}
              onClick={onClose}
            >
              {t("Cancel")}
            </button>
            <Btn size="md" block onClick={() => setStep(1)}>
              {t("Send request")}
              <Icons.send size={16} />
            </Btn>
          </div>
        </div>
      ) : (
        <div className="py-[34px] px-[30px] text-center">
          <div className="w-[66px] h-[66px] rounded-[99px] bg-[color-mix(in_srgb,#1FA46E_14%,transparent)] text-[#1FA46E] grid place-items-center mt-0 mx-auto mb-[18px]">
            <Icons.check size={34} />
          </div>
          <h2 className="text-[23px] mb-[8px]">{t("Request sent ✦")}</h2>
          <p
            className="text-ink-2 text-[14.5px] mt-0 mx-auto mb-[22px] leading-[1.55]"
            style={{ maxWidth: "36ch" }}
          >
            {t("Our events team will email you a tailored plan for")}{" "}
            <b>
              {size} {t("people")}
            </b>{" "}
            {t("within one business day.")}
          </p>
          <Btn size="md" onClick={onClose}>
            {t("Done")}
          </Btn>
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
        <div className="py-[26px] px-[28px]">
          <div
            className="corp-eyebrow"
            style={{ marginBottom: 8, color: "#B97714" }}
          >
            {t("Joymap gift card")}
          </div>
          <h2 className="text-[23px] mb-[18px]">{t("Send the joy")}</h2>
          <div
            className="corp-gift"
            style={{ marginBottom: 20, cursor: "default" }}
          >
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-[11.5px] tracking-[.1em] opacity-[.7] font-bold">
                  {t("JOYMAP GIFT")}
                </div>
                <div className="font-display font-extrabold text-[30px] text-[#FFF3E4] mt-[4px]">
                  {fmt(amt)}
                </div>
              </div>
              <Icons.gift size={34} style={{ color: "var(--gold)" }} />
            </div>
          </div>
          <Lbl>{t("Amount")}</Lbl>
          <div className="grid grid-cols-[repeat(4,1fr)] gap-[8px] mb-[16px]">
            {GIFT_DENOMS.map((d) => (
              <div
                key={d}
                className={`gift-denom ${amt === d ? "on" : ""}`}
                onClick={() => setAmt(d)}
              >
                <div className="font-display font-extrabold text-[15px]">
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
            style={{ marginBottom: 14 }}
          />
          <Lbl>{t("Message (optional)")}</Lbl>
          <Textarea
            rows={2}
            placeholder={t("Thanks for everything — enjoy! 🎉")}
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            style={{ resize: "vertical", marginBottom: 20 }}
          />
          <div className="flex gap-[10px]">
            <button
              className={btnCls("app", "ghost", "md", true)}
              onClick={onClose}
            >
              {t("Cancel")}
            </button>
            <Btn
              size="md"
              block
              onClick={() => setSent(true)}
              style={!to ? { opacity: 0.5 } : undefined}
            >
              <Icons.gift size={16} />
              {t("Send")} {fmt(amt)}
            </Btn>
          </div>
        </div>
      ) : (
        <div className="py-[34px] px-[30px] text-center">
          <div className="w-[66px] h-[66px] rounded-[99px] bg-[color-mix(in_srgb,var(--gold)_18%,transparent)] text-[#B97714] grid place-items-center mt-0 mx-auto mb-[18px]">
            <Icons.gift size={32} />
          </div>
          <h2 className="text-[23px] mb-[8px]">{t("Gift on its way 🎁")}</h2>
          <p
            className="text-ink-2 text-[14.5px] mt-0 mx-auto mb-[22px] leading-[1.55]"
            style={{ maxWidth: "34ch" }}
          >
            {t("A Joymap gift card of")} <b>{fmt(amt)}</b> {t("is heading to")}{" "}
            {to || t("your colleague")}.
          </p>
          <Btn size="md" onClick={onClose}>
            {t("Done")}
          </Btn>
        </div>
      )}
    </Modal>
  );
}
