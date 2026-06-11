"use client";
// Provider screens — 1:1 port of provider-app.jsx (Overview, Bookings, Services,
// Analytics, Payouts, Reviews) + their tables/modals. Data fetched server-side.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import { money, Stat, Bars, LineChart, Pill, Seg, Toggle, Modal, Btn, Avatar, BusyBtn, SectionHead } from "@/components/dash/primitives";
import { MOODS, MOOD_ORDER, CATS } from "@/components/customer/primitives";

const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dow = (d: number) => (d - 1) % 7;
const dateLabel = (d: number) => `${WD[dow(Math.min(d, 30))]} ${d} Jun`;
const TODAY = 10;

type Booking = any; type Svc = any;

/* ===== Overview ===== */
export function POverview({ bookings, fin, todaySlots, svcs, rating }: { bookings: Booking[]; fin: any; todaySlots: any[]; svcs: Svc[]; rating: any }) {
  const router = useRouter();
  const week = Array.from({ length: 7 }, (_, i) => { const d = TODAY + i; const v = bookings.filter((b) => b.day === d && b.status !== "cancelled").reduce((a, b) => a + b.total, 0); return { label: WD[dow(Math.min(d, 30))], value: v }; });
  const max = Math.max(...week.map((w) => w.value));
  const cap = todaySlots.reduce((a, s) => { const sv = svcs.find((x) => x.id === s.serviceId); return a + ((sv && sv.cap) || 0); }, 0);
  const fill = cap ? Math.round(todaySlots.reduce((a, s) => a + (s.booked || 0), 0) / cap * 100) : 0;
  const kpis = [
    { label: "Revenue · June", value: money(fin.gross), icon: "wallet" as const, accent: "#1FA46E" },
    { label: "Bookings", value: String(bookings.filter((b) => b.status !== "cancelled").length), icon: "calendar" as const, accent: "#5563D6" },
    { label: "Fill rate · today", value: fill + "%", icon: "flame" as const, accent: "#E89015" },
    { label: "Avg rating", value: rating.rating ? String(rating.rating) : "—", icon: "star" as const, accent: "#FF8A4C" },
  ];
  return (
    <div className="anim-fade">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
        {kpis.map((k, i) => { const I = Icons[k.icon]; return <Stat key={i} label={k.label} value={k.value} icon={<I size={16} />} accent={k.accent} sub="live from bookings" />; })}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="shead" style={{ marginBottom: 8 }}><div><h3 style={{ fontSize: 17 }}>Revenue this week</h3><div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{max > 0 ? "Confirmed + pending bookings by day" : "No bookings this week yet"}</div></div></div>
          {max > 0 ? <Bars data={week.map((w) => ({ ...w, hot: w.value === max }))} unit="₽" /> : <div style={{ height: 160, display: "grid", placeItems: "center", color: "var(--ink-3)", fontWeight: 600, fontSize: 13.5 }}>Revenue appears here as bookings come in.</div>}
        </div>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 17, marginBottom: 4 }}>Today&apos;s schedule</h3>
          <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginBottom: 16 }}>{dateLabel(TODAY)} · {todaySlots.length} session{todaySlots.length !== 1 ? "s" : ""}</div>
          {todaySlots.length === 0
            ? <div style={{ padding: "30px 0", textAlign: "center", color: "var(--ink-3)", fontWeight: 600, fontSize: 13.5 }}>Nothing scheduled today.<br />Drag services onto days in <a style={{ color: "var(--coral-deep)", cursor: "pointer" }} onClick={() => router.push("/provider/calendar")}>Calendar</a>.</div>
            : <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {todaySlots.slice().sort((a, b) => a.time.localeCompare(b.time)).map((s, i) => { const sv = svcs.find((x) => x.id === s.serviceId) || { name: "Service", mood: "calm", cap: 0 }; return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 14, width: 46, color: "var(--ink-2)" }}>{s.time}</div>
                  <div style={{ width: 3, alignSelf: "stretch", borderRadius: 9, background: MOODS[sv.mood].color }} />
                  <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sv.name}</div><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{s.booked || 0}/{sv.cap} booked</div></div>
                </div>
              ); })}
            </div>}
        </div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px" }}>
          <h3 style={{ fontSize: 17 }}>Recent bookings</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push("/provider/bookings")}>View all <Icons.arrowR size={15} /></button>
        </div>
        {bookings.length === 0
          ? <div style={{ padding: "26px 20px", color: "var(--ink-3)", fontWeight: 600, fontSize: 13.5, borderTop: "1px solid var(--line)" }}>No bookings yet — once your services are approved and customers book, they land here.</div>
          : <div style={{ overflowX: "auto" }}><BookingsTable rows={bookings.slice(0, 4)} compact /></div>}
      </div>
    </div>
  );
}

