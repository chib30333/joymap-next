"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import {
  MOODS,
  fmt,
  PhotoFrame,
  MoodDot,
  BusyBtn,
  type Exp,
} from "./primitives";
import { ServiceModal, type Slot } from "./ServiceModal";
import { useFav } from "./useFav";
import { useT } from "@/components/i18n";

type Day = {
  day: number;
  wd: string;
  date: string;
  rest?: boolean;
  expId: string | null;
  time?: string;
  note: string;
};
const TODAY = 10;

export function JoyMapScreen({
  map,
  bookings,
  catalog,
  favs,
  userName,
  userMoods,
  slotsByService,
  wallet,
}: {
  map: Day[];
  bookings: any[];
  catalog: Exp[];
  favs: string[];
  userName: string;
  userMoods: string[];
  slotsByService: Record<string, Slot[]>;
  wallet: number;
}) {
  const t = useT();
  const router = useRouter();
  const { busy, run } = useBusy();
  const [open, setOpen] = useState<Exp | null>(null);
  const onFav = useFav();
  const byId = (id: string | null) => catalog.find((e) => e.id === id) || null;
  const hour = new Date().getHours();
  const greet =
    hour < 12
      ? t("Good morning")
      : hour < 18
        ? t("Good afternoon")
        : t("Good evening");
  const weekLabel = `${TODAY}–${Math.min(TODAY + 6, 30)} ${t("Jun")}`;
  const days = map.filter((d) => !d.rest && d.expId && byId(d.expId));
  const regen = () =>
    run(
      () => rpc("generateJoyMap", {}),
      () => router.refresh(),
    );

  return (
    <div className="anim-fade">
      <div className="flex items-end justify-between gap-[20px] flex-wrap mt-[6px] mb-[22px]">
        <div>
          <div className="eyebrow" style={{ marginBottom: 9 }}>
            {t("This week")} · {weekLabel}
          </div>
          <h1
            className="max-w-[560px] leading-[1.02]"
            style={{ fontSize: "clamp(30px,4vw,44px)" }}
          >
            {greet}, {userName}.{" "}
            <span className="text-[var(--orange)]">
              {t("Here's your week of joy.")}
            </span>
          </h1>
          <p className="text-ink-2 text-[16px] mt-[12px] max-w-[520px]">
            {t(
              "Seven days, tuned to how you want to feel. Booked days are locked in — swap anything that doesn't fit.",
            )}
          </p>
        </div>
        <BusyBtn
          busy={busy}
          className="btn btn-ghost btn-md"
          icon={<Icons.refresh size={18} />}
          onClick={regen}
        >
          {t("Regenerate")}
        </BusyBtn>
      </div>

      {catalog.length === 0 ? (
        <EmptyMarketplace />
      ) : map.length === 0 ? (
        <div
          className="card"
          style={{ padding: "56px 24px", textAlign: "center" }}
        >
          <div
            className="w-[60px] h-[60px] rounded-[99px] bg-coral-soft text-coral-deep grid mt-0 mb-[14px] mx-auto"
            style={{ placeItems: "center" }}
          >
            <Icons.sparkle size={26} />
          </div>
          <h3 className="text-[20px]">{t("No Joy Map yet")}</h3>
          <p className="text-ink-2 text-[14.5px] mt-[8px] mb-[18px] mx-auto max-w-[380px]">
            {t("Let Joy compose a week of experiences around your moods.")}
          </p>
          <BusyBtn
            busy={busy}
            className="btn btn-primary btn-md"
            icon={<Icons.sparkle size={17} />}
            onClick={regen}
          >
            {t("Build my week")}
          </BusyBtn>
        </div>
      ) : (
        <>
          <MoodArc map={map} byId={byId} />
          <div className="relative mt-[26px]">
            <div
              className="no-scrollbar"
              style={{
                display: "flex",
                gap: 16,
                overflowX: "auto",
                paddingBottom: 10,
                scrollSnapType: "x proximity",
              }}
            >
              {map.map((d, i) => (
                <DayCard
                  key={d.day}
                  d={d}
                  i={i}
                  byId={byId}
                  onOpen={setOpen}
                  bookings={bookings}
                />
              ))}
            </div>
          </div>
          {days.length > 0 && (
            <div
              className="card-fill"
              style={{
                marginTop: 26,
                padding: "22px 24px",
                display: "flex",
                gap: 18,
                alignItems: "flex-start",
              }}
            >
              <div
                className="ricon"
                style={{ width: 44, height: 44, borderRadius: 14 }}
              >
                <Icons.sparkle size={22} />
              </div>
              <div>
                <h3 className="text-[17px] mb-[6px]">
                  {t("Why Joy built this week")}
                </h3>
                <p className="text-[rgba(243,235,224,.85)] text-[14.5px] leading-[1.55] max-w-[760px]">
                  {t("You asked for more")}{" "}
                  <b className="text-[#FFF3E8]">
                    {(userMoods || [])
                      .map((k) =>
                        MOODS[k] ? t(MOODS[k].label).toLowerCase() : k,
                      )
                      .join(", ") || t("joy")}
                  </b>
                  .{" "}
                  {t(
                    "The week balances restorative mornings with playful evenings — and keeps a true rest day so the week breathes.",
                  )}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {open && (
        <ServiceModal
          exp={open}
          slots={slotsByService[open.id] || []}
          wallet={wallet}
          fav={favs.includes(open.id)}
          onFav={onFav}
          onClose={() => setOpen(null)}
        />
      )}
    </div>
  );
}

export function EmptyMarketplace() {
  const t = useT();
  return (
    <div className="card" style={{ padding: "60px 24px", textAlign: "center" }}>
      <div
        className="w-[64px] h-[64px] rounded-[99px] bg-surface-2 grid mt-0 mb-[16px] mx-auto text-ink-3"
        style={{ placeItems: "center" }}
      >
        <Icons.compass size={30} />
      </div>
      <h3 className="text-[20px] text-ink">{t("The marketplace is empty")}</h3>
      <p className="text-ink-2 text-[14.5px] mt-[8px] mb-0 mx-auto max-w-[420px] leading-[1.55]">
        {t("No experiences have been published yet. Sign up as a")}{" "}
        <b>{t("provider")}</b>{" "}
        {t("to list one (an admin approves it), or run")}{" "}
        <code>npm run db:seed</code> {t("to fill the platform.")}
      </p>
    </div>
  );
}

function MoodArc({
  map,
  byId,
}: {
  map: Day[];
  byId: (id: string | null) => Exp | null;
}) {
  const t = useT();
  return (
    <div
      className="card"
      style={{
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        overflowX: "auto",
      }}
    >
      <span className="text-[12.5px] font-bold text-ink-3 tracking-[.04em] uppercase flex-none">
        {t("Your emotional arc")}
      </span>
      <div className="flex items-center gap-0 flex-1 min-w-[420px]">
        {map.map((d) => {
          const e = d.rest ? null : byId(d.expId);
          const m = e ? MOODS[e.mood] : null;
          return (
            <div key={d.day} className="text-center flex-1">
              <div
                className="h-[8px] rounded-[99px] mb-[6px]"
                style={{
                  background: m ? m.color : "var(--line-2)",
                  boxShadow: m ? `0 2px 8px ${m.color}55` : "none",
                }}
              />
              <span className="text-[11.5px] font-bold text-ink-3">{d.wd}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DayCard({
  d,
  i,
  byId,
  onOpen,
  bookings,
}: {
  d: Day;
  i: number;
  byId: (id: string | null) => Exp | null;
  onOpen: (e: Exp) => void;
  bookings: any[];
}) {
  const t = useT();
  const today = d.day === TODAY;
  const e = d.rest ? null : byId(d.expId);
  if (d.rest || !e) {
    return (
      <div
        className="card anim-pop"
        style={{
          flex: "none",
          width: 230,
          scrollSnapAlign: "start",
          padding: 20,
          display: "flex",
          flexDirection: "column",
          background: "var(--surface-2)",
          borderStyle: "dashed",
          animationDelay: `${i * 0.06}s`,
        }}
      >
        <div className="flex items-center justify-between">
          <span className="font-display font-extrabold text-[15px]">
            {d.wd} · {d.date}
          </span>
          {today && (
            <span className="bg-coral text-[#fff] pt-[3px] pb-[3px] pl-[9px] pr-[9px] rounded-[99px] text-[10.5px] font-extrabold">
              {t("TODAY")}
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-[10px] pt-[18px] pb-[18px] pl-0 pr-0">
          <div
            className="w-[48px] h-[48px] rounded-[99px] bg-[var(--m-calm-soft)] grid text-[var(--m-calm)]"
            style={{ placeItems: "center" }}
          >
            <Icons.heart size={24} />
          </div>
          <div className="font-display font-bold text-[17px] whitespace-nowrap">
            {t("Rest day")}
          </div>
          <p className="text-[13px] text-ink-3 m-0">{d.note}</p>
        </div>
      </div>
    );
  }
  const m = MOODS[e.mood];
  const booked = (bookings || []).find(
    (b) => b.serviceId === e.id && b.day === d.day && b.status !== "cancelled",
  );
  return (
    <div
      className="card anim-pop"
      onClick={() => onOpen(e)}
      style={{
        flex: "none",
        width: 268,
        scrollSnapAlign: "start",
        overflow: "hidden",
        cursor: "pointer",
        transition: ".2s",
        animationDelay: `${i * 0.06}s`,
      }}
    >
      <PhotoFrame exp={e} ratio="16/11">
        <div className="absolute top-[12px] left-[12px] right-[12px] flex justify-between items-start">
          <span className="bg-[rgba(255,255,255,.92)] text-[#241C2E] pt-[5px] pb-[5px] pl-[11px] pr-[11px] rounded-[99px] text-[12px] font-extrabold">
            {d.wd} · {d.date}
          </span>
          {today && (
            <span className="bg-coral text-[#fff] pt-[5px] pb-[5px] pl-[10px] pr-[10px] rounded-[99px] text-[11px] font-extrabold">
              {t("TODAY")}
            </span>
          )}
        </div>
        <div className="ttl" style={{ fontSize: 18 }}>
          {e.title}
        </div>
      </PhotoFrame>
      <div className="pt-[13px] pr-[15px] pb-[15px] pl-[15px] flex flex-col gap-[11px]">
        <div className="flex items-center justify-between">
          <span
            className="mood-chip"
            style={{
              background: m.soft,
              color: m.color,
              padding: "5px 11px 5px 9px",
              fontSize: 12,
            }}
          >
            <MoodDot mood={e.mood} size={7} />
            {t(m.label)}
          </span>
          <span className="inline-flex items-center gap-[5px] text-[13px] font-bold text-ink-2">
            <Icons.clock size={14} />
            {d.time}
          </span>
        </div>
        <p className="m-0 text-[13px] text-ink-3 font-semibold">{d.note}</p>
        {booked ? (
          <div
            className="btn btn-sm"
            style={{
              background: "var(--m-calm-soft)",
              color: "var(--m-calm)",
              fontWeight: 700,
              cursor: "default",
            }}
          >
            <Icons.check size={16} />
            {booked.status === "pending" ? t("Requested") : t("Booked")} ·{" "}
            {booked.time}
          </div>
        ) : (
          <button
            className="btn btn-primary btn-sm btn-block"
            onClick={(ev) => {
              ev.stopPropagation();
              onOpen(e);
            }}
          >
            {t("Book this day")}
          </button>
        )}
      </div>
    </div>
  );
}
