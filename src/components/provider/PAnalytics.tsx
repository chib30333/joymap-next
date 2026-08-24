"use client";

import { type ReactNode } from "react";
import { Icons } from "@/components/Icons";
import { Bars, LineChart } from "@/components/dash/primitives";
import { MOODS } from "@/components/customer/primitives";
import { useT } from "@/components/Language";

type Booking = {
  id: string;
  day: number;
  time: string;
  total: number;
  status: string;
};

type Svc = {
  id: string;
  name: string;
  mood: string;
  booked: number;
};

function ChartCard({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-surface border border-line rounded-lg p-6">
      <h3 className="text-base mb-1">{title}</h3>
      <div className="text-sm text-ink-3 font-semibold mb-2">
        {caption}
      </div>
      {children}
    </div>
  );
}

export function PAnalytics({
  bookings,
  svcs,
}: {
  bookings: Booking[];
  svcs: Svc[];
}) {
  const t = useT();
  const ok = bookings.filter((b) => b.status !== "cancelled");
  if (ok.length === 0)
    return (
      <div className="bg-surface border border-line rounded-lg animate-anim-fade-dash py-16 px-6 text-center text-ink-3">
        <Icons.flame size={36} />
        <h3 className="text-ink mt-3 text-lg">{t("No data yet")}</h3>
        <p className="max-w-[380px] mt-2 mx-auto mb-0 font-semibold text-sm">
          {t(
            "Analytics light up as bookings come in — revenue trends, peak hours and top services."
          )}
        </p>
      </div>
    );
  const byDay: Record<number, number> = {};
  ok.forEach((b) => {
    byDay[b.day] = (byDay[b.day] || 0) + b.total;
  });
  const days = Object.keys(byDay)
    .map(Number)
    .sort((a, b) => a - b);
  const trend = days.map((day) => ({
    label: day + " " + t("Jun"),
    value: byDay[day],
  }));
  const byHour: Record<string, number> = {};
  ok.forEach((b) => {
    byHour[b.time] = (byHour[b.time] || 0) + 1;
  });
  const peak = Object.keys(byHour)
    .sort()
    .map((tm) => ({ label: tm, value: byHour[tm] }));
  const maxPeak = Math.max(...peak.map((p) => p.value));
  const top = [...svcs]
    .sort((a, b) => b.booked - a.booked)
    .filter((s) => s.booked > 0);
  const maxB = Math.max(...top.map((tp) => tp.booked), 1);
  return (
    <div className="animate-anim-fade-dash">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--gap)] mb-[var(--gap)]">
        <ChartCard title={t("Revenue by day")} caption={t("June 2026 · live")}>
          {trend.length > 1 ? (
            <LineChart points={trend} />
          ) : (
            <Bars data={trend} unit="₽" />
          )}
        </ChartCard>
        <ChartCard
          title={t("Bookings by start time")}
          caption={t("Across all services")}
        >
          <Bars
            data={peak.map((p) => ({ ...p, hot: p.value === maxPeak }))}
            accent="var(--orange)"
          />
        </ChartCard>
      </div>
      <div className="bg-surface border border-line rounded-lg p-6 max-w-[640px]">
        <h3 className="text-base mb-4">{t("Top services")}</h3>
        <div className="flex flex-col gap-3.5">
          {top.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between mb-1.5">
                <span className="font-bold text-sm">{s.name}</span>
                <span className="font-bold text-sm text-ink-3">
                  {s.booked}
                </span>
              </div>
              <div className="h-2 rounded-pill bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-pill w-[var(--w)] [background:var(--bg)]"
                  style={
                    {
                      ["--w"]: `${(s.booked / maxB) * 100}%`,
                      ["--bg"]: MOODS[s.mood].color,
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
