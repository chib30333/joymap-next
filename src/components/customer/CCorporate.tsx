"use client";
// CCorporate — 1:1 port of corporate.jsx (Joymap for Teams). Demo content inlined,
// matching the prototype's pages-data.jsx exactly.
import { useState } from "react";
import { Icons, Logo } from "@/components/Icons";
import { MOODS, MOOD_ORDER, fmt, Avatar, Btn, MoodChip, MoodDot, SectionHead, Modal, type Exp } from "./primitives";
import { ServiceModal, type Slot } from "./ServiceModal";
import { useFav } from "./useFav";

const COMPANY = { name: "Acme Corp", letter: "A", plan: "Joymap for Teams", seats: 120, seatsUsed: 86, allowance: 5000, used: 2100, renews: "1 Jul 2026", since: "2025", hr: "People & Culture team" };
const CORP_PERKS = [
  { icon: "sparkle", accent: "#7B53F0", title: "Joy Map+ membership", desc: "Fully sponsored by Acme Corp", value: "Active", tag: "Sponsored" },
  { icon: "wallet", accent: "#1FA46E", title: "Monthly experience credit", desc: "Resets on the 1st of each month", value: "2 900 ₽ left", tag: null },
  { icon: "gift", accent: "#E89015", title: "Birthday experience", desc: "One free session in your birthday month", value: "Available", tag: null },
  { icon: "heart", accent: "#FF4D74", title: "Bring a +1", desc: "Half-price guest seat on wellness sessions", value: "Unlimited", tag: null },
] as const;
const TEAM_EVENTS = [
  { id: "te1", expId: "e12", day: 13, time: "18:00", title: "Summer Sail Social", team: "All hands", going: ["A", "M", "D", "S", "K", "R"], extra: 6, cap: 16, joined: false },
  { id: "te2", expId: "e10", day: 18, time: "19:00", title: "Pasta Night · Design", team: "Design team", going: ["L", "P", "J"], extra: 9, cap: 12, joined: true },
  { id: "te3", expId: "e2", day: 25, time: "15:00", title: "Karting Grand Prix", team: "Company-wide", going: ["A", "B", "C", "D", "E"], extra: 14, cap: 24, joined: false },
];
const GIFT_DENOMS = [1000, 2500, 5000, 10000];
const CORP_INVOICES = [
  { id: "INV-2026-06", date: "1 Jun 2026", label: "June · 120 seats", amount: 59880, status: "paid" },
  { id: "INV-2026-05", date: "1 May 2026", label: "May · 118 seats", amount: 58882, status: "paid" },
  { id: "INV-2026-07", date: "1 Jul 2026", label: "July · 120 seats (est.)", amount: 59880, status: "upcoming" },
];
const CAL_WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const calDow = (day: number) => (day - 1) % 7;

