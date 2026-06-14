"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/components/Language";
import { Icons } from "@/components/Icons";
import { money, Stat, Bars, LineChart, Donut, Pill, Avatar } from "@/components/dash/primitives";
import { Chip } from "@/components/admin/AdminShared";
import { Button } from "@/components/ui";

const CAT_COLORS: Record<string, string> = {
  Wellness: "#3FA89B",
  Thrill: "#FF4D74",
  Creative: "#7B53F0",
  Movement: "#5563D6",
  Adventure: "#E89015",
  Mind: "#FF8A4C",
  Other: "#9B8AA0",
};

export function ADashboard({
  s,
  apps,
  pend,
  top,
}: {
  s: any;
  apps: any[];
  pend: any[];
  top: any[];
}) {
  const t = useT();
  const router = useRouter();
  const days = Object.keys(s.byDay)
    .map(Number)
    .sort((a, b) => a - b);
  const gmvPts = days.map((d) => ({
    label: d + " " + t("Jun"),
    value: s.byDay[d],
  }));
  const cats = Object.keys(s.byCat).map((c) => ({
    label: c,
    value: s.byCat[c],
    color: CAT_COLORS[c] || CAT_COLORS.Other,
  }));
  const queue = [
    ...apps.map((a) => ({
      kind: t("Provider"),
      name: a.name,
      sub: a.cat + " · " + a.city,
    })),
    ...pend.map((p) => ({
      kind: t("Service"),
      name: p.name,
      sub: t("by") + " " + p.providerName,
    })),
  ];
  return (
    <div className="animate-anim-fade-dash">
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))] gap-[var(--gap)] mb-[var(--gap)]">
        <Stat
          label={t("GMV · June")}
          value={money(s.gmv)}
          icon={<Icons.flame size={16} />}
          accent="#1FA46E"
          sub={t("confirmed bookings")}
        />
        <Stat
          label={t("Platform revenue")}
          value={money(s.revenue)}
          icon={<Icons.wallet size={16} />}
          accent="#5563D6"
          sub={t("15% commission")}
        />
        <Stat
          label={t("Active providers")}
          value={String(s.activeProviders)}
          icon={<Icons.user size={16} />}
          accent="#E89015"
          sub={`${apps.length} ${t("in review")}`}
        />
        <Stat
          label={t("Bookings")}
          value={String(s.bookings)}
          icon={<Icons.calendar size={16} />}
          accent="#FF8A4C"
          sub={`${s.customers} ${t("customers")}`}
        />
      </div>
      <div className="grid [grid-template-columns:1.6fr_1fr] gap-[var(--gap)] mb-[var(--gap)]">
        <div className="bg-surface border border-line rounded-lg p-[22px]">
          <div className="flex items-end justify-between gap-[16px] mb-[8px]">
            <div>
              <h3 className="text-[17px]">{t("Gross merchandise value")}</h3>
              <div className="text-[13px] text-ink-3 font-semibold">
                {t("By booking day · live")}
              </div>
            </div>
            {s.gmv > 0 && (
              <Chip bg="rgba(31,164,110,.13)" color="#1FA46E">
                ▴ {t("Live")}
              </Chip>
            )}
          </div>
          {gmvPts.length > 1 ? (
            <LineChart
              points={gmvPts}
              h={210}
              caption="GMV"
              valFmt={(v) => money(v)}
            />
          ) : gmvPts.length === 1 ? (
            <Bars data={gmvPts} unit="₽" />
          ) : (
            <div className="h-[210px] grid place-items-center text-ink-3 font-semibold text-[13.5px]">
              {t("GMV charts light up once bookings are confirmed.")}
            </div>
          )}
        </div>
        <div className="bg-surface border border-line rounded-lg p-[22px] flex flex-col items-center">
          <h3 className="text-[17px] mb-[16px] self-start">
            {t("GMV by category")}
          </h3>
          {cats.length === 0 ? (
            <div className="flex-1 grid place-items-center text-ink-3 font-semibold text-[13.5px] text-center">
              {t("No category data yet.")}
            </div>
          ) : (
            <>
              <Donut
                segments={cats}
                center={{ v: money(s.gmv), l: t("total") }}
                size={170}
                valFmt={(seg, total) =>
                  `${Math.round((seg.value / total) * 100)}% · ${money(seg.value)}`
                }
              />
              <div className="grid mt-[18px] w-full [grid-template-columns:1fr_1fr] gap-[8px_14px]">
                {cats.map((c) => (
                  <span
                    key={c.label}
                    className="inline-flex items-center gap-[7px] text-[12.5px] font-bold text-ink-2"
                  >
                    <span
                      className="w-[9px] h-[9px] rounded-[99px] [background:var(--seg-c)]"
                      style={{ ["--seg-c"]: c.color } as React.CSSProperties}
                    />
                    {t(c.label)}
                    <span className="ml-auto text-ink-3">
                      {Math.round((c.value / s.gmv) * 100)}%
                    </span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="grid [grid-template-columns:1fr_1fr] gap-[var(--gap)]">
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-[20px] py-[18px]">
            <h3 className="text-[16px]">{t("Moderation queue")}</h3>
            <Button
              ctx="dash"
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/moderation")}
            >
              {t("Review")} <Icons.arrowR size={15} />
            </Button>
          </div>
          {queue.length === 0 && (
            <div className="px-[20px] py-[18px] border-t border-line text-ink-3 font-semibold text-[13.5px]">
              {t("Queue is clear — nothing awaiting review.")}
            </div>
          )}
          {queue.slice(0, 3).map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-[12px] px-[20px] py-[12px] border-t border-line"
            >
              <Avatar
                name={m.name}
                size={34}
                grad="linear-gradient(140deg,var(--m-focus),#3742A8)"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px]">{m.name}</div>
                <div className="text-[12px] text-ink-3 font-semibold">
                  {m.kind} · {m.sub}
                </div>
              </div>
              <Pill status="review" label={t("new")} />
            </div>
          ))}
        </div>
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-[20px] py-[18px]">
            <h3 className="text-[16px]">{t("Top providers by GMV")}</h3>
            <Button
              ctx="dash"
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/providers")}
            >
              {t("All")} <Icons.arrowR size={15} />
            </Button>
          </div>
          {top.length === 0 && (
            <div className="px-[20px] py-[18px] border-t border-line text-ink-3 font-semibold text-[13.5px]">
              {t("No providers yet.")}
            </div>
          )}
          {top.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-[12px] px-[20px] py-[12px] border-t border-line"
            >
              <span className="font-display font-extrabold text-ink-3 w-[16px]">
                {i + 1}
              </span>
              <Avatar name={p.name} size={34} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px]">{p.name}</div>
                <div className="text-[12px] text-ink-3 font-semibold">
                  {p.cat} · {p.city}
                </div>
              </div>
              <span className="font-display font-bold text-[14px]">
                {money(p.gmv)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
