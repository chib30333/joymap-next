"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { MOODS } from "@/components/customer/primitives";

const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const dow = (d: number) => (d - 1) % 7;
const TODAY = 10;
const PCAL_TIMES = [
  "07:30",
  "09:00",
  "11:00",
  "13:00",
  "15:00",
  "17:00",
  "18:30",
  "20:00",
];

type Svc = any;
type Slot = any;

export function PCalendar({ svcs, slots }: { svcs: Svc[]; slots: Slot[] }) {
  const router = useRouter();
  const days = Array.from({ length: 7 }, (_, i) => TODAY + i).filter(
    (d) => d <= 30,
  );
  const byDay: Record<number, Slot[]> = {};
  days.forEach((d) => (byDay[d] = []));
  slots.forEach((s) => {
    if (byDay[s.day]) byDay[s.day].push(s);
  });
  days.forEach((d) => byDay[d].sort((a, b) => a.time.localeCompare(b.time)));

  const [over, setOver] = useState<number | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const drag = useRef<any>(null);
  const total = slots.length;
  const nextTime = (arr: Slot[]) => {
    const used = new Set(arr.map((s) => s.time));
    return PCAL_TIMES.find((tm) => !used.has(tm)) || "12:00";
  };

  const startSvc = (sid: string, e: React.DragEvent) => {
    drag.current = { kind: "service", sid };
    setDragId("svc:" + sid);
    e.dataTransfer.effectAllowed = "copy";
    try {
      e.dataTransfer.setData("text/plain", sid);
    } catch {}
  };
  const startSlot = (slot: Slot, e: React.DragEvent) => {
    e.stopPropagation();
    drag.current = {
      kind: "slot",
      slotId: slot.id,
      fromDay: slot.day,
      time: slot.time,
    };
    setDragId("slot:" + slot.id);
    e.dataTransfer.effectAllowed = "move";
    try {
      e.dataTransfer.setData("text/plain", slot.id);
    } catch {}
  };
  const endDrag = () => {
    drag.current = null;
    setDragId(null);
    setOver(null);
  };
  const drop = (day: number, e: React.DragEvent) => {
    e.preventDefault();
    const p = drag.current;
    setOver(null);
    if (!p) return;
    if (p.kind === "service")
      rpc("addSlot", {
        serviceId: p.sid,
        day,
        time: nextTime(byDay[day] || []),
      }).then(() => router.refresh());
    else if (p.kind === "slot" && p.fromDay !== day) {
      const used = new Set((byDay[day] || []).map((s) => s.time));
      rpc("moveSlot", {
        slotId: p.slotId,
        day,
        time: used.has(p.time) ? nextTime(byDay[day] || []) : p.time,
      }).then(() => router.refresh());
    }
    endDrag();
  };
  const remove = (id: string) =>
    rpc("removeSlot", { slotId: id }).then(() => router.refresh());
  const setTime = (id: string, time: string) => {
    setEditing(null);
    rpc("setSlotTime", { slotId: id, time }).then(() => router.refresh());
  };

  return (
    <div className="anim-fade">
      <div className="shead">
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Week of {TODAY}–{Math.min(TODAY + 6, 30)} Jun · {total} sessions
          </div>
          <h2 className="text-[22px]">Schedule</h2>
        </div>
        <div className="flex items-center gap-[10px] text-ink-3 text-[13px] font-bold">
          <Icons.briefcase size={16} />
          Drag a service onto a day — saved instantly
        </div>
      </div>
      <div className="pcal-wrap">
        <aside className="pcal-palette">
          <div className="pcal-pal-head">Your services</div>
          {svcs.length === 0 && (
            <div className="text-[12.5px] text-ink-3 font-semibold leading-[1.5]">
              No services yet — create one in <b>Services</b> first.
            </div>
          )}
          {svcs.map((svc) => {
            const m = MOODS[svc.mood];
            return (
              <div
                key={svc.id}
                className={`pcal-svc ${dragId === "svc:" + svc.id ? "dragging" : ""}`}
                draggable
                style={{ borderLeftColor: m.color }}
                onDragStart={(e) => startSvc(svc.id, e)}
                onDragEnd={endDrag}
              >
                <span className="pcal-grip">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className="font-bold text-[13px] leading-[1.2] whitespace-nowrap overflow-hidden"
                    style={{ textOverflow: "ellipsis" }}
                  >
                    {svc.name}
                  </div>
                  <div className="flex items-center gap-[7px] mt-[4px]">
                    <span
                      className="w-[7px] h-[7px] rounded-[99px]"
                      style={{ background: m.color }}
                    />
                    <span className="text-[11px] text-ink-3 font-semibold">
                      {svc.dur} · {svc.cap} cap
                    </span>
                    {svc.status === "review" && (
                      <span className="text-[9.5px] font-extrabold text-[#E89015] bg-[rgba(232,144,21,.12)] rounded-[99px] px-[6px] py-[1px]">
                        IN REVIEW
                      </span>
                    )}
                    {svc.active === false && (
                      <span className="text-[9.5px] font-extrabold text-ink-3 bg-surface border border-line rounded-[99px] px-[6px] py-[1px]">
                        PAUSED
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex gap-[8px] items-start mt-[4px] p-[10px] rounded-sm bg-surface-2 text-ink-2 text-[11.5px] font-semibold leading-[1.4]">
            <Icons.sparkle
              size={15}
              style={{ color: "var(--coral)", flex: "none", marginTop: 1 }}
            />
            Slots feed the customer calendar and booking flow instantly.
          </div>
        </aside>
        <div className="pcal-week">
          {days.map((d) => {
            const list = byDay[d] || [];
            const today = d === TODAY;
            const isOver = over === d;
            return (
              <div
                key={d}
                className={`pcal-col ${today ? "today" : ""} ${isOver ? "over" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (over !== d) setOver(d);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node))
                    setOver((o) => (o === d ? null : o));
                }}
                onDrop={(e) => drop(d, e)}
              >
                <div className={`pcal-col-h ${today ? "today" : ""}`}>
                  <div className="wd">{WD[dow(d)]}</div>
                  <div className="dn">{d}</div>
                  {list.length > 0 && (
                    <span className="pcal-cnt">{list.length}</span>
                  )}
                </div>
                <div className="pcal-col-b">
                  {list.length === 0 ? (
                    <div className="pcal-drop">
                      {isOver ? "Release to schedule" : "Drop a service here"}
                    </div>
                  ) : (
                    list.map((slot) => {
                      const svc = svcs.find((x) => x.id === slot.serviceId) || {
                        name: "Service",
                        mood: "calm",
                        cap: 0,
                      };
                      const m = MOODS[svc.mood];
                      return (
                        <div
                          key={slot.id}
                          className={`pcal-slot ${dragId === "slot:" + slot.id ? "dragging" : ""}`}
                          draggable
                          style={{
                            background: m.soft,
                            borderLeftColor: m.color,
                          }}
                          onDragStart={(e) => startSlot(slot, e)}
                          onDragEnd={endDrag}
                        >
                          <button
                            className="pcal-x"
                            onClick={() => remove(slot.id)}
                            title="Remove"
                          >
                            <Icons.close size={12} />
                          </button>
                          <button
                            className="pcal-time-btn"
                            style={{ color: m.color }}
                            onClick={() =>
                              setEditing((e) =>
                                e === slot.id ? null : slot.id,
                              )
                            }
                          >
                            <Icons.clock size={12} />
                            {slot.time}
                          </button>
                          <div className="text-[11.5px] font-bold leading-[1.2] mt-[3px] text-ink pr-[14px]">
                            {svc.name}
                          </div>
                          <div className="text-[10.5px] text-ink-3 font-semibold mt-[3px]">
                            {slot.booked || 0}/{svc.cap} booked
                          </div>
                          {editing === slot.id && (
                            <div className="pcal-times">
                              {PCAL_TIMES.map((tm) => (
                                <button
                                  key={tm}
                                  className={slot.time === tm ? "on" : ""}
                                  onClick={() => setTime(slot.id, tm)}
                                >
                                  {tm}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