export function CCorporate({ catalog, favs, slotsByService, wallet }: { catalog: Exp[]; favs: string[]; slotsByService: Record<string, Slot[]>; wallet: number }) {
  const byId = (id: string) => catalog.find((e) => e.id === id) || null;
  const [modal, setModal] = useState<"quote" | "gift" | null>(null);
  const [open, setOpen] = useState<Exp | null>(null);
  const onFav = useFav();
  const remaining = COMPANY.allowance - COMPANY.used;
  const pct = Math.round((remaining / COMPANY.allowance) * 100);
  const openExp = (id: string) => { const e = byId(id) || catalog[0]; if (e) setOpen(e); };

  return (
    <div className="anim-fade corp">
      <div className="corp-hero">
        <div style={{ position: "relative", display: "flex", gap: 30, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280, maxWidth: 560 }}>
            <div className="corp-eyebrow" style={{ marginBottom: 16 }}>Corporate wellbeing</div>
            <div className="corp-lockup" style={{ marginBottom: 18 }}>
              <span className="corp-logo">{COMPANY.letter}</span><span className="corp-x">×</span><Logo size={30} mono />
            </div>
            <h1 style={{ fontSize: "clamp(28px,3.4vw,40px)", color: "#FFF3E4", lineHeight: 1.05, maxWidth: "14ch" }}>Your wellbeing, on the house.</h1>
            <p style={{ color: "rgba(244,233,216,.8)", fontSize: 15.5, lineHeight: 1.6, marginTop: 14, maxWidth: "52ch" }}>
              {COMPANY.name} sponsors your Joymap experiences. Spend your monthly credit on anything that brings you joy — no receipts, no approvals.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <button className="btn btn-lg" style={{ background: "var(--gold)", color: "#3a0a0d", fontWeight: 800 }} onClick={() => openExp("e1")}>Spend my credit<Icons.arrowR size={18} /></button>
              <button className="btn btn-lg" style={{ background: "rgba(255,255,255,.1)", color: "#F4E9D8", backdropFilter: "blur(4px)" }} onClick={() => setModal("quote")}>Plan a team event</button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div className="ring" style={{ ["--p" as any]: pct }}>
              <div className="hole">
                <div>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 24, color: "#FFF3E4", lineHeight: 1 }}>{fmt(remaining)}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(244,233,216,.7)", fontWeight: 700, letterSpacing: ".04em", marginTop: 3 }}>LEFT THIS MONTH</div>
                </div>
              </div>
            </div>
            <div style={{ textAlign: "center", fontSize: 12.5, color: "rgba(244,233,216,.7)", fontWeight: 600 }}>{fmt(COMPANY.used)} of {fmt(COMPANY.allowance)} used<br />Renews {COMPANY.renews}</div>
          </div>
        </div>
      </div>

      <div style={{ margin: "34px 0 14px" }}><SectionHead eyebrow="Included with your plan" title="Your perks" /></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(238px,1fr))", gap: "var(--gap)" }}>
        {CORP_PERKS.map((p) => {
          const I = Icons[p.icon];
          return (
            <div key={p.title} className="corp-card corp-perk">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ width: 46, height: 46, borderRadius: 13, display: "grid", placeItems: "center", background: `color-mix(in srgb,${p.accent} 15%,transparent)`, color: p.accent }}><I size={23} /></span>
                {p.tag && <span className="tag" style={{ background: "color-mix(in srgb,var(--gold) 16%,transparent)", color: "#B97714", border: "none" }}>{p.tag}</span>}
              </div>
              <h3 style={{ fontSize: 16.5, marginBottom: 5 }}>{p.title}</h3>
              <p style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, margin: "0 0 14px", lineHeight: 1.45 }}>{p.desc}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 800, fontFamily: "var(--display)", fontSize: 15, color: p.accent }}><span style={{ width: 7, height: 7, borderRadius: 99, background: p.accent }} />{p.value}</div>
            </div>
          );
        })}
      </div>

      <div style={{ margin: "40px 0 14px" }}>
        <SectionHead eyebrow="With your colleagues" title="Team-building events" action={<Btn variant="ghost" size="md" onClick={() => openExp("e9")} iconR={<Icons.arrowR size={17} />}>Browse team experiences</Btn>} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "var(--gap)" }}>
        {TEAM_EVENTS.map((ev) => <TeamEventCard key={ev.id} ev={ev} byId={byId} onOpen={setOpen} />)}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "var(--gap)", margin: "40px 0 0", alignItems: "stretch" }}>
        <div className="corp-gift" onClick={() => setModal("gift")}>
          <div style={{ position: "relative", display: "flex", flexDirection: "column", height: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <span className="corp-eyebrow" style={{ color: "var(--gold)" }}>Joymap gift card</span><Icons.gift size={26} style={{ color: "var(--gold)" }} />
            </div>
            <h3 style={{ fontSize: 24, color: "#FFF3E4", marginBottom: 8, maxWidth: "16ch" }}>Share the joy with a colleague.</h3>
            <p style={{ color: "rgba(244,233,216,.78)", fontSize: 14, lineHeight: 1.55, marginBottom: 20, maxWidth: "46ch" }}>Send an experience gift card by email — they pick what brings them joy.</p>
            <div style={{ display: "flex", gap: 8, marginTop: "auto", flexWrap: "wrap" }}>
              {GIFT_DENOMS.map((d) => <span key={d} style={{ padding: "7px 13px", borderRadius: 99, border: "1px solid color-mix(in srgb,var(--gold) 45%,transparent)", fontWeight: 800, fontSize: 13, fontFamily: "var(--display)" }}>{fmt(d)}</span>)}
            </div>
          </div>
        </div>
        <div className="corp-card" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 14, background: "var(--surface-2)" }}>
          <span style={{ width: 48, height: 48, borderRadius: 13, display: "grid", placeItems: "center", background: "var(--surface)", boxShadow: "var(--sh-sm)", color: "var(--coral-deep)" }}><Icons.sparkle size={24} /></span>
          <div>
            <h3 style={{ fontSize: 18, marginBottom: 6 }}>Something bigger in mind?</h3>
            <p style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5, margin: 0 }}>Off-sites, launches, away-days — our team curates a custom experience for any group size.</p>
          </div>
          <Btn size="md" onClick={() => setModal("quote")} icon={<Icons.briefcase size={17} />}>Request a quote</Btn>
        </div>
      </div>

      <div className="corp-feature" style={{ marginTop: "calc(var(--gap) + 16px)" }}>
        <div style={{ position: "relative", maxWidth: 560 }}>
          <div className="corp-eyebrow" style={{ marginBottom: 12 }}>Off-sites & away-days</div>
          <h2 style={{ fontSize: "clamp(24px,3vw,34px)", color: "#fff", lineHeight: 1.06, marginBottom: 12 }}>Bring the whole team together.</h2>
          <p style={{ color: "rgba(255,255,255,.85)", fontSize: 15, lineHeight: 1.6, marginBottom: 20, maxWidth: "48ch" }}>
            From strategy days to celebration nights, our events team curates a custom experience for any group size — fully handled, beautifully run.
          </p>
          <button className="btn btn-lg" style={{ background: "var(--gold)", color: "#3a0a0d", fontWeight: 800 }} onClick={() => setModal("quote")}><Icons.briefcase size={18} />Plan a team event</button>
        </div>
      </div>

      <div style={{ margin: "40px 0 14px" }}><SectionHead eyebrow="Managed by your company" title="Your company plan" /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: "var(--gap)", alignItems: "start" }}>
        <div className="corp-card">
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <span className="corp-logo" style={{ width: 42, height: 42, fontSize: 20, background: "linear-gradient(140deg,var(--red),var(--orange))", color: "#fff", borderRadius: 12 }}>{COMPANY.letter}</span>
            <div><div style={{ fontWeight: 800, fontFamily: "var(--display)", fontSize: 16 }}>{COMPANY.name}</div><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{COMPANY.plan} · since {COMPANY.since}</div></div>
          </div>
          <div style={{ marginBottom: 8, display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700 }}><span style={{ color: "var(--ink-2)" }}>Seats in use</span><span>{COMPANY.seatsUsed} / {COMPANY.seats}</span></div>
          <div style={{ height: 8, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden", marginBottom: 18 }}><div style={{ height: "100%", width: `${(COMPANY.seatsUsed / COMPANY.seats) * 100}%`, background: "linear-gradient(90deg,var(--coral),var(--orange))", borderRadius: 99 }} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 14px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", fontSize: 12.5, color: "var(--ink-2)", fontWeight: 600 }}>
            <Icons.building size={16} style={{ color: "var(--ink-3)" }} />Managed by {COMPANY.hr}. Need a seat changed? Contact your admin.
          </div>
        </div>
        <div className="corp-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px" }}>
            <h3 style={{ fontSize: 16 }}>Billing & invoices</h3>
            <span className="tag" style={{ background: "var(--surface-2)", color: "var(--ink-3)" }}>View only</span>
          </div>
          {CORP_INVOICES.map((inv) => (
            <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 22px", borderTop: "1px solid var(--line)" }}>
              <span style={{ width: 38, height: 38, borderRadius: 11, flex: "none", display: "grid", placeItems: "center", background: inv.status === "paid" ? "color-mix(in srgb,#1FA46E 13%,transparent)" : "color-mix(in srgb,var(--orange) 14%,transparent)", color: inv.status === "paid" ? "#1FA46E" : "var(--orange-deep)" }}><Icons.wallet size={18} /></span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{inv.id}</div>
                <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{inv.label} · {inv.date}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>{fmt(inv.amount)}</div>
                <span style={{ fontSize: 11.5, fontWeight: 800, color: inv.status === "paid" ? "#1FA46E" : "var(--orange-deep)", textTransform: "uppercase", letterSpacing: ".04em" }}>{inv.status}</span>
              </div>
              <button className="icon-btn" style={{ width: 34, height: 34 }}><Icons.download size={15} /></button>
            </div>
          ))}
        </div>
      </div>

      {modal === "quote" && <QuoteModal onClose={() => setModal(null)} />}
      {modal === "gift" && <GiftModal onClose={() => setModal(null)} />}
      {open && <ServiceModal exp={open} slots={slotsByService[open.id] || []} wallet={wallet} fav={favs.includes(open.id)} onFav={onFav} onClose={() => setOpen(null)} />}
    </div>
  );
}

