"use client";

import { Icons } from "@/components/Icons";
import { useT } from "@/components/Language";
import { Button, DataTable } from "@/components/ui";
import { money, Pill, Avatar } from "@/components/dash/primitives";

export interface Booking {
  id: string;
  customer: string;
  service: string;
  day: number;
  date: string;
  time: string;
  people: number;
  total: number;
  status: string;
  code: string;
}

type Translate = ReturnType<typeof useT>;

type ActHandler = (id: string, st: string) => void;

interface ColumnHeader {
  /** Translation key for the header label; omit for action column. */
  label?: string;
  /** Hidden when the table is rendered in compact mode. */
  compactHidden?: boolean;
  /** Rendered only when an action handler is provided. */
  actionOnly?: boolean;
}

const COLUMNS: ColumnHeader[] = [
  { label: "Customer" },
  { label: "Service" },
  { label: "Date", compactHidden: true },
  { label: "Time" },
  { label: "People" },
  { label: "Total" },
  { label: "Status" },
  { actionOnly: true },
];

/** A primary/secondary action pair offered for a given booking status. */
interface StatusAction {
  /** Button label translation key. */
  label: string;
  /** Status the booking transitions to when clicked. */
  to: string;
  /** Visual treatment for the button (action-row buttons only). */
  variant: "primary" | "soft" | "ghost";
}

const STATUS_ACTIONS: Record<string, StatusAction[]> = {
  pending: [{ label: "Confirm", to: "confirmed", variant: "primary" }],
  confirmed: [
    { label: "Complete", to: "completed", variant: "soft" },
    { label: "Cancel", to: "cancelled", variant: "ghost" },
  ],
};

function ActionButtons({
  booking,
  onAct,
  t,
}: {
  booking: Booking;
  onAct: ActHandler;
  t: Translate;
}) {
  const actions = STATUS_ACTIONS[booking.status] ?? [];
  return (
    <>
      {actions.map((action) => (
        <Button
          key={action.to}
          ctx="dash"
          variant={action.variant}
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAct(booking.id, action.to);
          }}
        >
          {t(action.label)}
        </Button>
      ))}
      {booking.status === "pending" && (
        <button
          className="w-[34px] h-[34px] rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
          title={t("Decline")}
          onClick={(e) => {
            e.stopPropagation();
            onAct(booking.id, "cancelled");
          }}
        >
          <Icons.close size={16} />
        </button>
      )}
    </>
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
  const t = useT();
  return (
    <DataTable
      head={
        <>
          {COLUMNS.map((col, i) => {
            if (col.compactHidden && compact) return null;
            if (col.actionOnly) return onAct ? <th key="actions" /> : null;
            return <th key={col.label ?? i}>{t(col.label!)}</th>;
          })}
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
                  <span className="w-[17px] h-[17px] rounded-full inline-block flex-none border-[2.5px] border-solid [border-top-color:currentColor] [border-right-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-bottom-color:color-mix(in_srgb,currentColor_35%,transparent)] [border-left-color:color-mix(in_srgb,currentColor_35%,transparent)] animate-jm-spin text-ink-3" />
                ) : (
                  <ActionButtons booking={b} onAct={onAct} t={t} />
                )}
              </div>
            </td>
          )}
        </tr>
      ))}
    </DataTable>
  );
}
