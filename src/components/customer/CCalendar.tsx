"use client";

import { useMemo, useState } from "react";
import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";
import {
  MOODS,
  MOOD_ORDER,
  CATS,
  fmt,
  bg,
  MoodChip,
  MoodDot,
  Rating,
  type Exp,
} from "./primitives";
import { Button } from "@/components/ui";
import { ServiceModal, type Slot } from "./ServiceModal";
import { useFav } from "@/hooks";

const CAL_MONTH = { label: "June 2026", days: 30, firstDow: 0, today: 10 };
const CAL_WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CAL_WD_FULL = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const calDow = (day: number) => (day - 1) % 7;
const PRICE_BANDS = [
  { v: "any", l: "Any price" },
  { v: "low", l: "Under 2 000 ₽" },
  { v: "mid", l: "2 000–5 000 ₽" },
  { v: "high", l: "5 000 ₽+" },
];

type Session = {
  id: string;
  expId: string;
  day: number;
  time: string;
  tod: string;
  spots: number;
};
type Filters = {
  mood: string | null;
  cat: string;
  area: string;
  tod: string;
  price: string;
};

function calPasses(s: Session, f: Filters, byId: (id: string) => Exp | null) {
  const e = byId(s.expId);
  if (!e) return false;
  if (f.mood && e.mood !== f.mood) return false;
  if (f.cat !== "All" && e.cat !== f.cat) return false;
  if (f.area !== "All" && e.area !== f.area) return false;
  if (f.tod !== "any" && s.tod !== f.tod) return false;
  if (f.price === "low" && e.price >= 2000) return false;
  if (f.price === "mid" && (e.price < 2000 || e.price > 5000)) return false;
  if (f.price === "high" && e.price <= 5000) return false;
  return true;
}

