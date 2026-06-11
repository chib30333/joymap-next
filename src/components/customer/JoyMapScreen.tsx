"use client";
// JoyMapScreen — 1:1 port of screens.jsx JoyMapScreen (hero, mood arc, day cards).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import { MOODS, fmt, PhotoFrame, MoodDot, BusyBtn, type Exp } from "./primitives";
import { ServiceModal, type Slot } from "./ServiceModal";
import { useFav } from "./useFav";

type Day = { day: number; wd: string; date: string; rest?: boolean; expId: string | null; time?: string; note: string };
const TODAY = 10;

export function JoyMapScreen({ map, bookings, catalog, favs, userName, userMoods, slotsByService, wallet }: {
  map: Day[]; bookings: any[]; catalog: Exp[]; favs: string[]; userName: string; userMoods: string[];
  slotsByService: Record<string, Slot[]>; wallet: number;
}) {
  const router = useRouter();
  const { busy, run } = useBusy();
  const [open, setOpen] = useState<Exp | null>(null);
  const onFav = useFav();
  const byId = (id: string | null) => catalog.find((e) => e.id === id) || null;
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const weekLabel = `${TODAY}–${Math.min(TODAY + 6, 30)} Jun`;
  const days = map.filter((d) => !d.rest && d.expId && byId(d.expId));
  const regen = () => run(() => rpc("generateJoyMap", {}), () => router.refresh());

  return (
    <div className="anim-fade">
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginTop: 6, marginBottom: 22 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 9 }}>This week · {weekLabel}</div>
          <h1 style={{ fontSize: "clamp(30px,4vw,44px)", maxWidth: 560, lineHeight: 1.02 }}>
            {greet}, {userName}. <span style={{ color: "var(--orange)" }}>Here&apos;s your week of joy.</span>
          </h1>
          <p style={{ color: "var(--ink-2)", fontSize: 16, marginTop: 12, maxWidth: 520 }}>
            Seven days, tuned to how you want to feel. Booked days are locked in — swap anything that doesn&apos;t fit.
          </p>
        </div>
        <BusyBtn busy={busy} className="btn btn-ghost btn-md" icon={<Icons.refresh size={18} />} onClick={regen}>Regenerate</BusyBtn>
      </div>

      {catalog.length === 0 ? (
        <EmptyMarketplace />
      ) : map.length === 0 ? (
        <div className="card" style={{ padding: "56px 24px", textAlign: "center" }}>
          <div style={{ width: 60, height: 60, borderRadius: 99, background: "var(--coral-soft)", color: "var(--coral-deep)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Icons.sparkle size={26} /></div>
          <h3 style={{ fontSize: 20 }}>No Joy Map yet</h3>
          <p style={{ color: "var(--ink-2)", fontSize: 14.5, margin: "8px auto 18px", maxWidth: 380 }}>Let Joy compose a week of experiences around your moods.</p>
          <BusyBtn busy={busy} className="btn btn-primary btn-md" icon={<Icons.sparkle size={17} />} onClick={regen}>Build my week</BusyBtn>
        </div>
      ) : (
        <>
          <MoodArc map={map} byId={byId} />
          <div style={{ position: "relative", marginTop: 26 }}>
            <div className="no-scrollbar" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 10, scrollSnapType: "x proximity" }}>
              {map.map((d, i) => <DayCard key={d.day} d={d} i={i} byId={byId} onOpen={setOpen} bookings={bookings} />)}
            </div>
          </div>
          {days.length > 0 && (
            <div className="card-fill" style={{ marginTop: 26, padding: "22px 24px", display: "flex", gap: 18, alignItems: "flex-start" }}>
              <div className="ricon" style={{ width: 44, height: 44, borderRadius: 14 }}><Icons.sparkle size={22} /></div>
              <div>
                <h3 style={{ fontSize: 17, marginBottom: 6 }}>Why Joy built this week</h3>
                <p style={{ color: "rgba(243,235,224,.85)", fontSize: 14.5, lineHeight: 1.55, maxWidth: 760 }}>
                  You asked for more <b style={{ color: "#FFF3E8" }}>{(userMoods || []).map((k) => MOODS[k] ? MOODS[k].label.toLowerCase() : k).join(", ") || "joy"}</b>. The week balances restorative mornings with playful evenings — and keeps a true rest day so the week breathes.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {open && <ServiceModal exp={open} slots={slotsByService[open.id] || []} wallet={wallet} fav={favs.includes(open.id)} onFav={onFav} onClose={() => setOpen(null)} />}
    </div>
  );
}

export function EmptyMarketplace() {
  return (
    <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
      <div style={{ width: 64, height: 64, borderRadius: 99, background: "var(--surface-2)", display: "grid", placeItems: "center", margin: "0 auto 16px", color: "var(--ink-3)" }}><Icons.compass size={30} /></div>
      <h3 style={{ fontSize: 20, color: "var(--ink)" }}>The marketplace is empty</h3>
      <p style={{ color: "var(--ink-2)", fontSize: 14.5, margin: "8px auto 0", maxWidth: 420, lineHeight: 1.55 }}>
        No experiences have been published yet. Sign up as a <b>provider</b> to list one (an admin approves it), or run <code>npm run db:seed</code> to fill the platform.
      </p>
    </div>
  );
}

function MoodArc({ map, byId }: { map: Day[]; byId: (id: string | null) => Exp | null }) {
  return (
    <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, overflowX: "auto" }}>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--ink-3)", letterSpacing: ".04em", textTransform: "uppercase", flex: "none" }}>Your emotional arc</span>
      <div style={{ display: "flex", alignItems: "center", gap: 0, flex: 1, minWidth: 420 }}>
        {map.map((d) => {
          const e = d.rest ? null : byId(d.expId);
          const m = e ? MOODS[e.mood] : null;
          return (
            <div key={d.day} style={{ textAlign: "center", flex: 1 }}>
              <div style={{ height: 8, borderRadius: 99, background: m ? m.color : "var(--line-2)", marginBottom: 6, boxShadow: m ? `0 2px 8px ${m.color}55` : "none" }} />
              <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)" }}>{d.wd}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayCard({ d, i, byId, onOpen, bookings }: { d: Day; i: number; byId: (id: string | null) => Exp | null; onOpen: (e: Exp) => void; bookings: any[] }) {
  const today = d.day === TODAY;
  const e = d.rest ? null : byId(d.expId);
  if (d.rest || !e) {
    return (
      <div className="card anim-pop" style={{ flex: "none", width: 230, scrollSnapAlign: "start", padding: 20, display: "flex", flexDirection: "column", background: "var(--surface-2)", borderStyle: "dashed", animationDelay: `${i * 0.06}s` }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 15 }}>{d.wd} · {d.date}</span>
          {today && <span style={{ background: "var(--coral)", color: "#fff", padding: "3px 9px", borderRadius: 99, fontSize: 10.5, fontWeight: 800 }}>TODAY</span>}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: 10, padding: "18px 0" }}>
          <div style={{ width: 48, height: 48, borderRadius: 99, background: "var(--m-calm-soft)", display: "grid", placeItems: "center", color: "var(--m-calm)" }}><Icons.heart size={24} /></div>
          <div style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: 17, whiteSpace: "nowrap" }}>Rest day</div>
          <p style={{ fontSize: 13, color: "var(--ink-3)", margin: 0 }}>{d.note}</p>
        </div>
      </div>
    );
  }
  const m = MOODS[e.mood];
  const booked = (bookings || []).find((b) => b.serviceId === e.id && b.day === d.day && b.status !== "cancelled");
  return (
    <div className="card anim-pop" onClick={() => onOpen(e)} style={{ flex: "none", width: 268, scrollSnapAlign: "start", overflow: "hidden", cursor: "pointer", transition: ".2s", animationDelay: `${i * 0.06}s` }}>
      <PhotoFrame exp={e} ratio="16/11">
        <div style={{ position: "absolute", top: 12, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <span style={{ background: "rgba(255,255,255,.92)", color: "#241C2E", padding: "5px 11px", borderRadius: 99, fontSize: 12, fontWeight: 800 }}>{d.wd} · {d.date}</span>
          {today && <span style={{ background: "var(--coral)", color: "#fff", padding: "5px 10px", borderRadius: 99, fontSize: 11, fontWeight: 800 }}>TODAY</span>}
        </div>
        <div className="ttl" style={{ fontSize: 18 }}>{e.title}</div>
      </PhotoFrame>
      <div style={{ padding: "13px 15px 15px", display: "flex", flexDirection: "column", gap: 11 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="mood-chip" style={{ background: m.soft, color: m.color, padding: "5px 11px 5px 9px", fontSize: 12 }}><MoodDot mood={e.mood} size={7} />{m.label}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "var(--ink-2)" }}><Icons.clock size={14} />{d.time}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "var(--ink-3)", fontWeight: 600 }}>{d.note}</p>
        {booked ? (
          <div className="btn btn-sm" style={{ background: "var(--m-calm-soft)", color: "var(--m-calm)", fontWeight: 700, cursor: "default" }}><Icons.check size={16} />{booked.status === "pending" ? "Requested" : "Booked"} · {booked.time}</div>
        ) : (
          <button className="btn btn-primary btn-sm btn-block" onClick={(ev) => { ev.stopPropagation(); onOpen(e); }}>Book this day</button>
        )}
      </div>
    </div>
  );
}
