"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { money, Pill, Seg, Modal, Avatar } from "@/components/dash/primitives";
import { Button } from "@/components/ui";
import { BookingsTable, type Booking } from "@/components/provider/BookingsTable";
import { useT } from "@/components/Language";

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

type StatusFilter = "all" | BookingStatus;

const STATUS_FILTERS: readonly { value: StatusFilter; labelKey: string }[] = [
  { value: "all", labelKey: "All" },
  { value: "pending", labelKey: "Pending" },
  { value: "confirmed", labelKey: "Confirmed" },
  { value: "completed", labelKey: "Completed" },
  { value: "cancelled", labelKey: "Cancelled" },
];

export function PBookings({ rows }: { rows: Booking[] }) {
  const t = useT();
  const router = useRouter();
  const [f, setF] = useState<StatusFilter>("all");
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
    <div className="animate-anim-fade-dash">
      <div className="flex items-end justify-between gap-4 mb-[18px]">
        <div />
        <Seg
          value={f}
          options={STATUS_FILTERS.map((o) => ({ v: o.value, l: t(o.labelKey) }))}
          onChange={(v) => setF(v as StatusFilter)}
        />
      </div>
      {list.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg py-[56px] px-[20px] text-center text-ink-3 font-semibold">
          {t("No")} {f === "all" ? "" : t(f) + " "}
          {t("bookings yet.")}
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
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
  const t = useT();
  const b = booking;
  const detailRows: { label: string; value: string }[] = [
    { label: t("Date"), value: b.date },
    { label: t("Time"), value: b.time },
    { label: t("People"), value: String(b.people) },
    { label: t("Total"), value: money(b.total) },
    { label: t("Code"), value: b.code },
  ];
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
        <div className="bg-surface-2 border border-line rounded-lg p-[16px] mb-[18px]">
          {detailRows.map((row) => (
            <Row key={row.label} l={row.label} r={row.value} />
          ))}
        </div>
        <div className="flex gap-[10px]">
          <Button ctx="dash" variant="ghost" size="md" block onClick={onClose}>
            {t("Close")}
          </Button>
          {b.status === "pending" ? (
            <Button
              ctx="dash"
              variant="primary"
              size="md"
              block
              onClick={() => {
                onAct(b.id, "confirmed");
                onClose();
              }}
            >
              <Icons.check size={16} />
              {t("Confirm booking")}
            </Button>
          ) : b.status === "confirmed" ? (
            <Button
              ctx="dash"
              variant="primary"
              size="md"
              block
              onClick={() => {
                onAct(b.id, "completed");
                onClose();
              }}
            >
              <Icons.sparkle size={16} />
              {t("Mark completed")}
            </Button>
          ) : (
            <Button ctx="dash" variant="primary" size="md" block onClick={onClose}>
              {t("Done")}
            </Button>
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
