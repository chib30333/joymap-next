"use client";
// Bookings — 1:1 port of screens.jsx Bookings (+ QR / Rate / Move / Cancel modals).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import { MOODS, fmt, bg, WD, dow, Modal, MoodDot, Rating, BusyBtn, QR, type Exp } from "./primitives";

type B = { id: string; serviceId: string; day: number; date: string; time: string; total: number; pay: string; status: string; code: string; rated?: number | null; exp: Exp | null };

export function Bookings({ upcoming, past }: { upcoming: B[]; past: B[] }) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [modal, setModal] = useState<{ kind: string; b: B } | null>(null);
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="anim-fade">
      <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "var(--surface-2)", padding: 5, borderRadius: "var(--r-pill)", width: "fit-content", border: "1px solid var(--line)" }}>
        {([["upcoming", "Upcoming"], ["past", "Past"]] as const).map(([k, l]) => (
          <button key={k} className="btn btn-sm" onClick={() => setTab(k)} style={tab === k ? { background: "var(--surface)", color: "var(--ink)", boxShadow: "var(--sh-sm)" } : { color: "var(--ink-3)" }}>{l}</button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "70px 20px", color: "var(--ink-3)" }}>
          <div style={{ width: 64, height: 64, borderRadius: 99, background: "var(--surface-2)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icons.calendar size={28} /></div>
          <h3 style={{ fontSize: 19, color: "var(--ink)" }}>{tab === "upcoming" ? "Nothing booked yet" : "No past experiences"}</h3>
          <p style={{ maxWidth: 360, margin: "8px auto 0" }}>{tab === "upcoming" ? "Find something in Discover and book your first experience — it will appear here." : "Completed and cancelled bookings will show up here."}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {list.map((b, i) => {
            const e = b.exp;
            if (!e) return null;
            const m = MOODS[e.mood];
            return (
              <div key={b.id} className="card anim-pop" style={{ display: "flex", gap: 0, overflow: "hidden", animationDelay: `${i * 0.05}s` }}>
                <div style={{ width: 150, flex: "none", background: bg(e), position: "relative" }}><div className="grain" style={{ position: "absolute", inset: 0, opacity: 0.15 }} /></div>
                <div style={{ flex: 1, padding: "18px 22px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <span className="mood-chip" style={{ background: m.soft, color: m.color, padding: "4px 10px 4px 8px", fontSize: 11.5, marginBottom: 8 }}><MoodDot mood={e.mood} size={6} />{m.label}</span>
                    <h3 style={{ fontSize: 18, marginTop: 8 }}>{e.title}</h3>
                    <div style={{ display: "flex", gap: 14, marginTop: 8, color: "var(--ink-3)", fontSize: 13.5, fontWeight: 600, flexWrap: "wrap" }}>
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icons.calendar size={14} />{b.date}</span>
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icons.clock size={14} />{b.time}</span>
                      <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icons.pin size={14} />{e.area}</span>
                    </div>
                  </div>
                  {tab === "upcoming" ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <BookingPill status={b.status} />
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: "qr", b })}><Icons.qr size={16} />QR</button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setModal({ kind: "move", b })}><Icons.clock size={15} />Move</button>
                        <button className="btn btn-ghost btn-sm" style={{ color: "var(--coral)" }} onClick={() => setModal({ kind: "cancel", b })}>Cancel</button>
                      </div>
                      <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{b.code}</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      {b.status === "cancelled" ? <BookingPill status="cancelled" /> : b.rated ? <Rating value={b.rated} /> : <button className="btn btn-soft btn-sm" onClick={() => setModal({ kind: "rate", b })}>Rate it</button>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal?.kind === "qr" && <QRModal b={modal.b} onClose={() => setModal(null)} />}
      {modal?.kind === "rate" && <RateModal b={modal.b} onClose={() => setModal(null)} />}
      {modal?.kind === "move" && <MoveModal b={modal.b} onClose={() => setModal(null)} />}
      {modal?.kind === "cancel" && <CancelModal b={modal.b} onClose={() => setModal(null)} />}
    </div>
  );
}

export function BookingPill({ status }: { status: string }) {
  const map: Record<string, [string, string, string, keyof typeof Icons]> = {
    pending: ["Awaiting confirmation", "var(--m-joy)", "var(--m-joy-soft)", "clock"],
    confirmed: ["Confirmed", "var(--m-calm)", "var(--m-calm-soft)", "check"],
    cancelled: ["Cancelled", "var(--coral)", "var(--coral-soft)", "close"],
    completed: ["Completed", "var(--m-focus)", "var(--m-focus-soft)", "sparkle"],
  };
  const [l, c, bgc, ic] = map[status] || map.pending;
  const I = Icons[ic];
  return <span className="tag" style={{ background: bgc, color: c, border: "none", fontWeight: 700 }}><I size={13} style={{ marginRight: 4 }} />{l}</span>;
}

function QRModal({ b, onClose }: { b: B; onClose: () => void }) {
  return (
    <Modal onClose={onClose} maxWidth={360}>
      <div style={{ padding: 28, textAlign: "center" }}>
        <h3 style={{ fontSize: 19, marginBottom: 4 }}>{b.exp?.title ?? ""}</h3>
        <div style={{ fontSize: 13.5, color: "var(--ink-3)", fontWeight: 600, marginBottom: 18 }}>{b.date} · {b.time}</div>
        <div className="card" style={{ padding: 22, background: "var(--surface-2)" }}>
          <QR />
          <div style={{ marginTop: 14, fontFamily: "var(--display)", fontWeight: 800, letterSpacing: ".12em", fontSize: 18 }}>{b.code}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 3 }}>Show this at the door</div>
        </div>
        <button className="btn btn-ghost btn-md btn-block" style={{ marginTop: 16 }} onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

function RateModal({ b, onClose }: { b: B; onClose: () => void }) {
  const router = useRouter();
  const [stars, setStars] = useState(5);
  const [text, setText] = useState("");
  const { busy, run } = useBusy();
  return (
    <Modal onClose={onClose} maxWidth={420}>
      <div style={{ padding: 26 }}>
        <h3 style={{ fontSize: 20, marginBottom: 4 }}>How was it?</h3>
        <div style={{ fontSize: 13.5, color: "var(--ink-3)", fontWeight: 600, marginBottom: 18 }}>{b.exp?.title ?? ""} · {b.date}</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 18 }}>
          {[1, 2, 3, 4, 5].map((s) => <button key={s} onClick={() => setStars(s)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 32, color: s <= stars ? "var(--m-joy)" : "var(--line-2)", transition: ".12s" }}>★</button>)}
        </div>
        <textarea className="field" rows={3} placeholder="Tell others what you loved (optional)…" value={text} onChange={(e) => setText(e.target.value)} style={{ resize: "vertical", marginBottom: 18 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Cancel</button>
          <BusyBtn busy={busy} className="btn btn-primary btn-md btn-block" icon={<Icons.star size={16} />} onClick={() => run(() => rpc("rateBooking", { id: b.id, stars, text }), () => { onClose(); router.refresh(); })}>Submit review</BusyBtn>
        </div>
      </div>
    </Modal>
  );
}

function MoveModal({ b, onClose }: { b: B; onClose: () => void }) {
  const router = useRouter();
  const days = Array.from({ length: 7 }, (_, i) => 10 + i).filter((d) => d <= 30);
  const times = ["07:30", "09:00", "11:00", "13:00", "15:00", "17:00", "18:30", "20:00"];
  const [day, setDay] = useState(b.day);
  const [time, setTime] = useState(b.time);
  const { busy, run } = useBusy();
  return (
    <Modal onClose={onClose} maxWidth={440}>
      <div style={{ padding: 26 }}>
        <h3 style={{ fontSize: 20, marginBottom: 4 }}>Reschedule</h3>
        <div style={{ fontSize: 13.5, color: "var(--ink-3)", fontWeight: 600, marginBottom: 18 }}>{b.exp?.title ?? ""} — the provider will re-confirm.</div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>New day</div>
        <div className="no-scrollbar" style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 18 }}>
          {days.map((d) => (
            <button key={d} onClick={() => setDay(d)} style={{ flex: "none", width: 60, padding: "10px 0", borderRadius: "var(--r-sm)", cursor: "pointer", border: `1.5px solid ${day === d ? "var(--coral)" : "var(--line-2)"}`, background: day === d ? "var(--coral-soft)" : "var(--surface)" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: day === d ? "var(--coral-deep)" : "var(--ink-3)" }}>{WD[dow(d)]}</div>
              <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 18, color: day === d ? "var(--coral-deep)" : "var(--ink)" }}>{d}</div>
            </button>
          ))}
        </div>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>New time</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {times.map((tm) => <button key={tm} className={`chip ${time === tm ? "on" : ""}`} onClick={() => setTime(tm)}>{tm}</button>)}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Cancel</button>
          <BusyBtn busy={busy} className="btn btn-primary btn-md btn-block" icon={<Icons.check size={16} />} onClick={() => run(() => rpc("rescheduleBooking", { id: b.id, day, time }), () => { onClose(); router.refresh(); })}>Move booking</BusyBtn>
        </div>
      </div>
    </Modal>
  );
}

function CancelModal({ b, onClose }: { b: B; onClose: () => void }) {
  const router = useRouter();
  const { busy, run } = useBusy();
  return (
    <Modal onClose={onClose} maxWidth={400}>
      <div style={{ padding: 26, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: 99, background: "var(--coral-soft)", color: "var(--coral)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Icons.close size={26} /></div>
        <h3 style={{ fontSize: 20, marginBottom: 8 }}>Cancel this booking?</h3>
        <p style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: 6 }}><b>{b.exp?.title ?? ""}</b> · {b.date}, {b.time}</p>
        <p style={{ color: "var(--ink-3)", fontSize: 13, marginBottom: 20 }}>{b.pay === "wallet" ? `${fmt(b.total)} will be refunded to your Joymap balance.` : "Free cancellation up to 12h before the start."}</p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Keep it</button>
          <BusyBtn busy={busy} className="btn btn-md btn-block" style={{ background: "var(--coral)", color: "#fff" }} onClick={() => run(() => rpc("cancelBooking", { id: b.id }), () => { onClose(); router.refresh(); })}>Cancel booking</BusyBtn>
        </div>
      </div>
    </Modal>
  );
}
