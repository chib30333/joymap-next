"use client";

import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { money, Stat, Bars } from "@/components/dash/primitives";
import { MOODS } from "@/components/customer/primitives";
import { BookingsTable } from "@/components/provider/BookingsTable";

const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dow = (d: number) => (d - 1) % 7;
const dateLabel = (d: number) => `${WD[dow(Math.min(d, 30))]} ${d} Jun`;
const TODAY = 10;

type Booking = any;
type Svc = any;

export function POverview({
  bookings,
  fin,
  todaySlots,
  svcs,
  rating,
}: {
  bookings: Booking[];
  fin: any;
  todaySlots: any[];
  svcs: Svc[];
  rating: any;
}) {
  const router = useRouter();
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = TODAY + i;
    const v = bookings
      .filter((b) => b.day === d && b.status !== "cancelled")
      .reduce((a, b) => a + b.total, 0);
    return { label: WD[dow(Math.min(d, 30))], value: v };
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
  const kpis = [
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
    <div className="anim-fade">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
          gap: "var(--gap)",
          marginBottom: "var(--gap)",
        }}
      >
        {kpis.map((k, i) => {
          const I = Icons[k.icon];
          return (
            <Stat
              key={i}
              label={k.label}
              value={k.value}
              icon={<I size={16} />}
              accent={k.accent}
              sub="live from bookings"
            />
          );
        })}
      </div>
      <div
        className="grid grid-cols-[1.5fr_1fr]"
        style={{ gap: "var(--gap)", marginBottom: "var(--gap)" }}
      >
        <div className="card" style={{ padding: 22 }}>
          <div className="shead" style={{ marginBottom: 8 }}>
            <div>
              <h3 className="text-[17px]">Revenue this week</h3>
              <div className="text-[13px] text-ink-3 font-semibold">
                {max > 0
                  ? "Confirmed + pending bookings by day"
                  : "No bookings this week yet"}
              </div>
            </div>
          </div>
          {max > 0 ? (
            <Bars
              data={week.map((w) => ({ ...w, hot: w.value === max }))}
              unit="₽"
            />
          ) : (
            <div className="h-[160px] grid place-items-center text-ink-3 font-semibold text-[13.5px]">
              Revenue appears here as bookings come in.
            </div>
          )}
        </div>
        <div className="card" style={{ padding: 22 }}>
          <h3 className="text-[17px] mb-[4px]">Today&apos;s schedule</h3>
          <div className="text-[13px] text-ink-3 font-semibold mb-[16px]">
            {dateLabel(TODAY)} · {todaySlots.length} session
            {todaySlots.length !== 1 ? "s" : ""}
          </div>
          {todaySlots.length === 0 ? (
            <div className="py-[30px] px-0 text-center text-ink-3 font-semibold text-[13.5px]">
              Nothing scheduled today.
              <br />
              Drag services onto days in{" "}
              <a
                className="text-coral-deep cursor-pointer"
                onClick={() => router.push("/provider/calendar")}
              >
                Calendar
              </a>
              .
            </div>
          ) : (
            <div className="flex flex-col gap-[10px]">
              {todaySlots
                .slice()
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((s, i) => {
                  const sv = svcs.find((x) => x.id === s.serviceId) || {
                    name: "Service",
                    mood: "calm",
                    cap: 0,
                  };
                  return (
                    <div key={i} className="flex items-center gap-[12px]">
                      <div className="font-display font-extrabold text-[14px] w-[46px] text-ink-2">
                        {s.time}
                      </div>
                      <div
                        className="w-[3px] self-stretch rounded-[9px]"
                        style={{ background: MOODS[sv.mood].color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className="font-bold text-[14px] whitespace-nowrap overflow-hidden"
                          style={{ textOverflow: "ellipsis" }}
                        >
                          {sv.name}
                        </div>
                        <div className="text-[12.5px] text-ink-3 font-semibold">
                          {s.booked || 0}/{sv.cap} booked
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="flex items-center justify-between py-[18px] px-[20px]">
          <h3 className="text-[17px]">Recent bookings</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => router.push("/provider/bookings")}
          >
            View all <Icons.arrowR size={15} />
          </button>
        </div>
        {bookings.length === 0 ? (
          <div className="py-[26px] px-[20px] text-ink-3 font-semibold text-[13.5px] border-t border-line">
            No bookings yet — once your services are approved and customers
            book, they land here.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <BookingsTable rows={bookings.slice(0, 4)} compact />
          </div>
        )}
      </div>
    </div>
  );
}
