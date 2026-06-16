"use client";

import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";
import { Button } from "@/components/ui";
import { money, Stat, Bars } from "@/components/dash/primitives";
import { MOODS } from "@/components/customer/primitives";
import { BookingsTable, type Booking } from "@/components/provider/BookingsTable";

const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dow = (d: number) => (d - 1) % 7;
const TODAY = 10;

type Svc = {
  id: string;
  name: string;
  mood: keyof typeof MOODS;
  cap: number;
};

type Slot = {
  serviceId: string;
  time: string;
  booked?: number;
};

type Fin = { gross: number };

type Rating = { rating: number | null };

type Kpi = {
  label: string;
  value: string;
  icon: keyof typeof Icons;
  accent: string;
};

function SlotRow({ slot, svc, t }: { slot: Slot; svc: Svc; t: ReturnType<typeof useT> }) {
  return (
    <div className="flex items-center gap-3">
      <div className="font-display font-extrabold text-sm w-12 text-ink-2">
        {slot.time}
      </div>
      <div
        className="w-1 self-stretch rounded-md [background:var(--mood-bg)]"
        style={
          {
            ["--mood-bg"]: MOODS[svc.mood].color,
          } as React.CSSProperties
        }
      />
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm whitespace-nowrap overflow-hidden text-ellipsis">
          {svc.name}
        </div>
        <div className="text-xs text-ink-3 font-semibold">
          {slot.booked || 0}/{svc.cap} {t("booked")}
        </div>
      </div>
    </div>
  );
}

export function POverview({
  bookings,
  fin,
  todaySlots,
  svcs,
  rating,
}: {
  bookings: Booking[];
  fin: Fin;
  todaySlots: Slot[];
  svcs: Svc[];
  rating: Rating;
}) {
  const router = useRouter();
  const t = useT();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = TODAY + i;
    const v = bookings
      .filter((b) => b.day === d && b.status !== "cancelled")
      .reduce((a, b) => a + b.total, 0);
    return { label: t(WD[dow(Math.min(d, 30))]), value: v };
  });
  const max = Math.max(...week.map((w) => w.value));
  const cap = todaySlots.reduce((a, s) => {
    const sv = svcs.find((x) => x.id === s.serviceId);
    return a + ((sv && sv.cap) || 0);
  }, 0);
  const fill = cap
    ? Math.round(
        (todaySlots.reduce((a, s) => a + (s.booked || 0), 0) / cap) * 100,
      )
    : 0;
  const kpis: Kpi[] = [
    {
      label: "Revenue · June",
      value: money(fin.gross),
      icon: "wallet" as const,
      accent: "#1FA46E",
    },
    {
      label: "Bookings",
      value: String(bookings.filter((b) => b.status !== "cancelled").length),
      icon: "calendar" as const,
      accent: "#5563D6",
    },
    {
      label: "Fill rate · today",
      value: fill + "%",
      icon: "flame" as const,
      accent: "#E89015",
    },
    {
      label: "Avg rating",
      value: rating.rating ? String(rating.rating) : "—",
      icon: "star" as const,
      accent: "#FF8A4C",
    },
  ];
  return (
    <div className="animate-anim-fade-dash">
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))] gap-[var(--gap)] mb-[var(--gap)]">
        {kpis.map((k, i) => {
          const I = Icons[k.icon];
          return (
            <Stat
              key={i}
              label={t(k.label)}
              value={k.value}
              icon={<I size={16} />}
              accent={k.accent}
              sub={t("live from bookings")}
            />
          );
        })}
      </div>
      <div className="grid grid-cols-[1.5fr_1fr] gap-[var(--gap)] mb-[var(--gap)]">
        <div className="bg-surface border border-line rounded-lg p-6">
          <div className="flex items-end justify-between gap-4 mb-2">
            <div>
              <h3 className="text-base">{t("Revenue this week")}</h3>
              <div className="text-sm text-ink-3 font-semibold">
                {max > 0
                  ? t("Confirmed + pending bookings by day")
                  : t("No bookings this week yet")}
              </div>
            </div>
          </div>
          {max > 0 ? (
            <Bars
              data={week.map((w) => ({ ...w, hot: w.value === max }))}
              unit="₽"
            />
          ) : (
            <div className="h-40 grid place-items-center text-ink-3 font-semibold text-sm">
              {t("Revenue appears here as bookings come in.")}
            </div>
          )}
        </div>
        <div className="bg-surface border border-line rounded-lg p-6">
          <h3 className="text-base mb-1">{t("Today's schedule")}</h3>
          <div className="text-sm text-ink-3 font-semibold mb-4">
            {t(WD[dow(TODAY)])} {TODAY} {t("Jun")} · {todaySlots.length}{" "}
            {todaySlots.length !== 1 ? t("sessions") : t("session")}
          </div>
          {todaySlots.length === 0 ? (
            <div className="py-8 px-0 text-center text-ink-3 font-semibold text-sm">
              {t("Nothing scheduled today.")}
              <br />
              {t("Drag services onto days in")}{" "}
              <a
                className="text-coral-deep cursor-pointer"
                onClick={() => router.push("/provider/calendar")}
              >
                {t("Calendar")}
              </a>
              .
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {todaySlots
                .slice()
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((s, i) => {
                  const sv = svcs.find((x) => x.id === s.serviceId) || {
                    id: s.serviceId,
                    name: t("Service"),
                    mood: "calm" as const,
                    cap: 0,
                  };
                  return <SlotRow key={i} slot={s} svc={sv} t={t} />;
                })}
            </div>
          )}
        </div>
      </div>
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <div className="flex items-center justify-between py-5 px-5">
          <h3 className="text-base">{t("Recent bookings")}</h3>
          <Button
            ctx="dash"
            variant="ghost"
            size="sm"
            onClick={() => router.push("/provider/bookings")}
          >
            {t("View all")} <Icons.arrowR size={15} />
          </Button>
        </div>
        {bookings.length === 0 ? (
          <div className="py-7 px-5 text-ink-3 font-semibold text-sm border-t border-line">
            {t(
              "No bookings yet — once your services are approved and customers book, they land here.",
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <BookingsTable rows={bookings.slice(0, 4)} compact />
          </div>
        )}
      </div>
    </div>
  );
}
