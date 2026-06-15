"use client";

import { useMemo, useState } from "react";
import { Icons } from "@/components/Icons";
import {
  MOODS,
  MOOD_ORDER,
  CATS,
  MoodChip,
  ExperienceCard,
  type Exp,
} from "./primitives";
import { Select } from "@/components/ui";
import { ServiceModal, type Slot } from "./ServiceModal";
import { EmptyMarketplace } from "./JoyMapScreen";
import { useFav } from "@/hooks";
import { useT } from "@/components/Language";

const SORT_OPTIONS = ["Recommended", "Price", "Rating"] as const;

function PillButton({
  active,
  paddingClass,
  onClick,
  children,
}: {
  active: boolean;
  paddingClass: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      className={`inline-flex items-center gap-[7px] ${paddingClass} rounded-pill text-[13px] font-semibold border cursor-pointer [transition:0.14s] whitespace-nowrap ${active ? "bg-coral text-white border-coral" : "bg-surface text-ink-2 border-line-2 hover:border-ink-3 hover:text-ink"}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Catalog({
  list: source,
  favs,
  city,
  slotsByService,
  wallet,
  initialQuery,
}: {
  list: Exp[];
  favs: string[];
  city: string;
  slotsByService: Record<string, Slot[]>;
  wallet: number;
  initialQuery?: string;
}) {
  const t = useT();
  const [mood, setMood] = useState<string | null>(null);
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [query] = useState(initialQuery || "");
  const [open, setOpen] = useState<Exp | null>(null);
  const onFav = useFav();

  const list = useMemo(() => {
    let l = source;
    if (mood) l = l.filter((e) => e.mood === mood);
    if (cat !== "All") l = l.filter((e) => e.cat === cat);
    if (query.trim()) {
      const q = query.toLowerCase();
      l = l.filter((e) =>
        (e.title + e.cat + e.area + MOODS[e.mood].label + e.tags.join())
          .toLowerCase()
          .includes(q),
      );
    }
    if (sort === "Price") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "Rating")
      l = [...l].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return l;
  }, [source, mood, cat, sort, query]);

  return (
    <div className="animate-anim-fade-app">
      <div className="mb-[18px]">
        <div className="text-[12.5px] font-bold tracking-[0.1em] uppercase text-orange mb-[12px]">
          {t("Browse by how you want to feel")}
        </div>
        <div className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex gap-[10px] overflow-x-auto pb-[4px]">
          <PillButton
            active={!mood}
            paddingClass="p-[9px_16px]"
            onClick={() => setMood(null)}
          >
            {t("All moods")}
          </PillButton>
          {MOOD_ORDER.map((k) => (
            <MoodChip
              key={k}
              mood={k}
              active={mood === k}
              onClick={() => setMood(mood === k ? null : k)}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-[10px] flex-wrap mb-[22px]">
        {["All", ...CATS].map((c) => (
          <PillButton
            key={c}
            active={cat === c}
            paddingClass="py-[7px] px-[13px]"
            onClick={() => setCat(c)}
          >
            {t(c)}
          </PillButton>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-[8px] text-ink-3 text-[13.5px] font-semibold">
          <Icons.filter size={16} />
          {t("Sort")}
          <Select
            className="[width:auto] [padding:8px_12px] [border-radius:var(--r-pill)] [font-weight:700] [font-size:13.5px]"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {t(s)}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex items-baseline gap-[10px] mb-[16px]">
        <span className="font-bold text-[15px]">
          {list.length} {list.length !== 1 ? t("experiences") : t("experience")}
        </span>
        <span className="text-ink-3 text-[14px]">
          {t("in")} {city}
          {mood ? ` · ${t(MOODS[mood].label)}` : ""}
        </span>
      </div>

      {list.length === 0 ? (
        source.length === 0 && !mood && cat === "All" && !query.trim() ? (
          <EmptyMarketplace />
        ) : (
          <Empty />
        )
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-[var(--gap)]">
          {list.map((e, i) => (
            <div
              key={e.id}
              className="animate-anim-pop-app [animation-delay:var(--ad)]"
              style={{ ["--ad"]: `${Math.min(i * 0.04, 0.4)}s` } as React.CSSProperties}
            >
              <ExperienceCard
                exp={e}
                onOpen={setOpen}
                fav={favs.includes(e.id)}
                onFav={onFav}
              />
            </div>
          ))}
        </div>
      )}

      {open && (
        <ServiceModal
          exp={open}
          slots={slotsByService[open.id] || []}
          wallet={wallet}
          fav={favs.includes(open.id)}
          onFav={onFav}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

function Empty() {
  const t = useT();
  return (
    <div className="text-center py-[80px] px-[20px] text-ink-3">
      <div className="w-[64px] h-[64px] rounded-[99px] bg-surface-2 grid place-items-center mt-0 mx-auto mb-[16px] text-ink-3">
        <Icons.search size={28} />
      </div>
      <h3 className="text-[19px] text-ink">{t("Nothing matches — yet")}</h3>
      <p className="max-w-[340px] mt-[8px] mx-auto mb-0">
        {t("Try a different mood or clear your filters to see everything nearby.")}
      </p>
    </div>
  );
}
