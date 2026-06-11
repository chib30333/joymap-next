"use client";
// Provider extra screens — 1:1 port of provider-extra.jsx (Business profile,
// Pricing, Gallery, Marketing). Gallery/rules/promos are local demo state as in the
// prototype; profile edits persist via rpc('updateProvider').
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import { money, Pill, Seg, Toggle, Modal, Btn, BusyBtn } from "@/components/dash/primitives";

const P_GALLERY = [
  { id: "g1", g: "linear-gradient(150deg,#6FD4C4,#2E8C80)", cover: true, label: "Rooftop at sunrise" },
  { id: "g2", g: "linear-gradient(150deg,#5FC8B6,#268070)", label: "Sound bath setup" },
  { id: "g3", g: "linear-gradient(150deg,#7E8BE6,#3F49B0)", label: "Breathwork circle" },
  { id: "g4", g: "linear-gradient(150deg,#FBC15B,#E08B12)", label: "Golden hour flow" },
  { id: "g5", g: "linear-gradient(150deg,#FF9A57,#E36A1E)", label: "Studio interior" },
  { id: "g6", g: "linear-gradient(150deg,#9E7BF6,#5B33C9)", label: "Evening candlelit", video: true },
] as { id: string; g: string; cover?: boolean; label: string; video?: boolean }[];

const P_RULES = [
  { id: "r1", name: "Peak weekend surge", cond: "Sat–Sun · all services", adj: "+15%", type: "up", active: true },
  { id: "r2", name: "Early bird discount", cond: "Before 09:00", adj: "−10%", type: "down", active: true },
  { id: "r3", name: "Last-minute fill", cond: "< 3h to start & seats open", adj: "−20%", type: "down", active: true },
  { id: "r4", name: "Group of 4+", cond: "4 or more spots", adj: "−12%", type: "down", active: false },
];

const P_PROMOS = [
  { code: "CALM15", desc: "15% off any wellness session", uses: 42, cap: 100, expires: "30 Jun", status: "active" },
  { code: "FIRSTYOGA", desc: "−500 ₽ on a first booking", uses: 88, cap: 200, expires: "15 Jul", status: "active" },
  { code: "SUNRISE", desc: "Free tea with sunrise classes", uses: 120, cap: 120, expires: "1 Jun", status: "rejected" },
];

type Provider = any;

