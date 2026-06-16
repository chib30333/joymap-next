"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/Language";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { Seg, Avatar } from "@/components/dash/primitives";
import { EmptyState, Chip } from "@/components/admin/AdminShared";
import { Spinner, Button } from "@/components/ui";
import { AdminHeader } from "@/components/admin/AdminHeader";

type FlagItem = {
  id: string;
  type: string;
  author: string;
  target: string;
  text: string | null;
  grad: string | null;
  reason: string;
  time: string;
};

type TypeMeta = { label: string; color: string };

export function AContent({ items }: { items: FlagItem[] }) {
  const t = useT();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [acting, setActing] = useState<string | null>(null);
  const act = (id: string) => {
    setActing(id);
    rpc("resolveFlag", { id }).then(() => {
      setActing(null);
      router.refresh();
    });
  };
  const list =
    filter === "all" ? items : items.filter((c) => c.type === filter);
  const TYPE: Record<string, TypeMeta> = {
    review: { label: "Review", color: "#5563D6" },
    photo: { label: "Photo", color: "#E89015" },
    promo: { label: "Promo material", color: "#7B53F0" },
  };
  return (
    <div className="animate-anim-fade-dash">
      <AdminHeader
        eyebrow={`${items.length} ${t("flagged items")}`}
        title={t("Content moderation")}
        action={
          <Seg
            value={filter}
            options={[
              { v: "all", l: t("All") },
              { v: "review", l: t("Reviews") },
              { v: "photo", l: t("Photos") },
              { v: "promo", l: t("Promos") },
            ]}
            onChange={setFilter}
          />
        }
      />
      {list.length === 0 ? (
        <EmptyState title={t("Nothing flagged 🎉")}>
          {t("Reported reviews, photos and promos land here.")}
        </EmptyState>
      ) : (
        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(340px,1fr))] gap-[var(--gap)]">
          {list.map((c) => {
            const { label: tl, color: tc } = TYPE[c.type] || {
              label: "Item",
              color: "#9B8AA0",
            };
            return (
              <div
                key={c.id}
                className="bg-surface border border-line rounded-lg animate-anim-pop-dash p-5 flex flex-col gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <Chip bg={`color-mix(in srgb,${tc} 14%,transparent)`} color={tc}>
                    {t(tl)}
                  </Chip>
                  <Chip bg="rgba(224,33,47,.1)" color="var(--coral)">
                    <Icons.flame size={12} />
                    {c.reason}
                  </Chip>
                  <span className="ml-auto text-xs text-ink-3 font-semibold">
                    {c.time}
                  </span>
                </div>
                {c.type === "photo" ? (
                  <div
                    className="h-36 rounded-sm [background:var(--card-bg)]"
                    style={
                      {
                        "--card-bg":
                          c.grad || "linear-gradient(135deg,#9E7BF6,#5B33C9)",
                      } as React.CSSProperties
                    }
                  />
                ) : (
                  <p className="m-0 text-sm leading-normal text-ink-2 bg-surface-2 px-3.5 py-3 rounded-sm italic">
                    &quot;{c.text}&quot;
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-ink-3 font-semibold">
                  <Avatar name={c.author} size={24} />
                  {c.author}
                  <span className="opacity-50">·</span>
                  {t("on")} {c.target}
                </div>
                <div className="flex gap-2 mt-0.5">
                  {acting === c.id ? (
                    <Spinner className="mx-auto my-2" />
                  ) : (
                    <>
                      <Button
                        ctx="dash"
                        variant="ghost"
                        size="sm"
                        block
                        onClick={() => act(c.id)}
                      >
                        <Icons.check size={15} />
                        {t("Keep")}
                      </Button>
                      <Button
                        ctx="dash"
                        size="sm"
                        block
                        className="bg-coral text-white"
                        onClick={() => act(c.id)}
                      >
                        <Icons.trash size={15} />
                        {t("Remove")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
