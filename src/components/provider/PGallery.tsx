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
      <div className="flex items-end justify-between gap-4 mb-[18px]">
        <div>
          <div className="text-[12px] font-extrabold tracking-[0.1em] uppercase text-orange mb-[6px]">
            {items.length} {t("items")}
          </div>
          <h2 className="text-[22px]">{t("Photos & videos")}</h2>
        </div>
        <Button ctx="dash" variant="primary" size="md" icon={<Icons.plus size={16} />}>
          {t("Upload")}
        </Button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[var(--gap)]">
        <label className="rounded-lg flex flex-col items-center justify-center gap-[8px] text-ink-3 cursor-pointer bg-surface-2 [aspect-ratio:4/3] [border:2px_dashed_var(--line-2)]">
          <Icons.image size={28} />
          <span className="font-bold text-[13.5px]">{t("Add photo or video")}</span>
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
                <span className="inline-flex items-center gap-[6px] py-1 px-[11px] rounded-pill text-[12px] font-bold whitespace-nowrap absolute top-[10px] left-[10px] text-[#1A0A04] bg-orange">
                  <Icons.star size={12} />
                  {t("Cover")}
                </span>
              )}
              {g.video && (
                <span className="absolute inset-0 grid place-items-center">
                  <span className="w-[46px] h-[46px] rounded-[99px] bg-[rgba(0,0,0,.45)] grid text-[#fff] place-items-center">
                    <Icons.arrowR size={20} />
                  </span>
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 pt-[24px] px-[12px] pb-[10px] bg-[linear-gradient(transparent,rgba(0,0,0,.5))] flex items-center gap-[6px]">
                <span className="text-[#fff] font-bold text-[12.5px] flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                  {g.label}
                </span>
              </div>
            </div>
            <div className="flex gap-[6px] py-[10px] px-[12px]">
              {!g.cover && (
                <Button
                  ctx="dash"
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-[12px]"
                  onClick={() => setCover(g.id)}
                >
                  {t("Set cover")}
                </Button>
              )}
              <button
                className="rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2 w-[34px] h-[34px]"
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
