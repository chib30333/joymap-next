"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
  type CSSProperties,
} from "react";
import { statusColor } from "@/components/ui/pill";
import { btnCls } from "@/lib/btn";

export const money = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(Math.round(n)) + "\u00A0₽";

export function Btn({
  variant = "primary",
  size = "md",
  block,
  icon,
  iconR,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft" | "orange";
  size?: "lg" | "md" | "sm";
  block?: boolean;
  icon?: ReactNode;
  iconR?: ReactNode;
}) {
  return (
    <button
      className={btnCls("dash", variant, size, block)}
      {...p}
    >
      {icon}
      {children}
      {iconR}
    </button>
  );
}
export function Avatar({
  name,
  size = 40,
  grad,
}: {
  name: string;
  size?: number;
  grad?: string;
}) {
  return (
    <div
      className="grid place-items-center rounded-[99px] bg-[linear-gradient(140deg,var(--coral),var(--orange))] text-white font-extrabold font-display flex-none"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        ...(grad ? { background: grad } : {}),
      }}
    >
      {(name || "?")[0]}
    </div>
  );
}

export function Pill({ status, label }: { status: string; label?: string }) {
  const [c, bg] = statusColor(status);
  return (
    <span
      className="inline-flex items-center gap-[6px] py-[4px] px-[11px] rounded-pill text-[12px] font-bold whitespace-nowrap"
      style={{ color: c, background: bg }}
    >
      <span className="w-[6px] h-[6px] rounded-[99px]" style={{ background: c }} />
      {label || status}
    </span>
  );
}
export function Stat({
  label,
  value,
  icon,
  delta,
  deltaDir,
  sub,
  accent,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  delta?: string;
  deltaDir?: "up" | "down";
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="bg-surface border border-line rounded-lg p-5 flex flex-col gap-[6px] animate-anim-pop-dash">
      <div className="text-[13px] font-semibold text-ink-3 flex items-center gap-2">
        {icon && (
          <span
            className="grid place-items-center flex-none"
            style={{
              width: 28,
              height: 28,
              borderRadius: 9,
              background: accent
                ? `color-mix(in srgb,${accent} 14%,transparent)`
                : undefined,
              color: accent,
            }}
          >
            {icon}
          </span>
        )}
        {label}
      </div>
      <div className="font-display font-extrabold text-[30px] tracking-[-0.02em] leading-none whitespace-nowrap">{value}</div>
      <div className="flex items-center gap-[8px]">
        {delta != null && (
          <span
            className={`inline-flex items-center gap-[3px] text-[12.5px] font-bold ${deltaDir === "down" ? "text-coral" : "text-[#1fa46e]"}`}
          >
            {deltaDir === "down" ? "▾" : "▴"} {delta}
          </span>
        )}
        {sub && (
          <span className="text-[12.5px] text-ink-3 font-semibold">{sub}</span>
        )}
      </div>
    </div>
  );
}
export function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-[18px]">
      <div>
        {eyebrow && (
          <div className="text-[12px] font-extrabold tracking-[0.1em] uppercase text-orange" style={{ marginBottom: 7 }}>
            {eyebrow}
          </div>
        )}
        <h2 className="text-[24px]">{title}</h2>
      </div>
      {action}
    </div>
  );
}
export function Seg({
  value,
  options,
  onChange,
}: {
  value: string;
  options: ({ v: string; l: string } | string)[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="seg">
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.v;
        const l = typeof o === "string" ? o : o.l;
        return (
          <button
            key={v}
            className={value === v ? "on" : ""}
            onClick={() => onChange(v)}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
export function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={`w-[42px] h-[24px] rounded-[99px] relative [transition:0.18s] cursor-pointer flex-none ${on ? "bg-coral" : "bg-line-2"}`}
      onClick={() => onChange(!on)}
    >
      <i
        className={`absolute top-[3px] w-[18px] h-[18px] rounded-[99px] bg-white [transition:0.18s] shadow-[0_1px_3px_rgba(0,0,0,0.2)] ${on ? "left-[21px]" : "left-[3px]"}`}
      />
    </div>
  );
}
export function Modal({
  children,
  onClose,
  maxWidth,
}: {
  children: ReactNode;
  onClose: () => void;
  maxWidth?: number;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", k);
      document.body.style.overflow = "";
    };
  }, [onClose]);
  return (
    <div className="scrim" onClick={onClose}>
      <div
        className="sheet"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function Bars({
  data,
  unit = "",
  h = 160,
  accent = "var(--coral)",
}: {
  data: { label: string; value: number; short?: string; hot?: boolean }[];
  unit?: string;
  h?: number;
  accent?: string;
}) {
  const max = Math.max(...data.map((d) => d.value)) || 1;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: 10,
        height: h,
        paddingTop: 18,
      }}
    >
      {data.map((d, i) => {
        const pct = d.value / max;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              height: "100%",
              justifyContent: "flex-end",
            }}
          >
            <span
              style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-2)" }}
            >
              {d.short ||
                (unit === "₽" ? Math.round(d.value / 1000) + "k" : d.value)}
            </span>
            <div
              title={d.value + unit}
              className="origin-bottom animate-[grow_0.6s_both]"
              style={{
                width: "72%",
                maxWidth: 34,
                borderRadius: "7px 7px 3px 3px",
                background: d.hot
                  ? accent
                  : "color-mix(in srgb,var(--coral) 26%,transparent)",
                height: `${Math.max(pct * 100, 4)}%`,
                transition: ".3s",
                animationDelay: `${i * 0.05}s`,
              }}
            />
            <span
              style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink-3)" }}
            >
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function LineChart({
  points,
  h = 180,
  unit = "₽",
  accent = "var(--coral)",
  caption = "Value",
  valFmt,
}: {
  points: { label: string; value: number }[];
  h?: number;
  unit?: string;
  accent?: string;
  caption?: string;
  valFmt?: (v: number) => string;
}) {
  const w = 560,
    pad = 8;
  const fmt = valFmt || ((v: number) => v + unit);
  const max = Math.max(...points.map((p) => p.value)),
    min = Math.min(...points.map((p) => p.value));
  const rng = max - min || 1;
  const xs = (i: number) => pad + (i * (w - 2 * pad)) / (points.length - 1);
  const ys = (v: number) => pad + (1 - (v - min) / rng) * (h - 2 * pad - 20);
  const path = points
    .map(
      (p, i) => `${i ? "L" : "M"}${xs(i).toFixed(1)} ${ys(p.value).toFixed(1)}`,
    )
    .join(" ");
  const area = `${path} L ${xs(points.length - 1)} ${h - 20} L ${xs(0)} ${h - 20} Z`;
  const [hi, setHi] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const move = (e: React.MouseEvent) => {
    const r = wrapRef.current!.getBoundingClientRect();
    const rel = (e.clientX - r.left) / r.width;
    const x = Math.min(Math.max(rel * w, pad), w - pad);
    const idx = Math.round(((x - pad) / (w - 2 * pad)) * (points.length - 1));
    setHi(Math.min(Math.max(idx, 0), points.length - 1));
  };
  const tipX = hi != null ? `${(xs(hi) / w) * 100}%` : 0;
  const tipY = hi != null ? `${(ys(points[hi].value) / h) * 100}%` : 0;
  return (
    <div
      className="relative"
      ref={wrapRef}
      onMouseMove={move}
      onMouseLeave={() => setHi(null)}
    >
      <svg
        viewBox={`0 0 ${w} ${h}`}
        width="100%"
        height={h}
        preserveAspectRatio="none"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={accent} stopOpacity=".22" />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#lg)" />
        <path
          d={path}
          fill="none"
          stroke={accent}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hi != null && (
          <line
            x1={xs(hi)}
            y1={pad - 4}
            x2={xs(hi)}
            y2={h - 20}
            stroke={accent}
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity=".55"
          />
        )}
        {points.map((p, i) => (
          <g key={i}>
            <circle
              cx={xs(i)}
              cy={ys(p.value)}
              r={hi === i ? 5.5 : 3.5}
              fill={hi === i ? accent : "var(--surface)"}
              stroke={accent}
              strokeWidth="2.5"
              style={{ transition: "r .12s" }}
            />
            <text
              x={xs(i)}
              y={h - 4}
              fontSize="11"
              fontWeight="700"
              fill={hi === i ? "var(--ink)" : "var(--ink-3)"}
              textAnchor="middle"
              fontFamily="var(--body)"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      <div
        className={`absolute z-30 pointer-events-none translate-x-[-50%] translate-y-[-118%] bg-ink text-bg py-2 px-[11px] rounded-[10px] shadow-lg whitespace-nowrap font-semibold text-[12.5px] [transition:opacity_0.12s] after:content-[''] after:absolute after:left-1/2 after:top-full after:translate-x-[-50%] after:border-[5px] after:border-solid after:border-transparent after:border-t-ink ${hi != null ? "opacity-100" : "opacity-0"}`}
        style={{ left: tipX, top: tipY }}
      >
        {hi != null && (
          <>
            <div className="flex items-center gap-[6px] text-[11px] font-bold opacity-70 uppercase tracking-[0.04em] mb-[3px]">
              <span className="w-2 h-2 rounded-[99px] flex-none" style={{ background: accent }} />
              {caption} · {points[hi].label}
            </div>
            <div className="font-display font-extrabold text-[15px] tracking-[-0.01em]">{fmt(points[hi].value)}</div>
          </>
        )}
      </div>
    </div>
  );
}

export function Donut({
  segments,
  size = 150,
  thick = 22,
  center,
  valFmt,
  unit = "",
}: {
  segments: { label: string; value: number; color: string }[];
  size?: number;
  thick?: number;
  center?: { v: string; l: string };
  valFmt?: (seg: any, total: number) => string;
  unit?: string;
}) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  let acc = 0;
  const r = (size - thick) / 2,
    c = size / 2,
    circ = 2 * Math.PI * r;
  const [hi, setHi] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const wrapRef = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const box = wrapRef.current!.getBoundingClientRect();
    const mx = e.clientX - box.left,
      my = e.clientY - box.top;
    setPos({ x: mx, y: my });
    const dx = mx - c,
      dy = my - c,
      dist = Math.hypot(dx, dy);
    if (dist < r - thick / 2 - 3 || dist > r + thick / 2 + 3) {
      setHi(null);
      return;
    }
    let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
    ang = (ang + 90 + 360) % 360;
    const frac = (ang / 360) * total;
    let a = 0,
      found: number | null = null;
    for (let i = 0; i < segments.length; i++) {
      if (frac >= a && frac < a + segments[i].value) {
        found = i;
        break;
      }
      a += segments[i].value;
    }
    setHi(found);
  };
  const seg = hi != null ? segments[hi] : null;
  return (
    <div
      className="relative"
      ref={wrapRef}
      style={{ width: size, height: size, flex: "none" }}
      onMouseMove={onMove}
      onMouseLeave={() => setHi(null)}
    >
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        {segments.map((s, i) => {
          const len = (s.value / total) * circ;
          const el = (
            <circle
              key={i}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={hi === i ? thick + 6 : thick}
              strokeDasharray={`${len} ${circ - len}`}
              strokeDashoffset={-acc}
              strokeLinecap="butt"
              opacity={hi == null || hi === i ? 1 : 0.4}
              style={{ transition: "stroke-width .12s, opacity .12s" }}
            />
          );
          acc += len;
          return el;
        })}
      </svg>
      {center && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--display)",
                fontWeight: 800,
                fontSize: 22,
                lineHeight: 1,
              }}
            >
              {seg ? `${Math.round((seg.value / total) * 100)}%` : center.v}
            </div>
            <div
              style={{ fontSize: 11.5, color: "var(--ink-3)", fontWeight: 600 }}
            >
              {seg ? seg.label : center.l}
            </div>
          </div>
        </div>
      )}
      <div
        className={`absolute z-30 pointer-events-none translate-x-[-50%] translate-y-[-118%] bg-ink text-bg py-2 px-[11px] rounded-[10px] shadow-lg whitespace-nowrap font-semibold text-[12.5px] [transition:opacity_0.12s] after:content-[''] after:absolute after:left-1/2 after:top-full after:translate-x-[-50%] after:border-[5px] after:border-solid after:border-transparent after:border-t-ink ${seg ? "opacity-100" : "opacity-0"}`}
        style={{ left: pos.x, top: pos.y }}
      >
        {seg && (
          <>
            <div className="flex items-center gap-[6px] text-[11px] font-bold opacity-70 uppercase tracking-[0.04em] mb-[3px]">
              <span className="w-2 h-2 rounded-[99px] flex-none" style={{ background: seg.color }} />
              {seg.label}
            </div>
            <div className="font-display font-extrabold text-[15px] tracking-[-0.01em]">
              {valFmt ? valFmt(seg, total) : `${seg.value}${unit}`}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export { BusyBtn } from "@/components/ui/busy-btn";
