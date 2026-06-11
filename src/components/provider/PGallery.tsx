"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";
import { Btn } from "@/components/dash/primitives";
import { P_GALLERY } from "@/components/provider/data";

export function PGalleryView() {
  const [items, setItems] = useState(P_GALLERY);
  const del = (id: string) => setItems((it) => it.filter((g) => g.id !== id));
  const setCover = (id: string) =>
    setItems((it) => it.map((g) => ({ ...g, cover: g.id === id })));
  return (
    <div className="anim-fade">
      <div className="shead">
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {items.length} items
          </div>
          <h2 className="text-[22px]">Photos & videos</h2>
        </div>
        <Btn size="md" icon={<Icons.plus size={16} />}>
          Upload
        </Btn>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[var(--gap)]">
        <label
          className="rounded-lg flex flex-col items-center justify-center gap-[8px] text-ink-3 cursor-pointer bg-surface-2"
          style={{ aspectRatio: "4/3", border: "2px dashed var(--line-2)" }}
        >
          <Icons.image size={28} />
          <span className="font-bold text-[13.5px]">Add photo or video</span>
        </label>
        {items.map((g) => (
          <div
            key={g.id}
            className="card anim-pop"
            style={{ overflow: "hidden", padding: 0 }}
          >
            <div
              className="relative"
              style={{ aspectRatio: "4/3", background: g.g }}
            >
              {g.cover && (
                <span
                  className="pill"
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    color: "#1A0A04",
                    background: "var(--orange)",
                  }}
                >
                  <Icons.star size={12} />
                  Cover
                </span>
              )}
              {g.video && (
                <span
                  className="absolute inset-0 grid"
                  style={{ placeItems: "center" }}
                >
                  <span
                    className="w-[46px] h-[46px] rounded-[99px] bg-[rgba(0,0,0,.45)] grid text-[#fff]"
                    style={{ placeItems: "center" }}
                  >
                    <Icons.arrowR size={20} />
                  </span>
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 pt-[24px] px-[12px] pb-[10px] bg-[linear-gradient(transparent,rgba(0,0,0,.5))] flex items-center gap-[6px]">
                <span
                  className="text-[#fff] font-bold text-[12.5px] flex-1 whitespace-nowrap overflow-hidden"
                  style={{ textOverflow: "ellipsis" }}
                >
                  {g.label}
                </span>
              </div>
            </div>
            <div className="flex gap-[6px] py-[10px] px-[12px]">
              {!g.cover && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1, fontSize: 12 }}
                  onClick={() => setCover(g.id)}
                >
                  Set cover
                </button>
              )}
              <button
                className="icon-btn"
                style={{ width: 34, height: 34 }}
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
