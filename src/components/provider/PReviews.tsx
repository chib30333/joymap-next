"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { Avatar } from "@/components/dash/primitives";
import { Button } from "@/components/ui";
import { useT } from "@/components/Language";

type Review = {
  id: string;
  name: string;
  serviceName: string;
  date: string;
  rating: number;
  text?: string;
  replied?: boolean;
};

type Rating = { rating: number | null };

type RatingBar = { star: number; percent: number };

export function PReviews({ list, rating }: { list: Review[]; rating: Rating }) {
  const t = useT();
  const router = useRouter();
  const [replying, setReplying] = useState<string | null>(null);
  if (list.length === 0)
    return (
      <div className="bg-surface border border-line rounded-lg animate-anim-fade-dash py-16 px-6 text-center text-ink-3 max-w-[760px]">
        <Icons.star size={36} />
        <h3 className="text-ink mt-3 text-xl">{t("No reviews yet")}</h3>
        <p className="max-w-[380px] mt-2 mx-auto mb-0 font-semibold text-sm">
          {t(
            "After a completed session, customers can rate the experience — reviews appear here.",
          )}
        </p>
      </div>
    );
  const dist: RatingBar[] = [5, 4, 3, 2, 1].map((star) => ({
    star,
    percent: Math.round(
      (list.filter((x) => x.rating === star).length / list.length) * 100,
    ),
  }));
  return (
    <div className="animate-anim-fade-dash">
      <div className="bg-surface border border-line rounded-lg p-6 flex items-center gap-6 mb-[var(--gap)]">
        <div className="text-center">
          <div className="font-display font-extrabold text-[44px] leading-none">
            {rating.rating || "—"}
          </div>
          <div className="text-[var(--m-joy)] text-base">★★★★★</div>
          <div className="text-xs text-ink-3 font-semibold mt-1">
            {list.length} {list.length !== 1 ? t("reviews") : t("review")}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-1.5">
          {dist.map(({ star, percent }) => (
            <div key={star} className="flex items-center gap-2.5">
              <span className="text-xs font-bold w-2.5">{star}</span>
              <div className="flex-1 h-2 rounded-pill bg-surface-2 overflow-hidden">
                <div
                  className="h-full w-[var(--w)] bg-[var(--m-joy)] rounded-pill"
                  style={{ ["--w"]: percent + "%" } as React.CSSProperties}
                />
              </div>
              <span className="text-xs text-ink-3 font-semibold w-8">
                {percent}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3.5">
        {list.map((rv) => (
          <div key={rv.id} className="bg-surface border border-line rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2.5">
              <Avatar name={rv.name} size={38} />
              <div className="flex-1">
                <div className="font-bold">{rv.name}</div>
                <div className="text-xs text-ink-3 font-semibold">
                  {rv.serviceName} · {rv.date}
                </div>
              </div>
              <span className="text-[var(--m-joy)] text-sm">
                {"★".repeat(rv.rating)}
                <span className="text-line-2">{"★".repeat(5 - rv.rating)}</span>
              </span>
            </div>
            {rv.text && (
              <p className="mt-0 mx-0 mb-3 text-ink-2 text-sm leading-normal">
                {rv.text}
              </p>
            )}
            {rv.replied ? (
              <div className="text-sm text-ink-3 font-semibold flex items-center gap-1.5">
                <Icons.check size={15} />
                {t("You replied")}
              </div>
            ) : (
              <Button
                busy={replying === rv.id}
                ctx="dash"
                variant="soft"
                size="sm"
                icon={<Icons.send size={14} />}
                onClick={() => {
                  setReplying(rv.id);
                  rpc("replyReview", { id: rv.id }).then(() => {
                    setReplying(null);
                    router.refresh();
                  });
                }}
              >
                {t("Reply")}
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