/* ===== Bookings ===== */
export function BookingsTable({ rows, compact, onAct, onRow, actingId }: { rows: Booking[]; compact?: boolean; onAct?: (id: string, st: string) => void; onRow?: (b: Booking) => void; actingId?: string | null }) {
  return (
    <table className="tbl"><thead><tr><th>Customer</th><th>Service</th>{!compact && <th>Date</th>}<th>Time</th><th>People</th><th>Total</th><th>Status</th>{onAct && <th />}</tr></thead><tbody>
      {rows.map((b) => (
        <tr key={b.id} className="row" onClick={onRow ? () => onRow(b) : undefined}>
          <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={b.customer} size={30} /><b style={{ fontWeight: 700 }}>{b.customer}</b></div></td>
          <td style={{ color: "var(--ink-2)" }}>{b.service}</td>
          {!compact && <td style={{ color: "var(--ink-2)" }}>{b.date}</td>}
          <td style={{ fontWeight: 700 }}>{b.time}</td>
          <td>{b.people}</td>
          <td style={{ fontFamily: "var(--display)", fontWeight: 700 }}>{money(b.total)}</td>
          <td><Pill status={b.status} /></td>
          {onAct && <td><div style={{ display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
            {actingId === b.id ? <span className="jm-spin" style={{ color: "var(--ink-3)" }} /> : <>
              {b.status === "pending" && <><button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); onAct(b.id, "confirmed"); }}>Confirm</button><button className="icon-btn" style={{ width: 34, height: 34 }} title="Decline" onClick={(e) => { e.stopPropagation(); onAct(b.id, "cancelled"); }}><Icons.close size={16} /></button></>}
              {b.status === "confirmed" && <><button className="btn btn-soft btn-sm" onClick={(e) => { e.stopPropagation(); onAct(b.id, "completed"); }}>Complete</button><button className="btn btn-ghost btn-sm" onClick={(e) => { e.stopPropagation(); onAct(b.id, "cancelled"); }}>Cancel</button></>}
            </>}
          </div></td>}
        </tr>
      ))}
    </tbody></table>
  );
}

export function PBookings({ rows }: { rows: Booking[] }) {
  const router = useRouter();
  const [f, setF] = useState("all");
  const [sel, setSel] = useState<Booking | null>(null);
  const [actingId, setActing] = useState<string | null>(null);
  const act = (id: string, st: string) => { setActing(id); rpc("setBookingStatus", { id, status: st }).then(() => { setActing(null); router.refresh(); }); };
  const list = f === "all" ? rows : rows.filter((b) => b.status === f);
  return (
    <div className="anim-fade">
      <div className="shead"><div /><Seg value={f} options={[{ v: "all", l: "All" }, { v: "pending", l: "Pending" }, { v: "confirmed", l: "Confirmed" }, { v: "completed", l: "Completed" }, { v: "cancelled", l: "Cancelled" }]} onChange={setF} /></div>
      {list.length === 0
        ? <div className="card" style={{ padding: "56px 20px", textAlign: "center", color: "var(--ink-3)", fontWeight: 600 }}>No {f === "all" ? "" : f + " "}bookings yet.</div>
        : <div className="card" style={{ overflow: "hidden" }}><div style={{ overflowX: "auto" }}><BookingsTable rows={list} onAct={act} onRow={setSel} actingId={actingId} /></div></div>}
      {sel && <BookingDetailModal booking={sel} onClose={() => setSel(null)} onAct={act} />}
    </div>
  );
}

