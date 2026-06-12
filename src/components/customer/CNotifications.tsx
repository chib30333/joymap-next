"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { useT } from "@/components/Language";

type N = {
  id: string;
  icon: string;
  accent: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export function CNotifications({ items }: { items: N[] }) {
  const t = useT();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unread = items.filter((n) => n.unread).length;
  const list = filter === "all" ? items : items.filter((n) => n.unread);
  const mark = (id: string) =>
    rpc("markNotif", { id }).then(() => router.refresh());
  const markAll = () => rpc("markAllNotifs").then(() => router.refresh());

  return (
    <div className="anim-fade">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1.5 bg-surface-2 p-[5px] rounded-pill border border-line">
          {(
            [
              ["all", t("All")],
              ["unread", `${t("Unread")}${unread ? ` · ${unread}` : ""}`],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              className="btn btn-sm"
              onClick={() => setFilter(k as "all" | "unread")}
              style={
                filter === k
                  ? {
                      background: "var(--surface)",
                      color: "var(--ink)",
                      boxShadow: "var(--sh-sm)",
                    }
                  : { color: "var(--ink-3)" }
              }
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button className="btn btn-ghost btn-sm" onClick={markAll}>
          <Icons.checkCirc size={15} />
          {t("Mark all read")}
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        {list.map((n) => {
          const I = Icons[n.icon] || Icons.bell;
          return (
            <div
              key={n.id}
              className="card"
              onClick={() => mark(n.id)}
              style={{
                padding: "15px 17px",
                display: "flex",
                gap: 13,
                cursor: "pointer",
                borderColor: n.unread
                  ? "color-mix(in srgb,var(--coral) 32%,transparent)"
                  : "var(--line)",
              }}
            >
              <span
                className="w-10 h-10 rounded-sm flex-none grid place-items-center"
                style={{
                  background: `color-mix(in srgb,${n.accent} 15%,transparent)`,
                  color: n.accent,
                }}
              >
                <I size={19} />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14.5px]">{n.title}</span>
                  {n.unread && (
                    <span className="w-2 h-2 rounded-[99px] bg-coral flex-none" />
                  )}
                  <span className="ml-auto text-[12px] text-ink-3 font-semibold flex-none">
                    {n.time}
                  </span>
                </div>
                <p className="mt-[3px] mx-0 mb-0 text-[13.5px] text-ink-2 leading-[1.45]">
                  {n.body}
                </p>
              </div>
            </div>
          );
        })}
        {list.length === 0 && (
          <div className="text-center p-[50px] text-ink-3">
            <Icons.checkCirc size={36} />
            <p className="mt-2.5 font-semibold">{t("You're all caught up.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
