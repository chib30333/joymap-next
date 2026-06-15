"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { useBusy } from "@/hooks";
import {
  MOODS,
  fmt,
  bg,
  WD,
  dow,
  Modal,
  MoodDot,
  Rating,
  QR,
  type Exp,
} from "./primitives";
import { Button, Textarea } from "@/components/ui";
import { useT } from "@/components/Language";

type B = {
  id: string;
  serviceId: string;
  day: number;
  date: string;
  time: string;
  total: number;
  pay: string;
  status: string;
  code: string;
  rated?: number | null;
  exp: Exp | null;
};

export function Bookings({ upcoming, past }: { upcoming: B[]; past: B[] }) {
  const t = useT();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [modal, setModal] = useState<{ kind: string; b: B } | null>(null);
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="animate-anim-fade-app">
      <div className="flex gap-[8px] mb-[24px] bg-surface-2 p-[5px] rounded-pill w-fit border border-line">
        {(
          [
            ["upcoming", t("Upcoming")],
            ["past", t("Past")],
          ] as const
        ).map(([k, l]) => (
          <Button
            key={k}
            ctx="app"
            size="sm"
            onClick={() => setTab(k)}
            className={
              tab === k
                ? "bg-[var(--surface)] text-[var(--ink)] [box-shadow:var(--sh-sm)]"
                : "text-[var(--ink-3)]"
            }
          >
            {l}
          </Button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="text-center py-[70px] px-[20px] text-ink-3">
          <div className="w-[64px] h-[64px] rounded-[99px] bg-surface-2 grid place-items-center mt-0 mx-auto mb-[16px]">
            <Icons.calendar size={28} />
          </div>
          <h3 className="text-[19px] text-ink">
            {tab === "upcoming"
              ? t("Nothing booked yet")
              : t("No past experiences")}
          </h3>
          <p className="max-w-[360px] mt-[8px] mx-auto mb-0">
            {tab === "upcoming"
              ? t(
                  "Find something in Discover and book your first experience — it will appear here.",
                )
              : t("Completed and cancelled bookings will show up here.")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-[14px]">
          {list.map((b, i) => {
            const e = b.exp;
            if (!e) return null;
            const m = MOODS[e.mood];
            return (
              <div
                key={b.id}
                className="bg-surface border border-line rounded-lg animate-anim-pop-app flex gap-0 overflow-hidden [animation-delay:var(--ad)]"
                style={{ "--ad": `${i * 0.05}s` } as React.CSSProperties}
              >
                <div
                  className="w-[150px] flex-none relative [background:var(--cell-bg)]"
                  style={{ "--cell-bg": bg(e) } as React.CSSProperties}
                >
                  <div
                    className="absolute inset-0 mix-blend-overlay bg-[radial-gradient(rgba(255,255,255,0.9)_0.6px,transparent_0.6px)] bg-[length:7px_7px] opacity-[0.15]"
                  />
                </div>
                <div className="flex-1 py-[18px] px-[22px] flex items-center gap-[20px] flex-wrap">
                  <div className="flex-1 min-w-[180px]">
                    <span
                      className="inline-flex items-center gap-[8px] rounded-pill font-bold cursor-pointer [transition:0.14s] border-[1.5px] border-solid border-transparent p-[4px_10px_4px_8px] text-[11.5px] mb-[8px] [background:var(--chip-bg)] text-[var(--chip-c)]"
                      style={
                        { "--chip-bg": m.soft, "--chip-c": m.color } as React.CSSProperties
                      }
                    >
                      <MoodDot mood={e.mood} size={6} />
                      {t(m.label)}
                    </span>
                    <h3 className="text-[18px] mt-[8px]">{e.title}</h3>
                    <div className="flex gap-[14px] mt-[8px] text-ink-3 text-[13.5px] font-semibold flex-wrap">
                      <span className="inline-flex gap-[5px] items-center">
                        <Icons.calendar size={14} />
                        {b.date}
                      </span>
                      <span className="inline-flex gap-[5px] items-center">
                        <Icons.clock size={14} />
                        {b.time}
                      </span>
                      <span className="inline-flex gap-[5px] items-center">
                        <Icons.pin size={14} />
                        {e.area}
                      </span>
                    </div>
                  </div>
                  {tab === "upcoming" ? (
                    <div className="flex flex-col gap-[8px] items-end">
                      <BookingPill status={b.status} />
                      <div className="flex gap-[6px]">
                        <Button
                          ctx="app"
                          variant="ghost"
                          size="sm"
                          onClick={() => setModal({ kind: "qr", b })}
                        >
                          <Icons.qr size={16} />
                          {t("QR")}
                        </Button>
                        <Button
                          ctx="app"
                          variant="ghost"
                          size="sm"
                          onClick={() => setModal({ kind: "move", b })}
                        >
                          <Icons.clock size={15} />
                          {t("Move")}
                        </Button>
                        <Button
                          ctx="app"
                          variant="ghost"
                          size="sm"
                          className="text-[var(--coral)]"
                          onClick={() => setModal({ kind: "cancel", b })}
                        >
                          {t("Cancel")}
                        </Button>
                      </div>
                      <span className="text-[12px] text-ink-3 font-semibold">
                        {b.code}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-[8px] items-end">
                      {b.status === "cancelled" ? (
                        <BookingPill status="cancelled" />
                      ) : b.rated ? (
                        <Rating value={b.rated} />
                      ) : (
                        <Button
                          ctx="app"
                          variant="soft"
                          size="sm"
                          onClick={() => setModal({ kind: "rate", b })}
                        >
                          {t("Rate it")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal?.kind === "qr" && (
        <QRModal b={modal.b} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "rate" && (
        <RateModal b={modal.b} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "move" && (
        <MoveModal b={modal.b} onClose={() => setModal(null)} />
      )}
      {modal?.kind === "cancel" && (
        <CancelModal b={modal.b} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

type PillStyle = {
  label: string;
  color: string;
  bg: string;
  icon: keyof typeof Icons;
};

const PILL_STYLES: Record<string, PillStyle> = {
  pending: {
    label: "Awaiting confirmation",
    color: "var(--m-joy)",
    bg: "var(--m-joy-soft)",
    icon: "clock",
  },
  confirmed: {
    label: "Confirmed",
    color: "var(--m-calm)",
    bg: "var(--m-calm-soft)",
    icon: "check",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--coral)",
    bg: "var(--coral-soft)",
    icon: "close",
  },
  completed: {
    label: "Completed",
    color: "var(--m-focus)",
    bg: "var(--m-focus-soft)",
    icon: "sparkle",
  },
};

export function BookingPill({ status }: { status: string }) {
  const t = useT();
  const { label, color, bg: bgc, icon } = PILL_STYLES[status] ?? PILL_STYLES.pending;
  const I = Icons[icon];
  return (
    <span
      className="inline-flex items-center px-[11px] py-[5px] rounded-pill text-[12px] border-none font-bold [background:var(--pill-bg)] text-[var(--pill-c)]"
      style={{ "--pill-bg": bgc, "--pill-c": color } as React.CSSProperties}
    >
      <I size={13} className="mr-[4px]" />
      {t(label)}
    </span>
  );
}

function QRModal({ b, onClose }: { b: B; onClose: () => void }) {
  const t = useT();
  return (
    <Modal onClose={onClose} maxWidth={360}>
      <div className="p-[28px] text-center">
        <h3 className="text-[19px] mb-[4px]">{b.exp?.title ?? ""}</h3>
        <div className="text-[13.5px] text-ink-3 font-semibold mb-[18px]">
          {b.date} · {b.time}
        </div>
        <div
          className="border border-line rounded-lg p-[22px] bg-surface-2"
        >
          <QR />
          <div className="mt-[14px] [font-family:var(--display)] font-extrabold tracking-[.12em] text-[18px]">
            {b.code}
          </div>
          <div className="text-[12.5px] text-ink-3 font-semibold mt-[3px]">
            {t("Show this at the door")}
          </div>
        </div>
        <Button
          ctx="app"
          variant="ghost"
          size="md"
          block
          className="mt-[16px]"
          onClick={onClose}
        >
          {t("Close")}
        </Button>
      </div>
    </Modal>
  );
}

function RateModal({ b, onClose }: { b: B; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const { busy, run } = useBusy();
  return (
    <Modal onClose={onClose} maxWidth={420}>
      <div className="p-[26px]">
        <h3 className="text-[20px] mb-[4px]">{t("How was it?")}</h3>
        <div className="text-[13.5px] text-ink-3 font-semibold mb-[18px]">
          {b.exp?.title ?? ""} · {b.date}
        </div>
        <div className="flex gap-[6px] justify-center mb-[18px]">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              onClick={() => setStars(s)}
              className={`[background:none] border-none cursor-pointer text-[32px] [transition:.12s] ${s <= stars ? "text-m-joy" : "text-line-2"}`}
            >
              ★
            </button>
          ))}
        </div>
        <Textarea
          rows={3}
          placeholder={t("Tell others what you loved (optional)…")}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="resize-y mb-[18px]"
        />
        <div className="flex gap-[10px]">
          <Button ctx="app" variant="ghost" size="md" block onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button
            busy={busy}
            ctx="app"
            variant="primary"
            size="md"
            block
            icon={<Icons.star size={16} />}
            onClick={() =>
              run(
                () => rpc("rateBooking", { id: b.id, stars, text }),
                () => {
                  onClose();
                  router.refresh();
                },
              )
            }
          >
            {t("Submit review")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function MoveModal({ b, onClose }: { b: B; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const days = Array.from({ length: 7 }, (_, i) => 10 + i).filter(
    (d) => d <= 30,
  );
  const times = [
    "07:30",
    "09:00",
    "11:00",
    "13:00",
    "15:00",
    "17:00",
    "18:30",
    "20:00",
  ];
  const [day, setDay] = useState(b.day);
  const [time, setTime] = useState(b.time);
  const { busy, run } = useBusy();
  return (
    <Modal onClose={onClose} maxWidth={440}>
      <div className="p-[26px]">
        <h3 className="text-[20px] mb-[4px]">{t("Reschedule")}</h3>
        <div className="text-[13.5px] text-ink-3 font-semibold mb-[18px]">
          {b.exp?.title ?? ""} — {t("the provider will re-confirm.")}
        </div>
        <div className="font-bold text-[14px] mb-[10px]">{t("New day")}</div>
        <div
          className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex gap-[8px] overflow-x-auto mb-[18px]"
        >
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              className={`flex-none w-[60px] p-[10px_0] rounded-[var(--r-sm)] cursor-pointer [border-width:1.5px] [border-style:solid] ${day === d ? "border-coral bg-coral-soft" : "border-line-2 bg-surface"}`}
            >
              <div
                className={`text-[11.5px] font-bold ${day === d ? "text-coral-deep" : "text-ink-3"}`}
              >
                {t(WD[dow(d)])}
              </div>
              <div
                className={`[font-family:var(--display)] font-extrabold text-[18px] ${day === d ? "text-coral-deep" : "text-ink"}`}
              >
                {d}
              </div>
            </button>
          ))}
        </div>
        <div className="font-bold text-[14px] mb-[10px]">{t("New time")}</div>
        <div className="flex gap-[8px] flex-wrap mb-[20px]">
          {times.map((tm) => (
            <button
              key={tm}
              className={`inline-flex items-center gap-[7px] py-[7px] px-[13px] rounded-pill text-[13px] font-semibold border cursor-pointer [transition:0.14s] whitespace-nowrap ${time === tm ? "bg-coral text-white border-coral" : "bg-surface text-ink-2 border-line-2 hover:border-ink-3 hover:text-ink"}`}
              onClick={() => setTime(tm)}
            >
              {tm}
            </button>
          ))}
        </div>
        <div className="flex gap-[10px]">
          <Button ctx="app" variant="ghost" size="md" block onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button
            busy={busy}
            ctx="app"
            variant="primary"
            size="md"
            block
            icon={<Icons.check size={16} />}
            onClick={() =>
              run(
                () => rpc("rescheduleBooking", { id: b.id, day, time }),
                () => {
                  onClose();
                  router.refresh();
                },
              )
            }
          >
            {t("Move booking")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function CancelModal({ b, onClose }: { b: B; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const { busy, run } = useBusy();
  return (
    <Modal onClose={onClose} maxWidth={400}>
      <div className="p-[26px] text-center">
        <div className="w-[56px] h-[56px] rounded-[99px] bg-coral-soft text-coral grid place-items-center mt-0 mx-auto mb-[14px]">
          <Icons.close size={26} />
        </div>
        <h3 className="text-[20px] mb-[8px]">{t("Cancel this booking?")}</h3>
        <p className="text-ink-2 text-[14px] mb-[6px]">
          <b>{b.exp?.title ?? ""}</b> · {b.date}, {b.time}
        </p>
        <p className="text-ink-3 text-[13px] mb-[20px]">
          {b.pay === "wallet"
            ? `${fmt(b.total)} ${t("will be refunded to your Joymap balance.")}`
            : t("Free cancellation up to 12h before the start.")}
        </p>
        <div className="flex gap-[10px]">
          <Button ctx="app" variant="ghost" size="md" block onClick={onClose}>
            {t("Keep it")}
          </Button>
          <Button
            busy={busy}
            ctx="app"
            size="md"
            block
            className="bg-[var(--coral)] text-[#fff]"
            onClick={() =>
              run(
                () => rpc("cancelBooking", { id: b.id }),
                () => {
                  onClose();
                  router.refresh();
                },
              )
            }
          >
            {t("Cancel booking")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
