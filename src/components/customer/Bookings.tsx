"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import {
  MOODS,
  fmt,
  bg,
  WD,
  dow,
  Modal,
  MoodDot,
  Rating,
  BusyBtn,
  QR,
  type Exp,
} from "./primitives";
import { Textarea } from "@/components/ui";
import { useT } from "@/components/i18n";

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
    <div className="anim-fade">
      <div className="flex gap-[8px] mb-[24px] bg-surface-2 p-[5px] rounded-pill w-fit border border-line">
        {(
          [
            ["upcoming", t("Upcoming")],
            ["past", t("Past")],
          ] as const
        ).map(([k, l]) => (
          <button
            key={k}
            className="btn btn-sm"
            onClick={() => setTab(k)}
            style={
              tab === k
                ? {
                    background: "var(--surface)",
                    color: "var(--ink)",
                    boxShadow: "var(--sh-sm)",
                  }
                : { color: "var(--ink-3)" }
            }
          >
            {l}
          </button>
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
                className="card anim-pop"
                style={{
                  display: "flex",
                  gap: 0,
                  overflow: "hidden",
                  animationDelay: `${i * 0.05}s`,
                }}
              >
                <div
                  style={{
                    width: 150,
                    flex: "none",
                    background: bg(e),
                    position: "relative",
                  }}
                >
                  <div
                    className="grain"
                    style={{ position: "absolute", inset: 0, opacity: 0.15 }}
                  />
                </div>
                <div className="flex-1 py-[18px] px-[22px] flex items-center gap-[20px] flex-wrap">
                  <div className="flex-1 min-w-[180px]">
                    <span
                      className="mood-chip"
                      style={{
                        background: m.soft,
                        color: m.color,
                        padding: "4px 10px 4px 8px",
                        fontSize: 11.5,
                        marginBottom: 8,
                      }}
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
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setModal({ kind: "qr", b })}
                        >
                          <Icons.qr size={16} />
                          {t("QR")}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setModal({ kind: "move", b })}
                        >
                          <Icons.clock size={15} />
                          {t("Move")}
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: "var(--coral)" }}
                          onClick={() => setModal({ kind: "cancel", b })}
                        >
                          {t("Cancel")}
                        </button>
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
                        <button
                          className="btn btn-soft btn-sm"
                          onClick={() => setModal({ kind: "rate", b })}
                        >
                          {t("Rate it")}
                        </button>
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

export function BookingPill({ status }: { status: string }) {
  const t = useT();
  const map: Record<string, [string, string, string, keyof typeof Icons]> = {
    pending: [
      "Awaiting confirmation",
      "var(--m-joy)",
      "var(--m-joy-soft)",
      "clock",
    ],
    confirmed: ["Confirmed", "var(--m-calm)", "var(--m-calm-soft)", "check"],
    cancelled: ["Cancelled", "var(--coral)", "var(--coral-soft)", "close"],
    completed: [
      "Completed",
      "var(--m-focus)",
      "var(--m-focus-soft)",
      "sparkle",
    ],
  };
  const [l, c, bgc, ic] = map[status] || map.pending;
  const I = Icons[ic];
  return (
    <span
      className="tag"
      style={{ background: bgc, color: c, border: "none", fontWeight: 700 }}
    >
      <I size={13} style={{ marginRight: 4 }} />
      {t(l)}
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
          className="card"
          style={{ padding: 22, background: "var(--surface-2)" }}
        >
          <QR />
          <div className="mt-[14px] [font-family:var(--display)] font-extrabold tracking-[.12em] text-[18px]">
            {b.code}
          </div>
          <div className="text-[12.5px] text-ink-3 font-semibold mt-[3px]">
            {t("Show this at the door")}
          </div>
        </div>
        <button
          className="btn btn-ghost btn-md btn-block"
          style={{ marginTop: 16 }}
          onClick={onClose}
        >
          {t("Close")}
        </button>
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
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 32,
                color: s <= stars ? "var(--m-joy)" : "var(--line-2)",
                transition: ".12s",
              }}
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
          style={{ resize: "vertical", marginBottom: 18 }}
        />
        <div className="flex gap-[10px]">
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>
            {t("Cancel")}
          </button>
          <BusyBtn
            busy={busy}
            className="btn btn-primary btn-md btn-block"
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
          </BusyBtn>
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
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            marginBottom: 18,
          }}
        >
          {days.map((d) => (
            <button
              key={d}
              onClick={() => setDay(d)}
              style={{
                flex: "none",
                width: 60,
                padding: "10px 0",
                borderRadius: "var(--r-sm)",
                cursor: "pointer",
                border: `1.5px solid ${day === d ? "var(--coral)" : "var(--line-2)"}`,
                background: day === d ? "var(--coral-soft)" : "var(--surface)",
              }}
            >
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: day === d ? "var(--coral-deep)" : "var(--ink-3)",
                }}
              >
                {t(WD[dow(d)])}
              </div>
              <div
                style={{
                  fontFamily: "var(--display)",
                  fontWeight: 800,
                  fontSize: 18,
                  color: day === d ? "var(--coral-deep)" : "var(--ink)",
                }}
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
              className={`chip ${time === tm ? "on" : ""}`}
              onClick={() => setTime(tm)}
            >
              {tm}
            </button>
          ))}
        </div>
        <div className="flex gap-[10px]">
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>
            {t("Cancel")}
          </button>
          <BusyBtn
            busy={busy}
            className="btn btn-primary btn-md btn-block"
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
          </BusyBtn>
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
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>
            {t("Keep it")}
          </button>
          <BusyBtn
            busy={busy}
            className="btn btn-md btn-block"
            style={{ background: "var(--coral)", color: "#fff" }}
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
          </BusyBtn>
        </div>
      </div>
    </Modal>
  );
}