export function CCalendar({
  sessions: allSessions,
  catalog,
  favs,
  slotsByService,
  wallet,
}: {
  sessions: Session[];
  catalog: Exp[];
  favs: string[];
  slotsByService: Record<string, Slot[]>;
  wallet: number;
}) {
  const t = useT();
  const byId = (id: string) => catalog.find((e) => e.id === id) || null;
  const calAreas = useMemo(
    () => Array.from(new Set(catalog.map((e) => e.area))).sort(),
    [catalog],
  );
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(CAL_MONTH.today);
  const [sel, setSel] = useState(CAL_MONTH.today);
  const [f, setF] = useState<Filters>({
    mood: null,
    cat: "All",
    area: "All",
    tod: "any",
    price: "any",
  });
  const [open, setOpen] = useState<Exp | null>(null);
  const onFav = useFav();
  const setFilter = (k: keyof Filters, v: Filters[keyof Filters]) =>
    setF((p) => ({ ...p, [k]: v }));
  const clear = () =>
    setF({ mood: null, cat: "All", area: "All", tod: "any", price: "any" });
  const activeFilters =
    (f.mood ? 1 : 0) +
    (f.cat !== "All" ? 1 : 0) +
    (f.area !== "All" ? 1 : 0) +
    (f.tod !== "any" ? 1 : 0) +
    (f.price !== "any" ? 1 : 0);

  const sessions = useMemo(
    () => allSessions.filter((s) => calPasses(s, f, byId)),
    [allSessions, f],
  );
  const byDay = useMemo(() => {
    const m: Record<number, Session[]> = {};
    sessions.forEach((s) => {
      (m[s.day] = m[s.day] || []).push(s);
    });
    return m;
  }, [sessions]);
  const weekStart = cursor - calDow(cursor);
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i).filter(
    (d) => d >= 1 && d <= CAL_MONTH.days,
  );

  return (
    <div className="animate-anim-fade-app">
      <div className="flex items-center gap-[14px] flex-wrap mb-[18px]">
        <Seg
          accent
          value={view}
          onChange={(v) => setView(v as "month" | "week")}
          options={[
            { v: "month", l: t("Month"), icon: <Icons.grid size={15} /> },
            { v: "week", l: t("Week"), icon: <Icons.list size={15} /> },
          ]}
        />
        <div className="flex items-center gap-[4px]">
          <button
            className="w-[38px] h-[38px] rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
            onClick={() => setCursor((c) => Math.max(1, c - 7))}
            disabled={view === "month"}
          >
            <Icons.arrowL size={18} />
          </button>
          <b className="font-display font-extrabold text-[20px] min-w-[148px] text-center">
            {view === "month" ? (
              <>
                {t("June")} 2026
              </>
            ) : (
              <>
                {t("Week of")} {weekStart < 1 ? 1 : weekStart} {t("Jun")}
              </>
            )}
          </b>
          <button
            className="w-[38px] h-[38px] rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
            onClick={() => setCursor((c) => Math.min(CAL_MONTH.days, c + 7))}
            disabled={view === "month"}
          >
            <Icons.arrowR size={18} />
          </button>
        </div>
        <div className="flex-1" />
        <Button
          ctx="app"
          variant="soft"
          size="sm"
          onClick={() => {
            setCursor(CAL_MONTH.today);
            setSel(CAL_MONTH.today);
          }}
        >
          {t("Today")}
        </Button>
      </div>

      <div className="flex flex-col gap-[12px] mb-5">
        <div className="flex gap-[9px] overflow-x-auto pb-[3px]">
          <button
            className={`inline-flex items-center gap-[7px] p-[9px_16px] rounded-pill text-[13px] font-semibold border cursor-pointer [transition:0.15s] ${!f.mood ? "bg-coral text-white border-coral" : "border-line-2 bg-surface hover:border-ink-3 hover:text-ink"}`}
            onClick={() => setFilter("mood", null)}
          >
            {t("All moods")}
          </button>
          {MOOD_ORDER.map((k) => (
            <MoodChip
              key={k}
              mood={k}
              active={f.mood === k}
              onClick={() => setFilter("mood", f.mood === k ? null : k)}
            />
          ))}
        </div>
        <div className="flex gap-[10px] flex-wrap items-center">
          <Sel value={f.cat} onChange={(v) => setFilter("cat", v)}>
            <option value="All">{t("All categories")}</option>
            {CATS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </Sel>
          <Sel value={f.area} onChange={(v) => setFilter("area", v)}>
            <option value="All">{t("All areas")}</option>
            {calAreas.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Sel>
          <Seg
            value={f.tod}
            onChange={(v) => setFilter("tod", v)}
            options={[
              { v: "any", l: t("Any time") },
              { v: "morning", l: t("AM"), icon: <Icons.sun size={14} /> },
              { v: "afternoon", l: t("Noon"), icon: <Icons.sunset size={14} /> },
              { v: "evening", l: t("PM"), icon: <Icons.moon size={14} /> },
            ]}
          />
          <Sel value={f.price} onChange={(v) => setFilter("price", v)}>
            {PRICE_BANDS.map((b) => (
              <option key={b.v} value={b.v}>
                {t(b.l)}
              </option>
            ))}
          </Sel>
          {activeFilters > 0 && (
            <Button ctx="app" variant="ghost" size="sm" onClick={clear}>
              <Icons.close size={14} />
              {t("Clear")}
              {` (${activeFilters})`}
            </Button>
          )}
          <span className="ml-auto text-ink-3 text-[13px] font-bold">
            {sessions.length} {t("sessions")}
          </span>
        </div>
      </div>

      {view === "month" ? (
        <MonthGrid
          byDay={byDay}
          sel={sel}
          setSel={(d) => {
            setSel(d);
            setCursor(d);
          }}
          byId={byId}
          onOpen={setOpen}
        />
      ) : (
        <WeekView days={weekDays} byDay={byDay} byId={byId} onOpen={setOpen} />
      )}

      {view === "month" && sel && (
        <DayPanel
          day={sel}
          list={(byDay[sel] || [])
            .slice()
            .sort((a, b) => a.time.localeCompare(b.time))}
          byId={byId}
          onOpen={setOpen}
        />
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

function Seg({
  value,
  options,
  onChange,
  accent,
}: {
  value: string;
  options: { v: string; l: string; icon?: React.ReactNode }[];
  onChange: (v: string) => void;
  accent?: boolean;
}) {
  return (
    <div className="inline-flex bg-surface-2 border border-line rounded-pill p-[4px] gap-[2px]">
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button
            key={o.v}
            className={`py-[8px] px-4 rounded-pill font-bold text-[13px] border-none cursor-pointer [transition:0.16s] whitespace-nowrap inline-flex items-center gap-[6px] ${
              on
                ? accent
                  ? "bg-coral text-[#fff]"
                  : "bg-surface text-ink"
                : "bg-transparent text-ink-3"
            }`}
            onClick={() => onChange(o.v)}
          >
            {o.icon}
            {o.l}
          </button>
        );
      })}
    </div>
  );
}
function Sel({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <span className="relative">
      <select
        className="appearance-none [-webkit-appearance:none] py-[9px] pr-[34px] pl-[14px] rounded-pill border border-line-2 bg-surface text-ink font-bold text-[13px] [font-family:inherit] cursor-pointer outline-none focus:border-coral"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <span className="absolute right-[13px] top-1/2 -translate-y-1/2 pointer-events-none text-ink-3">
        <Icons.chevR size={14} className="[transform:rotate(90deg)]" />
      </span>
    </span>
  );
}

function MonthGrid({
  byDay,
  sel,
  setSel,
  byId,
  onOpen,
}: {
  byDay: Record<number, Session[]>;
  sel: number;
  setSel: (d: number) => void;
  byId: (id: string) => Exp | null;
  onOpen: (e: Exp) => void;
}) {
  const t = useT();
  const cells: JSX.Element[] = [];
  for (let i = 0; i < CAL_MONTH.firstDow; i++)
    cells.push(
      <div
        key={`e${i}`}
        className="bg-bg min-h-[118px] pt-[9px] px-[9px] pb-[10px] text-left flex flex-col gap-[6px] relative cursor-default"
      />,
    );
  for (let d = 1; d <= CAL_MONTH.days; d++) {
    const list = (byDay[d] || [])
      .slice()
      .sort((a, b) => a.time.localeCompare(b.time));
    const past = d < CAL_MONTH.today;
    const today = d === CAL_MONTH.today;
    cells.push(
      <button
        key={d}
        className={`bg-surface min-h-[118px] pt-[9px] px-[9px] pb-[10px] text-left border-none cursor-pointer flex flex-col gap-[6px] [transition:0.14s] relative hover:bg-surface-2 ${
          past ? "opacity-[0.72]" : ""
        } ${
          sel === d
            ? "[box-shadow:inset_0_0_0_2px_var(--coral)] bg-coral-soft z-[2]"
            : ""
        }`}
        onClick={() => setSel(d)}
      >
        <span
          className={`flex items-center gap-[6px] font-extrabold text-[14px] font-display ${
            past ? "text-ink-3" : ""
          }`}
        >
          {today ? (
            <span className="bg-coral text-[#fff] w-[24px] h-[24px] rounded-[99px] grid place-items-center text-[13px]">
              {d}
            </span>
          ) : (
            d
          )}
        </span>
        <div className="flex flex-col gap-[4px]">
          {list.slice(0, 3).map((s) => {
            const e = byId(s.expId);
            if (!e) return null;
            const m = MOODS[e.mood];
            return (
              <span
                key={s.id}
                className="flex items-center gap-[6px] py-[3px] px-[8px] rounded-[7px] text-[11px] font-bold leading-[1.3] overflow-hidden whitespace-nowrap text-ellipsis [background:var(--pill-bg)] text-[var(--pill-c)]"
                style={{ "--pill-bg": m.soft, "--pill-c": m.color } as React.CSSProperties}
                onClick={(ev) => {
                  ev.stopPropagation();
                  onOpen(e);
                }}
              >
                <b className="flex-none">{s.time}</b>
                <span className="overflow-hidden text-ellipsis">{e.title}</span>
              </span>
            );
          })}
          {list.length > 3 && (
            <span className="text-[11px] font-bold text-ink-3 py-[1px] px-[6px]">
              +{list.length - 3} {t("more")}
            </span>
          )}
          {list.length === 0 && !past && (
            <span className="w-[5px] h-[5px] rounded-[99px] bg-line-2" />
          )}
        </div>
      </button>,
    );
  }
  return (
    <div className="grid grid-cols-[repeat(7,1fr)] bg-line border border-line rounded-lg overflow-hidden gap-[1px]">
      {CAL_WD.map((w) => (
        <div
          key={w}
          className="bg-surface py-[11px] px-3 text-[11.5px] font-extrabold tracking-[0.06em] uppercase text-ink-3 text-left"
        >
          {t(w)}
        </div>
      ))}
      {cells}
    </div>
  );
}

function DayPanel({
  day,
  list,
  byId,
  onOpen,
}: {
  day: number;
  list: Session[];
  byId: (id: string) => Exp | null;
  onOpen: (e: Exp) => void;
}) {
  const t = useT();
  const wd = CAL_WD_FULL[calDow(day)];
  return (
    <div className="mt-[18px] border border-line rounded-lg overflow-hidden bg-surface">
      <div className="flex items-center gap-[12px] py-[18px] px-[22px] [background:linear-gradient(120deg,var(--coral-soft),var(--surface)_75%)] border-b border-line">
        <div
          className="w-[46px] h-[46px] rounded-[13px] bg-surface grid place-items-center flex-none [box-shadow:var(--sh-sm)]"
        >
          <span className="font-display font-extrabold text-[20px] text-coral-deep">
            {day}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-[18px]">
            {t(wd)}, {day} {t("June")}
          </h3>
          <div className="text-[13px] text-ink-2 font-semibold">
            {list.length} {list.length !== 1 ? t("sessions") : t("session")}{" "}
            {t("available")}
          </div>
        </div>
        {day === CAL_MONTH.today && (
          <span
            className="inline-flex items-center px-[11px] py-[5px] rounded-pill text-[12px] font-semibold bg-[var(--coral)] text-[#fff] border-none"
          >
            {t("Today")}
          </span>
        )}
      </div>
      {list.length === 0 ? (
        <div className="p-[34px] text-center text-ink-3">
          <Icons.schedule size={30} />
          <p className="mt-[8px] font-semibold">
            {t("No sessions match your filters on this day.")}
          </p>
        </div>
      ) : (
        list.map((s) => {
          const e = byId(s.expId);
          if (!e) return null;
          const m = MOODS[e.mood];
          return (
            <div
              key={s.id}
              className="flex items-center gap-[16px] py-[14px] px-[22px] border-t border-line [transition:0.14s] cursor-pointer hover:bg-surface-2"
              onClick={() => onOpen(e)}
            >
              <span className="font-display font-extrabold text-[16px] w-[60px] flex-none">
                {s.time}
              </span>
              <div
                className="w-[54px] h-[54px] rounded-sm flex-none [background:var(--sw-bg)]"
                style={{ "--sw-bg": bg(e) } as React.CSSProperties}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[8px] mb-[4px]">
                  <span
                    className="inline-flex items-center gap-[8px] rounded-pill font-bold cursor-pointer [transition:0.14s] border-[1.5px] border-solid border-transparent p-[3px_9px_3px_8px] text-[11px] [background:var(--chip-bg)] text-[var(--chip-c)]"
                    style={
                      { "--chip-bg": m.soft, "--chip-c": m.color } as React.CSSProperties
                    }
                  >
                    <MoodDot mood={e.mood} size={6} />
                    {t(m.label)}
                  </span>
                  {e.rating && <Rating value={e.rating} />}
                </div>
                <div className="font-bold text-[15.5px]">{e.title}</div>
                <div className="text-[12.5px] text-ink-3 font-semibold flex gap-[12px] mt-[2px] flex-wrap">
                  <span className="inline-flex gap-[4px] items-center">
                    <Icons.pin size={13} />
                    {e.area}
                  </span>
                  <span className="inline-flex gap-[4px] items-center">
                    <Icons.clock size={13} />
                    {e.dur}
                  </span>
                  <span className="inline-flex gap-[4px] items-center">
                    <Icons.user size={13} />
                    {s.spots} {t("spots left")}
                  </span>
                </div>
              </div>
              <div className="text-right flex-none">
                <div
                  className="font-display font-bold text-ink whitespace-nowrap [&_small]:font-semibold [&_small]:text-[12.5px] [&_small]:text-ink-3 text-[17px] mb-[7px]"
                >
                  {fmt(e.price)}
                </div>
                <Button
                  ctx="app"
                  variant="primary"
                  size="sm"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onOpen(e);
                  }}
                >
                  {t("Book")}
                </Button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function WeekView({
  days,
  byDay,
  byId,
  onOpen,
}: {
  days: number[];
  byDay: Record<number, Session[]>;
  byId: (id: string) => Exp | null;
  onOpen: (e: Exp) => void;
}) {
  const t = useT();
  return (
    <div className="grid grid-cols-[repeat(7,1fr)] gap-[10px] max-[900px]:[grid-auto-flow:column] max-[900px]:[grid-auto-columns:minmax(180px,1fr)] max-[900px]:grid-cols-none max-[900px]:overflow-x-auto">
      {days.map((d) => {
        const list = (byDay[d] || [])
          .slice()
          .sort((a, b) => a.time.localeCompare(b.time));
        const today = d === CAL_MONTH.today;
        return (
          <div
            key={d}
            className="bg-surface border border-line rounded overflow-hidden flex flex-col min-h-[360px]"
          >
            <div
              className={`py-[11px] px-3 text-center border-b border-line ${
                today ? "bg-coral text-[#fff]" : ""
              }`}
            >
              <div
                className={`text-[11px] font-extrabold tracking-[.05em] uppercase ${today ? "opacity-90" : "opacity-60"}`}
              >
                {t(CAL_WD[calDow(d)])}
              </div>
              <div className="font-display font-extrabold text-[22px]">{d}</div>
            </div>
            <div className="p-[10px] flex flex-col gap-[9px] flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {list.length === 0 ? (
                <div className="flex-1 grid place-items-center text-ink-3 text-[12px] font-semibold text-center p-[18px]">
                  {t("No sessions")}
                </div>
              ) : (
                list.map((s) => {
                  const e = byId(s.expId);
                  if (!e) return null;
                  const m = MOODS[e.mood];
                  return (
                    <div
                      key={s.id}
                      className="rounded-[12px] py-[10px] px-[11px] cursor-pointer text-[#fff] relative overflow-hidden [transition:0.16s] hover:-translate-y-[2px] hover:shadow [background:var(--card-bg)]"
                      style={{ "--card-bg": bg(e) } as React.CSSProperties}
                      onClick={() => onOpen(e)}
                    >
                      <div className="absolute inset-0 bg-[rgba(0,0,0,.18)]" />
                      <div className="relative">
                        <div className="font-extrabold text-[14px] font-display">
                          {s.time}
                        </div>
                        <div
                          className="text-[12.5px] font-bold leading-[1.25] mt-[2px] [text-shadow:0_1px_6px_rgba(0,0,0,.3)]"
                        >
                          {e.title}
                        </div>
                        <div className="flex items-center justify-between mt-[7px] text-[11.5px] font-bold">
                          <span
                            className="bg-[rgba(255,255,255,.25)] py-[2px] px-[7px] rounded-[99px] [backdrop-filter:blur(4px)]"
                          >
                            {t(m.label)}
                          </span>
                          <span>{fmt(e.price)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
