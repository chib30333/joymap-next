"use client";
// Catalog — 1:1 port of screens.jsx Catalog (mood rail, filters, sort, grid).
import { useMemo, useState } from "react";
import { Icons } from "@/components/Icons";
import { MOODS, MOOD_ORDER, CATS, MoodChip, ExperienceCard, type Exp } from "./primitives";
import { ServiceModal, type Slot } from "./ServiceModal";
import { EmptyMarketplace } from "./JoyMapScreen";
import { useFav } from "./useFav";

export function Catalog({ list: source, favs, city, slotsByService, wallet, initialQuery }: {
  list: Exp[]; favs: string[]; city: string; slotsByService: Record<string, Slot[]>; wallet: number; initialQuery?: string;
}) {
  const [mood, setMood] = useState<string | null>(null);
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [query, setQuery] = useState(initialQuery || "");
  const [open, setOpen] = useState<Exp | null>(null);
  const onFav = useFav();

  const list = useMemo(() => {
    let l = source;
    if (mood) l = l.filter((e) => e.mood === mood);
    if (cat !== "All") l = l.filter((e) => e.cat === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      l = l.filter((e) => (e.title + e.cat + e.area + MOODS[e.mood].label + e.tags.join()).toLowerCase().includes(q));
    }
    if (sort === "Price") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "Rating") l = [...l].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return l;
  }, [source, mood, cat, sort, query]);

  return (
    <div className="anim-fade">
      <div style={{ marginBottom: 18 }}>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Browse by how you want to feel</div>
        <div className="no-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
          <button className={`chip ${!mood ? "on" : ""}`} style={{ padding: "9px 16px" }} onClick={() => setMood(null)}>All moods</button>
          {MOOD_ORDER.map((k) => <MoodChip key={k} mood={k} active={mood === k} onClick={() => setMood(mood === k ? null : k)} />)}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        {["All", ...CATS].map((c) => <button key={c} className={`chip ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>)}
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--ink-3)", fontSize: 13.5, fontWeight: 600 }}>
          <Icons.filter size={16} />Sort
          <select className="field" style={{ width: "auto", padding: "8px 12px", borderRadius: "var(--r-pill)", fontWeight: 700, fontSize: 13.5 }} value={sort} onChange={(e) => setSort(e.target.value)}>
            {["Recommended", "Price", "Rating"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{list.length} experience{list.length !== 1 ? "s" : ""}</span>
        <span style={{ color: "var(--ink-3)", fontSize: 14 }}>in {city}{mood ? ` · ${MOODS[mood].label}` : ""}</span>
      </div>

      {list.length === 0 ? (
        source.length === 0 && !mood && cat === "All" && !query.trim() ? <EmptyMarketplace /> : <Empty />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: "var(--gap)" }}>
          {list.map((e, i) => (
            <div key={e.id} className="anim-pop" style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}>
              <ExperienceCard exp={e} onOpen={setOpen} fav={favs.includes(e.id)} onFav={onFav} />
            </div>
          ))}
        </div>
      )}

      {open && <ServiceModal exp={open} slots={slotsByService[open.id] || []} wallet={wallet} fav={favs.includes(open.id)} onFav={onFav} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Empty() {
  return (
    <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--ink-3)" }}>
      <div style={{ width: 64, height: 64, borderRadius: 99, background: "var(--surface-2)", display: "grid", placeItems: "center", margin: "0 auto 16px", color: "var(--ink-3)" }}><Icons.search size={28} /></div>
      <h3 style={{ fontSize: 19, color: "var(--ink)" }}>Nothing matches — yet</h3>
      <p style={{ maxWidth: 340, margin: "8px auto 0" }}>Try a different mood or clear your filters to see everything nearby.</p>
    </div>
  );
}
