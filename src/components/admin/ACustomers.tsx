"use client";

import { useT } from "@/components/Language";
import { Icons } from "@/components/Icons";
import { money, Stat, Pill, Avatar } from "@/components/dash/primitives";
import { DataTable, ExportButton, TableCard } from "@/components/ui";
import { downloadCSV } from "@/lib/csv";
import { EmptyCard } from "@/components/admin/AdminShared";

export function ACustomers({ list }: { list: any[] }) {
  const t = useT();
  const avgLtv = list.length
    ? Math.round(list.reduce((a, c) => a + c.ltv, 0) / list.length)
    : 0;
  const exportCsv = () =>
    downloadCSV("joymap-customers-ltv.csv", [
      [t("Customer"), t("Tier"), t("Bookings"), t("LTV"), t("Joined")],
      ...list.map((c) => [c.name, c.tier, c.bookings, c.ltv, c.joined]),
    ]);
  return (
    <div className="animate-anim-fade-dash">
      <div
        className="flex items-end justify-between gap-[16px]"
        style={{ marginBottom: "var(--gap)" }}
      >
        <div />
        <ExportButton label={t("Export LTV")} onClick={exportCsv} />
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: "var(--gap)",
          marginBottom: "var(--gap)",
        }}
      >
        <Stat
          label={t("Customers")}
          value={String(list.length)}
          icon={<Icons.user size={16} />}
          accent="#5563D6"
        />
        <Stat
          label={t("Avg LTV")}
          value={money(avgLtv)}
          icon={<Icons.heart size={16} />}
          accent="#7B53F0"
        />
        <Stat
          label={t("Total bookings")}
          value={String(list.reduce((a, c) => a + c.bookings, 0))}
          icon={<Icons.calendar size={16} />}
          accent="#1FA46E"
        />
      </div>
      {list.length === 0 ? (
        <EmptyCard>
          {t("No customers yet — they appear here after signing up.")}
        </EmptyCard>
      ) : (
        <TableCard scroll>
          <DataTable
            head={
              <>
                <th>{t("Customer")}</th>
                <th>{t("Tier")}</th>
                <th>{t("Bookings")}</th>
                <th>{t("Lifetime value")}</th>
                <th>{t("Joined")}</th>
              </>
            }
          >
            {list.map((c, i) => (
              <tr
                key={i}
                className="[transition:0.12s] cursor-pointer hover:[&>td]:bg-surface-2"
              >
                <td>
                  <div className="flex items-center gap-[10px]">
                    <Avatar name={c.name} size={32} />
                    <b className="font-bold">{c.name}</b>
                  </div>
                </td>
                <td>
                  <Pill
                    status={
                      c.tier === "vip"
                        ? "vip"
                        : c.tier === "new"
                          ? "review"
                          : "active"
                    }
                    label={
                      c.tier === "vip"
                        ? t("VIP")
                        : c.tier === "new"
                          ? t("New")
                          : t("Active")
                    }
                  />
                </td>
                <td>{c.bookings}</td>
                <td className="font-display font-bold">{money(c.ltv)}</td>
                <td className="text-ink-2">{c.joined}</td>
              </tr>
            ))}
          </DataTable>
        </TableCard>
      )}
    </div>
  );
}