function BookingDetailModal({ booking, onClose, onAct }: { booking: Booking; onClose: () => void; onAct: (id: string, st: string) => void }) {
  const b = booking;
  return (
    <Modal onClose={onClose} maxWidth={460}>
      <div style={{ padding: "24px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <Avatar name={b.customer} size={46} />
          <div style={{ flex: 1 }}><h3 style={{ fontSize: 19 }}>{b.customer}</h3><div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{b.service}</div></div>
          <Pill status={b.status} />
        </div>
        <div className="card" style={{ padding: 16, background: "var(--surface-2)", marginBottom: 18 }}>
          <Row l="Date" r={b.date} /><Row l="Time" r={b.time} /><Row l="People" r={String(b.people)} /><Row l="Total" r={money(b.total)} /><Row l="Code" r={b.code} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Close</button>
          {b.status === "pending" ? <Btn size="md" block onClick={() => { onAct(b.id, "confirmed"); onClose(); }}><Icons.check size={16} />Confirm booking</Btn>
            : b.status === "confirmed" ? <Btn size="md" block onClick={() => { onAct(b.id, "completed"); onClose(); }}><Icons.sparkle size={16} />Mark completed</Btn>
            : <Btn size="md" block onClick={onClose}>Done</Btn>}
        </div>
      </div>
    </Modal>
  );
}
function Row({ l, r }: { l: string; r: string }) {
  return <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14 }}><span style={{ color: "var(--ink-2)", fontWeight: 600 }}>{l}</span><span style={{ fontWeight: 700 }}>{r}</span></div>;
}

