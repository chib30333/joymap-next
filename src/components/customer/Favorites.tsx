"use client";
// Favorites — 1:1 port of screens.jsx Favorites.
import { useState } from "react";
import { Icons } from "@/components/Icons";
import { ExperienceCard, type Exp } from "./primitives";
import { ServiceModal, type Slot } from "./ServiceModal";
import { useFav } from "./useFav";

export function Favorites({ list, favs, slotsByService, wallet }: { list: Exp[]; favs: string[]; slotsByService: Record<string, Slot[]>; wallet: number }) {
  const [open, setOpen] = useState<Exp | null>(null);
  const onFav = useFav();
  return (
    <div className="anim-fade">
      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "70px 20px", color: "var(--ink-3)" }}>
          <div style={{ width: 64, height: 64, borderRadius: 99, background: "var(--m-energy-soft)", display: "grid", placeItems: "center", margin: "0 auto 16px", color: "var(--m-energy)" }}><Icons.heart size={28} /></div>
          <h3 style={{ fontSize: 19, color: "var(--ink)" }}>No favorites yet</h3>
          <p style={{ maxWidth: 340, margin: "8px auto 0" }}>Tap the heart on any experience to save it here for later.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: "var(--gap)" }}>
          {list.map((e) => <ExperienceCard key={e.id} exp={e} onOpen={setOpen} fav onFav={onFav} />)}
        </div>
      )}
      {open && <ServiceModal exp={open} slots={slotsByService[open.id] || []} wallet={wallet} fav={favs.includes(open.id)} onFav={onFav} onClose={() => setOpen(null)} />}
    </div>
  );
}
