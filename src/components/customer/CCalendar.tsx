"use client";
// CCalendar — 1:1 port of calendar.jsx (month/week views, filters, day panel).
import { useMemo, useState } from "react";
import { Icons } from "@/components/Icons";
import { MOODS, MOOD_ORDER, CATS, fmt, bg, MoodChip, MoodDot, Rating, Btn, type Exp } from "./primitives";
import { ServiceModal, type Slot } from "./ServiceModal";
import { useFav } from "./useFav";

const CAL_MONTH = { label: "June 2026", days: 30, firstDow: 0, today: 10 };
const CAL_WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CAL_WD_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const calDow = (day: number) => (day - 1) % 7;
const calDateLabel = (day: number) => `${day} Jun`;
const PRICE_BANDS = [{ v: "any", l: "Any price" }, { v: "low", l: "Under 2 000 ₽" }, { v: "mid", l: "2 000–5 000 ₽" }, { v: "high", l: "5 000 ₽+" }];

type Session = { id: string; expId: string; day: number; time: string; tod: string; spots: number };
type Filters = { mood: string | null; cat: string; area: string; tod: string; price: string };

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

export function CCalendar({ sessions: allSessions, catalog, favs, slotsByService, wallet }: {
  sessions: Session[]; catalog: Exp[]; favs: string[]; slotsByService: Record<string, Slot[]>; wallet: number;
}) {
  const byId = (id: string) => catalog.find((e) => e.id === id) || null;
  const calAreas = useMemo(() => Array.from(new Set(catalog.map((e) => e.area))).sort(), [catalog]);
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(CAL_MONTH.today);
  const [sel, setSel] = useState(CAL_MONTH.today);
  const [f, setF] = useState<Filters>({ mood: null, cat: "All", area: "All", tod: "any", price: "any" });
  const [open, setOpen] = useState<Exp | null>(null);
  const onFav = useFav();
  const setFilter = (k: keyof Filters, v: any) => setF((p) => ({ ...p, [k]: v }));
  const clear = () => setF({ mood: null, cat: "All", area: "All", tod: "any", price: "any" });
  const activeFilters = (f.mood ? 1 : 0) + (f.cat !== "All" ? 1 : 0) + (f.area !== "All" ? 1 : 0) + (f.tod !== "any" ? 1 : 0) + (f.price !== "any" ? 1 : 0);

  const sessions = useMemo(() => allSessions.filter((s) => calPasses(s, f, byId)), [allSessions, f]);
  const byDay = useMemo(() => { const m: Record<number, Session[]> = {}; sessions.forEach((s) => { (m[s.day] = m[s.day] || []).push(s); }); return m; }, [sessions]);
  const weekStart = cursor - calDow(cursor);
  const weekDays = Array.from({ length: 7 }, (_, i) => weekStart + i).filter((d) => d >= 1 && d <= CAL_MONTH.days);

  return (
    <div className="anim-fade">
      <div className="cal-toolbar">
        <Seg accent value={view} onChange={(v) => setView(v as any)} options={[{ v: "month", l: "Month", icon: <Icons.grid size={15} /> }, { v: "week", l: "Week", icon: <Icons.list size={15} /> }]} />
        <div className="cal-nav">
          <button className="icon-btn" style={{ width: 38, height: 38 }} onClick={() => setCursor((c) => Math.max(1, c - 7))} disabled={view === "month"}><Icons.arrowL size={18} /></button>
          <b>{view === "month" ? CAL_MONTH.label : `Week of ${calDateLabel(weekStart < 1 ? 1 : weekStart)}`}</b>
          <button className="icon-btn" style={{ width: 38, height: 38 }} onClick={() => setCursor((c) => Math.min(CAL_MONTH.days, c + 7))} disabled={view === "month"}><Icons.arrowR size={18} /></button>
        </div>
        <div className="flex-1" />
        <button className="btn btn-soft btn-sm" onClick={() => { setCursor(CAL_MONTH.today); setSel(CAL_MONTH.today); }}>Today</button>
      </div>

      <div className="cal-filters">
        <div className="cal-moodrail">
          <button className={`chip ${!f.mood ? "on" : ""}`} style={{ padding: "9px 16px" }} onClick={() => setFilter("mood", null)}>All moods</button>
          {MOOD_ORDER.map((k) => <MoodChip key={k} mood={k} active={f.mood === k} onClick={() => setFilter("mood", f.mood === k ? null : k)} />)}
        </div>
        <div className="cal-selects">
          <Sel value={f.cat} onChange={(v) => setFilter("cat", v)}><option value="All">All categories</option>{CATS.map((c) => <option key={c}>{c}</option>)}</Sel>
          <Sel value={f.area} onChange={(v) => setFilter("area", v)}><option value="All">All areas</option>{calAreas.map((a) => <option key={a}>{a}</option>)}</Sel>
          <Seg value={f.tod} onChange={(v) => setFilter("tod", v)} options={[{ v: "any", l: "Any time" }, { v: "morning", l: "AM", icon: <Icons.sun size={14} /> }, { v: "afternoon", l: "Noon", icon: <Icons.sunset size={14} /> }, { v: "evening", l: "PM", icon: <Icons.moon size={14} /> }]} />
          <Sel value={f.price} onChange={(v) => setFilter("price", v)}>{PRICE_BANDS.map((b) => <option key={b.v} value={b.v}>{b.l}</option>)}</Sel>
          {activeFilters > 0 && <button className="btn btn-ghost btn-sm" onClick={clear}><Icons.close size={14} />Clear{` (${activeFilters})`}</button>}
          <span className="ml-auto text-ink-3 text-[13px] font-bold">{sessions.length} sessions</span>
        </div>
      </div>

      {view === "month"
        ? <MonthGrid byDay={byDay} sel={sel} setSel={(d) => { setSel(d); setCursor(d); }} byId={byId} onOpen={setOpen} />
        : <WeekView days={weekDays} byDay={byDay} byId={byId} onOpen={setOpen} />}

      {view === "month" && sel && <DayPanel day={sel} list={(byDay[sel] || []).slice().sort((a, b) => a.time.localeCompare(b.time))} byId={byId} onOpen={setOpen} />}

      {open && <ServiceModal exp={open} slots={slotsByService[open.id] || []} wallet={wallet} fav={favs.includes(open.id)} onFav={onFav} onClose={() => setOpen(null)} />}
    </div>
  );
}