/* ===== Business Profile ===== */
export function PBusinessProfile({ provider }: { provider: Provider }) {
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const { busy, run } = useBusy();
  const p = provider || {};
  const [f, setF] = useState({ name: p.name || "", tagline: p.tagline || "", about: p.about || "", email: p.email || "", phone: p.phone || "", site: p.site || "", address: p.address || (p.area ? p.area + ", " + p.city : ""), cats: p.cats || [p.cat || "Wellness"], founded: p.founded || "2026", team: p.team || 1 });
  const cover = P_GALLERY.find((g) => g.cover) || P_GALLERY[0];
  const set = (k: string, v: any) => setF((prev) => ({ ...prev, [k]: v }));
  const saveOrEdit = () => {
    if (!edit) { setEdit(true); return; }
    run(() => rpc("updateProvider", { name: f.name, tagline: f.tagline, about: f.about, email: f.email, phone: f.phone, site: f.site, address: f.address }), () => { setEdit(false); router.refresh(); });
  };
  return (
    <div className="anim-fade" style={{ maxWidth: 840 }}>
      <div className="card" style={{ overflow: "hidden", marginBottom: "var(--gap)" }}>
        <div style={{ height: 150, background: cover.g, position: "relative" }}>
          <button className="btn btn-ghost btn-sm" style={{ position: "absolute", right: 14, top: 14 }}><Icons.camera size={15} />Change cover</button>
        </div>
        <div style={{ padding: "0 24px 22px", display: "flex", gap: 18, alignItems: "flex-end", marginTop: -36, flexWrap: "wrap", position: "relative", zIndex: 1 }}>
          <div style={{ width: 84, height: 84, borderRadius: 22, background: "linear-gradient(140deg,var(--m-calm),#2E8C80)", border: "4px solid var(--surface)", display: "grid", placeItems: "center", color: "#fff", fontFamily: "var(--display)", fontWeight: 800, fontSize: 34, flex: "none" }}>{(f.name || "?")[0]}</div>
          <div style={{ flex: 1, minWidth: 200, paddingBottom: 4 }}>
            <h2 style={{ fontSize: 24 }}>{f.name}</h2>
            <div style={{ color: "var(--ink-3)", fontWeight: 600, marginTop: 3 }}>{edit ? <input className="field" placeholder="A short tagline customers see" value={f.tagline} onChange={(e) => set("tagline", e.target.value)} style={{ marginTop: 6 }} /> : (f.tagline || "Add a tagline so customers know your vibe")}</div>
          </div>
          <div style={{ display: "flex", gap: 8, paddingBottom: 4 }}>
            {p.status === "active" ? <span className="pill" style={{ color: "#1FA46E", background: "rgba(31,164,110,.13)" }}><Icons.shield size={13} />Verified</span> : <span className="pill" style={{ color: "#E89015", background: "rgba(232,144,21,.14)" }}><Icons.clock size={13} />In review</span>}
            <BusyBtn busy={busy} className="btn btn-ghost btn-sm" icon={edit ? <Icons.check size={15} /> : <Icons.edit size={15} />} onClick={saveOrEdit}>{edit ? "Save" : "Edit"}</BusyBtn>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--gap)", alignItems: "start" }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 17, marginBottom: 14 }}>About the business</h3>
          {edit ? <textarea className="field" rows={5} value={f.about} onChange={(e) => set("about", e.target.value)} placeholder="Tell customers your story…" style={{ resize: "vertical", lineHeight: 1.5 }} /> : <p style={{ color: "var(--ink-2)", fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{f.about || "No description yet — hit Edit and tell customers what makes you special."}</p>}
          <hr className="divider" style={{ margin: "20px 0", border: 0, height: 1, background: "var(--line)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {([["email", "Email", "mail"], ["phone", "Phone", "phone"], ["site", "Website", "compass"], ["address", "Address", "pin"]] as const).map(([k, l, ic]) => {
              const I = Icons[ic];
              return <div key={k} style={{ gridColumn: k === "address" ? "1 / -1" : "auto" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-3)", marginBottom: 6 }}>{l}</div>
                {edit ? <input className="field" value={(f as any)[k]} onChange={(e) => set(k, e.target.value)} /> : <div style={{ display: "flex", gap: 8, alignItems: "center", fontWeight: 600, fontSize: 14 }}><span style={{ color: "var(--ink-3)" }}><I size={16} /></span>{(f as any)[k] || "—"}</div>}
              </div>;
            })}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--gap)" }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontSize: 16, marginBottom: 14 }}>Categories</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {f.cats.map((c: string) => <span key={c} className="tag" style={{ background: "var(--surface-2)", color: "var(--ink-2)", border: "1px solid var(--line)" }}>{c}</span>)}
              {edit && <button className="chip" style={{ padding: "4px 12px" }}><Icons.plus size={13} />Add</button>}
            </div>
            <hr className="divider" style={{ margin: "18px 0", border: 0, height: 1, background: "var(--line)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
              <div><div style={{ color: "var(--ink-3)", fontWeight: 600, marginBottom: 4 }}>Founded</div><b>{f.founded}</b></div>
              <div><div style={{ color: "var(--ink-3)", fontWeight: 600, marginBottom: 4 }}>Team</div><b>{f.team} people</b></div>
              <div><div style={{ color: "var(--ink-3)", fontWeight: 600, marginBottom: 4 }}>Joined</div><b>{p.joined || "Jun 2026"}</b></div>
            </div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <h3 style={{ fontSize: 16 }}>Gallery</h3><span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{P_GALLERY.length} items</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginTop: 10 }}>
              {P_GALLERY.slice(0, 6).map((g) => <div key={g.id} style={{ aspectRatio: "1", borderRadius: 10, background: g.g }} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Pricing ===== */
export function PPricing({ svcs }: { svcs: any[] }) {
  const [rules, setRules] = useState(P_RULES);
  const toggle = (id: string) => setRules((r) => r.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
  return (
    <div className="anim-fade" style={{ maxWidth: 820 }}>
      <div className="card" style={{ padding: 22, marginBottom: "var(--gap)" }}>
        <div className="shead" style={{ marginBottom: 14 }}><div><h3 style={{ fontSize: 17 }}>Base prices</h3><div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>Per person, before dynamic rules</div></div></div>
        {svcs.length === 0
          ? <div style={{ padding: "20px 0", color: "var(--ink-3)", fontWeight: 600, fontSize: 13.5 }}>No services yet — create one in Services.</div>
          : <table className="tbl"><thead><tr><th>Service</th><th>Duration</th><th>Capacity</th><th>Base price</th></tr></thead><tbody>
            {svcs.map((s) => <tr key={s.id} className="row"><td><b style={{ fontWeight: 700 }}>{s.name}</b></td><td style={{ color: "var(--ink-2)" }}>{s.dur}</td><td style={{ color: "var(--ink-2)" }}>{s.cap}</td><td style={{ fontFamily: "var(--display)", fontWeight: 700 }}>{money(s.price)}</td></tr>)}
          </tbody></table>}
      </div>
      <div className="shead"><div><h3 style={{ fontSize: 17 }}>Dynamic pricing rules</h3><div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>Automatically adjust prices to fill capacity</div></div><Btn size="md" icon={<Icons.plus size={16} />}>New rule</Btn></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {rules.map((r) => <div key={r.id} className="card" style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, opacity: r.active ? 1 : 0.6 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, flex: "none", display: "grid", placeItems: "center", background: r.type === "up" ? "rgba(224,33,47,.12)" : "rgba(31,164,110,.13)", color: r.type === "up" ? "var(--coral)" : "#1FA46E" }}><Icons.percent size={20} /></span>
          <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div><div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{r.cond}</div></div>
          <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 18, color: r.type === "up" ? "var(--coral)" : "#1FA46E" }}>{r.adj}</span>
          <Toggle on={r.active} onChange={() => toggle(r.id)} />
        </div>)}
      </div>
    </div>
  );
}

/* ===== Gallery ===== */
export function PGalleryView() {
  const [items, setItems] = useState(P_GALLERY);
  const del = (id: string) => setItems((it) => it.filter((g) => g.id !== id));
  const setCover = (id: string) => setItems((it) => it.map((g) => ({ ...g, cover: g.id === id })));
  return (
    <div className="anim-fade">
      <div className="shead"><div><div className="eyebrow" style={{ marginBottom: 6 }}>{items.length} items</div><h2 style={{ fontSize: 22 }}>Photos & videos</h2></div><Btn size="md" icon={<Icons.plus size={16} />}>Upload</Btn></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: "var(--gap)" }}>
        <label style={{ aspectRatio: "4/3", borderRadius: "var(--r-lg)", border: "2px dashed var(--line-2)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--ink-3)", cursor: "pointer", background: "var(--surface-2)" }}><Icons.image size={28} /><span style={{ fontWeight: 700, fontSize: 13.5 }}>Add photo or video</span></label>
        {items.map((g) => <div key={g.id} className="card anim-pop" style={{ overflow: "hidden", padding: 0 }}>
          <div style={{ aspectRatio: "4/3", background: g.g, position: "relative" }}>
            {g.cover && <span className="pill" style={{ position: "absolute", top: 10, left: 10, color: "#1A0A04", background: "var(--orange)" }}><Icons.star size={12} />Cover</span>}
            {g.video && <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><span style={{ width: 46, height: 46, borderRadius: 99, background: "rgba(0,0,0,.45)", display: "grid", placeItems: "center", color: "#fff" }}><Icons.arrowR size={20} /></span></span>}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "24px 12px 10px", background: "linear-gradient(transparent,rgba(0,0,0,.5))", display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#fff", fontWeight: 700, fontSize: 12.5, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g.label}</span></div>
          </div>
          <div style={{ display: "flex", gap: 6, padding: "10px 12px" }}>
            {!g.cover && <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: 12 }} onClick={() => setCover(g.id)}>Set cover</button>}
            <button className="icon-btn" style={{ width: 34, height: 34 }} onClick={() => del(g.id)}><Icons.trash size={15} /></button>
          </div>
        </div>)}
      </div>
    </div>
  );
}

