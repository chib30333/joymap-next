"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui";
import { rpc } from "@/lib/client";
import { useT } from "@/components/i18n";

type N = {
  id: string;
  icon: string;
  accent: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

export function NotificationsList({ items }: { items: N[] }) {
  const t = useT();
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const unread = items.filter((n) => n.unread).length;
  const list = filter === "all" ? items : items.filter((n) => n.unread);

  async function mark(id: string) {
    await rpc("markNotif", { id }).catch(() => {});
    router.refresh();
  }
  async function markAll() {
    await rpc("markAllNotifs").catch(() => {});
    router.refresh();
  }

  return (
    <div className="max-w-2xl animate-rise">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex gap-1.5 rounded-pill border border-line bg-surface-2 p-1.5">
          {(["all", "unread"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className={`rounded-pill px-4 py-2 text-[13px] font-bold ${filter === k ? "bg-surface text-ink shadow-sm" : "text-ink-3"}`}
            >
              {k === "all"
                ? t("All")
                : `${t("Unread")}${unread ? ` · ${unread}` : ""}`}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={markAll}
          className="text-[13px] font-bold text-ink-3 hover:text-ink"
        >
          {t("Mark all read")}
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        {list.map((n) => (
          <Card
            key={n.id}
            onClick={() => mark(n.id)}
            className="flex cursor-pointer gap-3.5 p-4"
            style={
              n.unread
                ? {
                    borderColor:
                      "color-mix(in srgb,var(--coral) 32%,transparent)",
                  }
                : undefined
            }
          >
            <span
              className="grid h-10 w-10 shrink-0 place-items-center rounded text-lg"
              style={{
                background: `color-mix(in srgb,${n.accent} 15%,transparent)`,
                color: n.accent,
              }}
            >
              •
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[14.5px] font-bold">{n.title}</span>
                {n.unread && <span className="h-2 w-2 rounded-full bg-coral" />}
                <span className="ml-auto text-xs font-semibold text-ink-3">
                  {n.time}
                </span>
              </div>
              <p className="mt-0.5 text-[13.5px] leading-snug text-ink-2">
                {n.body}
              </p>
            </div>
          </Card>
        ))}
        {list.length === 0 && (
          <Card className="p-12 text-center font-semibold text-ink-3">
            {t("You're all caught up.")}
          </Card>
        )}
      </div>
    </div>
  );
}
