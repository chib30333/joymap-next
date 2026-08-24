"use client";

import { useEffect, type ReactNode } from "react";
import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";
import {
  MOODS,
  MOOD_ORDER,
  CITIES,
  CATS,
  WD,
  dow,
  type Mood,
} from "@/constants";

// Re-exported from the single source of truth in src/constants so existing
// customer-area imports (`from "./primitives"`) keep working.
export { MOODS, MOOD_ORDER, CITIES, CATS, WD, dow, type Mood };

export const fmt = (n: number) =>
  new Intl.NumberFormat("ru-RU").format(n) + " ₽";

// Local helper: typed CSS custom-property maps without repeating the
// `as React.CSSProperties` cast at every call site. The returned object is
// identical at runtime to the literal it wraps.
export const cssVars = (
  vars: Record<`--${string}`, string>,
): React.CSSProperties => vars as React.CSSProperties;

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

export function MoodDot({ mood, size = 9 }: { mood: string; size?: number }) {
  const m = MOODS[mood];
  return (
    <span
      className="rounded-pill flex-none [width:var(--s)] [height:var(--s)] [background:var(--bg)]"
      style={cssVars({ "--s": size + "px", "--bg": m.color })}
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
      className="inline-flex items-center gap-2 pt-2 pr-3.5 pb-2 pl-3 rounded-pill text-sm font-bold cursor-pointer duration-[140ms] border-2 border-solid [background:var(--bg)] [color:var(--fg)] [border-color:var(--bd)]"
      onClick={onClick}
      style={
        active
          ? cssVars({ "--bg": m.color, "--fg": "#fff", "--bd": m.color })
          : cssVars({ "--bg": m.soft, "--fg": m.color, "--bd": "transparent" })
      }
    >
      <span
        className="rounded-pill flex-none w-2.5 h-2.5 [background:var(--dot)]"
        style={cssVars({ "--dot": active ? "#fff" : m.color })}
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
    <span className="inline-flex items-center gap-1.5 font-bold text-sm text-ink [&_svg]:text-m-joy">
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
      className="rounded-pill bg-[linear-gradient(140deg,var(--red),var(--orange))] text-white grid place-items-center font-extrabold font-display flex-none [width:var(--s)] [height:var(--s)] [font-size:var(--fs)]"
      style={cssVars({ "--s": size + "px", "--fs": size * 0.42 + "px" })}
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
      className="relative aspect-[var(--ar,4/3)] overflow-hidden [background:var(--bg)]"
      style={cssVars({ "--bg": bg(exp), ...(ratio ? { "--ar": ratio } : {}) })}
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
      className="cursor-pointer flex flex-col overflow-hidden bg-surface border border-line rounded-lg duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-transparent"
      onClick={() => onOpen(exp)}
    >
      <PhotoFrame exp={exp}>
        <span className="absolute top-3 left-3 bg-[rgba(255,255,255,0.92)] text-[#241c2e] px-3 py-1.5 rounded-pill text-xs font-bold tracking-normal">
          {t(exp.cat)}
        </span>
        <button
          className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-pill border-none bg-[rgba(255,255,255,0.85)] grid place-items-center duration-150 cursor-pointer hover:bg-white hover:scale-[1.08] ${fav ? "text-m-energy" : "text-[#241c2e]"}`}
          onClick={(e) => {
            e.stopPropagation();
            onFav?.(exp.id);
          }}
        >
          <Icons.heart size={17} fill={fav} />
        </button>
        <div className="absolute left-3.5 right-3.5 bottom-3 text-white font-display font-bold text-lg tracking-normal leading-none [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
          {exp.title}
        </div>
      </PhotoFrame>
      <div className="px-4 pt-3.5 pb-4 flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <span
            className="inline-flex items-center gap-2 rounded-pill font-bold cursor-pointer duration-[140ms] border-2 border-solid border-transparent px-2.5 py-1.5 text-xs [background:var(--bg)] [color:var(--fg)]"
            style={cssVars({ "--bg": m.soft, "--fg": m.color })}
          >
            <MoodDot mood={exp.mood} size={7} />
            {t(m.label)}
          </span>
          {exp.rating ? (
            <Rating value={exp.rating} reviews={exp.reviews} />
          ) : (
            <span className="inline-flex items-center px-3 py-1.5 rounded-pill text-xs [background:var(--coral-soft)] [color:var(--coral-deep)] [border:none] font-bold">
              {t("New")}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-ink-3 text-sm font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <Icons.pin size={14} />
            {exp.area}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Icons.clock size={14} />
            {exp.dur}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="font-display font-bold text-lg text-ink whitespace-nowrap [&_small]:font-semibold [&_small]:text-[12.5px] [&_small]:text-ink-3">
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
    <div className="flex items-end justify-between gap-3 sm:gap-4 mb-5 flex-wrap">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-xs font-bold tracking-widest uppercase text-orange mb-2">
            {eyebrow}
          </div>
        )}
        <h2 className="text-xl sm:text-2xl">{title}</h2>
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
      className="fixed inset-0 bg-[rgba(20,14,26,0.55)] [backdrop-filter:blur(4px)] z-[100] flex items-end justify-center min-[760px]:items-center min-[760px]:p-8 animate-anim-fade motion-reduce:animate-none"
      onClick={onClose}
    >
      <div
        className="bg-bg w-full max-w-[var(--mw,560px)] rounded-t-xl max-h-[92dvh] overflow-auto overscroll-contain pb-[env(safe-area-inset-bottom)] min-[760px]:rounded-xl min-[760px]:pb-0 animate-anim-slideup motion-reduce:animate-none"
        style={maxWidth ? cssVars({ "--mw": maxWidth + "px" }) : undefined}
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
      className="bg-white rounded-sm p-1.5"
    >
      {cells}
    </svg>
  );
}
