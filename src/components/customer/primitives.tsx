"use client";
// Customer shared primitives — ported 1:1 from components.jsx (Btn, MoodChip,
// Rating, Avatar, PhotoFrame, ExperienceCard, SectionHead, Modal) + data.jsx helpers.
import { useEffect, type ReactNode, type CSSProperties, type ButtonHTMLAttributes } from "react";
import { Icons } from "@/components/Icons";

export type Mood = { key: string; label: string; color: string; soft: string; hex: string; blurb: string };
export const MOODS: Record<string, Mood> = {
  calm: { key: "calm", label: "Calm", color: "var(--m-calm)", soft: "var(--m-calm-soft)", hex: "#3FA89B", blurb: "Slow down & restore" },
  joy: { key: "joy", label: "Joy", color: "var(--m-joy)", soft: "var(--m-joy-soft)", hex: "#F4A52B", blurb: "Light, playful fun" },
  energy: { key: "energy", label: "Energy", color: "var(--m-energy)", soft: "var(--m-energy-soft)", hex: "#FF4D74", blurb: "Move & feel alive" },
  focus: { key: "focus", label: "Focus", color: "var(--m-focus)", soft: "var(--m-focus-soft)", hex: "#5563D6", blurb: "Learn & sharpen" },
  adventure: { key: "adventure", label: "Adventure", color: "var(--m-adventure)", soft: "var(--m-adventure-soft)", hex: "#7B53F0", blurb: "Thrill & the new" },
  connect: { key: "connect", label: "Connection", color: "var(--m-connect)", soft: "var(--m-connect-soft)", hex: "#FF8A4C", blurb: "Together with others" },
};
export const MOOD_ORDER = ["calm", "joy", "energy", "focus", "adventure", "connect"];
export const CITIES = ["Moscow", "Saint Petersburg", "Kazan"];
export const CATS = ["Wellness", "Movement", "Creative", "Thrill", "Mind", "Adventure"];
export const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const dow = (day: number) => (day - 1) % 7;

export const fmt = (n: number) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";

export type Exp = {
  id: string; title: string; provider: string; providerId?: string; cat: string; mood: string;
  price: number; rating: number | null; reviews: number; dur: string; city: string; area: string;
  gradient?: string; img?: string | null; spots: number; tags: string[]; about: string;
};
// background CSS — real photo if available, else mood gradient (mirrors bg() in data.jsx)
export const bg = (e: Exp) => (e && e.img ? `center/cover no-repeat url('${e.img}')` : e?.gradient || "");

export function Btn({ variant = "primary", size = "md", block, icon, iconR, children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft"; size?: "lg" | "md" | "sm"; block?: boolean; icon?: ReactNode; iconR?: ReactNode;
}) {
  return <button className={`btn btn-${variant} btn-${size} ${block ? "btn-block" : ""}`} {...p}>{icon}{children}{iconR}</button>;
}

export function MoodDot({ mood, size = 9 }: { mood: string; size?: number }) {
  const m = MOODS[mood];
  return <span className="mood-dot" style={{ width: size, height: size, background: m.color }} />;
}

export function MoodChip({ mood, active, onClick }: { mood: string; active?: boolean; onClick?: () => void }) {
  const m = MOODS[mood];
  return (
    <button className="mood-chip" onClick={onClick}
      style={active ? { background: m.color, color: "#fff", borderColor: m.color } : { background: m.soft, color: m.color, borderColor: "transparent" }}>
      <span className="mood-dot" style={{ background: active ? "#fff" : m.color }} />{m.label}
    </button>
  );
}

export function Rating({ value, reviews }: { value: number; reviews?: number | null }) {
  return <span className="rating"><Icons.star size={15} />{value}{reviews != null && <span style={{ color: "var(--ink-3)", fontWeight: 600 }}>({reviews})</span>}</span>;
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.42 }}>{(name || "?")[0]}</div>;
}

export function PhotoFrame({ exp, children, ratio }: { exp: Exp; children?: ReactNode; ratio?: string }) {
  return (
    <div className="xphoto" style={{ background: bg(exp), ...(ratio ? { aspectRatio: ratio } : {}) }}>
      <div className="grain" /><div className="veil" />{children}
    </div>
  );
}

export function ExperienceCard({ exp, onOpen, fav, onFav }: { exp: Exp; onOpen: (e: Exp) => void; fav?: boolean; onFav?: (id: string) => void }) {
  const m = MOODS[exp.mood];
  return (
    <article className="xcard" onClick={() => onOpen(exp)}>
      <PhotoFrame exp={exp}>
        <span className="cat">{exp.cat}</span>
        <button className={`fav ${fav ? "on" : ""}`} onClick={(e) => { e.stopPropagation(); onFav?.(exp.id); }}><Icons.heart size={17} fill={fav} /></button>
        <div className="ttl">{exp.title}</div>
      </PhotoFrame>
      <div className="xbody">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <span className="mood-chip" style={{ background: m.soft, color: m.color, padding: "5px 11px 5px 9px", fontSize: 12 }}>
            <MoodDot mood={exp.mood} size={7} />{m.label}
          </span>
          {exp.rating ? <Rating value={exp.rating} reviews={exp.reviews} />
            : <span className="tag" style={{ background: "var(--coral-soft)", color: "var(--coral-deep)", border: "none", fontWeight: 700 }}>New</span>}
        </div>
        <div className="xmeta">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icons.pin size={14} />{exp.area}</span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Icons.clock size={14} />{exp.dur}</span>
        </div>
        <div className="xrow">
          <span className="price">{fmt(exp.price)} <small>/ person</small></span>
          <span style={{ color: "var(--coral-deep)", display: "inline-flex" }}><Icons.arrowR size={20} /></span>
        </div>
      </div>
    </article>
  );
}

export function SectionHead({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="shead">
      <div>{eyebrow && <div className="eyebrow" style={{ marginBottom: 7 }}>{eyebrow}</div>}<h2 style={{ fontSize: 26 }}>{title}</h2></div>
      {action}
    </div>
  );
}

export function Modal({ children, onClose, maxWidth }: { children: ReactNode; onClose: () => void; maxWidth?: number }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [onClose]);
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" style={maxWidth ? { maxWidth } : undefined} onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

// deterministic QR-ish pattern (1:1 with detail.jsx QR)
export function QR() {
  const cells: JSX.Element[] = [];
  const N = 11;
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const finder = (x < 3 && y < 3) || (x > N - 4 && y < 3) || (x < 3 && y > N - 4);
    const on = finder ? (x === 0 || x === 2 || x === N - 1 || x === N - 3 || y === 0 || y === 2 || y === N - 1 || y === N - 3 || (x < 3 && y < 3)) : rnd() > 0.5;
    if (finder || on) cells.push(<rect key={`${x}-${y}`} x={x * 9 + 2} y={y * 9 + 2} width={8} height={8} rx={2} fill="#161214" />);
  }
  return <svg viewBox="0 0 103 103" width="150" height="150" style={{ background: "#fff", borderRadius: 12, padding: 6 }}>{cells}</svg>;
}

export function BusyBtn({ busy, children, icon, className = "btn btn-primary btn-md", disabled, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { busy?: boolean; icon?: ReactNode }) {
  return <button className={className} disabled={busy || disabled} {...p}>{busy ? <span className="jm-spin" /> : icon}{children}</button>;
}