/* ===== Services ===== */
export function PServices({ svcs }: { svcs: Svc[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"new" | Svc | null>(null);
  const toggle = (id: string) => rpc("toggleService", { id }).then(() => router.refresh());
  return (
    <div className="anim-fade">
      <div className="shead"><div /><Btn size="md" icon={<Icons.plus size={17} />} onClick={() => setModal("new")}>New service</Btn></div>
      {svcs.length === 0
        ? <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 99, background: "var(--coral-soft)", color: "var(--coral-deep)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Icons.compass size={26} /></div>
          <h3 style={{ fontSize: 20 }}>List your first experience</h3>
          <p style={{ color: "var(--ink-2)", fontSize: 14.5, margin: "8px auto 18px", maxWidth: 420, lineHeight: 1.55 }}>Create a service, send it for review, and once the platform team approves it customers can book it.</p>
          <Btn size="md" icon={<Icons.plus size={16} />} onClick={() => setModal("new")}>Create a service</Btn>
        </div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "var(--gap)" }}>
          {svcs.map((s) => { const m = MOODS[s.mood]; return (
            <div key={s.id} className="card anim-pop" style={{ padding: 0, overflow: "hidden", opacity: s.active !== false ? 1 : 0.62 }}>
              <div style={{ position: "relative", height: 128, background: s.img ? `center/cover no-repeat url('${s.img}')` : `linear-gradient(135deg,${m.color},color-mix(in srgb,${m.color} 68%,#000))` }}>
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.5))" }} />
                <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <span style={{ background: "rgba(255,255,255,.92)", color: m.color, padding: "4px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 5 }}><span style={{ width: 7, height: 7, borderRadius: 99, background: m.color }} />{m.label}</span>
                    {s.status === "review" && <span style={{ background: "rgba(232,144,21,.92)", color: "#fff", padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800 }}>IN REVIEW</span>}
                    {s.status === "rejected" && <span style={{ background: "rgba(224,33,47,.92)", color: "#fff", padding: "4px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800 }}>REJECTED</span>}
                  </div>
                  <Toggle on={s.active !== false} onChange={() => toggle(s.id)} />
                </div>
                <h3 style={{ position: "absolute", left: 14, bottom: 11, right: 14, color: "#fff", fontSize: 18, textShadow: "0 1px 10px rgba(0,0,0,.4)" }}>{s.name}</h3>
              </div>
              <div style={{ padding: "14px 18px 18px" }}>
                <div style={{ display: "flex", gap: 14, color: "var(--ink-3)", fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
                  <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icons.clock size={14} />{s.dur}</span>
                  <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icons.user size={14} />{s.cap} cap</span>
                  <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icons.star size={14} />{s.rating || "—"}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--line)" }}>
                  <div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 20 }}>{money(s.price)}</div><div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{s.booked} booked all-time</div></div>
                  <button className="btn btn-ghost btn-sm" onClick={() => setModal(s)}><Icons.settings size={15} />Edit</button>
                </div>
              </div>
            </div>
          ); })}
        </div>}
      {modal && <ServiceFormModal svc={modal === "new" ? null : modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function ServiceFormModal({ svc, onClose }: { svc: Svc | null; onClose: () => void }) {
  const router = useRouter();
  const isNew = !svc;
  const [f, setF] = useState<any>(svc ? { ...svc } : { name: "", cat: "Wellness", mood: "calm", price: 1500, dur: "60 min", cap: 8, about: "", area: "" });
  const { busy, run, error } = useBusy();
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));
  const ok = f.name.length > 2 && f.price > 0 && f.cap > 0;
  const save = () => run(() => isNew
    ? rpc("createService", { name: f.name, cat: f.cat, mood: f.mood, price: +f.price, dur: f.dur, cap: +f.cap, about: f.about, area: f.area || "Center", tags: ["New"] })
    : rpc("updateService", { id: svc.id, patch: { name: f.name, cat: f.cat, mood: f.mood, price: +f.price, dur: f.dur, cap: +f.cap, about: f.about } }), () => { onClose(); router.refresh(); });
  return (
    <Modal onClose={onClose} maxWidth={500}>
      <div style={{ padding: "24px 26px" }}>
        <h3 style={{ fontSize: 20, marginBottom: 4 }}>{isNew ? "New service" : "Edit service"}</h3>
        <p style={{ color: "var(--ink-2)", fontSize: 13.5, margin: "0 0 18px" }}>{isNew ? "New services go to platform review before customers can see them." : "Changes apply immediately."}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><L>Name</L><input className="field" placeholder="Sunrise Rooftop Yoga" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><L>Category</L><select className="field" value={f.cat} onChange={(e) => set("cat", e.target.value)}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
            <div style={{ flex: 1 }}><L>Mood</L><select className="field" value={f.mood} onChange={(e) => set("mood", e.target.value)}>{MOOD_ORDER.map((k) => <option key={k} value={k}>{MOODS[k].label}</option>)}</select></div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><L>Price (₽)</L><input className="field" type="number" value={f.price} onChange={(e) => set("price", e.target.value)} /></div>
            <div style={{ flex: 1 }}><L>Duration</L><select className="field" value={f.dur} onChange={(e) => set("dur", e.target.value)}>{["45 min", "60 min", "75 min", "90 min", "120 min", "150 min", "180 min"].map((d) => <option key={d}>{d}</option>)}</select></div>
            <div style={{ width: 90 }}><L>Capacity</L><input className="field" type="number" value={f.cap} onChange={(e) => set("cap", e.target.value)} /></div>
          </div>
          <div><L>About</L><textarea className="field" rows={3} value={f.about} onChange={(e) => set("about", e.target.value)} placeholder="What makes this experience special?" style={{ resize: "vertical" }} /></div>
        </div>
        {error && <div style={{ marginTop: 12, color: "var(--coral-deep)", fontWeight: 700, fontSize: 13.5 }}>{error}</div>}
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Cancel</button>
          <BusyBtn busy={busy} className="btn btn-primary btn-md btn-block" disabled={!ok} icon={<Icons.check size={16} />} onClick={save}>{isNew ? "Submit for review" : "Save changes"}</BusyBtn>
        </div>
      </div>
    </Modal>
  );
}
function L({ children }: { children: React.ReactNode }) { return <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 7 }}>{children}</div>; }

/* ===== Analytics ===== */
export function PAnalytics({ bookings, svcs }: { bookings: Booking[]; svcs: Svc[] }) {
  const ok = bookings.filter((b) => b.status !== "cancelled");
  if (ok.length === 0) return <div className="card anim-fade" style={{ padding: "60px 24px", textAlign: "center", color: "var(--ink-3)" }}><Icons.flame size={36} /><h3 style={{ color: "var(--ink)", marginTop: 12, fontSize: 19 }}>No data yet</h3><p style={{ maxWidth: 380, margin: "8px auto 0", fontWeight: 600, fontSize: 14 }}>Analytics light up as bookings come in — revenue trends, peak hours and top services.</p></div>;
  const byDay: Record<number, number> = {}; ok.forEach((b) => { byDay[b.day] = (byDay[b.day] || 0) + b.total; });
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);
  const trend = days.map((day) => ({ label: day + " Jun", value: byDay[day] }));
  const byHour: Record<string, number> = {}; ok.forEach((b) => { byHour[b.time] = (byHour[b.time] || 0) + 1; });
  const peak = Object.keys(byHour).sort().map((tm) => ({ label: tm, value: byHour[tm] }));
  const maxPeak = Math.max(...peak.map((p) => p.value));
  const top = [...svcs].sort((a, b) => b.booked - a.booked).filter((s) => s.booked > 0);
  const maxB = Math.max(...top.map((tp) => tp.booked), 1);
  return (
    <div className="anim-fade">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
        <div className="card" style={{ padding: 22 }}><h3 style={{ fontSize: 17, marginBottom: 4 }}>Revenue by day</h3><div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginBottom: 8 }}>June 2026 · live</div>{trend.length > 1 ? <LineChart points={trend} /> : <Bars data={trend} unit="₽" />}</div>
        <div className="card" style={{ padding: 22 }}><h3 style={{ fontSize: 17, marginBottom: 4 }}>Bookings by start time</h3><div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, marginBottom: 8 }}>Across all services</div><Bars data={peak.map((p) => ({ ...p, hot: p.value === maxPeak }))} accent="var(--orange)" /></div>
      </div>
      <div className="card" style={{ padding: 22, maxWidth: 640 }}><h3 style={{ fontSize: 17, marginBottom: 16 }}>Top services</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {top.map((s) => <div key={s.id}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</span><span style={{ fontWeight: 700, fontSize: 13, color: "var(--ink-3)" }}>{s.booked}</span></div><div style={{ height: 8, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: `${s.booked / maxB * 100}%`, borderRadius: 99, background: MOODS[s.mood].color }} /></div></div>)}
        </div>
      </div>
    </div>
  );
}

