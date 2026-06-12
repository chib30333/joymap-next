"use client";

import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";
import { money, Pill, Avatar } from "@/components/dash/primitives";

type Booking = any;

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
  const t = useT();
  return (
    <table className="tbl">
      <thead>
        <tr>
          <th>{t("Customer")}</th>
          <th>{t("Service")}</th>
          {!compact && <th>{t("Date")}</th>}
          <th>{t("Time")}</th>
          <th>{t("People")}</th>
          <th>{t("Total")}</th>
          <th>{t("Status")}</th>
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
              <Pill status={b.status} label={t(b.status)} />
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
                            {t("Confirm")}
                          </button>
                          <button
                            className="icon-btn"
                            style={{ width: 34, height: 34 }}
                            title={t("Decline")}
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
                            {t("Complete")}
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              onAct(b.id, "cancelled");
                            }}
                          >
                            {t("Cancel")}
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