/* ===== Marketing ===== */
export function PMarketing() {
  const [promos, setPromos] = useState(P_PROMOS);
  const [modal, setModal] = useState(false);
  const add = (p: any) => { setPromos((ps) => [{ ...p, uses: 0, status: "active" }, ...ps]); setModal(false); };
  return (
    <div className="anim-fade" style={{ maxWidth: 860 }}>
      <div className="shead"><div><h3 style={{ fontSize: 17 }}>Promo codes</h3><div style={{ fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>Drive bookings with limited-time offers</div></div><Btn size="md" icon={<Icons.plus size={16} />} onClick={() => setModal(true)}>Create code</Btn></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "var(--gap)" }}>
        {promos.map((p, i) => <div key={i} className="card anim-pop" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 18, letterSpacing: ".04em", padding: "5px 12px", borderRadius: 8, background: "color-mix(in srgb,var(--orange) 14%,transparent)", color: "var(--orange-deep)", border: "1px dashed color-mix(in srgb,var(--orange) 45%,transparent)" }}>{p.code}</span>
            <Pill status={p.status} label={p.status === "active" ? "Active" : p.status === "rejected" ? "Expired" : p.status} />
          </div>
          <p style={{ margin: "0 0 14px", fontSize: 14, color: "var(--ink-2)", fontWeight: 600 }}>{p.desc}</p>
          <div style={{ height: 7, borderRadius: 99, background: "var(--surface-2)", overflow: "hidden", marginBottom: 8 }}><div style={{ height: "100%", width: `${Math.min(p.uses / p.cap * 100, 100)}%`, background: p.uses >= p.cap ? "var(--ink-3)" : "var(--coral)", borderRadius: 99 }} /></div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}><span>{p.uses}/{p.cap} redeemed</span><span>Expires {p.expires}</span></div>
        </div>)}
      </div>
      {modal && <PromoModal onClose={() => setModal(false)} onAdd={add} />}
    </div>
  );
}

