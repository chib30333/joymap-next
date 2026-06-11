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
import { useFav } from "./useFav";
import { useT } from "@/components/i18n";

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
  const [query, setQuery] = useState(initialQuery || "");
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
    <div className="anim-fade">
      <div className="mb-[18px]">
        <div className="eyebrow" style={{ marginBottom: 12 }}>
          {t("Browse by how you want to feel")}
        </div>
        <div
          className="no-scrollbar"
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            paddingBottom: 4,
          }}
        >
          <button
            className={`chip ${!mood ? "on" : ""}`}
            style={{ padding: "9px 16px" }}
            onClick={() => setMood(null)}
          >
            {t("All moods")}
          </button>
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
          <button
            key={c}
            className={`chip ${cat === c ? "on" : ""}`}
            onClick={() => setCat(c)}
          >
            {t(c)}
          </button>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-[8px] text-ink-3 text-[13.5px] font-semibold">
          <Icons.filter size={16} />
          {t("Sort")}
          <Select
            style={{
              width: "auto",
              padding: "8px 12px",
              borderRadius: "var(--r-pill)",
              fontWeight: 700,
              fontSize: 13.5,
            }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {["Recommended", "Price", "Rating"].map((s) => (
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
              className="anim-pop"
              style={{ animationDelay: `${Math.min(i * 0.04, 0.4)}s` }}
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