function Seg({ value, options, onChange, accent }: { value: string; options: { v: string; l: string; icon?: React.ReactNode }[]; onChange: (v: string) => void; accent?: boolean }) {
  return <div className={`seg ${accent ? "accent" : ""}`}>{options.map((o) => <button key={o.v} className={value === o.v ? "on" : ""} onClick={() => onChange(o.v)}>{o.icon}{o.l}</button>)}</div>;
}
function Sel({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return <span className="cal-sel"><select value={value} onChange={(e) => onChange(e.target.value)}>{children}</select><span className="cev"><Icons.chevR size={14} style={{ transform: "rotate(90deg)" }} /></span></span>;
}

function MonthGrid({ byDay, sel, setSel, byId, onOpen }: { byDay: Record<number, Session[]>; sel: number; setSel: (d: number) => void; byId: (id: string) => Exp | null; onOpen: (e: Exp) => void }) {
  const cells: JSX.Element[] = [];
  for (let i = 0; i < CAL_MONTH.firstDow; i++) cells.push(<div key={`e${i}`} className="cal-day empty" />);
  for (let d = 1; d <= CAL_MONTH.days; d++) {
    const list = (byDay[d] || []).slice().sort((a, b) => a.time.localeCompare(b.time));
    const past = d < CAL_MONTH.today;
    const today = d === CAL_MONTH.today;
    cells.push(
      <button key={d} className={`cal-day ${past ? "past" : ""} ${sel === d ? "sel" : ""}`} onClick={() => setSel(d)}>
        <span className="cal-dnum">{today ? <span className="cal-today">{d}</span> : d}</span>
        <div className="flex flex-col gap-[4px]">
          {list.slice(0, 3).map((s) => { const e = byId(s.expId); if (!e) return null; const m = MOODS[e.mood]; return <span key={s.id} className="cal-chip" style={{ background: m.soft, color: m.color }} onClick={(ev) => { ev.stopPropagation(); onOpen(e); }}><b>{s.time}</b><span>{e.title}</span></span>; })}
          {list.length > 3 && <span className="cal-more">+{list.length - 3} more</span>}
          {list.length === 0 && !past && <span className="cal-empty-dot" />}
        </div>
      </button>
    );
  }
  return <div className="cal-grid">{CAL_WD.map((w) => <div key={w} className="cal-wd">{w}</div>)}{cells}</div>;
}

function DayPanel({ day, list, byId, onOpen }: { day: number; list: Session[]; byId: (id: string) => Exp | null; onOpen: (e: Exp) => void }) {
  const wd = CAL_WD_FULL[calDow(day)];
  return (
    <div className="cal-day-panel">
      <div className="cal-day-head">
        <div className="w-[46px] h-[46px] rounded-[13px] bg-surface grid place-items-center flex-none" style={{ boxShadow: "var(--sh-sm)" }}>
          <span className="font-display font-extrabold text-[20px] text-coral-deep">{day}</span></div>
        <div className="flex-1">
          <h3 className="text-[18px]">{wd}, {day} June</h3>
          <div className="text-[13px] text-ink-2 font-semibold">{list.length} session{list.length !== 1 ? "s" : ""} available</div>
        </div>
        {day === CAL_MONTH.today && <span className="tag" style={{ background: "var(--coral)", color: "#fff", border: "none" }}>Today</span>}
      </div>
      {list.length === 0
        ? <div className="p-[34px] text-center text-ink-3"><Icons.schedule size={30} /><p className="mt-[8px] font-semibold">No sessions match your filters on this day.</p></div>
        : list.map((s) => {
          const e = byId(s.expId); if (!e) return null; const m = MOODS[e.mood];
          return (
            <div key={s.id} className="cal-srow" onClick={() => onOpen(e)}>
              <span className="cal-time">{s.time}</span>
              <div className="w-[54px] h-[54px] rounded-sm flex-none" style={{ background: bg(e) }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[8px] mb-[4px]">
                  <span className="mood-chip" style={{ background: m.soft, color: m.color, padding: "3px 9px 3px 8px", fontSize: 11 }}><MoodDot mood={e.mood} size={6} />{m.label}</span>
                  {e.rating && <Rating value={e.rating} />}
                </div>
                <div className="font-bold text-[15.5px]">{e.title}</div>
                <div className="text-[12.5px] text-ink-3 font-semibold flex gap-[12px] mt-[2px] flex-wrap">
                  <span className="inline-flex gap-[4px] items-center"><Icons.pin size={13} />{e.area}</span>
                  <span className="inline-flex gap-[4px] items-center"><Icons.clock size={13} />{e.dur}</span>
                  <span className="inline-flex gap-[4px] items-center"><Icons.user size={13} />{s.spots} spots left</span>
                </div>
              </div>
              <div className="text-right flex-none">
                <div className="price" style={{ fontSize: 17, marginBottom: 7 }}>{fmt(e.price)}</div>
                <Btn size="sm" onClick={(ev) => { ev.stopPropagation(); onOpen(e); }}>Book</Btn>
              </div>
            </div>
          );
        })}
    </div>
  );
}

function WeekView({ days, byDay, byId, onOpen }: { days: number[]; byDay: Record<number, Session[]>; byId: (id: string) => Exp | null; onOpen: (e: Exp) => void }) {
  return (
    <div className="cal-week">
      {days.map((d) => {
        const list = (byDay[d] || []).slice().sort((a, b) => a.time.localeCompare(b.time));
        const today = d === CAL_MONTH.today;
        return (
          <div key={d} className="cal-col">
            <div className={`cal-col-h ${today ? "today" : ""}`}>
              <div className="text-[11px] font-extrabold tracking-[.05em] uppercase" style={{ opacity: today ? 0.9 : 0.6 }}>{CAL_WD[calDow(d)]}</div>
              <div className="font-display font-extrabold text-[22px]">{d}</div>
            </div>
            <div className="cal-col-b no-scrollbar">
              {list.length === 0
                ? <div className="wk-empty">No sessions</div>
                : list.map((s) => { const e = byId(s.expId); if (!e) return null; const m = MOODS[e.mood]; return (
                  <div key={s.id} className="wk-card" style={{ background: bg(e) }} onClick={() => onOpen(e)}>
                    <div className="absolute inset-0 bg-[rgba(0,0,0,.18)]" />
                    <div className="relative">
                      <div className="font-extrabold text-[14px] font-display">{s.time}</div>
                      <div className="text-[12.5px] font-bold leading-[1.25] mt-[2px]" style={{ textShadow: "0 1px 6px rgba(0,0,0,.3)" }}>{e.title}</div>
                      <div className="flex items-center justify-between mt-[7px] text-[11.5px] font-bold">
                        <span className="bg-[rgba(255,255,255,.25)] py-[2px] px-[7px] rounded-[99px]" style={{ backdropFilter: "blur(4px)" }}>{m.label}</span>
                        <span>{fmt(e.price)}</span>
                      </div>
                    </div>
                  </div>
                ); })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