/* ===== Payouts ===== */
export function PPayouts({ fin, list }: { fin: any; list: any[] }) {
  const router = useRouter();
  const { busy, run, error } = useBusy();
  return (
    <div className="anim-fade" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: "var(--gap)", alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
        <div className="card-fill" style={{ padding: 26, position: "relative", overflow: "hidden" }}>
          <div style={{ fontSize: 13.5, opacity: 0.82, fontWeight: 600, marginBottom: 8 }}>Available balance</div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 38, letterSpacing: "-.02em" }}>{money(fin.available)}</div>
          <div style={{ fontSize: 13, opacity: 0.82, fontWeight: 600, marginTop: 6 }}>Net of {fin.commission}% platform commission</div>
          <BusyBtn busy={busy} className="btn btn-orange btn-md" icon={<Icons.wallet size={16} />} disabled={fin.available <= 0} onClick={() => run(() => rpc("requestPayout"), () => router.refresh())} style={{ marginTop: 18 }}>Withdraw {fin.available > 0 ? money(fin.available) : ""}</BusyBtn>
          {error && <div style={{ marginTop: 10, fontSize: 13, fontWeight: 700, color: "#FFC58A" }}>{error}</div>}
          <div style={{ position: "absolute", right: -30, bottom: -40, width: 150, height: 150, borderRadius: 99, background: "rgba(255,255,255,.05)" }} />
        </div>
        <div className="card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 16, marginBottom: 14 }}>Earnings breakdown</h3>
          <PRow l="Gross bookings" r={money(fin.gross)} />
          <PRow l={`Platform commission (${fin.commission}%)`} r={"− " + money(fin.gross - fin.net)} neg />
          <PRow l="Already withdrawn / pending" r={"− " + money(fin.withdrawn)} neg />
          <div style={{ borderTop: "1px solid var(--line)", marginTop: 8, paddingTop: 12 }}><PRow l={<b>Available</b>} r={<b style={{ fontFamily: "var(--display)", fontSize: 17 }}>{money(fin.available)}</b>} /></div>
        </div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <h3 style={{ fontSize: 17, padding: "18px 20px 4px" }}>Payout history</h3>
        {list.length === 0
          ? <div style={{ padding: "34px 20px", color: "var(--ink-3)", fontWeight: 600, fontSize: 13.5 }}>No payouts yet. Withdraw your balance and the request lands in the admin payout queue.</div>
          : <table className="tbl"><thead><tr><th>Requested</th><th>Amount</th><th>Due</th><th>Status</th></tr></thead><tbody>
            {list.map((p) => <tr key={p.id} className="row"><td style={{ fontWeight: 700 }}>{p.date}</td><td style={{ fontFamily: "var(--display)", fontWeight: 700 }}>{money(p.amount)}</td><td style={{ color: "var(--ink-2)" }}>{p.due}</td><td><Pill status={p.status} /></td></tr>)}
          </tbody></table>}
      </div>
    </div>
  );
}
function PRow({ l, r, neg }: { l: React.ReactNode; r: React.ReactNode; neg?: boolean }) {
  return <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", fontSize: 14 }}><span style={{ color: "var(--ink-2)", fontWeight: 600 }}>{l}</span><span style={{ fontWeight: 700, color: neg ? "var(--coral)" : "var(--ink)" }}>{r}</span></div>;
}

