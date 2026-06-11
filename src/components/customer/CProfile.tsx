"use client";
// CProfile — 1:1 port of customer-extra.jsx Profile (personal data, history, moods).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import { MOODS, MOOD_ORDER, fmt, bg, Avatar, BusyBtn, MoodChip, type Exp } from "./primitives";

type B = { id: string; date: string; total: number; status: string; rated?: number | null; exp: Exp | null };

export function CProfile({ user, bookings }: {
  user: { name: string; email: string; phone?: string; city: string; plan?: string; moods?: string[] };
  bookings: { upcoming: B[]; past: B[] };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"account" | "history" | "moods">("account");
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({ name: user.name || "", email: user.email || "", phone: user.phone || "+7 — — —", city: user.city || "Moscow" });
  const { busy, run } = useBusy();
  const past = (bookings.past || []).filter((b) => b.status !== "cancelled");
  const total = bookings.upcoming.length + past.length;
  const spent = past.reduce((a, b) => a + b.total, 0);
  const saveOrEdit = () => {
    if (!edit) { setEdit(true); return; }
    run(() => rpc("updateUser", { name: form.name, email: form.email, phone: form.phone, city: form.city }), () => { setEdit(false); router.refresh(); });
  };

  return (
    <div className="anim-fade" style={{ maxWidth: 720 }}>
      <div className="card" style={{ padding: 24, display: "flex", gap: 18, alignItems: "center", marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{ position: "relative" }}>
          <Avatar name={form.name || "?"} size={72} />
          <button className="icon-btn" style={{ position: "absolute", bottom: -4, right: -4, width: 30, height: 30, background: "var(--coral)", color: "#fff", border: "2px solid var(--surface)" }}><Icons.camera size={15} /></button>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          <h2 style={{ fontSize: 24 }}>{form.name}</h2>
          <div style={{ color: "var(--ink-3)", fontWeight: 600, marginTop: 4, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icons.pin size={14} />{form.city}</span>
            <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}><Icons.sparkle size={14} />{user.plan || "Joy Map"} member</span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, textAlign: "right" }}>
          <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 26 }}>{total}</span>
          <span style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>experiences booked</span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "var(--surface-2)", padding: 5, borderRadius: "var(--r-pill)", width: "fit-content", border: "1px solid var(--line)" }}>
        {([["account", "Personal data"], ["history", "Activity history"], ["moods", "Moods"]] as const).map(([k, l]) => (
          <button key={k} className="btn btn-sm" onClick={() => setTab(k as any)} style={tab === k ? { background: "var(--surface)", color: "var(--ink)", boxShadow: "var(--sh-sm)" } : { color: "var(--ink-3)" }}>{l}</button>
        ))}
      </div>

      {tab === "account" && (
        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
            <h3 style={{ fontSize: 17 }}>Personal data</h3>
            <BusyBtn busy={busy} className="btn btn-ghost btn-sm" icon={edit ? <Icons.check size={15} /> : <Icons.edit size={15} />} onClick={saveOrEdit}>{edit ? "Save" : "Edit"}</BusyBtn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {([["name", "Full name", "user"], ["email", "Email", "mail"], ["phone", "Phone", "phone"], ["city", "City", "pin"]] as const).map(([k, l, ic]) => {
              const I = Icons[ic];
              return (
                <div key={k} style={{ gridColumn: k === "name" ? "1 / -1" : "auto" }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", marginBottom: 7 }}>{l}</div>
                  {edit
                    ? <input className="field" value={(form as any)[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
                    : <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "12px 14px", borderRadius: "var(--r-sm)", background: "var(--surface-2)", fontWeight: 600, fontSize: 14.5 }}><span style={{ color: "var(--ink-3)" }}><I size={17} /></span>{(form as any)[k]}</div>}
                </div>
              );
            })}
          </div>
          <hr className="divider" style={{ margin: "22px 0" }} />
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", background: "color-mix(in srgb,#1FA46E 14%,transparent)", color: "#1FA46E", flex: "none" }}><Icons.shield size={19} /></span>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>Account secured</div><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>Signed in as {user.email}</div></div>
            <button className="btn btn-ghost btn-sm" onClick={() => rpc("logout").then(() => router.push("/auth"))}>Log out</button>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--ink-2)" }}>{past.length} past experiences · {fmt(spent)} spent</span>
          </div>
          {past.length === 0
            ? <div className="card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-3)", fontWeight: 600, fontSize: 14 }}>Your completed experiences will appear here.</div>
            : (
              <div className="card" style={{ overflow: "hidden" }}>
                {past.map((h, i) => {
                  const e = h.exp;
                  const m = e ? MOODS[e.mood] : MOODS.calm;
                  return (
                    <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "15px 18px", borderTop: i ? "1px solid var(--line)" : "none" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: e ? bg(e) : m.color, backgroundSize: "cover", flex: "none", opacity: 0.95 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14.5 }}>{e ? e.title : "Experience"}</div>
                        <div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{e ? e.provider : ""} · {h.date}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 14 }}>{fmt(h.total)}</div>
                        {h.rated ? <div style={{ color: "var(--m-joy)", fontSize: 12 }}>{"★".repeat(h.rated)}</div> : h.status === "completed" ? <span style={{ fontSize: 12, color: "var(--ink-3)", fontWeight: 600 }}>Not rated</span> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
        </div>
      )}

      {tab === "moods" && (
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 17, marginBottom: 8 }}>Your moods</h3>
          <p style={{ color: "var(--ink-2)", fontSize: 14, marginBottom: 16 }}>Joy tunes your weekly map around these. Tap to toggle — your next Joy Map uses them.</p>
          <MoodPicker initial={user.moods || []} />
        </div>
      )}
    </div>
  );
}

function MoodPicker({ initial }: { initial: string[] }) {
  const [sel, setSel] = useState(initial);
  const toggle = (k: string) => {
    const next = sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k];
    setSel(next);
    rpc("updateUser", { moods: next });
  };
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 9 }}>{MOOD_ORDER.map((k) => <MoodChip key={k} mood={k} active={sel.includes(k)} onClick={() => toggle(k)} />)}</div>;
}
