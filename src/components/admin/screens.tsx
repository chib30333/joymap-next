"use client";
// Admin screens — 1:1 port of admin-app.jsx + admin-extra.jsx (Dashboard, Providers,
// Moderation, Content, Customers, Financials, Marketing). Data fetched server-side.
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import { money, Stat, Bars, LineChart, Donut, Pill, Seg, Modal, Btn, Avatar, BusyBtn } from "@/components/dash/primitives";
import { MOODS } from "@/components/customer/primitives";
import { downloadCSV } from "@/lib/csv";

const CAT_COLORS: Record<string, string> = { Wellness: "#3FA89B", Thrill: "#FF4D74", Creative: "#7B53F0", Movement: "#5563D6", Adventure: "#E89015", Mind: "#FF8A4C", Other: "#9B8AA0" };
const REJECT_REASONS = ["Incomplete documents", "Unverified business license", "Low-quality photos", "Pricing policy violation", "Duplicate listing", "Other"];

/* ===== Dashboard ===== */
export function ADashboard({ s, apps, pend, top }: { s: any; apps: any[]; pend: any[]; top: any[] }) {
  const router = useRouter();
  const days = Object.keys(s.byDay).map(Number).sort((a, b) => a - b);
  const gmvPts = days.map((d) => ({ label: d + " Jun", value: s.byDay[d] }));
  const cats = Object.keys(s.byCat).map((c) => ({ label: c, value: s.byCat[c], color: CAT_COLORS[c] || CAT_COLORS.Other }));
  const queue = [...apps.map((a) => ({ kind: "Provider", name: a.name, sub: a.cat + " · " + a.city })), ...pend.map((p) => ({ kind: "Service", name: p.name, sub: "by " + p.providerName }))];
  return (
    <div className="anim-fade">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
        <Stat label="GMV · June" value={money(s.gmv)} icon={<Icons.flame size={16} />} accent="#1FA46E" sub="confirmed bookings" />
        <Stat label="Platform revenue" value={money(s.revenue)} icon={<Icons.wallet size={16} />} accent="#5563D6" sub="15% commission" />
        <Stat label="Active providers" value={String(s.activeProviders)} icon={<Icons.user size={16} />} accent="#E89015" sub={`${apps.length} in review`} />
        <Stat label="Bookings" value={String(s.bookings)} icon={<Icons.calendar size={16} />} accent="#FF8A4C" sub={`${s.customers} customers`} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
        <div className="card" style={{ padding: 22 }}>
          <div className="shead" style={{ marginBottom: 8 }}><div><h3 style={{ fontSize: 17 }}>Gross merchandise value</h3><div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>By booking day · live</div></div>{s.gmv > 0 && <span className="tag" style={{ background: "rgba(31,164,110,.13)", color: "#1FA46E" }}>▴ Live</span>}</div>
          {gmvPts.length > 1 ? <LineChart points={gmvPts} h={210} caption="GMV" valFmt={(v) => money(v)} /> : gmvPts.length === 1 ? <Bars data={gmvPts} unit="₽" /> : <div style={{ height: 210, display: "grid", placeItems: "center", color: "var(--ink-3)", fontWeight: 600, fontSize: 13.5 }}>GMV charts light up once bookings are confirmed.</div>}
        </div>
        <div className="card" style={{ padding: 22, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 style={{ fontSize: 17, marginBottom: 16, alignSelf: "flex-start" }}>GMV by category</h3>
          {cats.length === 0 ? <div style={{ flex: 1, display: "grid", placeItems: "center", color: "var(--ink-3)", fontWeight: 600, fontSize: 13.5, textAlign: "center" }}>No category data yet.</div> : (
            <>
              <Donut segments={cats} center={{ v: money(s.gmv), l: "total" }} size={170} valFmt={(seg, total) => `${Math.round(seg.value / total * 100)}% · ${money(seg.value)}`} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 14px", marginTop: 18, width: "100%" }}>
                {cats.map((c) => <span key={c.label} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)" }}><span style={{ width: 9, height: 9, borderRadius: 99, background: c.color }} />{c.label}<span style={{ marginLeft: "auto", color: "var(--ink-3)" }}>{Math.round(c.value / s.gmv * 100)}%</span></span>)}
              </div>
            </>
          )}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--gap)" }}>
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px" }}><h3 style={{ fontSize: 16 }}>Moderation queue</h3><button className="btn btn-ghost btn-sm" onClick={() => router.push("/admin/moderation")}>Review <Icons.arrowR size={15} /></button></div>
          {queue.length === 0 && <div style={{ padding: "18px 20px", borderTop: "1px solid var(--line)", color: "var(--ink-3)", fontWeight: 600, fontSize: 13.5 }}>Queue is clear — nothing awaiting review.</div>}
          {queue.slice(0, 3).map((m, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderTop: "1px solid var(--line)" }}><Avatar name={m.name} size={34} grad="linear-gradient(140deg,var(--m-focus),#3742A8)" /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{m.name}</div><div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{m.kind} · {m.sub}</div></div><Pill status="review" label="new" /></div>)}
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px" }}><h3 style={{ fontSize: 16 }}>Top providers by GMV</h3><button className="btn btn-ghost btn-sm" onClick={() => router.push("/admin/providers")}>All <Icons.arrowR size={15} /></button></div>
          {top.length === 0 && <div style={{ padding: "18px 20px", borderTop: "1px solid var(--line)", color: "var(--ink-3)", fontWeight: 600, fontSize: 13.5 }}>No providers yet.</div>}
          {top.map((p, i) => <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderTop: "1px solid var(--line)" }}><span style={{ fontFamily: "var(--display)", fontWeight: 800, color: "var(--ink-3)", width: 16 }}>{i + 1}</span><Avatar name={p.name} size={34} /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</div><div style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{p.cat} · {p.city}</div></div><span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>{money(p.gmv)}</span></div>)}
        </div>
      </div>
    </div>
  );
}

