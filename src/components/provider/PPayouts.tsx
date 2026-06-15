"use client";

import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { useBusy } from "@/hooks";
import { money, Pill } from "@/components/dash/primitives";
import { Button, DataTable } from "@/components/ui";
import { useT } from "@/components/Language";

type PayoutFinance = {
  available: number;
  commission: number;
  gross: number;
  net: number;
  withdrawn: number;
};

type PayoutRow = {
  id: string | number;
  date: React.ReactNode;
  amount: number;
  due: React.ReactNode;
  status: React.ComponentProps<typeof Pill>["status"];
};

export function PPayouts({
  fin,
  list,
}: {
  fin: PayoutFinance;
  list: PayoutRow[];
}) {
  const t = useT();
  const router = useRouter();
  const { busy, run, error } = useBusy();

  const breakdown: { l: React.ReactNode; r: React.ReactNode; neg?: boolean }[] =
    [
      { l: t("Gross bookings"), r: money(fin.gross) },
      {
        l: `${t("Platform commission")} (${fin.commission}%)`,
        r: "− " + money(fin.gross - fin.net),
        neg: true,
      },
      {
        l: t("Already withdrawn / pending"),
        r: "− " + money(fin.withdrawn),
        neg: true,
      },
    ];

  const columns = [
    t("Requested"),
    t("Amount"),
    t("Due"),
    t("Status"),
  ];
  return (
    <div className="animate-anim-fade-dash grid grid-cols-[1fr_1.3fr] items-start gap-[var(--gap)]">
      <div className="flex flex-col gap-[var(--gap)]">
        <div className="bg-[linear-gradient(160deg,#5e1014,var(--maroon))] border border-[color-mix(in_srgb,var(--red)_55%,transparent)] text-[#f3ebe0] rounded-lg p-[26px] relative overflow-hidden">
          <div className="text-[13.5px] opacity-[.82] font-semibold mb-[8px]">
            {t("Available balance")}
          </div>
          <div className="font-display font-extrabold text-[38px] tracking-[-.02em]">
            {money(fin.available)}
          </div>
          <div className="text-[13px] opacity-[.82] font-semibold mt-[6px]">
            {t("Net of")} {fin.commission}
            {t("% platform commission")}
          </div>
          <Button
            busy={busy}
            ctx="dash"
            variant="orange"
            size="md"
            icon={<Icons.wallet size={16} />}
            disabled={fin.available <= 0}
            onClick={() =>
              run(
                () => rpc("requestPayout"),
                () => router.refresh(),
              )
            }
            className="mt-[18px]"
          >
            {t("Withdraw")} {fin.available > 0 ? money(fin.available) : ""}
          </Button>
          {error && (
            <div className="mt-[10px] text-[13px] font-bold text-[#FFC58A]">
              {error}
            </div>
          )}
          <div className="absolute right-[-30px] bottom-[-40px] w-[150px] h-[150px] rounded-[99px] bg-[rgba(255,255,255,.05)]" />
        </div>
        <div className="bg-surface border border-line rounded-lg p-[22px]">
          <h3 className="text-[16px] mb-[14px]">{t("Earnings breakdown")}</h3>
          {breakdown.map((row, i) => (
            <PRow key={i} l={row.l} r={row.r} neg={row.neg} />
          ))}
          <div className="border-t border-line mt-[8px] pt-[12px]">
            <PRow
              l={<b>{t("Available")}</b>}
              r={
                <b className="font-display text-[17px]">
                  {money(fin.available)}
                </b>
              }
            />
          </div>
        </div>
      </div>
      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <h3 className="text-[17px] pt-[18px] px-[20px] pb-[4px]">
          {t("Payout history")}
        </h3>
        {list.length === 0 ? (
          <div className="py-[34px] px-[20px] text-ink-3 font-semibold text-[13.5px]">
            {t(
              "No payouts yet. Withdraw your balance and the request lands in the admin payout queue.",
            )}
          </div>
        ) : (
          <DataTable
            head={
              <>
                {columns.map((c) => (
                  <th key={c}>{c}</th>
                ))}
              </>
            }
          >
            {list.map((p) => (
              <tr key={p.id} className="[transition:0.12s] cursor-pointer">
                <td className="font-bold">{p.date}</td>
                <td className="font-display font-bold">{money(p.amount)}</td>
                <td className="text-ink-2">{p.due}</td>
                <td>
                  <Pill status={p.status} />
                </td>
              </tr>
            ))}
          </DataTable>
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
      <span className={`font-bold ${neg ? "text-coral" : "text-ink"}`}>
        {r}
      </span>
    </div>
  );
}
