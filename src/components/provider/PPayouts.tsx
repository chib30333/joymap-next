"use client";

import { useRouter } from "next/navigation";
import { btnCls } from "@/lib/btn";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import { money, Pill, BusyBtn } from "@/components/dash/primitives";
import { DataTable } from "@/components/ui";
import { useT } from "@/components/Language";

export function PPayouts({ fin, list }: { fin: any; list: any[] }) {
  const t = useT();
  const router = useRouter();
  const { busy, run, error } = useBusy();
  return (
    <div
      className="animate-anim-fade-dash grid grid-cols-[1fr_1.3fr] items-start"
      style={{ gap: "var(--gap)" }}
    >
      <div className="flex flex-col" style={{ gap: "var(--gap)" }}>
        <div
          className="bg-[linear-gradient(160deg,#5e1014,var(--maroon))] border border-[color-mix(in_srgb,var(--red)_55%,transparent)] text-[#f3ebe0] rounded-lg"
          style={{ padding: 26, position: "relative", overflow: "hidden" }}
        >
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
          <BusyBtn
            busy={busy}
            className={btnCls("dash", "orange", "md")}
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
            {t("Withdraw")} {fin.available > 0 ? money(fin.available) : ""}
          </BusyBtn>
          {error && (
            <div className="mt-[10px] text-[13px] font-bold text-[#FFC58A]">
              {error}
            </div>
          )}
          <div className="absolute right-[-30px] bottom-[-40px] w-[150px] h-[150px] rounded-[99px] bg-[rgba(255,255,255,.05)]" />
        </div>
        <div className="bg-surface border border-line rounded-lg" style={{ padding: 22 }}>
          <h3 className="text-[16px] mb-[14px]">{t("Earnings breakdown")}</h3>
          <PRow l={t("Gross bookings")} r={money(fin.gross)} />
          <PRow
            l={`${t("Platform commission")} (${fin.commission}%)`}
            r={"− " + money(fin.gross - fin.net)}
            neg
          />
          <PRow
            l={t("Already withdrawn / pending")}
            r={"− " + money(fin.withdrawn)}
            neg
          />
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
      <div className="bg-surface border border-line rounded-lg" style={{ overflow: "hidden" }}>
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
                <th>{t("Requested")}</th>
                <th>{t("Amount")}</th>
                <th>{t("Due")}</th>
                <th>{t("Status")}</th>
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
      <span
        className="font-bold"
        style={{ color: neg ? "var(--coral)" : "var(--ink)" }}
      >
        {r}
      </span>
    </div>
  );
}