/* ===== Reviews ===== */
export function PReviews({ list, rating }: { list: any[]; rating: any }) {
  const router = useRouter();
  const [replying, setReplying] = useState<string | null>(null);
  if (list.length === 0) return <div className="card anim-fade" style={{ padding: "60px 24px", textAlign: "center", color: "var(--ink-3)", maxWidth: 760 }}><Icons.star size={36} /><h3 style={{ color: "var(--ink)", marginTop: 12, fontSize: 19 }}>No reviews yet</h3><p style={{ maxWidth: 380, margin: "8px auto 0", fontWeight: 600, fontSize: 14 }}>After a completed session, customers can rate the experience — reviews appear here.</p></div>;
  const dist = [5, 4, 3, 2, 1].map((st) => [st, Math.round(list.filter((x) => x.rating === st).length / list.length * 100)] as [number, number]);
  return (
    <div className="anim-fade" style={{ maxWidth: 760 }}>
      <div className="card" style={{ padding: 22, display: "flex", alignItems: "center", gap: 24, marginBottom: "var(--gap)" }}>
        <div style={{ textAlign: "center" }}><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 44, lineHeight: 1 }}>{rating.rating || "—"}</div><div style={{ color: "var(--m-joy)", fontSize: 15 }}>★★★★★</div><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600, marginTop: 4 }}>{list.length} review{list.length !== 1 ? "s" : ""}</div></div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          {dist.map(([st, p]) => <div key={st} style={{ display: "flex", alignItems: "center", gap: 10 }}><span style={{ fontSize: 12, fontWeight: 700, width: 10 }}>{st}</span><div style={{ flex: 1, height: 7, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden" }}><div style={{ height: "100%", width: p + "%", background: "var(--m-joy)", borderRadius: 99 }} /></div><span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600, width: 30 }}>{p}%</span></div>)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {list.map((rv) => (
          <div key={rv.id} className="card" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <Avatar name={rv.name} size={38} /><div style={{ flex: 1 }}><div style={{ fontWeight: 700 }}>{rv.name}</div><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{rv.serviceName} · {rv.date}</div></div>
              <span style={{ color: "var(--m-joy)", fontSize: 14 }}>{"★".repeat(rv.rating)}<span style={{ color: "var(--line-2)" }}>{"★".repeat(5 - rv.rating)}</span></span>
            </div>
            {rv.text && <p style={{ margin: "0 0 12px", color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.55 }}>{rv.text}</p>}
            {rv.replied ? <div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}><Icons.check size={15} />You replied</div>
              : <BusyBtn busy={replying === rv.id} className="btn btn-soft btn-sm" icon={<Icons.send size={14} />} onClick={() => { setReplying(rv.id); rpc("replyReview", { id: rv.id }).then(() => { setReplying(null); router.refresh(); }); }}>Reply</BusyBtn>}
          </div>
        ))}
      </div>
    </div>
  );
}
