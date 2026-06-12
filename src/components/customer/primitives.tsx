"use client";

import {
  useEffect,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";
import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";
import { MOODS, type Mood } from "@/lib/constants";
import { btnCls } from "@/lib/btn";

export { MOODS, type Mood };
export const MOOD_ORDER = [
  "calm",
  "joy",
  "energy",
  "focus",
  "adventure",
  "connect",
];
export const CITIES = ["Moscow", "Saint Petersburg", "Kazan"];
export const CATS = [
  "Wellness",
  "Movement",
  "Creative",
  "Thrill",
  "Mind",
  "Adventure",
];
export const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const dow = (day: number) => (day - 1) % 7;

export const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(n) + " ₽";

export type Exp = {
  id: string;
  title: string;
  provider: string;
  providerId?: string;
  cat: string;
  mood: string;
  price: number;
  rating: number | null;
  reviews: number;
  dur: string;
  city: string;
  area: string;
  gradient?: string;
  img?: string | null;
  spots: number;
  tags: string[];
  about: string;
};

export const bg = (e: Exp) =>
  e && e.img ? `center/cover no-repeat url('${e.img}')` : e?.gradient || "";

export function Btn({
  variant = "primary",
  size = "md",
  block,
  icon,
  iconR,
  children,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "soft";
  size?: "lg" | "md" | "sm";
  block?: boolean;
  icon?: ReactNode;
  iconR?: ReactNode;
}) {
  return (
    <button
      className={btnCls("app", variant, size, block)}
      {...p}
    >
      {icon}
      {children}
      {iconR}
    </button>
  );
}

export function MoodDot({ mood, size = 9 }: { mood: string; size?: number }) {
  const m = MOODS[mood];
  return (
    <span
      className="rounded-pill flex-none"
      style={{ width: size, height: size, background: m.color }}
    />
  );
}

export function MoodChip({
  mood,
  active,
  onClick,
}: {
  mood: string;
  active?: boolean;
  onClick?: () => void;
}) {
  const t = useT();
  const m = MOODS[mood];
  return (
    <button
      className="inline-flex items-center gap-[8px] pt-[7px] pr-[13px] pb-[7px] pl-[11px] rounded-pill text-[13px] font-bold cursor-pointer [transition:0.14s] border-[1.5px] border-solid border-transparent"
      onClick={onClick}
      style={
        active
          ? { background: m.color, color: "#fff", borderColor: m.color }
          : { background: m.soft, color: m.color, borderColor: "transparent" }
      }
    >
      <span
        className="rounded-pill flex-none"
        style={{ width: 9, height: 9, background: active ? "#fff" : m.color }}
      />
      {t(m.label)}
    </button>
  );
}

export function Rating({
  value,
  reviews,
}: {
  value: number;
  reviews?: number | null;
}) {
  return (
    <span className="inline-flex items-center gap-[5px] font-bold text-[13.5px] text-ink [&_svg]:text-m-joy">
      <Icons.star size={15} />
      {value}
      {reviews != null && (
        <span className="text-ink-3 font-semibold">({reviews})</span>
      )}
    </span>
  );
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      className="rounded-pill bg-[linear-gradient(140deg,var(--red),var(--orange))] text-[#fff] grid place-items-center font-extrabold font-display flex-none"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {(name || "?")[0]}
    </div>
  );
}

export function PhotoFrame({
  exp,
  children,
  ratio,
}: {
  exp: Exp;
  children?: ReactNode;
  ratio?: string;
}) {
  return (
    <div
      className="relative aspect-[4/3] overflow-hidden"
      style={{ background: bg(exp), ...(ratio ? { aspectRatio: ratio } : {}) }}
    >
      <div className="absolute inset-0 opacity-[0.16] mix-blend-overlay bg-[radial-gradient(rgba(255,255,255,0.9)_0.6px,transparent_0.6px)] bg-[length:7px_7px]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.42))]" />
      {children}
    </div>
  );
}

