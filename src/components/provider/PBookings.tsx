"use client";

import { useState } from "react";
import { btnCls } from "@/lib/btn";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { money, Pill, Seg, Modal, Btn, Avatar } from "@/components/dash/primitives";
import { BookingsTable } from "@/components/provider/BookingsTable";
import { useT } from "@/components/Language";

type Booking = any;

export function PBookings({ rows }: { rows: Booking[] }) {
  const t = useT();
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
    <div className="animate-anim-fade-dash">
      <div className="flex items-end justify-between gap-4 mb-[18px]">
        <div />
        <Seg
          value={f}
          options={[
            { v: "all", l: t("All") },
            { v: "pending", l: t("Pending") },
            { v: "confirmed", l: t("Confirmed") },
            { v: "completed", l: t("Completed") },
            { v: "cancelled", l: t("Cancelled") },
          ]}
          onChange={setF}
        />
      </div>
      {list.length === 0 ? (
        <div
          className="bg-surface border border-line rounded-lg"
          style={{
            padding: "56px 20px",
            textAlign: "center",
            color: "var(--ink-3)",
            fontWeight: 600,
          }}
        >
          {t("No")} {f === "all" ? "" : t(f) + " "}
          {t("bookings yet.")}
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-lg" style={{ overflow: "hidden" }}>
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
  const t = useT();
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
          className="bg-surface border border-line rounded-lg"
          style={{
            padding: 16,
            background: "var(--surface-2)",
            marginBottom: 18,
          }}
        >
          <Row l={t("Date")} r={b.date} />
          <Row l={t("Time")} r={b.time} />
          <Row l={t("People")} r={String(b.people)} />
          <Row l={t("Total")} r={money(b.total)} />
          <Row l={t("Code")} r={b.code} />
        </div>
        <div className="flex gap-[10px]">
          <button className={btnCls("dash", "ghost", "md", true)} onClick={onClose}>
            {t("Close")}
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
              {t("Confirm booking")}
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
              {t("Mark completed")}
            </Btn>
          ) : (
            <Btn size="md" block onClick={onClose}>
              {t("Done")}
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
