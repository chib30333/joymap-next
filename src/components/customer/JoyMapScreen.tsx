"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { useBusy } from "@/hooks";
import {
  MOODS,
  PhotoFrame,
  MoodDot,
  type Exp,
} from "./primitives";
import { Button } from "@/components/ui";
import { ServiceModal, type Slot } from "./ServiceModal";
import { useFav } from "@/hooks";
import { useT } from "@/components/Language";

type Day = {
  day: number;
  wd: string;
  date: string;
  rest?: boolean;
  expId: string | null;
  time?: string;
  note: string;
};

type Booking = {
  serviceId: string;
  day: number;
  time: string;
  status: string;
};

type ByIdFn = (id: string | null) => Exp | null;

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
  bookings: Booking[];
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
  const byId: ByIdFn = (id) => catalog.find((e) => e.id === id) || null;
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
    <div className="animate-anim-fade-app">
      <div className="flex items-end justify-between gap-5 flex-wrap mt-1.5 mb-6">
        <div>
          <div className="text-xs font-bold tracking-widest uppercase text-orange mb-2">
            {t("This week")} · {weekLabel}
          </div>
          <h1
            className="max-w-[560px] leading-none text-[clamp(30px,4vw,44px)]"
          >
            {greet}, {userName}.{" "}
            <span className="text-[var(--orange)]">
              {t("Here's your week of joy.")}
            </span>
          </h1>
          <p className="text-ink-2 text-base mt-3 max-w-[520px]">
            {t(
              "Seven days, tuned to how you want to feel. Booked days are locked in — swap anything that doesn't fit.",
            )}
          </p>
        </div>
        <Button
          busy={busy}
          ctx="app"
          variant="ghost"
          size="md"
          icon={<Icons.refresh size={18} />}
          onClick={regen}
        >
          {t("Regenerate")}
        </Button>
      </div>

      {catalog.length === 0 ? (
        <EmptyMarketplace />
      ) : map.length === 0 ? (
        <div
          className="bg-surface border border-line rounded-lg px-6 py-14 text-center"
        >
          <div
            className="w-16 h-16 rounded-pill bg-coral-soft text-coral-deep grid mt-0 mb-3.5 mx-auto place-items-center"
          >
            <Icons.sparkle size={26} />
          </div>
          <h3 className="text-xl">{t("No Joy Map yet")}</h3>
          <p className="text-ink-2 text-sm mt-2 mb-5 mx-auto max-w-[380px]">
            {t("Let Joy compose a week of experiences around your moods.")}
          </p>
          <Button
            busy={busy}
            ctx="app"
            variant="primary"
            size="md"
            icon={<Icons.sparkle size={17} />}
            onClick={regen}
          >
            {t("Build my week")}
          </Button>
        </div>
      ) : (
        <>
          <MoodArc map={map} byId={byId} />
          <div className="relative mt-7">
            <div
              className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex gap-4 overflow-x-auto pb-2.5 [scroll-snap-type:x_proximity]"
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
              className="bg-[linear-gradient(160deg,#5e1014,var(--maroon))] border border-[color-mix(in_srgb,var(--coral)_55%,transparent)] text-[#f3ebe0] rounded-lg mt-7 p-6 flex gap-5 items-start"
            >
              <div
                className="flex-none grid place-items-center bg-coral text-white w-11 h-11 rounded-md"
              >
                <Icons.sparkle size={22} />
              </div>
              <div>
                <h3 className="text-base mb-1.5 text-[#fff3e8]">
                  {t("Why Joy built this week")}
                </h3>
                <p className="text-[rgba(243,235,224,.85)] text-sm leading-normal max-w-[760px]">
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
    <div className="bg-surface border border-line rounded-lg px-6 py-16 text-center">
      <div
        className="w-16 h-16 rounded-pill bg-surface-2 grid mt-0 mb-4 mx-auto text-ink-3 place-items-center"
      >
        <Icons.compass size={30} />
      </div>
      <h3 className="text-xl text-ink">{t("The marketplace is empty")}</h3>
      <p className="text-ink-2 text-sm mt-2 mb-0 mx-auto max-w-[420px] leading-normal">
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
  byId: ByIdFn;
}) {
  const t = useT();
  return (
    <div
      className="bg-surface border border-line rounded-lg px-5 py-3.5 flex items-center gap-3.5 overflow-x-auto"
    >
      <span className="text-xs font-bold text-ink-3 tracking-wider uppercase flex-none">
        {t("Your emotional arc")}
      </span>
      <div className="flex items-center gap-0 flex-1 min-w-[420px]">
        {map.map((d) => {
          const e = d.rest ? null : byId(d.expId);
          const m = e ? MOODS[e.mood] : null;
          return (
            <div key={d.day} className="text-center flex-1">
              <div
                className="h-2 rounded-pill mb-1.5 [background:var(--bar-bg)] [box-shadow:var(--bar-sh)]"
                style={
                  {
                    "--bar-bg": m ? m.color : "var(--line-2)",
                    "--bar-sh": m ? `0 2px 8px ${m.color}55` : "none",
                  } as React.CSSProperties
                }
              />
              <span className="text-xs font-bold text-ink-3">{d.wd}</span>
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
  byId: ByIdFn;
  onOpen: (e: Exp) => void;
  bookings: Booking[];
}) {
  const t = useT();
  const today = d.day === TODAY;
  const e = d.rest ? null : byId(d.expId);
  if (d.rest || !e) {
    return (
      <div
        className="border border-line rounded-lg animate-anim-pop-app flex-none w-[230px] [scroll-snap-align:start] p-5 flex flex-col bg-surface-2 [border-style:dashed] [animation-delay:var(--ad)]"
        style={{ "--ad": `${i * 0.06}s` } as React.CSSProperties}
      >
        <div className="flex items-center justify-between">
          <span className="font-display font-extrabold text-base">
            {d.wd} · {d.date}
          </span>
          {today && (
            <span className="bg-coral text-white pt-1 pb-1 pl-2 pr-2 rounded-pill text-xs font-extrabold">
              {t("TODAY")}
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-center items-center text-center gap-2.5 pt-5 pb-5 pl-0 pr-0">
          <div
            className="w-12 h-12 rounded-pill bg-[var(--m-calm-soft)] grid text-[var(--m-calm)] place-items-center"
          >
            <Icons.heart size={24} />
          </div>
          <div className="font-display font-bold text-base whitespace-nowrap">
            {t("Rest day")}
          </div>
          <p className="text-sm text-ink-3 m-0">{d.note}</p>
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
      className="bg-surface border border-line rounded-lg animate-anim-pop-app flex-none w-[268px] [scroll-snap-align:start] overflow-hidden cursor-pointer duration-200 [animation-delay:var(--ad)]"
      onClick={() => onOpen(e)}
      style={{ "--ad": `${i * 0.06}s` } as React.CSSProperties}
    >
      <PhotoFrame exp={e} ratio="16/11">
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          <span className="bg-[rgba(255,255,255,.92)] text-[#241C2E] pt-1.5 pb-1.5 pl-3 pr-3 rounded-pill text-xs font-extrabold">
            {d.wd} · {d.date}
          </span>
          {today && (
            <span className="bg-coral text-white pt-1.5 pb-1.5 pl-2.5 pr-2.5 rounded-pill text-xs font-extrabold">
              {t("TODAY")}
            </span>
          )}
        </div>
        <div className="absolute left-3.5 right-3.5 bottom-3 text-white font-display font-bold text-lg tracking-normal leading-none [text-shadow:0_1px_12px_rgba(0,0,0,0.35)]">
          {e.title}
        </div>
      </PhotoFrame>
      <div className="pt-3.5 pr-4 pb-4 pl-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span
            className="inline-flex items-center gap-2 rounded-pill font-bold cursor-pointer duration-[140ms] border-2 border-solid border-transparent py-1.5 pr-3 pl-2 text-xs [background:var(--chip-bg)] text-[var(--chip-c)]"
            style={
              { "--chip-bg": m.soft, "--chip-c": m.color } as React.CSSProperties
            }
          >
            <MoodDot mood={e.mood} size={7} />
            {t(m.label)}
          </span>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ink-2">
            <Icons.clock size={14} />
            {d.time}
          </span>
        </div>
        <p className="m-0 text-sm text-ink-3 font-semibold">{d.note}</p>
        {booked ? (
          <div
            className="inline-flex items-center justify-center font-bold rounded-pill whitespace-nowrap leading-none duration-[160ms] active:[transform:translateY(1px)_scale(0.99)] gap-2 py-2 px-4 text-sm bg-[var(--m-calm-soft)] text-[var(--m-calm)] cursor-default"
          >
            <Icons.check size={16} />
            {booked.status === "pending" ? t("Requested") : t("Booked")} ·{" "}
            {booked.time}
          </div>
        ) : (
          <Button
            ctx="app"
            variant="primary"
            size="sm"
            block
            onClick={(ev) => {
              ev.stopPropagation();
              onOpen(e);
            }}
          >
            {t("Book this day")}
          </Button>
        )}
      </div>
    </div>
  );
}