export function ExperienceCard({
  exp,
  onOpen,
  fav,
  onFav,
}: {
  exp: Exp;
  onOpen: (e: Exp) => void;
  fav?: boolean;
  onFav?: (id: string) => void;
}) {
  const t = useT();
  const m = MOODS[exp.mood];
  return (
    <article
      className="cursor-pointer flex flex-col overflow-hidden bg-surface border border-line rounded-lg [transition:0.2s] hover:-translate-y-[4px] hover:shadow-lg hover:border-transparent"
      onClick={() => onOpen(exp)}
    >
      <PhotoFrame exp={exp}>
        <span className="absolute top-[12px] left-[12px] bg-[rgba(255,255,255,0.92)] text-[#241c2e] px-[11px] py-[5px] rounded-pill text-[11.5px] font-bold tracking-[0.01em]">
          {t(exp.cat)}
        </span>
        <button
          className={`absolute top-[10px] right-[10px] w-[34px] h-[34px] rounded-pill border-none bg-[rgba(255,255,255,0.85)] grid place-items-center [transition:0.15s] cursor-pointer hover:bg-[#fff] hover:scale-[1.08] ${fav ? "text-m-energy" : "text-[#241c2e]"}`}
          onClick={(e) => {
            e.stopPropagation();
            onFav?.(exp.id);
          }}
        >
          <Icons.heart size={17} fill={fav} />
        </button>
        <div className="absolute left-[14px] right-[14px] bottom-[12px] text-[#fff] font-display font-bold text-[18px] tracking-[-0.01em] leading-[1.1] [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
          {exp.title}
        </div>
      </PhotoFrame>
      <div className="px-[16px] pt-[14px] pb-[16px] flex flex-col gap-[10px]">
        <div className="flex items-center justify-between gap-[8px]">
          <span
            className="inline-flex items-center gap-[8px] rounded-pill font-bold cursor-pointer [transition:0.14s] border-[1.5px] border-solid border-transparent"
            style={{
              background: m.soft,
              color: m.color,
              padding: "5px 11px 5px 9px",
              fontSize: 12,
            }}
          >
            <MoodDot mood={exp.mood} size={7} />
            {t(m.label)}
          </span>
          {exp.rating ? (
            <Rating value={exp.rating} reviews={exp.reviews} />
          ) : (
            <span
              className="inline-flex items-center px-[11px] py-[5px] rounded-pill text-[12px] font-semibold bg-surface-2 text-ink-2 border border-line"
              style={{
                background: "var(--coral-soft)",
                color: "var(--coral-deep)",
                border: "none",
                fontWeight: 700,
              }}
            >
              {t("New")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-[12px] text-ink-3 text-[13px] font-semibold">
          <span className="inline-flex items-center gap-[5px]">
            <Icons.pin size={14} />
            {exp.area}
          </span>
          <span className="inline-flex items-center gap-[5px]">
            <Icons.clock size={14} />
            {exp.dur}
          </span>
        </div>
        <div className="flex items-center justify-between mt-[2px]">
          <span className="font-display font-bold text-[18px] text-ink whitespace-nowrap [&_small]:font-semibold [&_small]:text-[12.5px] [&_small]:text-ink-3">
            {fmt(exp.price)} <small>/ {t("person")}</small>
          </span>
          <span className="text-coral-deep inline-flex">
            <Icons.arrowR size={20} />
          </span>
        </div>
      </div>
    </article>
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
    <div className="flex items-end justify-between gap-[16px] mb-[18px]">
      <div>
        {eyebrow && (
          <div className="text-[12.5px] font-bold tracking-[0.1em] uppercase text-orange" style={{ marginBottom: 7 }}>
            {eyebrow}
          </div>
        )}
        <h2 className="text-[26px]">{title}</h2>
      </div>
      {action}
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
    <div
      className="fixed inset-0 bg-[rgba(20,14,26,0.55)] [backdrop-filter:blur(4px)] z-[100] flex items-end justify-center min-[760px]:items-center min-[760px]:p-[30px] animate-anim-fade motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        className="bg-bg w-full max-w-[560px] rounded-t-xl max-h-[92vh] overflow-auto min-[760px]:rounded-xl animate-anim-slideup motion-reduce:animate-none"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export function QR() {
  const cells: JSX.Element[] = [];
  const N = 11;
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const finder =
        (x < 3 && y < 3) || (x > N - 4 && y < 3) || (x < 3 && y > N - 4);
      const on = finder
        ? x === 0 ||
          x === 2 ||
          x === N - 1 ||
          x === N - 3 ||
          y === 0 ||
          y === 2 ||
          y === N - 1 ||
          y === N - 3 ||
          (x < 3 && y < 3)
        : rnd() > 0.5;
      if (finder || on)
        cells.push(
          <rect
            key={`${x}-${y}`}
            x={x * 9 + 2}
            y={y * 9 + 2}
            width={8}
            height={8}
            rx={2}
            fill="#161214"
          />,
        );
    }
  return (
    <svg
      viewBox="0 0 103 103"
      width="150"
      height="150"
      className="bg-[#fff] rounded-sm p-[6px]"
    >
      {cells}
    </svg>
  );
}

export { BusyBtn } from "@/components/ui/busy-btn";
