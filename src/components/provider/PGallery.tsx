"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";
import { Button } from "@/components/ui";
import { P_GALLERY } from "@/components/provider/data";
import { useT } from "@/components/Language";

export function PGalleryView() {
  const t = useT();
  const [items, setItems] = useState(P_GALLERY);
  const del = (id: string) => setItems((it) => it.filter((g) => g.id !== id));
  const setCover = (id: string) =>
    setItems((it) => it.map((g) => ({ ...g, cover: g.id === id })));
  return (
    <div className="animate-anim-fade-dash">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <div className="text-xs font-extrabold tracking-widest uppercase text-orange mb-1.5">
            {items.length} {t("items")}
          </div>
          <h2 className="text-xl">{t("Photos & videos")}</h2>
        </div>
        <Button ctx="dash" variant="primary" size="md" icon={<Icons.plus size={16} />}>
          {t("Upload")}
        </Button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[var(--gap)]">
        <label className="rounded-lg flex flex-col items-center justify-center gap-2 text-ink-3 cursor-pointer bg-surface-2 [aspect-ratio:4/3] [border:2px_dashed_var(--line-2)]">
          <Icons.image size={28} />
          <span className="font-bold text-sm">{t("Add photo or video")}</span>
        </label>
        {items.map((g) => (
          <div
            key={g.id}
            className="bg-surface border border-line rounded-lg animate-anim-pop-dash overflow-hidden p-0"
          >
            <div
              className="relative [aspect-ratio:4/3] [background:var(--g-bg)]"
              style={{ ["--g-bg"]: g.g } as React.CSSProperties}
            >
              {g.cover && (
                <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-pill text-xs font-bold whitespace-nowrap absolute top-2.5 left-2.5 text-[#1A0A04] bg-orange">
                  <Icons.star size={12} />
                  {t("Cover")}
                </span>
              )}
              {g.video && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="w-[46px] h-[46px] rounded-pill bg-[rgba(0,0,0,.45)] grid text-white place-items-center">
                    <Icons.arrowR size={20} />
                  </span>
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 pt-6 px-3 pb-2.5 bg-[linear-gradient(transparent,rgba(0,0,0,.5))] flex items-center gap-1.5">
                <span className="text-white font-bold text-xs flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  {g.label}
                </span>
              </div>
            </div>
            <div className="flex gap-1.5 py-2.5 px-3">
              {!g.cover && (
                <Button
                  ctx="dash"
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={() => setCover(g.id)}
                >
                  {t("Set cover")}
                </Button>
              )}
              <button
                className="rounded-pill grid place-items-center bg-surface border border-line text-ink-2 duration-150 relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2 w-9 h-9"
                onClick={() => del(g.id)}
              >
                <Icons.trash size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
