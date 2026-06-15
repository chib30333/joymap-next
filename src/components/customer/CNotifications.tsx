"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { Button } from "@/components/ui";
import { useT } from "@/components/Language";

type Notification = {
  id: string;
  icon: string;
  accent: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

type Filter = "all" | "unread";

type FilterTab = {
  key: Filter;
  label: string;
};

function NotificationRow({
  item,
  onMark,
}: {
  item: Notification;
  onMark: (id: string) => void;
}) {
  const Icon = Icons[item.icon] || Icons.bell;
  return (
    <div
      className={`bg-surface border rounded-lg p-[15px_17px] flex gap-[13px] cursor-pointer ${item.unread ? "[border-color:color-mix(in_srgb,var(--coral)_32%,transparent)]" : "border-line"}`}
      onClick={() => onMark(item.id)}
    >
      <span
        className="w-10 h-10 rounded-sm flex-none grid place-items-center [background:var(--ic-bg)] [color:var(--ic-c)]"
        style={
          {
            ["--ic-bg"]: `color-mix(in srgb,${item.accent} 15%,transparent)`,
            ["--ic-c"]: item.accent,
          } as React.CSSProperties
        }
      >
        <Icon size={19} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[14.5px]">{item.title}</span>
          {item.unread && (
            <span className="w-2 h-2 rounded-[99px] bg-coral flex-none" />
          )}
          <span className="ml-auto text-[12px] text-ink-3 font-semibold flex-none">
            {item.time}
          </span>
        </div>
        <p className="mt-[3px] mx-0 mb-0 text-[13.5px] text-ink-2 leading-[1.45]">
          {item.body}
        </p>
      </div>
    </div>
  );
}

export function CNotifications({ items }: { items: Notification[] }) {
  const t = useT();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const unread = items.filter((n) => n.unread).length;
  const list = filter === "all" ? items : items.filter((n) => n.unread);
  const mark = (id: string) =>
    rpc("markNotif", { id }).then(() => router.refresh());
  const markAll = () => rpc("markAllNotifs").then(() => router.refresh());

  const tabs: FilterTab[] = [
    { key: "all", label: t("All") },
    { key: "unread", label: `${t("Unread")}${unread ? ` · ${unread}` : ""}` },
  ];

  return (
    <div className="animate-anim-fade-app">
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="flex gap-1.5 bg-surface-2 p-[5px] rounded-pill border border-line">
          {tabs.map(({ key, label }) => (
            <Button
              key={key}
              ctx="app"
              size="sm"
              onClick={() => setFilter(key)}
              className={
                filter === key
                  ? "bg-surface text-ink shadow-sm"
                  : "bg-transparent text-ink-3 shadow-none"
              }
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex-1" />
        <Button ctx="app" variant="ghost" size="sm" onClick={markAll}>
          <Icons.checkCirc size={15} />
          {t("Mark all read")}
        </Button>
      </div>
      <div className="flex flex-col gap-2.5">
        {list.map((n) => (
          <NotificationRow key={n.id} item={n} onMark={mark} />
        ))}
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
