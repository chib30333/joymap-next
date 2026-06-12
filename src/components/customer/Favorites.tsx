"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";
import { ExperienceCard, type Exp } from "./primitives";
import { ServiceModal, type Slot } from "./ServiceModal";
import { useFav } from "./useFav";

export function Favorites({
  list,
  favs,
  slotsByService,
  wallet,
}: {
  list: Exp[];
  favs: string[];
  slotsByService: Record<string, Slot[]>;
  wallet: number;
}) {
  const t = useT();
  const [open, setOpen] = useState<Exp | null>(null);
  const onFav = useFav();
  return (
    <div className="animate-anim-fade-app">
      {list.length === 0 ? (
        <div className="text-center py-[70px] px-5 text-ink-3">
          <div className="w-16 h-16 rounded-[99px] bg-[var(--m-energy-soft)] grid place-items-center mt-0 mx-auto mb-4 text-[var(--m-energy)]">
            <Icons.heart size={28} />
          </div>
          <h3 className="text-[19px] text-ink">{t("No favorites yet")}</h3>
          <p className="max-w-[340px] mt-2 mx-auto mb-0">
            {t("Tap the heart on any experience to save it here for later.")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-[var(--gap)]">
          {list.map((e) => (
            <ExperienceCard
              key={e.id}
              exp={e}
              onOpen={setOpen}
              fav
              onFav={onFav}
            />
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
