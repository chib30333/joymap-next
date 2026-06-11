"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import {
  money,
  Stat,
  Bars,
  LineChart,
  Pill,
  Seg,
  Toggle,
  Modal,
  Btn,
  Avatar,
  BusyBtn,
  SectionHead,
} from "@/components/dash/primitives";
import { Input, Select, Textarea } from "@/components/ui";
import { MOODS, MOOD_ORDER, CATS } from "@/components/customer/primitives";

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

export function BookingsTable({
  rows,
  compact,
  onAct,
  onRow,
  actingId,
}: {
  rows: Booking[];
  compact?: boolean;
  onAct?: (id: string, st: string) => void;
  onRow?: (b: Booking) => void;
  actingId?: string | null;
}) {
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>Customer</th>
          <th>Service</th>
          {!compact && <th>Date</th>}
          <th>Time</th>
          <th>People</th>
          <th>Total</th>
          <th>Status</th>
          {onAct && <th />}
        </tr>
      </thead>
      <tbody>
        {rows.map((b) => (
          <tr
            key={b.id}
            className="row"
            onClick={onRow ? () => onRow(b) : undefined}
          >
            <td>
              <div className="flex items-center gap-[10px]">
                <Avatar name={b.customer} size={30} />
                <b className="font-bold">{b.customer}</b>
              </div>
            </td>
            <td className="text-ink-2">{b.service}</td>
            {!compact && <td className="text-ink-2">{b.date}</td>}
            <td className="font-bold">{b.time}</td>
            <td>{b.people}</td>
            <td className="font-display font-bold">{money(b.total)}</td>
            <td>
              <Pill status={b.status} />
            </td>
            {onAct && (
              <td>
                <div className="flex gap-[6px] justify-end items-center">
                  {actingId === b.id ? (
                    <span
                      className="jm-spin"
                      style={{ color: "var(--ink-3)" }}
                    />
                  ) : (
                    <>
                      {b.status === "pending" && (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAct(b.id, "confirmed");
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            className="icon-btn"
                            style={{ width: 34, height: 34 }}
                            title="Decline"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAct(b.id, "cancelled");
                            }}
                          >
                            <Icons.close size={16} />
                          </button>
                        </>
                      )}
                      {b.status === "confirmed" && (
                        <>
                          <button
                            className="btn btn-soft btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAct(b.id, "completed");
                            }}
                          >
                            Complete
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAct(b.id, "cancelled");
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PBookings({ rows }: { rows: Booking[] }) {
  const router = useRouter();
  const [f, setF] = useState("all");
  const [sel, setSel] = useState<Booking | null>(null);
  const [actingId, setActing] = useState<string | null>(null);
  const act = (id: string, st: string) => {
    setActing(id);
    rpc("setBookingStatus", { id, status: st }).then(() => {
      setActing(null);
      router.refresh();
    });
  };
  const list = f === "all" ? rows : rows.filter((b) => b.status === f);
  return (
    <div className="anim-fade">
      <div className="shead">
        <div />
        <Seg
          value={f}
          options={[
            { v: "all", l: "All" },
            { v: "pending", l: "Pending" },
            { v: "confirmed", l: "Confirmed" },
            { v: "completed", l: "Completed" },
            { v: "cancelled", l: "Cancelled" },
          ]}
          onChange={setF}
        />
      </div>
      {list.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "56px 20px",
            textAlign: "center",
            color: "var(--ink-3)",
            fontWeight: 600,
          }}
        >
          No {f === "all" ? "" : f + " "}bookings yet.
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <BookingsTable
              rows={list}
              onAct={act}
              onRow={setSel}
              actingId={actingId}
            />
          </div>
        </div>
      )}
      {sel && (
        <BookingDetailModal
          booking={sel}
          onClose={() => setSel(null)}
          onAct={act}
        />
      )}
    </div>
  );
}

function BookingDetailModal({
  booking,
  onClose,
  onAct,
}: {
  booking: Booking;
  onClose: () => void;
  onAct: (id: string, st: string) => void;
}) {
  const b = booking;
  return (
    <Modal onClose={onClose} maxWidth={460}>
      <div className="py-[24px] px-[26px]">
        <div className="flex items-center gap-[12px] mb-[18px]">
          <Avatar name={b.customer} size={46} />
          <div className="flex-1">
            <h3 className="text-[19px]">{b.customer}</h3>
            <div className="text-[13px] text-ink-3 font-semibold">
              {b.service}
            </div>
          </div>
          <Pill status={b.status} />
        </div>
        <div
          className="card"
          style={{
            padding: 16,
            background: "var(--surface-2)",
            marginBottom: 18,
          }}
        >
          <Row l="Date" r={b.date} />
          <Row l="Time" r={b.time} />
          <Row l="People" r={String(b.people)} />
          <Row l="Total" r={money(b.total)} />
          <Row l="Code" r={b.code} />
        </div>
        <div className="flex gap-[10px]">
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>
            Close
          </button>
          {b.status === "pending" ? (
            <Btn
              size="md"
              block
              onClick={() => {
                onAct(b.id, "confirmed");
                onClose();
              }}
            >
              <Icons.check size={16} />
              Confirm booking
            </Btn>
          ) : b.status === "confirmed" ? (
            <Btn
              size="md"
              block
              onClick={() => {
                onAct(b.id, "completed");
                onClose();
              }}
            >
              <Icons.sparkle size={16} />
              Mark completed
            </Btn>
          ) : (
            <Btn size="md" block onClick={onClose}>
              Done
            </Btn>
          )}
        </div>
      </div>
    </Modal>
  );
}
function Row({ l, r }: { l: string; r: string }) {
  return (
    <div className="flex justify-between py-[6px] px-0 text-[14px]">
      <span className="text-ink-2 font-semibold">{l}</span>
      <span className="font-bold">{r}</span>
    </div>
  );
}

/* ===== Services ===== */
export function PServices({ svcs }: { svcs: Svc[] }) {
  const router = useRouter();
  const [modal, setModal] = useState<"new" | Svc | null>(null);
  const toggle = (id: string) =>
    rpc("toggleService", { id }).then(() => router.refresh());
  return (
    <div className="anim-fade">
      <div className="shead">
        <div />
        <Btn
          size="md"
          icon={<Icons.plus size={17} />}
          onClick={() => setModal("new")}
        >
          New service
        </Btn>
      </div>
      {svcs.length === 0 ? (
        <div
          className="card"
          style={{ padding: "60px 24px", textAlign: "center" }}
        >
          <div className="w-[60px] h-[60px] rounded-[99px] bg-coral-soft text-coral-deep grid place-items-center mt-0 mx-auto mb-[14px]">
            <Icons.compass size={26} />
          </div>
          <h3 className="text-[20px]">List your first experience</h3>
          <p className="text-ink-2 text-[14.5px] mt-[8px] mx-auto mb-[18px] max-w-[420px] leading-[1.55]">
            Create a service, send it for review, and once the platform team
            approves it customers can book it.
          </p>
          <Btn
            size="md"
            icon={<Icons.plus size={16} />}
            onClick={() => setModal("new")}
          >
            Create a service
          </Btn>
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: "var(--gap)",
          }}
        >
          {svcs.map((s) => {
            const m = MOODS[s.mood];
            return (
              <div
                key={s.id}
                className="card anim-pop"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  opacity: s.active !== false ? 1 : 0.62,
                }}
              >
                <div
                  className="relative h-[128px]"
                  style={{
                    background: s.img
                      ? `center/cover no-repeat url('${s.img}')`
                      : `linear-gradient(135deg,${m.color},color-mix(in srgb,${m.color} 68%,#000))`,
                  }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.5))]" />
                  <div className="absolute top-[12px] left-[12px] right-[12px] flex justify-between items-start">
                    <div className="flex gap-[6px]">
                      <span
                        className="bg-[rgba(255,255,255,.92)] py-[4px] px-[10px] rounded-[99px] text-[11.5px] font-extrabold inline-flex items-center gap-[5px]"
                        style={{ color: m.color }}
                      >
                        <span
                          className="w-[7px] h-[7px] rounded-[99px]"
                          style={{ background: m.color }}
                        />
                        {m.label}
                      </span>
                      {s.status === "review" && (
                        <span className="bg-[rgba(232,144,21,.92)] text-[#fff] py-[4px] px-[10px] rounded-[99px] text-[11px] font-extrabold">
                          IN REVIEW
                        </span>
                      )}
                      {s.status === "rejected" && (
                        <span className="bg-[rgba(224,33,47,.92)] text-[#fff] py-[4px] px-[10px] rounded-[99px] text-[11px] font-extrabold">
                          REJECTED
                        </span>
                      )}
                    </div>
                    <Toggle
                      on={s.active !== false}
                      onChange={() => toggle(s.id)}
                    />
                  </div>
                  <h3
                    className="absolute left-[14px] bottom-[11px] right-[14px] text-[#fff] text-[18px]"
                    style={{ textShadow: "0 1px 10px rgba(0,0,0,.4)" }}
                  >
                    {s.name}
                  </h3>
                </div>
                <div className="pt-[14px] px-[18px] pb-[18px]">
                  <div className="flex gap-[14px] text-ink-3 text-[13px] font-semibold mb-[14px]">
                    <span className="inline-flex gap-[5px] items-center">
                      <Icons.clock size={14} />
                      {s.dur}
                    </span>
                    <span className="inline-flex gap-[5px] items-center">
                      <Icons.user size={14} />
                      {s.cap} cap
                    </span>
                    <span className="inline-flex gap-[5px] items-center">
                      <Icons.star size={14} />
                      {s.rating || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-[14px] border-t border-line">
                    <div>
                      <div className="font-display font-extrabold text-[20px]">
                        {money(s.price)}
                      </div>
                      <div className="text-[12px] text-ink-3 font-semibold">
                        {s.booked} booked all-time
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setModal(s)}
                    >
                      <Icons.settings size={15} />
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {modal && (
        <ServiceFormModal
          svc={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function ServiceFormModal({
  svc,
  onClose,
}: {
  svc: Svc | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const isNew = !svc;
  const [f, setF] = useState<any>(
    svc
      ? { ...svc }
      : {
          name: "",
          cat: "Wellness",
          mood: "calm",
          price: 1500,
          dur: "60 min",
          cap: 8,
          about: "",
          area: "",
        },
  );
  const { busy, run, error } = useBusy();
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));
  const ok = f.name.length > 2 && f.price > 0 && f.cap > 0;
  const save = () =>
    run(
      () =>
        isNew
          ? rpc("createService", {
              name: f.name,
              cat: f.cat,
              mood: f.mood,
              price: +f.price,
              dur: f.dur,
              cap: +f.cap,
              about: f.about,
              area: f.area || "Center",
              tags: ["New"],
            })
          : rpc("updateService", {
              id: svc.id,
              patch: {
                name: f.name,
                cat: f.cat,
                mood: f.mood,
                price: +f.price,
                dur: f.dur,
                cap: +f.cap,
                about: f.about,
              },
            }),
      () => {
        onClose();
        router.refresh();
      },
    );
  return (
    <Modal onClose={onClose} maxWidth={500}>
      <div className="py-[24px] px-[26px]">
        <h3 className="text-[20px] mb-[4px]">
          {isNew ? "New service" : "Edit service"}
        </h3>
        <p className="text-ink-2 text-[13.5px] mt-0 mx-0 mb-[18px]">
          {isNew
            ? "New services go to platform review before customers can see them."
            : "Changes apply immediately."}
        </p>
        <div className="flex flex-col gap-[14px]">
          <div>
            <L>Name</L>
            <Input
              placeholder="Sunrise Rooftop Yoga"
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="flex gap-[12px]">
            <div className="flex-1">
              <L>Category</L>
              <Select
                value={f.cat}
                onChange={(e) => set("cat", e.target.value)}
              >
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="flex-1">
              <L>Mood</L>
              <Select
                value={f.mood}
                onChange={(e) => set("mood", e.target.value)}
              >
                {MOOD_ORDER.map((k) => (
                  <option key={k} value={k}>
                    {MOODS[k].label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-[12px]">
            <div className="flex-1">
              <L>Price (₽)</L>
              <Input
                type="number"
                value={f.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <L>Duration</L>
              <Select
                value={f.dur}
                onChange={(e) => set("dur", e.target.value)}
              >
                {[
                  "45 min",
                  "60 min",
                  "75 min",
                  "90 min",
                  "120 min",
                  "150 min",
                  "180 min",
                ].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </div>
            <div className="w-[90px]">
              <L>Capacity</L>
              <Input
                type="number"
                value={f.cap}
                onChange={(e) => set("cap", e.target.value)}
              />
            </div>
          </div>
          <div>
            <L>About</L>
            <Textarea
              rows={3}
              value={f.about}
              onChange={(e) => set("about", e.target.value)}
              placeholder="What makes this experience special?"
              style={{ resize: "vertical" }}
            />
          </div>
        </div>
        {error && (
          <div className="mt-[12px] text-coral-deep font-bold text-[13.5px]">
            {error}
          </div>
        )}
        <div className="flex gap-[10px] mt-[20px]">
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>
            Cancel
          </button>
          <BusyBtn
            busy={busy}
            className="btn btn-primary btn-md btn-block"
            disabled={!ok}
            icon={<Icons.check size={16} />}
            onClick={save}
          >
            {isNew ? "Submit for review" : "Save changes"}
          </BusyBtn>
        </div>
      </div>
    </Modal>
  );
}
function L({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
      {children}
    </div>
  );
}

/* ===== Analytics ===== */
export function PAnalytics({
  bookings,
  svcs,
}: {
  bookings: Booking[];
  svcs: Svc[];
}) {
  const ok = bookings.filter((b) => b.status !== "cancelled");
  if (ok.length === 0)
    return (
      <div
        className="card anim-fade"
        style={{
          padding: "60px 24px",
          textAlign: "center",
          color: "var(--ink-3)",
        }}
      >
        <Icons.flame size={36} />
        <h3 className="text-ink mt-[12px] text-[19px]">No data yet</h3>
        <p className="max-w-[380px] mt-[8px] mx-auto mb-0 font-semibold text-[14px]">
          Analytics light up as bookings come in — revenue trends, peak hours
          and top services.
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
  const trend = days.map((day) => ({ label: day + " Jun", value: byDay[day] }));
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
    <div className="anim-fade">
      <div
        className="grid grid-cols-[1fr_1fr]"
        style={{ gap: "var(--gap)", marginBottom: "var(--gap)" }}
      >
        <div className="card" style={{ padding: 22 }}>
          <h3 className="text-[17px] mb-[4px]">Revenue by day</h3>
          <div className="text-[13px] text-ink-3 font-semibold mb-[8px]">
            June 2026 · live
          </div>
          {trend.length > 1 ? (
            <LineChart points={trend} />
          ) : (
            <Bars data={trend} unit="₽" />
          )}
        </div>
        <div className="card" style={{ padding: 22 }}>
          <h3 className="text-[17px] mb-[4px]">Bookings by start time</h3>
          <div className="text-[13px] text-ink-3 font-semibold mb-[8px]">
            Across all services
          </div>
          <Bars
            data={peak.map((p) => ({ ...p, hot: p.value === maxPeak }))}
            accent="var(--orange)"
          />
        </div>
      </div>
      <div className="card" style={{ padding: 22, maxWidth: 640 }}>
        <h3 className="text-[17px] mb-[16px]">Top services</h3>
        <div className="flex flex-col gap-[14px]">
          {top.map((s) => (
            <div key={s.id}>
              <div className="flex justify-between mb-[6px]">
                <span className="font-bold text-[14px]">{s.name}</span>
                <span className="font-bold text-[13px] text-ink-3">
                  {s.booked}
                </span>
              </div>
              <div className="h-[8px] rounded-[99px] bg-surface-2 overflow-hidden">
                <div
                  style={{
                    height: "100%",
                    width: `${(s.booked / maxB) * 100}%`,
                    borderRadius: 99,
                    background: MOODS[s.mood].color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== Payouts ===== */
export function PPayouts({ fin, list }: { fin: any; list: any[] }) {
  const router = useRouter();
  const { busy, run, error } = useBusy();
  return (
    <div
      className="anim-fade grid grid-cols-[1fr_1.3fr] items-start"
      style={{ gap: "var(--gap)" }}
    >
      <div className="flex flex-col" style={{ gap: "var(--gap)" }}>
        <div
          className="card-fill"
          style={{ padding: 26, position: "relative", overflow: "hidden" }}
        >
          <div className="text-[13.5px] opacity-[.82] font-semibold mb-[8px]">
            Available balance
          </div>
          <div className="font-display font-extrabold text-[38px] tracking-[-.02em]">
            {money(fin.available)}
          </div>
          <div className="text-[13px] opacity-[.82] font-semibold mt-[6px]">
            Net of {fin.commission}% platform commission
          </div>
          <BusyBtn
            busy={busy}
            className="btn btn-orange btn-md"
            icon={<Icons.wallet size={16} />}
            disabled={fin.available <= 0}
            onClick={() =>
              run(
                () => rpc("requestPayout"),
                () => router.refresh(),
              )
            }
            style={{ marginTop: 18 }}
          >
            Withdraw {fin.available > 0 ? money(fin.available) : ""}
          </BusyBtn>
          {error && (
            <div className="mt-[10px] text-[13px] font-bold text-[#FFC58A]">
              {error}
            </div>
          )}
          <div className="absolute right-[-30px] bottom-[-40px] w-[150px] h-[150px] rounded-[99px] bg-[rgba(255,255,255,.05)]" />
        </div>
        <div className="card" style={{ padding: 22 }}>
          <h3 className="text-[16px] mb-[14px]">Earnings breakdown</h3>
          <PRow l="Gross bookings" r={money(fin.gross)} />
          <PRow
            l={`Platform commission (${fin.commission}%)`}
            r={"− " + money(fin.gross - fin.net)}
            neg
          />
          <PRow
            l="Already withdrawn / pending"
            r={"− " + money(fin.withdrawn)}
            neg
          />
          <div className="border-t border-line mt-[8px] pt-[12px]">
            <PRow
              l={<b>Available</b>}
              r={
                <b className="font-display text-[17px]">
                  {money(fin.available)}
                </b>
              }
            />
          </div>
        </div>
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <h3 className="text-[17px] pt-[18px] px-[20px] pb-[4px]">
          Payout history
        </h3>
        {list.length === 0 ? (
          <div className="py-[34px] px-[20px] text-ink-3 font-semibold text-[13.5px]">
            No payouts yet. Withdraw your balance and the request lands in the
            admin payout queue.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Requested</th>
                <th>Amount</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="row">
                  <td className="font-bold">{p.date}</td>
                  <td className="font-display font-bold">{money(p.amount)}</td>
                  <td className="text-ink-2">{p.due}</td>
                  <td>
                    <Pill status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
function PRow({
  l,
  r,
  neg,
}: {
  l: React.ReactNode;
  r: React.ReactNode;
  neg?: boolean;
}) {
  return (
    <div className="flex justify-between py-[7px] px-0 text-[14px]">
      <span className="text-ink-2 font-semibold">{l}</span>
      <span
        className="font-bold"
        style={{ color: neg ? "var(--coral)" : "var(--ink)" }}
      >
        {r}
      </span>
    </div>
  );
}

/* ===== Reviews ===== */
export function PReviews({ list, rating }: { list: any[]; rating: any }) {
  const router = useRouter();
  const [replying, setReplying] = useState<string | null>(null);
  if (list.length === 0)
    return (
      <div
        className="card anim-fade"
        style={{
          padding: "60px 24px",
          textAlign: "center",
          color: "var(--ink-3)",
          maxWidth: 760,
        }}
      >
        <Icons.star size={36} />
        <h3 className="text-ink mt-[12px] text-[19px]">No reviews yet</h3>
        <p className="max-w-[380px] mt-[8px] mx-auto mb-0 font-semibold text-[14px]">
          After a completed session, customers can rate the experience — reviews
          appear here.
        </p>
      </div>
    );
  const dist = [5, 4, 3, 2, 1].map(
    (st) =>
      [
        st,
        Math.round(
          (list.filter((x) => x.rating === st).length / list.length) * 100,
        ),
      ] as [number, number],
  );
  return (
    <div className="anim-fade max-w-[760px]">
      <div
        className="card"
        style={{
          padding: 22,
          display: "flex",
          alignItems: "center",
          gap: 24,
          marginBottom: "var(--gap)",
        }}
      >
        <div className="text-center">
          <div className="font-display font-extrabold text-[44px] leading-[1]">
            {rating.rating || "—"}
          </div>
          <div className="text-[var(--m-joy)] text-[15px]">★★★★★</div>
          <div className="text-[12.5px] text-ink-3 font-semibold mt-[4px]">
            {list.length} review{list.length !== 1 ? "s" : ""}
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-[6px]">
          {dist.map(([st, p]) => (
            <div key={st} className="flex items-center gap-[10px]">
              <span className="text-[12px] font-bold w-[10px]">{st}</span>
              <div className="flex-1 h-[7px] rounded-[99px] bg-surface-2 overflow-hidden">
                <div
                  style={{
                    height: "100%",
                    width: p + "%",
                    background: "var(--m-joy)",
                    borderRadius: 99,
                  }}
                />
              </div>
              <span className="text-[12px] text-ink-3 font-semibold w-[30px]">
                {p}%
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-[14px]">
        {list.map((rv) => (
          <div key={rv.id} className="card" style={{ padding: 20 }}>
            <div className="flex items-center gap-[12px] mb-[10px]">
              <Avatar name={rv.name} size={38} />
              <div className="flex-1">
                <div className="font-bold">{rv.name}</div>
                <div className="text-[12.5px] text-ink-3 font-semibold">
                  {rv.serviceName} · {rv.date}
                </div>
              </div>
              <span className="text-[var(--m-joy)] text-[14px]">
                {"★".repeat(rv.rating)}
                <span className="text-line-2">{"★".repeat(5 - rv.rating)}</span>
              </span>
            </div>
            {rv.text && (
              <p className="mt-0 mx-0 mb-[12px] text-ink-2 text-[14.5px] leading-[1.55]">
                {rv.text}
              </p>
            )}
            {rv.replied ? (
              <div className="text-[13px] text-ink-3 font-semibold flex items-center gap-[6px]">
                <Icons.check size={15} />
                You replied
              </div>
            ) : (
              <BusyBtn
                busy={replying === rv.id}
                className="btn btn-soft btn-sm"
                icon={<Icons.send size={14} />}
                onClick={() => {
                  setReplying(rv.id);
                  rpc("replyReview", { id: rv.id }).then(() => {
                    setReplying(null);
                    router.refresh();
                  });
                }}
              >
                Reply
              </BusyBtn>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
