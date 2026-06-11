"use client";
// Wallet — 1:1 port of screens.jsx Wallet (+ Top-up modal).
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import { fmt, Modal, BusyBtn } from "./primitives";

type Tx = { id: string; label: string; amount: number; date: string };

export function Wallet({ wallet, tx }: { wallet: number; tx: Tx[] }) {
  const [topup, setTopup] = useState(false);
  return (
    <div className="anim-fade" style={{ maxWidth: 640 }}>
      <div className="card" style={{ padding: 28, background: "linear-gradient(150deg,#5E1014,var(--maroon))", color: "#F3EBE0", border: "1px solid color-mix(in srgb,var(--red) 55%,transparent)", position: "relative", overflow: "hidden", marginBottom: 24 }}>
        <div style={{ fontSize: 13.5, opacity: 0.82, fontWeight: 600, marginBottom: 8 }}>Joymap balance</div>
        <div style={{ fontFamily: "var(--display)", fontWeight: 800, fontSize: 40, letterSpacing: "-.02em" }}>{fmt(wallet)}</div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn btn-sm" style={{ background: "var(--orange)", color: "#1A0A04", fontWeight: 800 }} onClick={() => setTopup(true)}><Icons.plus size={16} />Top up</button>
        </div>
        <div style={{ position: "absolute", right: -30, bottom: -40, width: 160, height: 160, borderRadius: 99, background: "rgba(255,255,255,.05)" }} />
      </div>
      <h3 style={{ fontSize: 17, marginBottom: 14 }}>Recent transactions</h3>
      {tx.length === 0 ? (
        <div className="card" style={{ padding: "34px 20px", textAlign: "center", color: "var(--ink-3)", fontWeight: 600, fontSize: 14 }}>No transactions yet. Top up or pay with your balance and the ledger appears here.</div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          {tx.map((t, i) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "15px 20px", borderTop: i ? "1px solid var(--line)" : "none" }}>
              <div><div style={{ fontWeight: 700, fontSize: 14.5 }}>{t.label}</div><div style={{ fontSize: 12.5, color: "var(--ink-3)", fontWeight: 600 }}>{t.date}</div></div>
              <span style={{ fontWeight: 800, fontFamily: "var(--display)", color: t.amount > 0 ? "var(--m-calm)" : "var(--ink)" }}>{t.amount > 0 ? "+" : "−"}{fmt(Math.abs(t.amount))}</span>
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
      <div style={{ padding: 26 }}>
        <h3 style={{ fontSize: 20, marginBottom: 16 }}>Top up balance</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {[1000, 3000, 5000, 10000].map((v) => <button key={v} className={`chip ${amt === v ? "on" : ""}`} onClick={() => setAmt(v)}>{fmt(v)}</button>)}
        </div>
        <input className="field" type="number" value={amt} onChange={(e) => setAmt(Math.max(+e.target.value || 0, 0))} style={{ marginBottom: 18 }} />
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>Cancel</button>
          <BusyBtn busy={busy} className="btn btn-primary btn-md btn-block" icon={<Icons.wallet size={16} />} disabled={amt <= 0} onClick={() => run(() => rpc("topUp", { amount: amt }), () => { onClose(); router.refresh(); })}>Pay {fmt(amt)}</BusyBtn>
        </div>
      </div>
    </Modal>
  );
}
