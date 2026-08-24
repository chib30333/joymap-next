"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/Language";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { money, Stat, Pill, Avatar } from "@/components/dash/primitives";
import { DataTable, TableCard, Spinner, Button } from "@/components/ui";
import { downloadCSV } from "@/lib/csv";

type FinancialStats = {
  gmv: number;
  revenue: number;
  pendingPayouts: number;
};

type PayoutRow = {
  id: string;
  providerName: string;
  amount: number;
  due: string;
  status: string;
};

type StatCard = {
  label: string;
  value: string;
  icon: React.ReactNode;
  accent: string;
  sub?: string;
};

export function AFinancials({ s, queue }: { s: FinancialStats; queue: PayoutRow[] }) {
  const t = useT();
  const router = useRouter();
  const [releasing, setReleasing] = useState<string | null>(null);
  const release = (id: string) => {
    setReleasing(id);
    rpc("releasePayout", { id }).then(() => {
      setReleasing(null);
      router.refresh();
    });
  };
  const exportCsv = () =>
    downloadCSV("joymap-payouts.csv", [
      [t("Provider"), t("Amount"), t("Due"), t("Status")],
      ...queue.map((p) => [p.providerName, p.amount, p.due, p.status]),
    ]);
  const stats: StatCard[] = [
    {
      label: t("GMV · June"),
      value: money(s.gmv),
      icon: <Icons.flame size={16} />,
      accent: "#1FA46E",
    },
    {
      label: t("Commission collected"),
      value: money(s.revenue),
      icon: <Icons.wallet size={16} />,
      accent: "#5563D6",
      sub: t("15% / booking"),
    },
    {
      label: t("Pending payouts"),
      value: money(s.pendingPayouts),
      icon: <Icons.user size={16} />,
      accent: "#FF8A4C",
      sub: `${queue.filter((p) => p.status === "pending").length} ${t("requests")}`,
    },
    {
      label: t("Paid out"),
      value: money(
        queue
          .filter((p) => p.status === "paid")
          .reduce((a, p) => a + p.amount, 0),
      ),
      icon: <Icons.sparkle size={16} />,
      accent: "#E89015",
    },
  ];
  return (
    <div className="animate-anim-fade-dash">
      <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-[var(--gap)] mb-[var(--gap)]">
        {stats.map((stat) => (
          <Stat
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            accent={stat.accent}
            sub={stat.sub}
          />
        ))}
      </div>
      <TableCard>
        <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-5">
          <h3 className="text-lg">{t("Payouts queue")}</h3>
          <Button
            ctx="dash"
            variant="ghost"
            size="sm"
            icon={<Icons.download size={15} />}
            onClick={exportCsv}
          >
            {t("Export CSV")}
          </Button>
        </div>
        {queue.length === 0 ? (
          <div className="px-5 py-9 text-ink-3 font-semibold text-sm border-t border-line">
            {t(
              "No payout requests yet. When providers hit “Withdraw”, requests land here for release.",
            )}
          </div>
        ) : (
          <DataTable
            head={
              <>
                <th>{t("Provider")}</th>
                <th>{t("Amount")}</th>
                <th>{t("Due")}</th>
                <th>{t("Status")}</th>
                <th />
              </>
            }
          >
            {queue.map((p) => (
              <tr
                key={p.id}
                className="duration-[120ms] cursor-pointer hover:[&>td]:bg-surface-2"
              >
                <td>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={p.providerName} size={30} />
                    <b className="font-bold">{p.providerName}</b>
                  </div>
                </td>
                <td className="font-display font-bold">{money(p.amount)}</td>
                <td className="text-ink-2">{p.due}</td>
                <td>
                  <Pill status={p.status} />
                </td>
                <td className="text-right">
                  {p.status === "pending" &&
                    (releasing === p.id ? (
                      <Spinner />
                    ) : (
                      <Button
                        ctx="dash"
                        variant="soft"
                        size="sm"
                        onClick={() => release(p.id)}
                      >
                        {t("Release")}
                      </Button>
                    ))}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </TableCard>
    </div>
  );
}