function TeamEventCard({ ev, byId, onOpen }: { ev: typeof TEAM_EVENTS[number]; byId: (id: string) => Exp | null; onOpen: (e: Exp) => void }) {
  const e = byId(ev.expId);
  const [joined, setJoined] = useState(ev.joined);
  if (!e) return null;
  const m = MOODS[e.mood];
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div style={{ position: "relative", height: 120, background: e.gradient }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,transparent,rgba(0,0,0,.4))" }} />
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 7 }}>
          <span style={{ background: "rgba(255,255,255,.92)", color: "#241C2E", padding: "5px 11px", borderRadius: 99, fontSize: 11.5, fontWeight: 800 }}>{CAL_WD[calDow(ev.day)]} {ev.day} Jun · {ev.time}</span>
        </div>
        <span style={{ position: "absolute", bottom: 12, left: 14, color: "#fff", fontFamily: "var(--display)", fontWeight: 800, fontSize: 18, textShadow: "0 1px 10px rgba(0,0,0,.4)" }}>{ev.title}</span>
      </div>
      <div style={{ padding: "15px 17px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span className="tag" style={{ background: "var(--surface-2)", color: "var(--ink-2)" }}><Icons.briefcase size={12} style={{ marginRight: 4 }} />{ev.team}</span>
          <span className="mood-chip" style={{ background: m.soft, color: m.color, padding: "4px 10px 4px 8px", fontSize: 11 }}><MoodDot mood={e.mood} size={6} />{m.label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div className="av-stack">
            {ev.going.slice(0, 5).map((a, i) => <Avatar key={i} name={a} size={28} />)}
            <span style={{ marginLeft: -9, width: 28, height: 28, borderRadius: 99, background: "var(--surface-2)", border: "2px solid var(--surface)", display: "grid", placeItems: "center", fontSize: 11, fontWeight: 800, color: "var(--ink-2)" }}>+{ev.extra}</span>
          </div>
          <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 700 }}>{ev.going.length + ev.extra}/{ev.cap} going</span>
          <button className={`btn btn-sm ${joined ? "btn-soft" : "btn-primary"}`} style={{ marginLeft: "auto" }} onClick={() => setJoined((j) => !j)}>{joined ? <><Icons.check size={15} />Going</> : "Join"}</button>
        </div>
      </div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) { return <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 7 }}>{children}</div>; }

function QuoteModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [size, setSize] = useState(12);
  const [vibe, setVibe] = useState("joy");
  const [date, setDate] = useState("");
  const [budget, setBudget] = useState("mid");
  const [note, setNote] = useState("");
  return (
    <Modal onClose={onClose} maxWidth={500}>
      {step === 0 ? (
        <div style={{ padding: "26px 28px" }}>
          <div className="corp-eyebrow" style={{ marginBottom: 8, color: "var(--coral-deep)" }}>Custom team event</div>
          <h2 style={{ fontSize: 23, marginBottom: 6 }}>Tell us your vision</h2>
          <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "0 0 20px" }}>Our events team replies within one business day with a tailored plan.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div><Lbl>Team size — <b style={{ color: "var(--coral-deep)" }}>{size} people</b></Lbl><input type="range" min={4} max={80} value={size} onChange={(e) => setSize(+e.target.value)} style={{ width: "100%", accentColor: "var(--coral)" }} /></div>
            <div><Lbl>Vibe</Lbl><div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{MOOD_ORDER.map((k) => <MoodChip key={k} mood={k} active={vibe === k} onClick={() => setVibe(k)} />)}</div></div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><Lbl>Preferred date</Lbl><input className="field" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
              <div style={{ flex: 1 }}><Lbl>Budget / person</Lbl><div className="cal-sel" style={{ display: "block" }}><select className="field" value={budget} onChange={(e) => setBudget(e.target.value)} style={{ appearance: "none" }}><option value="low">Up to 2 000 ₽</option><option value="mid">2 000–5 000 ₽</option><option value="high">5 000 ₽+</option></select></div></div>
            </div>
            <div><Lbl>Anything else?</Lbl><textarea className="field" rows={3} placeholder="Dietary needs, accessibility, the occasion…" value={note} onChange={(e) => setNote(e.target.value)} style={{ resize: "vertical" }} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Cancel</button>
            <Btn size="md" block onClick={() => setStep(1)}>Send request<Icons.send size={16} /></Btn>
          </div>
        </div>
      ) : (
        <div style={{ padding: "34px 30px", textAlign: "center" }}>
          <div style={{ width: 66, height: 66, borderRadius: 99, background: "color-mix(in srgb,#1FA46E 14%,transparent)", color: "#1FA46E", display: "grid", placeItems: "center", margin: "0 auto 18px" }}><Icons.check size={34} /></div>
          <h2 style={{ fontSize: 23, marginBottom: 8 }}>Request sent ✦</h2>
          <p style={{ color: "var(--ink-2)", fontSize: 14.5, maxWidth: "36ch", margin: "0 auto 22px", lineHeight: 1.55 }}>Our events team will email you a tailored plan for <b>{size} people</b> within one business day.</p>
          <Btn size="md" onClick={onClose}>Done</Btn>
        </div>
      )}
    </Modal>
  );
}

