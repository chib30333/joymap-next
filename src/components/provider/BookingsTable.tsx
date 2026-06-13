"use client";

import { Icons } from "@/components/Icons";
import { btnCls } from "@/lib/btn";
import { useT } from "@/components/Language";
import { DataTable } from "@/components/ui";
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
    <DataTable
      head={
        <>
          <th>{t("Customer")}</th>
          <th>{t("Service")}</th>
          {!compact && <th>{t("Date")}</th>}
          <th>{t("Time")}</th>
          <th>{t("People")}</th>
          <th>{t("Total")}</th>
          <th>{t("Status")}</th>
          {onAct && <th />}
        </>
      }
    >
      {rows.map((b) => (
        <tr
          key={b.id}
          className="[transition:0.12s] cursor-pointer"
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
                    className="w-[17px] h-[17px] rounded-full inline-block flex-none border-[2.5px] border-solid [border-top-color:currentColor] [border-right-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-bottom-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-left-color:color-mix(in_srgb,currentColor_35%,transparent)] animate-jm-spin"
                    style={{ color: "var(--ink-3)" }}
                  />
                ) : (
                  <>
                    {b.status === "pending" && (
                      <>
                        <button
                          className={btnCls("dash", "primary", "sm")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAct(b.id, "confirmed");
                          }}
                        >
                          {t("Confirm")}
                        </button>
                        <button
                          className="w-10 h-10 rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
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
                          className={btnCls("dash", "soft", "sm")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAct(b.id, "completed");
                          }}
                        >
                          {t("Complete")}
                        </button>
                        <button
                          className={btnCls("dash", "ghost", "sm")}
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
    </DataTable>
  );
}