/* ===== Providers ===== */
export function AProviders({ rows }: { rows: any[] }) {
  const [q, setQ] = useState(""); const [st, setSt] = useState("all"); const [sel, setSel] = useState<any>(null);
  const list = rows.filter((p) => (st === "all" || p.status === st) && (p.name + p.cat + p.city).toLowerCase().includes(q.toLowerCase()));
  const exportCsv = () => downloadCSV("joymap-providers.csv", [["Provider", "Category", "City", "Bookings", "GMV", "Rating", "Status"], ...rows.map((p) => [p.name, p.cat, p.city, p.bookings, p.gmv, p.rating || "", p.status])]);
  return (
    <div className="anim-fade">
      <div className="shead">
        <div style={{ position: "relative", flex: 1, maxWidth: 340 }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)" }}><Icons.search size={17} /></span>
          <input className="field" placeholder="Search providers…" value={q} onChange={(e) => setQ(e.target.value)} style={{ paddingLeft: 42, borderRadius: "var(--r-pill)" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Seg value={st} options={[{ v: "all", l: "All" }, { v: "active", l: "Active" }, { v: "review", l: "In review" }, { v: "rejected", l: "Rejected" }]} onChange={setSt} />
          <button className="btn btn-ghost btn-md" onClick={exportCsv}><Icons.download size={16} />Export CSV</button>
        </div>
      </div>
      {list.length === 0
        ? <div className="card" style={{ padding: "56px 20px", textAlign: "center", color: "var(--ink-3)", fontWeight: 600 }}>No providers{st !== "all" ? ` with status “${st}”` : ""} yet — they appear here after signing up.</div>
        : <div className="card" style={{ overflow: "hidden" }}><div style={{ overflowX: "auto" }}>
          <table className="tbl"><thead><tr><th>Provider</th><th>Category</th><th>City</th><th>Bookings</th><th>GMV</th><th>Rating</th><th>Status</th></tr></thead><tbody>
            {list.map((p) => <tr key={p.id} className="row" onClick={() => setSel(p)}>
              <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={p.name} size={32} /><b style={{ fontWeight: 700 }}>{p.name}</b></div></td>
              <td style={{ color: "var(--ink-2)" }}>{p.cat}</td><td style={{ color: "var(--ink-2)" }}>{p.city}</td><td>{p.bookings}</td>
              <td style={{ fontFamily: "var(--display)", fontWeight: 700 }}>{money(p.gmv)}</td>
              <td>{p.rating ? <span style={{ display: "inline-flex", gap: 4, alignItems: "center", fontWeight: 700 }}><Icons.star size={14} style={{ color: "var(--m-joy)" }} />{p.rating}</span> : <span style={{ color: "var(--ink-3)" }}>—</span>}</td>
              <td><Pill status={p.status} label={p.status === "review" ? "In review" : p.status === "rejected" ? "Rejected" : "Active"} /></td>
            </tr>)}
          </tbody></table>
        </div></div>}
      {sel && <ProviderDrawer p={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function ProviderDrawer({ p, onClose }: { p: any; onClose: () => void }) {
  const comm = Math.round(p.gmv * ((p.commission || 15) / 100));
  return (
    <Modal onClose={onClose} maxWidth={520}>
      <div>
        <div style={{ height: 90, background: "linear-gradient(140deg,var(--red),var(--orange))", position: "relative" }}>
          <button className="icon-btn" style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,.9)", border: "none" }} onClick={onClose}><Icons.close size={18} /></button>
        </div>
        <div style={{ padding: "0 24px 24px", marginTop: -30, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14, marginBottom: 18 }}>
            <Avatar name={p.name} size={64} grad="linear-gradient(140deg,var(--m-calm),#2E8C80)" />
            <div style={{ flex: 1, paddingBottom: 4 }}><h3 style={{ fontSize: 21 }}>{p.name}</h3><div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{p.cat} · {p.city} · joined {p.joined || "Jun 2026"}</div></div>
            <Pill status={p.status} label={p.status === "review" ? "In review" : p.status === "rejected" ? "Rejected" : "Active"} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)", marginBottom: 10 }}>Financials</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[["GMV", money(p.gmv)], ["Commission (15%)", money(comm)], ["Bookings", String(p.bookings)]].map(([l, v]) => <div key={l} className="card" style={{ padding: "13px 14px", background: "var(--surface-2)" }}><div style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600, marginBottom: 4 }}>{l}</div><div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 17 }}>{v}</div></div>)}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-3)" }}>Rating & complaints</div>
            <span style={{ marginLeft: "auto", display: "inline-flex", gap: 4, alignItems: "center", fontWeight: 700 }}><Icons.star size={14} style={{ color: "var(--m-joy)" }} />{p.rating || "—"}</span>
          </div>
          <div className="card" style={{ padding: 16, background: "var(--surface-2)", display: "flex", alignItems: "center", gap: 10, color: "var(--ink-2)", fontWeight: 600, fontSize: 13.5 }}>
            <Icons.checkCirc size={18} style={{ color: "#1FA46E" }} />No open complaints — a clean record.
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}><button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Close</button></div>
        </div>
      </div>
    </Modal>
  );
}

/* ===== Moderation ===== */
export function AModeration({ apps, svcs }: { apps: any[]; svcs: any[] }) {
  const [sel, setSel] = useState<any>(null);
  const empty = apps.length === 0 && svcs.length === 0;
  return (
    <div className="anim-fade">
      <div className="shead"><div><div className="eyebrow" style={{ marginBottom: 6 }}>{apps.length + svcs.length} awaiting review</div><h2 style={{ fontSize: 22 }}>Moderation</h2></div></div>
      {empty && <div style={{ textAlign: "center", padding: 70, color: "var(--ink-3)" }}><Icons.checkCirc size={40} /><h3 style={{ color: "var(--ink)", marginTop: 12 }}>Queue cleared 🎉</h3><p>New provider applications and service submissions land here.</p></div>}
      {apps.length > 0 && <>
        <h3 style={{ fontSize: 16, margin: "4px 0 14px" }}>Provider applications</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
          {apps.map((m) => <div key={m.id} className="card anim-pop" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <Avatar name={m.name} size={42} grad="linear-gradient(140deg,var(--m-focus),#3742A8)" />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 16 }}>{m.name}</div><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{m.cat} · {m.city}</div></div>
              <Pill status="review" label="new" />
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: 13, color: "var(--ink-2)", fontWeight: 600, marginBottom: 16 }}>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Icons.mail size={15} />{m.email}</span>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}><Icons.checkCirc size={15} />{m.docs || 3} documents</span>
            </div>
            <div style={{ display: "flex", gap: 9 }}><Btn size="sm" block onClick={() => setSel({ kind: "provider", item: m, mode: "approve" })}><Icons.check size={15} />Approve</Btn><button className="btn btn-ghost btn-sm btn-block" onClick={() => setSel({ kind: "provider", item: m, mode: "reject" })}>Reject</button></div>
          </div>)}
        </div>
      </>}
      {svcs.length > 0 && <>
        <h3 style={{ fontSize: 16, margin: "4px 0 14px" }}>Service submissions</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: "var(--gap)" }}>
          {svcs.map((s) => { const m = MOODS[s.mood] || MOODS.calm; return <div key={s.id} className="card anim-pop" style={{ padding: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <span style={{ width: 42, height: 42, borderRadius: 12, flex: "none", background: `linear-gradient(135deg,${m.color},color-mix(in srgb,${m.color} 60%,#000))` }} />
              <div style={{ flex: 1 }}><div style={{ fontWeight: 800, fontSize: 16 }}>{s.name}</div><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>by {s.providerName} · {s.cat} · {money(s.price)}</div></div>
              <Pill status="review" label="new" />
            </div>
            {s.about && <p style={{ margin: "0 0 14px", fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.5 }}>{s.about.slice(0, 140)}{s.about.length > 140 ? "…" : ""}</p>}
            <div style={{ display: "flex", gap: 9 }}><Btn size="sm" block onClick={() => setSel({ kind: "service", item: s, mode: "approve" })}><Icons.check size={15} />Approve & publish</Btn><button className="btn btn-ghost btn-sm btn-block" onClick={() => setSel({ kind: "service", item: s, mode: "reject" })}>Reject</button></div>
          </div>; })}
        </div>
      </>}
      {sel && <ModerationModal sel={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function ModerationModal({ sel, onClose }: { sel: any; onClose: () => void }) {
  const router = useRouter();
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const { busy, run } = useBusy();
  const reject = sel.mode === "reject";
  const it = sel.item;
  const decide = () => run(() => rpc(sel.kind === "provider" ? "decideProvider" : "decideService", { id: it.id, approve: !reject, reason: reject ? reason : null }), () => { onClose(); router.refresh(); });
  return (
    <Modal onClose={onClose} maxWidth={440}>
      <div style={{ padding: "24px 26px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <Avatar name={it.name} size={44} grad="linear-gradient(140deg,var(--m-focus),#3742A8)" />
          <div><h3 style={{ fontSize: 18 }}>{it.name}</h3><div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{sel.kind === "provider" ? `${it.cat} · ${it.city}` : `Service · by ${it.providerName}`}</div></div>
        </div>
        {sel.kind === "provider" && <div className="card" style={{ padding: 14, background: "var(--surface-2)", marginBottom: 18 }}>
          {["Business license", "Identity verification", "Insurance certificate"].slice(0, it.docs || 3).map((d, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", fontSize: 13.5, fontWeight: 600 }}><Icons.checkCirc size={17} style={{ color: "#1FA46E" }} />{d}<span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)" }}>Verified</span></div>)}
        </div>}
        {reject ? <div style={{ marginBottom: 18 }}><div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Reason for rejection</div><select className="field" value={reason} onChange={(e) => setReason(e.target.value)}>{REJECT_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
          : <p style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: 18 }}>Approving will {sel.kind === "provider" ? <>activate <b>{it.name}</b> on the marketplace</> : <>publish <b>{it.name}</b> to the customer catalogue</>} and notify the owner.</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Cancel</button>
          {reject ? <BusyBtn busy={busy} className="btn btn-md btn-block" style={{ background: "var(--coral)", color: "#fff" }} onClick={decide}>Reject</BusyBtn> : <BusyBtn busy={busy} className="btn btn-primary btn-md btn-block" icon={<Icons.check size={16} />} onClick={decide}>Approve</BusyBtn>}
        </div>
      </div>
    </Modal>
  );
}

/* ===== Content ===== */
export function AContent({ items }: { items: any[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [acting, setActing] = useState<string | null>(null);
  const act = (id: string) => { setActing(id); rpc("resolveFlag", { id }).then(() => { setActing(null); router.refresh(); }); };
  const list = filter === "all" ? items : items.filter((c) => c.type === filter);
  const TYPE: Record<string, [string, string]> = { review: ["Review", "#5563D6"], photo: ["Photo", "#E89015"], promo: ["Promo material", "#7B53F0"] };
  return (
    <div className="anim-fade">
      <div className="shead"><div><div className="eyebrow" style={{ marginBottom: 6 }}>{items.length} flagged items</div><h2 style={{ fontSize: 22 }}>Content moderation</h2></div>
        <Seg value={filter} options={[{ v: "all", l: "All" }, { v: "review", l: "Reviews" }, { v: "photo", l: "Photos" }, { v: "promo", l: "Promos" }]} onChange={setFilter} /></div>
      {list.length === 0
        ? <div style={{ textAlign: "center", padding: 70, color: "var(--ink-3)" }}><Icons.checkCirc size={40} /><h3 style={{ color: "var(--ink)", marginTop: 12 }}>Nothing flagged 🎉</h3><p>Reported reviews, photos and promos land here.</p></div>
        : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: "var(--gap)" }}>
          {list.map((c) => { const [tl, tc] = TYPE[c.type] || ["Item", "#9B8AA0"]; return <div key={c.id} className="card anim-pop" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="tag" style={{ background: `color-mix(in srgb,${tc} 14%,transparent)`, color: tc }}>{tl}</span>
              <span className="tag" style={{ background: "rgba(224,33,47,.1)", color: "var(--coral)" }}><Icons.flame size={12} />{c.reason}</span>
              <span style={{ marginLeft: "auto", fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>{c.time}</span>
            </div>
            {c.type === "photo" ? <div style={{ height: 140, borderRadius: 12, background: c.grad || "linear-gradient(135deg,#9E7BF6,#5B33C9)" }} /> : <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: "var(--ink-2)", background: "var(--surface-2)", padding: "12px 14px", borderRadius: 12, fontStyle: "italic" }}>&quot;{c.text}&quot;</p>}
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}><Avatar name={c.author} size={24} />{c.author}<span style={{ opacity: 0.5 }}>·</span>on {c.target}</div>
            <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
              {acting === c.id ? <span className="jm-spin" style={{ margin: "8px auto", color: "var(--ink-3)" }} /> : <>
                <button className="btn btn-ghost btn-sm btn-block" onClick={() => act(c.id)}><Icons.check size={15} />Keep</button>
                <button className="btn btn-sm btn-block" style={{ background: "var(--coral)", color: "#fff" }} onClick={() => act(c.id)}><Icons.trash size={15} />Remove</button>
              </>}
            </div>
          </div>; })}
        </div>}
    </div>
  );
}

/* ===== Customers ===== */
export function ACustomers({ list }: { list: any[] }) {
  const avgLtv = list.length ? Math.round(list.reduce((a, c) => a + c.ltv, 0) / list.length) : 0;
  const exportCsv = () => downloadCSV("joymap-customers-ltv.csv", [["Customer", "Tier", "Bookings", "LTV", "Joined"], ...list.map((c) => [c.name, c.tier, c.bookings, c.ltv, c.joined])]);
  return (
    <div className="anim-fade">
      <div className="shead" style={{ marginBottom: "var(--gap)" }}><div /><button className="btn btn-ghost btn-md" onClick={exportCsv}><Icons.download size={16} />Export LTV</button></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
        <Stat label="Customers" value={String(list.length)} icon={<Icons.user size={16} />} accent="#5563D6" />
        <Stat label="Avg LTV" value={money(avgLtv)} icon={<Icons.heart size={16} />} accent="#7B53F0" />
        <Stat label="Total bookings" value={String(list.reduce((a, c) => a + c.bookings, 0))} icon={<Icons.calendar size={16} />} accent="#1FA46E" />
      </div>
      {list.length === 0
        ? <div className="card" style={{ padding: "56px 20px", textAlign: "center", color: "var(--ink-3)", fontWeight: 600 }}>No customers yet — they appear here after signing up.</div>
        : <div className="card" style={{ overflow: "hidden" }}><div style={{ overflowX: "auto" }}>
          <table className="tbl"><thead><tr><th>Customer</th><th>Tier</th><th>Bookings</th><th>Lifetime value</th><th>Joined</th></tr></thead><tbody>
            {list.map((c, i) => <tr key={i} className="row">
              <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={c.name} size={32} /><b style={{ fontWeight: 700 }}>{c.name}</b></div></td>
              <td><Pill status={c.tier === "vip" ? "vip" : c.tier === "new" ? "review" : "active"} label={c.tier === "vip" ? "VIP" : c.tier === "new" ? "New" : "Active"} /></td>
              <td>{c.bookings}</td><td style={{ fontFamily: "var(--display)", fontWeight: 700 }}>{money(c.ltv)}</td><td style={{ color: "var(--ink-2)" }}>{c.joined}</td>
            </tr>)}
          </tbody></table>
        </div></div>}
    </div>
  );
}

/* ===== Financials ===== */
export function AFinancials({ s, queue }: { s: any; queue: any[] }) {
  const router = useRouter();
  const [releasing, setReleasing] = useState<string | null>(null);
  const release = (id: string) => { setReleasing(id); rpc("releasePayout", { id }).then(() => { setReleasing(null); router.refresh(); }); };
  const exportCsv = () => downloadCSV("joymap-payouts.csv", [["Provider", "Amount", "Due", "Status"], ...queue.map((p) => [p.providerName, p.amount, p.due, p.status])]);
  return (
    <div className="anim-fade">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "var(--gap)", marginBottom: "var(--gap)" }}>
        <Stat label="GMV · June" value={money(s.gmv)} icon={<Icons.flame size={16} />} accent="#1FA46E" />
        <Stat label="Commission collected" value={money(s.revenue)} icon={<Icons.wallet size={16} />} accent="#5563D6" sub="15% / booking" />
        <Stat label="Pending payouts" value={money(s.pendingPayouts)} icon={<Icons.user size={16} />} accent="#FF8A4C" sub={`${queue.filter((p) => p.status === "pending").length} requests`} />
        <Stat label="Paid out" value={money(queue.filter((p) => p.status === "paid").reduce((a, p) => a + p.amount, 0))} icon={<Icons.sparkle size={16} />} accent="#E89015" />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px" }}><h3 style={{ fontSize: 17 }}>Payouts queue</h3><button className="btn btn-ghost btn-sm" onClick={exportCsv}><Icons.download size={15} />Export CSV</button></div>
        {queue.length === 0
          ? <div style={{ padding: "34px 20px", color: "var(--ink-3)", fontWeight: 600, fontSize: 13.5, borderTop: "1px solid var(--line)" }}>No payout requests yet. When providers hit “Withdraw”, requests land here for release.</div>
          : <table className="tbl"><thead><tr><th>Provider</th><th>Amount</th><th>Due</th><th>Status</th><th /></tr></thead><tbody>
            {queue.map((p) => <tr key={p.id} className="row">
              <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}><Avatar name={p.providerName} size={30} /><b style={{ fontWeight: 700 }}>{p.providerName}</b></div></td>
              <td style={{ fontFamily: "var(--display)", fontWeight: 700 }}>{money(p.amount)}</td><td style={{ color: "var(--ink-2)" }}>{p.due}</td><td><Pill status={p.status} /></td>
              <td style={{ textAlign: "right" }}>{p.status === "pending" && (releasing === p.id ? <span className="jm-spin" style={{ color: "var(--ink-3)" }} /> : <button className="btn btn-soft btn-sm" onClick={() => release(p.id)}>Release</button>)}</td>
            </tr>)}
          </tbody></table>}
      </div>
    </div>
  );
}

/* ===== Marketing ===== */
const A_CAMPAIGNS = [
  { name: "Weekend in Moscow", channel: "Push", audience: "All users · Moscow", sent: 42100, ctr: "7.4%", status: "active" },
  { name: "First booking −20%", channel: "Email", audience: "New users", sent: 18600, ctr: "12.1%", status: "active" },
  { name: "Win-back: dormant 30d", channel: "Push", audience: "Dormant", sent: 9300, ctr: "4.8%", status: "review" },
];
export function AMarketing() {
  const [promo, setPromo] = useState(false);
  return (
    <div className="anim-fade">
      <div className="shead"><div /><div style={{ display: "flex", gap: 10 }}><button className="btn btn-ghost btn-md" onClick={() => setPromo(true)}><Icons.percent size={16} />Mass-create promos</button><Btn size="md"><Icons.send size={16} />New campaign</Btn></div></div>
      <div className="card" style={{ overflow: "hidden", marginBottom: "var(--gap)" }}>
        <h3 style={{ fontSize: 17, padding: "18px 20px 4px" }}>Campaigns</h3>
        <table className="tbl"><thead><tr><th>Campaign</th><th>Channel</th><th>Audience</th><th>Sent</th><th>CTR</th><th>Status</th></tr></thead><tbody>
          {A_CAMPAIGNS.map((c, i) => <tr key={i} className="row">
            <td><b style={{ fontWeight: 700 }}>{c.name}</b></td>
            <td><span className="tag" style={{ background: "var(--surface-2)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>{c.channel}</span></td>
            <td style={{ color: "var(--ink-2)" }}>{c.audience}</td><td>{c.sent.toLocaleString("ru-RU")}</td>
            <td style={{ fontWeight: 700 }}>{c.ctr}</td><td><Pill status={c.status === "active" ? "active" : "review"} label={c.status === "active" ? "Active" : "Scheduled"} /></td>
          </tr>)}
        </tbody></table>
      </div>
      {promo && <PromoMassModal onClose={() => setPromo(false)} />}
    </div>
  );
}

function PromoMassModal({ onClose }: { onClose: () => void }) {
  const [prefix, setPrefix] = useState("SUMMER"); const [count, setCount] = useState(50); const [disc, setDisc] = useState("20"); const [done, setDone] = useState(false);
  const sample = Array.from({ length: 3 }, () => `${prefix}-${1000 + Math.floor(Math.random() * 9000)}`);
  return (
    <Modal onClose={onClose} maxWidth={460}>
      <div style={{ padding: "24px 26px" }}>
        {!done ? <>
          <h3 style={{ fontSize: 20, marginBottom: 6 }}>Mass-create promo codes</h3>
          <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "0 0 18px" }}>Generate a batch of unique single-use codes for a campaign.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 7 }}>Code prefix</div><input className="field" value={prefix} onChange={(e) => setPrefix(e.target.value.toUpperCase())} style={{ fontFamily: "var(--display)", fontWeight: 700 }} /></div>
              <div style={{ width: 120 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 7 }}>How many</div><input className="field" type="number" value={count} onChange={(e) => setCount(+e.target.value)} /></div>
            </div>
            <div><div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 7 }}>Discount (%)</div><input className="field" value={disc} onChange={(e) => setDisc(e.target.value)} /></div>
            <div className="card" style={{ padding: 14, background: "var(--surface-2)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", marginBottom: 8 }}>PREVIEW</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{sample.map((sm, i) => <span key={i} style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 13, padding: "4px 10px", borderRadius: 7, background: "var(--surface)", border: "1px dashed var(--line-2)" }}>{sm}</span>)}<span style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600, alignSelf: "center" }}>+{Math.max(count - 3, 0)} more</span></div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 22 }}><button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Cancel</button><Btn size="md" block onClick={() => setDone(true)}><Icons.sparkle size={16} />Generate {count} codes</Btn></div>
        </> : <div style={{ textAlign: "center", padding: "10px 0" }}>
          <div style={{ width: 60, height: 60, borderRadius: 99, background: "rgba(31,164,110,.14)", color: "#1FA46E", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Icons.check size={32} /></div>
          <h3 style={{ fontSize: 20, marginBottom: 6 }}>{count} codes created</h3>
          <p style={{ color: "var(--ink-2)", fontSize: 14, margin: "0 0 20px" }}>Download the batch as CSV to share with your campaign.</p>
          <div style={{ display: "flex", gap: 10 }}><button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Close</button><Btn size="md" block onClick={() => { downloadCSV(`${prefix}-codes.csv`, [["Code", "Discount"], ...Array.from({ length: count }, (_, i) => [`${prefix}-${1000 + i}`, disc + "%"])]); onClose(); }}><Icons.download size={16} />Download CSV</Btn></div>
        </div>}
      </div>
    </Modal>
  );
}