function GiftModal({ onClose }: { onClose: () => void }) {
  const [amt, setAmt] = useState(2500);
  const [to, setTo] = useState("");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <Modal onClose={onClose} maxWidth={460}>
      {!sent ? (
        <div style={{ padding: "26px 28px" }}>
          <div className="corp-eyebrow" style={{ marginBottom: 8, color: "#B97714" }}>Joymap gift card</div>
          <h2 style={{ fontSize: 23, marginBottom: 18 }}>Send the joy</h2>
          <div className="corp-gift" style={{ marginBottom: 20, cursor: "default" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div><div style={{ fontSize: 11.5, letterSpacing: ".1em", opacity: 0.7, fontWeight: 700 }}>JOYMAP GIFT</div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 30, color: "#FFF3E4", marginTop: 4 }}>{fmt(amt)}</div></div>
              <Icons.gift size={34} style={{ color: "var(--gold)" }} />
            </div>
          </div>
          <Lbl>Amount</Lbl>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
            {GIFT_DENOMS.map((d) => <div key={d} className={`gift-denom ${amt === d ? "on" : ""}`} onClick={() => setAmt(d)}><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 15 }}>{fmt(d)}</div></div>)}
          </div>
          <Lbl>Colleague&apos;s email</Lbl>
          <input className="field" type="email" placeholder="name@acme.com" value={to} onChange={(e) => setTo(e.target.value)} style={{ marginBottom: 14 }} />
          <Lbl>Message (optional)</Lbl>
          <textarea className="field" rows={2} placeholder="Thanks for everything — enjoy! 🎉" value={msg} onChange={(e) => setMsg(e.target.value)} style={{ resize: "vertical", marginBottom: 20 }} />
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Cancel</button>
            <Btn size="md" block onClick={() => setSent(true)} style={!to ? { opacity: 0.5 } : undefined}><Icons.gift size={16} />Send {fmt(amt)}</Btn>
          </div>
        </div>
      ) : (
        <div style={{ padding: "34px 30px", textAlign: "center" }}>
          <div style={{ width: 66, height: 66, borderRadius: 99, background: "color-mix(in srgb,var(--gold) 18%,transparent)", color: "#B97714", display: "grid", placeItems: "center", margin: "0 auto 18px" }}><Icons.gift size={32} /></div>
          <h2 style={{ fontSize: 23, marginBottom: 8 }}>Gift on its way 🎁</h2>
          <p style={{ color: "var(--ink-2)", fontSize: 14.5, maxWidth: "34ch", margin: "0 auto 22px", lineHeight: 1.55 }}>A <b>{fmt(amt)}</b> Joymap gift card is heading to {to || "your colleague"}.</p>
          <Btn size="md" onClick={onClose}>Done</Btn>
        </div>
      )}
    </Modal>
  );
}
