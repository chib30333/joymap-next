"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import { fmt, Modal, BusyBtn } from "./primitives";
import { Input } from "@/components/ui";

type Tx = { id: string; label: string; amount: number; date: string };

export function Wallet({ wallet, tx }: { wallet: number; tx: Tx[] }) {
  const [topup, setTopup] = useState(false);
  return (
    <div className="anim-fade max-w-[640px]">
      <div
        className="card"
        style={{
          padding: 28,
          background: "linear-gradient(150deg,#5E1014,var(--maroon))",
          color: "#F3EBE0",
          border: "1px solid color-mix(in srgb,var(--red) 55%,transparent)",
          position: "relative",
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <div className="text-[13.5px] opacity-[.82] font-semibold mb-[8px]">
          Joymap balance
        </div>
        <div className="font-display font-extrabold text-[40px] tracking-[-.02em]">
          {fmt(wallet)}
        </div>
        <div className="flex gap-[10px] mt-[20px]">
          <button
            className="btn btn-sm"
            style={{
              background: "var(--orange)",
              color: "#1A0A04",
              fontWeight: 800,
            }}
            onClick={() => setTopup(true)}
          >
            <Icons.plus size={16} />
            Top up
          </button>
        </div>
        <div className="absolute right-[-30px] bottom-[-40px] w-[160px] h-[160px] rounded-[99px] bg-[rgba(255,255,255,.05)]" />
      </div>
      <h3 className="text-[17px] mb-[14px]">Recent transactions</h3>
      {tx.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "34px 20px",
            textAlign: "center",
            color: "var(--ink-3)",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          No transactions yet. Top up or pay with your balance and the ledger
          appears here.
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {tx.map((t, i) => (
            <div
              key={t.id}
              className="flex items-center justify-between pt-[15px] pb-[15px] pl-[20px] pr-[20px]"
              style={{ borderTop: i ? "1px solid var(--line)" : "none" }}
            >
              <div>
                <div className="font-bold text-[14.5px]">{t.label}</div>
                <div className="text-[12.5px] text-ink-3 font-semibold">
                  {t.date}
                </div>
              </div>
              <span
                className="font-extrabold font-display"
                style={{ color: t.amount > 0 ? "var(--m-calm)" : "var(--ink)" }}
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
  const router = useRouter();
  const [amt, setAmt] = useState(3000);
  const { busy, run } = useBusy();
  return (
    <Modal onClose={onClose} maxWidth={400}>
      <div className="p-[26px]">
        <h3 className="text-[20px] mb-[16px]">Top up balance</h3>
        <div className="flex gap-[8px] flex-wrap mb-[14px]">
          {[1000, 3000, 5000, 10000].map((v) => (
            <button
              key={v}
              className={`chip ${amt === v ? "on" : ""}`}
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
          style={{ marginBottom: 18 }}
        />
        <div className="flex gap-[10px]">
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>
            Cancel
          </button>
          <BusyBtn
            busy={busy}
            className="btn btn-primary btn-md btn-block"
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
            Pay {fmt(amt)}
          </BusyBtn>
        </div>
      </div>
    </Modal>
  );
}
