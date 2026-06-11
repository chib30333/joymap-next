"use client";
// ServiceModal — 1:1 port of detail.jsx: service detail + 4-step booking flow + QR.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import { MOODS, fmt, bg, WD, dow, Modal, PhotoFrame, MoodDot, MoodChip, Rating, Btn, BusyBtn, QR, type Exp } from "./primitives";

const PAY_METHODS: [string, string, string | null][] = [["card", "Bank card", "•••• 4291"], ["sber", "Sber Pay", "Linked"], ["wallet", "Joymap balance", null]];
const dateLabel = (d: number) => `${WD[dow(d)]} ${d} Jun`;

export type Slot = { day: number; time: string };

export function ServiceModal({ exp, slots, wallet, fav, onFav, onClose }: {
  exp: Exp; slots: Slot[]; wallet: number; fav: boolean; onFav: (id: string) => void; onClose: () => void;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const m = MOODS[exp.mood];

  const slotDays = [...new Set(slots.map((s) => s.day))].sort((a, b) => a - b).slice(0, 7);
  const days = slotDays.length ? slotDays : Array.from({ length: 7 }, (_, i) => 10 + i).filter((d) => d <= 30);
  const timesFor = (d: number) => {
    const ts = slots.filter((s) => s.day === d).map((s) => s.time);
    return ts.length ? ts : ["07:30", "11:00", "15:00", "18:30", "20:00"];
  };

  const [day, setDay] = useState(days[0]);
  const [time, setTime] = useState(timesFor(days[0])[0]);
  const [spots, setSpots] = useState(1);
  const [pay, setPay] = useState("card");
  const [booking, setBooking] = useState<{ code: string } | null>(null);
  const { busy, run, error, setError } = useBusy();
  const total = exp.price * spots;

  const confirm = () => run(() => rpc<{ code: string }>("createBooking", { serviceId: exp.id, day, time, people: spots, pay }),
    (b) => { setBooking(b); setStep(3); router.refresh(); });

  const Header = ({ sub }: { sub?: string }) => (
    <div style={{ position: "relative" }}>
      <PhotoFrame exp={exp} ratio="16/8">
        <button className="icon-btn" style={{ position: "absolute", top: 14, right: 14, background: "rgba(255,255,255,.92)", border: "none", color: "#241C2E" }} onClick={onClose}><Icons.close size={18} /></button>
        <button className={`fav ${fav ? "on" : ""}`} style={{ position: "absolute", top: 14, right: 64, width: 42, height: 42, background: "rgba(255,255,255,.9)", color: fav ? "var(--m-energy)" : "#241C2E" }} onClick={() => onFav(exp.id)}><Icons.heart size={19} fill={fav} /></button>
        <div style={{ position: "absolute", left: 18, bottom: 16, right: 18 }}>
          <span className="mood-chip" style={{ background: "rgba(255,255,255,.92)", color: m.color, marginBottom: 10 }}><MoodDot mood={exp.mood} size={7} />{m.label}</span>
          <h2 style={{ color: "#fff", fontSize: 28, textShadow: "0 2px 16px rgba(0,0,0,.4)" }}>{exp.title}</h2>
          {sub && <div style={{ color: "rgba(255,255,255,.9)", fontWeight: 600, marginTop: 4 }}>{sub}</div>}
        </div>
      </PhotoFrame>
    </div>
  );

  return (
    <Modal onClose={onClose} maxWidth={step === 3 ? 460 : 560}>
      {step === 0 && (
        <div>
          <Header />
          <div style={{ padding: "22px 24px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 18 }}>
              {exp.rating ? <Rating value={exp.rating} reviews={exp.reviews} />
                : <span className="tag" style={{ background: "var(--coral-soft)", color: "var(--coral-deep)", border: "none", fontWeight: 700 }}>New on Joymap</span>}
              <span style={{ color: "var(--line-2)" }}>•</span>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center", color: "var(--ink-2)", fontWeight: 600, fontSize: 14 }}><Icons.pin size={16} />{exp.area}, {exp.city}</span>
              <span style={{ color: "var(--line-2)" }}>•</span>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center", color: "var(--ink-2)", fontWeight: 600, fontSize: 14 }}><Icons.clock size={16} />{exp.dur}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", marginBottom: 18 }}>
              <div className="avatar" style={{ background: "var(--bg-2)", color: "var(--ink-2)" }}>{exp.provider[0]}</div>
              <div><div style={{ fontWeight: 700, fontSize: 14.5 }}>{exp.provider}</div><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>Verified provider · responds in ~1h</div></div>
              <span className="tag" style={{ marginLeft: "auto", background: "var(--m-calm-soft)", color: "var(--m-calm)", border: "none" }}><Icons.check size={13} style={{ marginRight: 4 }} />Verified</span>
            </div>
            <p style={{ color: "var(--ink-2)", fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>{exp.about}</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
              {exp.tags.map((tg) => <span key={tg} className="tag">{tg}</span>)}
              <span className="tag" style={{ background: "var(--coral-soft)", color: "var(--coral-deep)", border: "none" }}><Icons.flame size={13} style={{ marginRight: 4 }} />{exp.spots} spots / session</span>
            </div>
          </div>
          <Footer>
            <div><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>From</div><div className="price" style={{ fontSize: 22 }}>{fmt(exp.price)}</div></div>
            <Btn size="lg" iconR={<Icons.arrowR size={19} />} onClick={() => setStep(1)}>Book a spot</Btn>
          </Footer>
        </div>
      )}

      {step === 1 && (
        <div>
          <Header sub="Choose your day & time" />
          <div style={{ padding: "22px 24px 0" }}>
            <Label n="1" t="Pick a day" />
            <div className="no-scrollbar" style={{ display: "flex", gap: 9, overflowX: "auto", marginBottom: 22 }}>
              {days.map((d) => (
                <button key={d} onClick={() => { setDay(d); setTime(timesFor(d)[0]); }}
                  style={{ flex: "none", width: 64, padding: "12px 0", borderRadius: "var(--r-sm)", border: `1.5px solid ${day === d ? "var(--coral)" : "var(--line-2)"}`, background: day === d ? "var(--coral-soft)" : "var(--surface)", cursor: "pointer", transition: ".15s" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: day === d ? "var(--coral-deep)" : "var(--ink-3)" }}>{WD[dow(d)]}</div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20, color: day === d ? "var(--coral-deep)" : "var(--ink)" }}>{d}</div>
                </button>
              ))}
            </div>
            <Label n="2" t="Pick a time" />
            <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 22 }}>
              {timesFor(day).map((tm) => <button key={tm} className={`chip ${time === tm ? "on" : ""}`} style={{ padding: "10px 16px" }} onClick={() => setTime(tm)}>{tm}</button>)}
            </div>
            {slotDays.length > 0 && (
              <div style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600, marginBottom: 18 }}>
                <Icons.sparkle size={14} style={{ color: "var(--coral)" }} />Times come straight from the provider&apos;s live schedule.
              </div>
            )}
            <Label n="3" t="How many spots?" />
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 8 }}>
              <button className="icon-btn" onClick={() => setSpots((s) => Math.max(1, s - 1))}><Icons.minus size={18} /></button>
              <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 26, minWidth: 30, textAlign: "center" }}>{spots}</span>
              <button className="icon-btn" onClick={() => setSpots((s) => Math.min(exp.spots, s + 1))}><Icons.plus size={18} /></button>
              <span style={{ color: "var(--ink-3)", fontSize: 13.5, fontWeight: 600 }}>{exp.spots} available</span>
            </div>
          </div>
          <Footer>
            <button className="btn btn-ghost btn-md" onClick={() => setStep(0)}><Icons.arrowL size={18} />Back</button>
            <Btn size="lg" onClick={() => setStep(2)} iconR={<Icons.arrowR size={19} />}>Continue · {fmt(total)}</Btn>
          </Footer>
        </div>
      )}

      {step === 2 && (
        <div>
          <div style={{ padding: "22px 24px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <button className="icon-btn" onClick={() => setStep(1)}><Icons.arrowL size={18} /></button>
              <h2 style={{ fontSize: 22 }}>Confirm &amp; pay</h2>
            </div>
            <div className="card" style={{ padding: 16, display: "flex", gap: 14, marginBottom: 20, background: "var(--surface-2)" }}>
              <div style={{ width: 64, height: 64, borderRadius: "var(--r-sm)", background: bg(exp), flex: "none" }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{exp.title}</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginTop: 4 }}>{dateLabel(day)} · {time} · {spots} spot{spots > 1 ? "s" : ""}</div>
                <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{exp.area}, {exp.city}</div>
              </div>
            </div>
            <Label n="" t="Payment method" />
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 20 }}>
              {PAY_METHODS.map(([k, l, s]) => (
                <button key={k} onClick={() => { setPay(k); setError(null); }}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 16px", borderRadius: "var(--r-sm)", cursor: "pointer", transition: ".15s", border: `1.5px solid ${pay === k ? "var(--coral)" : "var(--line-2)"}`, background: pay === k ? "var(--coral-soft)" : "var(--surface)" }}>
                  <span style={{ width: 20, height: 20, borderRadius: 99, border: `2px solid ${pay === k ? "var(--coral)" : "var(--line-2)"}`, display: "grid", placeItems: "center" }}>
                    {pay === k && <span style={{ width: 10, height: 10, borderRadius: 99, background: "var(--coral)" }} />}</span>
                  <div style={{ textAlign: "left" }}><div style={{ fontWeight: 700, fontSize: 14 }}>{l}</div>
                    <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{k === "wallet" ? fmt(wallet) : s}</div></div>
                </button>
              ))}
            </div>
            <div style={{ borderTop: "1px solid var(--line)", paddingTop: 14, marginBottom: 4 }}>
              <Row l={`${fmt(exp.price)} × ${spots}`} r={fmt(total)} />
              <Row l="Service fee" r="Included" muted />
              <Row l="Free cancellation" r="up to 12h before" muted />
            </div>
            {(error || (pay === "wallet" && wallet < total)) && (
              <div style={{ display: "flex", gap: 9, alignItems: "center", padding: "11px 14px", borderRadius: "var(--r-sm)", background: "var(--coral-soft)", color: "var(--coral-deep)", fontWeight: 700, fontSize: 13.5, marginTop: 10 }}>
                <Icons.flame size={16} />{error || "Not enough Joymap balance — top up in Wallet or pick another method."}
              </div>
            )}
          </div>
          <Footer>
            <div><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>Total</div><div className="price" style={{ fontSize: 22 }}>{fmt(total)}</div></div>
            <BusyBtn busy={busy} className="btn btn-primary btn-lg" icon={<Icons.check size={19} />} disabled={pay === "wallet" && wallet < total} onClick={confirm}>Pay {fmt(total)}</BusyBtn>
          </Footer>
        </div>
      )}

      {step === 3 && (
        <div style={{ padding: "30px 28px", textAlign: "center" }}>
          <div className="anim-pop" style={{ width: 72, height: 72, borderRadius: 99, background: "var(--m-calm)", display: "grid", placeItems: "center", margin: "0 auto 18px", color: "#fff", boxShadow: "0 12px 30px rgba(63,168,155,.4)" }}><Icons.check size={38} /></div>
          <h2 style={{ fontSize: 26, marginBottom: 8 }}>Request sent!</h2>
          <p style={{ color: "var(--ink-2)", fontSize: 15, marginBottom: 22, maxWidth: 340, marginInline: "auto" }}>
            <b>{exp.title}</b> · {dateLabel(day)} at {time}. {exp.provider} will confirm shortly — watch your notifications.
          </p>
          <div className="card" style={{ padding: 22, maxWidth: 300, margin: "0 auto 22px", background: "var(--surface-2)" }}>
            <QR />
            <div style={{ marginTop: 14, fontFamily: "var(--display)", fontWeight: 800, letterSpacing: ".12em", fontSize: 18 }}>{booking?.code ?? ""}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 3 }}>Show this at the door</div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}><Btn size="md" onClick={onClose}>Done</Btn></div>
        </div>
      )}
    </Modal>
  );
}

function Label({ n, t }: { n: string; t: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 12 }}>
      {n && <span style={{ width: 22, height: 22, flex: "none", borderRadius: 99, background: "var(--ink)", color: "var(--bg)", fontSize: 12, fontWeight: 800, display: "grid", placeItems: "center" }}>{n}</span>}
      <span style={{ fontWeight: 700, fontSize: 15, whiteSpace: "nowrap" }}>{t}</span>
    </div>
  );
}
function Row({ l, r, muted }: { l: string; r: string; muted?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14 }}>
      <span style={{ color: muted ? "var(--ink-3)" : "var(--ink-2)", fontWeight: 600 }}>{l}</span>
      <span style={{ fontWeight: muted ? 600 : 700, color: muted ? "var(--ink-3)" : "var(--ink)" }}>{r}</span>
    </div>
  );
}
function Footer({ children }: { children: React.ReactNode }) {
  return <div style={{ position: "sticky", bottom: 0, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, padding: "18px 24px", borderTop: "1px solid var(--line)", background: "var(--bg)", marginTop: 22 }}>{children}</div>;
}
