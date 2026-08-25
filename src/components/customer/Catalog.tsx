"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
      className={`inline-flex items-center gap-2 ${paddingClass} rounded-pill text-sm font-semibold border cursor-pointer duration-[140ms] whitespace-nowrap ${active ? "bg-coral text-white border-coral" : "bg-surface text-ink-2 border-line-2 hover:border-ink-3 hover:text-ink"}`}
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
  const router = useRouter();
  const [mood, setMood] = useState<string | null>(null);
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [query, setQuery] = useState(initialQuery || "");
  const [open, setOpen] = useState<Exp | null>(null);
  const onFav = useFav();

  // Searching again from the header pushes a new `?q=` onto the same route, so
  // React re-renders this component with a new prop instead of remounting it.
  // Without this sync the initial state would freeze on the first query and
  // every later search would look like it did nothing.
  useEffect(() => {
    setQuery(initialQuery || "");
  }, [initialQuery]);

  const list = useMemo(() => {
    let l = source;
    if (mood) l = l.filter((e) => e.mood === mood);
    if (cat !== "All") l = l.filter((e) => e.cat === cat);
    const q = query.trim().toLowerCase();
    if (q) {
      // Word by word rather than one substring: the hero rail hands us phrases
      // like "Neon karting", which as a single string matches nothing while
      // "Neon Drift Karting" is sitting right there. Words of one or two
      // letters are noise ("at", "a") unless they are the whole query.
      const long = q.split(/\s+/).filter((w) => w.length > 2);
      const words = long.length ? long : [q];
      const hay = (e: Exp) =>
        [e.title, e.cat, e.area, MOODS[e.mood].label, ...e.tags]
          .join(" ")
          .toLowerCase();
      const scored = l
        .map((e) => {
          const h = hay(e);
          return { e, hits: words.filter((w) => h.includes(w)).length };
        })
        .filter((r) => r.hits > 0);
      // Prefer the rows that match every word; only if none do fall back to the
      // partial matches, best first, so a long phrase never dead-ends on zero.
      const every = scored.filter((r) => r.hits === words.length);
      l = (every.length ? every : scored.sort((a, b) => b.hits - a.hits)).map(
        (r) => r.e,
      );
    }
    if (sort === "Price") l = [...l].sort((a, b) => a.price - b.price);
    if (sort === "Rating")
      l = [...l].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return l;
  }, [source, mood, cat, sort, query]);

  return (
    <div className="animate-anim-fade-app">
      <div className="mb-4">
        <div className="text-xs font-bold tracking-widest uppercase text-orange mb-3">
          {t("Browse by how you want to feel")}
        </div>
        <div className="rail flex gap-2.5 pb-1 -mx-[var(--pad)] px-[var(--pad)] sm:mx-0 sm:px-0">
          <PillButton
            active={!mood}
            paddingClass="px-4 py-2"
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

      <div className="flex items-center gap-2.5 flex-wrap mb-6">
        {["All", ...CATS].map((c) => (
          <PillButton
            key={c}
            active={cat === c}
            paddingClass="py-2 px-3.5"
            onClick={() => setCat(c)}
          >
            {t(c)}
          </PillButton>
        ))}
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-ink-3 text-sm font-semibold">
          <Icons.filter size={16} />
          {t("Sort")}
          <Select
            className="w-auto px-3 py-2 rounded-pill font-bold text-sm"
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

      <div className="flex items-center gap-2.5 flex-wrap mb-4">
        <span className="font-bold text-base">
          {list.length} {list.length !== 1 ? t("experiences") : t("experience")}
        </span>
        <span className="text-ink-3 text-sm">
          {t("in")} {city}
          {mood ? ` · ${t(MOODS[mood].label)}` : ""}
        </span>
        {/* The search term lives in the URL and is applied silently, so without
            this chip a filtered catalogue is indistinguishable from an empty
            one — and there is nothing to click to get back to everything. */}
        {query.trim() && (
          <button
            className="inline-flex items-center gap-1.5 max-w-full min-w-0 py-1 px-3 rounded-pill text-sm font-semibold bg-coral-soft text-coral-deep border border-transparent cursor-pointer duration-[140ms] hover:border-coral"
            onClick={() => {
              setQuery("");
              router.replace("/discover");
            }}
          >
            <span className="truncate">&ldquo;{query.trim()}&rdquo;</span>
            <Icons.close size={14} />
          </button>
        )}
      </div>

      {list.length === 0 ? (
        source.length === 0 && !mood && cat === "All" && !query.trim() ? (
          <EmptyMarketplace />
        ) : (
          <Empty />
        )
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,270px),1fr))] gap-[var(--gap)]">
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
    <div className="text-center py-20 px-5 text-ink-3">
      <div className="w-16 h-16 rounded-pill bg-surface-2 grid place-items-center mt-0 mx-auto mb-4 text-ink-3">
        <Icons.search size={28} />
      </div>
      <h3 className="text-xl text-ink">{t("Nothing matches — yet")}</h3>
      <p className="max-w-[340px] mt-2 mx-auto mb-0">
        {t("Try a different mood or clear your filters to see everything nearby.")}
      </p>
    </div>
  );
}
