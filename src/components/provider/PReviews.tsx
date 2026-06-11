"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { Avatar, BusyBtn } from "@/components/dash/primitives";

export function PReviews({ list, rating }: { list: any[]; rating: any }) {
  const router = useRouter();
  const [replying, setReplying] = useState<string | null>(null);
  if (list.length === 0)
    return (
      <div
        className="card anim-fade"
        style={{
          padding: "60px 24px",
          textAlign: "center",
          color: "var(--ink-3)",
          maxWidth: 760,
        }}
      >
        <Icons.star size={36} />
        <h3 className="text-ink mt-[12px] text-[19px]">No reviews yet</h3>
        <p className="max-w-[380px] mt-[8px] mx-auto mb-0 font-semibold text-[14px]">
          After a completed session, customers can rate the experience — reviews
          appear here.
        </p>
      </div>
    );
  const dist = [5, 4, 3, 2, 1].map(
    (st) =>
      [
        st,
        Math.round(
          (list.filter((x) => x.rating === st).length / list.length) * 100,
        ),
      ] as [number, number],
  );
  return (
    <div className="anim-fade">
      <div
        className="card"
        style={{
          padding: 22,
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: "var(--gap)",
        }}
      >
        <div className="text-center">
          <div className="font-display font-extrabold text-[44px] leading-[1]">
            {rating.rating || "—"}
          </div>
          <div className="text-[var(--m-joy)] text-[15px]">★★★★★</div>
          <div className="text-[12.5px] text-ink-3 font-semibold mt-[4px]">
            {list.length} review{list.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-[6px]">
          {dist.map(([st, p]) => (
            <div key={st} className="flex items-center gap-[10px]">
              <span className="text-[12px] font-bold w-[10px]">{st}</span>
              <div className="flex-1 h-[7px] rounded-[99px] bg-surface-2 overflow-hidden">
                <div
                  style={{
                    height: "100%",
                    width: p + "%",
                    background: "var(--m-joy)",
                    borderRadius: 99,
                  }}
                />
              </div>
              <span className="text-[12px] text-ink-3 font-semibold w-[30px]">
                {p}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-[14px]">
        {list.map((rv) => (
          <div key={rv.id} className="card" style={{ padding: 20 }}>
            <div className="flex items-center gap-[12px] mb-[10px]">
              <Avatar name={rv.name} size={38} />
              <div className="flex-1">
                <div className="font-bold">{rv.name}</div>
                <div className="text-[12.5px] text-ink-3 font-semibold">
                  {rv.serviceName} · {rv.date}
                </div>
              </div>
              <span className="text-[var(--m-joy)] text-[14px]">
                {"★".repeat(rv.rating)}
                <span className="text-line-2">{"★".repeat(5 - rv.rating)}</span>
              </span>
            </div>
            {rv.text && (
              <p className="mt-0 mx-0 mb-[12px] text-ink-2 text-[14.5px] leading-[1.55]">
                {rv.text}
              </p>
            )}
            {rv.replied ? (
              <div className="text-[13px] text-ink-3 font-semibold flex items-center gap-[6px]">
                <Icons.check size={15} />
                You replied
              </div>
            ) : (
              <BusyBtn
                busy={replying === rv.id}
                className="btn btn-soft btn-sm"
                icon={<Icons.send size={14} />}
                onClick={() => {
                  setReplying(rv.id);
                  rpc("replyReview", { id: rv.id }).then(() => {
                    setReplying(null);
                    router.refresh();
                  });
                }}
              >
                Reply
              </BusyBtn>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
