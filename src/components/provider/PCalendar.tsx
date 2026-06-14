"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { MOODS } from "@/components/customer/primitives";
import { useT } from "@/components/Language";

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
  const t = useT();
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
    <div className="animate-anim-fade-dash">
      <div className="flex items-end justify-between gap-4 mb-[18px]">
        <div>
          <div className="text-[12px] font-extrabold tracking-[0.1em] uppercase text-orange mb-[6px]">
            {t("Week of")} {TODAY}–{Math.min(TODAY + 6, 30)} {t("Jun")} · {total}{" "}
            {t("sessions")}
          </div>
          <h2 className="text-[22px]">{t("Schedule")}</h2>
        </div>
        <div className="flex items-center gap-[10px] text-ink-3 text-[13px] font-bold">
          <Icons.briefcase size={16} />
          {t("Drag a service onto a day — saved instantly")}
        </div>
      </div>
      <div className="grid grid-cols-[240px_1fr] gap-[var(--gap)] items-start max-[920px]:grid-cols-[1fr]">
        <aside className="sticky top-[94px] flex flex-col gap-[9px] bg-surface border border-line rounded-lg p-4">
          <div className="text-[11.5px] font-extrabold tracking-[0.05em] uppercase text-ink-3">
            {t("Your services")}
          </div>
          {svcs.length === 0 && (
            <div className="text-[12.5px] text-ink-3 font-semibold leading-[1.5]">
              {t("No services yet — create one in")} <b>{t("Services")}</b>{" "}
              {t("first.")}
            </div>
          )}
          {svcs.map((svc) => {
            const m = MOODS[svc.mood];
            return (
              <div
                key={svc.id}
                className={`flex items-center gap-[10px] py-[10px] px-[11px] rounded border border-line border-l-4 bg-surface-2 cursor-grab [transition:0.14s] select-none hover:shadow hover:-translate-y-px active:cursor-grabbing [border-left-color:var(--blc)] ${dragId === "svc:" + svc.id ? "opacity-[0.38]" : ""}`}
                draggable
                style={{ ["--blc"]: m.color } as React.CSSProperties}
                onDragStart={(e) => startSvc(svc.id, e)}
                onDragEnd={endDrag}
              >
                <span className="grid grid-cols-[1fr_1fr] gap-[2px] flex-none [&>i]:w-[3px] [&>i]:h-[3px] [&>i]:rounded-[99px] [&>i]:bg-ink-3 [&>i]:block">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[13px] leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis">
                    {svc.name}
                  </div>
                  <div className="flex items-center gap-[7px] mt-[4px]">
                    <span
                      className="w-[7px] h-[7px] rounded-[99px] [background:var(--bg)]"
                      style={{ ["--bg"]: m.color } as React.CSSProperties}
                    />
                    <span className="text-[11px] text-ink-3 font-semibold">
                      {svc.dur} · {svc.cap} {t("cap")}
                    </span>
                    {svc.status === "review" && (
                      <span className="text-[9.5px] font-extrabold text-[#E89015] bg-[rgba(232,144,21,.12)] rounded-[99px] px-[6px] py-[1px]">
                        {t("IN REVIEW")}
                      </span>
                    )}
                    {svc.active === false && (
                      <span className="text-[9.5px] font-extrabold text-ink-3 bg-surface border border-line rounded-[99px] px-[6px] py-[1px]">
                        {t("PAUSED")}
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
              className="text-coral flex-none mt-px"
            />
            {t("Slots feed the customer calendar and booking flow instantly.")}
          </div>
        </aside>
        <div className="grid grid-cols-[repeat(7,1fr)] gap-[10px] max-[1180px]:grid-flow-col max-[1180px]:auto-cols-[minmax(156px,1fr)] max-[1180px]:grid-cols-none max-[1180px]:overflow-x-auto max-[1180px]:pb-[6px]">
          {days.map((d) => {
            const list = byDay[d] || [];
            const today = d === TODAY;
            const isOver = over === d;
            return (
              <div
                key={d}
                className={`group/col bg-surface border rounded min-h-[360px] flex flex-col [transition:0.16s] ${
                  isOver
                    ? "border-coral border-dashed bg-coral-soft shadow-[0_0_0_3px_var(--coral-soft)] -translate-y-[2px]"
                    : today
                      ? "border-coral"
                      : "border-line"
                }`}
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
                <div className="text-center py-[9px] px-2 border-b border-line relative">
                  <div
                    className={`text-[11px] font-extrabold tracking-[0.04em] uppercase ${today ? "text-coral" : "text-ink-3"}`}
                  >
                    {t(WD[dow(d)])}
                  </div>
                  <div
                    className={`font-display font-extrabold text-[19px] ${today ? "text-coral" : ""}`}
                  >
                    {d}
                  </div>
                  {list.length > 0 && (
                    <span className="absolute top-[9px] right-[9px] text-[10.5px] font-extrabold text-ink-3 bg-surface-2 border border-line rounded-[99px] px-[6px] py-[1px]">
                      {list.length}
                    </span>
                  )}
                </div>
                <div className="flex-1 p-[9px] flex flex-col gap-2">
                  {list.length === 0 ? (
                    <div
                      className={`flex-1 grid place-items-center border-[1.5px] border-dashed rounded-[10px] m-[2px] text-[11.5px] font-bold text-center py-[14px] px-[10px] [transition:0.14s] ${
                        isOver
                          ? "border-coral text-coral-deep bg-[rgba(255,255,255,0.4)]"
                          : "border-line-2 text-ink-3"
                      }`}
                    >
                      {isOver
                        ? t("Release to schedule")
                        : t("Drop a service here")}
                    </div>
                  ) : (
                    list.map((slot) => {
                      const svc = svcs.find((x) => x.id === slot.serviceId) || {
                        name: t("Service"),
                        mood: "calm",
                        cap: 0,
                      };
                      const m = MOODS[svc.mood];
                      return (
                        <div
                          key={slot.id}
                          className={`group/slot rounded-[11px] pt-2 px-[9px] pb-[9px] cursor-grab relative border-l-[3px] border-solid [transition:0.14s] select-none hover:shadow-sm active:cursor-grabbing [background:var(--bg)] [border-left-color:var(--blc)] ${dragId === "slot:" + slot.id ? "opacity-[0.38]" : ""}`}
                          draggable
                          style={
                            {
                              ["--bg"]: m.soft,
                              ["--blc"]: m.color,
                            } as React.CSSProperties
                          }
                          onDragStart={(e) => startSlot(slot, e)}
                          onDragEnd={endDrag}
                        >
                          <button
                            className="absolute top-[5px] right-[5px] w-[18px] h-[18px] rounded-[99px] grid place-items-center bg-[rgba(0,0,0,0.07)] [[data-theme=dark]_&]:bg-[rgba(255,255,255,0.12)] text-ink-2 opacity-0 [transition:0.14s] border-none cursor-pointer group-hover/slot:opacity-100"
                            onClick={() => remove(slot.id)}
                            title={t("Remove")}
                          >
                            <Icons.close size={12} />
                          </button>
                          <button
                            className="font-display font-extrabold text-[12.5px] bg-none border-none cursor-pointer p-0 inline-flex items-center gap-1 [color:var(--c)]"
                            style={{ ["--c"]: m.color } as React.CSSProperties}
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
                            {slot.booked || 0}/{svc.cap} {t("booked")}
                          </div>
                          {editing === slot.id && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {PCAL_TIMES.map((tm) => (
                                <button
                                  key={tm}
                                  className={`text-[10.5px] font-bold py-[3px] px-[7px] rounded-[99px] border cursor-pointer [transition:0.12s] ${
                                    slot.time === tm
                                      ? "bg-ink text-bg border-ink"
                                      : "border-line-2 bg-surface hover:border-ink-3"
                                  }`}
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