function PromoModal({ onClose, onAdd }: { onClose: () => void; onAdd: (p: any) => void }) {
  const [code, setCode] = useState(""); const [desc, setDesc] = useState(""); const [amt, setAmt] = useState("15"); const [unit, setUnit] = useState("%"); const [cap, setCap] = useState("100");
  return (
    <Modal onClose={onClose} maxWidth={460}>
      <div style={{ padding: "24px 26px" }}>
        <h3 style={{ fontSize: 20, marginBottom: 18 }}>Create promo code</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div><div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 7 }}>Code</div><input className="field" placeholder="SUMMER20" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} style={{ fontFamily: "var(--display)", fontWeight: 700, letterSpacing: ".05em" }} /></div>
          <div><div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 7 }}>Description</div><input className="field" placeholder="15% off any wellness session" value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 7 }}>Discount</div><div style={{ display: "flex", gap: 8 }}><input className="field" value={amt} onChange={(e) => setAmt(e.target.value)} style={{ flex: 1 }} /><Seg value={unit} options={[{ v: "%", l: "%" }, { v: "₽", l: "₽" }]} onChange={setUnit} /></div></div>
            <div style={{ width: 110 }}><div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-2)", marginBottom: 7 }}>Max uses</div><input className="field" value={cap} onChange={(e) => setCap(e.target.value)} /></div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Cancel</button>
          <Btn size="md" block onClick={() => onAdd({ code: code || "NEWCODE", desc: desc || `${amt}${unit} off`, cap: +cap || 100, expires: "31 Jul" })}><Icons.check size={16} />Create code</Btn>
        </div>
      </div>
    </Modal>
  );
}
