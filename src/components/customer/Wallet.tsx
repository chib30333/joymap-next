"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { useBusy } from "@/hooks";
import { fmt, Modal } from "./primitives";
import { Button, Input } from "@/components/ui";
import { useT } from "@/components/Language";

type Tx = { id: string; label: string; amount: number; date: string };

const TOP_UP_AMOUNTS: readonly number[] = [1000, 3000, 5000, 10000];

export function Wallet({ wallet, tx }: { wallet: number; tx: Tx[] }) {
  const t = useT();
  const [topup, setTopup] = useState(false);
  return (
    <div className="animate-anim-fade-app">
      <div className="rounded-lg p-[28px] [background:linear-gradient(150deg,#5E1014,var(--maroon))] text-[#F3EBE0] [border:1px_solid_color-mix(in_srgb,var(--red)_55%,transparent)] relative overflow-hidden mb-[24px]">
        <div className="text-[13.5px] opacity-[.82] font-semibold mb-[8px]">
          {t("Joymap balance")}
        </div>
        <div className="font-display font-extrabold text-[40px] tracking-[-.02em]">
          {fmt(wallet)}
        </div>
        <div className="flex gap-[10px] mt-[20px]">
          <Button
            ctx="app"
            size="sm"
            className="[background:var(--orange)] text-[#1A0A04] font-extrabold"
            onClick={() => setTopup(true)}
          >
            <Icons.plus size={16} />
            {t("Top up")}
          </Button>
        </div>
        <div className="absolute right-[-30px] bottom-[-40px] w-[160px] h-[160px] rounded-[99px] bg-[rgba(255,255,255,.05)]" />
      </div>
      <h3 className="text-[17px] mb-[14px]">{t("Recent transactions")}</h3>
      {tx.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg p-[34px_20px] text-center text-ink-3 font-semibold text-[14px]">
          {t(
            "No transactions yet. Top up or pay with your balance and the ledger appears here.",
          )}
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          {tx.map((t, i) => (
            <div
              key={t.id}
              className="flex items-center justify-between pt-[15px] pb-[15px] pl-[20px] pr-[20px] [border-top:var(--bt)]"
              style={{ ["--bt"]: i ? "1px solid var(--line)" : "none" } as React.CSSProperties}
            >
              <div>
                <div className="font-bold text-[14.5px]">{t.label}</div>
                <div className="text-[12.5px] text-ink-3 font-semibold">
                  {t.date}
                </div>
              </div>
              <span
                className="font-extrabold font-display [color:var(--amt)]"
                style={{ ["--amt"]: t.amount > 0 ? "var(--m-calm)" : "var(--ink)" } as React.CSSProperties}
              >
                {t.amount > 0 ? "+" : "−"}
                {fmt(Math.abs(t.amount))}
              </span>
            </div>
          ))}
        </div>
      )}
      {topup && <TopUpModal onClose={() => setTopup(false)} />}
    </div>
  );
}

function TopUpModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const [amt, setAmt] = useState(3000);
  const { busy, run } = useBusy();
  return (
    <Modal onClose={onClose} maxWidth={400}>
      <div className="p-[26px]">
        <h3 className="text-[20px] mb-[16px]">{t("Top up balance")}</h3>
        <div className="flex gap-[8px] flex-wrap mb-[14px]">
          {TOP_UP_AMOUNTS.map((v) => (
            <button
              key={v}
              className={`inline-flex items-center gap-[7px] py-[7px] px-[13px] rounded-pill text-[13px] font-semibold border cursor-pointer [transition:0.14s] whitespace-nowrap ${amt === v ? "bg-coral text-white border-coral" : "bg-surface text-ink-2 border-line-2 hover:border-ink-3 hover:text-ink"}`}
              onClick={() => setAmt(v)}
            >
              {fmt(v)}
            </button>
          ))}
        </div>
        <Input
          type="number"
          value={amt}
          onChange={(e) => setAmt(Math.max(+e.target.value || 0, 0))}
          className="mb-[18px]"
        />
        <div className="flex gap-[10px]">
          <Button ctx="app" variant="ghost" size="md" block onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button
            busy={busy}
            ctx="app"
            variant="primary"
            size="md"
            block
            icon={<Icons.wallet size={16} />}
            disabled={amt <= 0}
            onClick={() =>
              run(
                () => rpc("topUp", { amount: amt }),
                () => {
                  onClose();
                  router.refresh();
                },
              )
            }
          >
            {t("Pay")} {fmt(amt)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
