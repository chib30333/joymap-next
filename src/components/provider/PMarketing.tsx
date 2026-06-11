"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";
import { Pill, Seg, Modal, Btn } from "@/components/dash/primitives";
import { Input } from "@/components/ui";

const P_PROMOS = [
  {
    code: "CALM15",
    desc: "15% off any wellness session",
    uses: 42,
    cap: 100,
    expires: "30 Jun",
    status: "active",
  },
  {
    code: "FIRSTYOGA",
    desc: "−500 ₽ on a first booking",
    uses: 88,
    cap: 200,
    expires: "15 Jul",
    status: "active",
  },
  {
    code: "SUNRISE",
    desc: "Free tea with sunrise classes",
    uses: 120,
    cap: 120,
    expires: "1 Jun",
    status: "rejected",
  },
];

export function PMarketing() {
  const [promos, setPromos] = useState(P_PROMOS);
  const [modal, setModal] = useState(false);
  const add = (p: any) => {
    setPromos((ps) => [{ ...p, uses: 0, status: "active" }, ...ps]);
    setModal(false);
  };
  return (
    <div className="anim-fade">
      <div className="shead">
        <div>
          <h3 className="text-[17px]">Promo codes</h3>
          <div className="text-[13px] text-ink-3 font-semibold">
            Drive bookings with limited-time offers
          </div>
        </div>
        <Btn
          size="md"
          icon={<Icons.plus size={16} />}
          onClick={() => setModal(true)}
        >
          Create code
        </Btn>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[var(--gap)]">
        {promos.map((p, i) => (
          <div key={i} className="card anim-pop" style={{ padding: 20 }}>
            <div className="flex items-center justify-between mb-[12px]">
              <span
                className="font-extrabold text-[18px] tracking-[.04em] py-[5px] px-[12px] rounded-xs bg-[color-mix(in_srgb,var(--orange)_14%,transparent)] text-[var(--orange-deep)]"
                style={{
                  fontFamily: "var(--display)",
                  border:
                    "1px dashed color-mix(in srgb,var(--orange) 45%,transparent)",
                }}
              >
                {p.code}
              </span>
              <Pill
                status={p.status}
                label={
                  p.status === "active"
                    ? "Active"
                    : p.status === "rejected"
                      ? "Expired"
                      : p.status
                }
              />
            </div>
            <p className="mt-0 mx-0 mb-[14px] text-[14px] text-ink-2 font-semibold">
              {p.desc}
            </p>
            <div className="h-[7px] rounded-[99px] bg-surface-2 overflow-hidden mb-[8px]">
              <div
                className="h-full rounded-[99px]"
                style={{
                  width: `${Math.min((p.uses / p.cap) * 100, 100)}%`,
                  background: p.uses >= p.cap ? "var(--ink-3)" : "var(--coral)",
                }}
              />
            </div>
            <div className="flex justify-between text-[12.5px] text-ink-3 font-semibold">
              <span>
                {p.uses}/{p.cap} redeemed
              </span>
              <span>Expires {p.expires}</span>
            </div>
          </div>
        ))}
      </div>
      {modal && <PromoModal onClose={() => setModal(false)} onAdd={add} />}
    </div>
  );
}

function PromoModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (p: any) => void;
}) {
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("15");
  const [unit, setUnit] = useState("%");
  const [cap, setCap] = useState("100");
  return (
    <Modal onClose={onClose} maxWidth={460}>
      <div className="py-[24px] px-[26px]">
        <h3 className="text-[20px] mb-[18px]">Create promo code</h3>
        <div className="flex flex-col gap-[14px]">
          <div>
            <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
              Code
            </div>
            <Input
              placeholder="SUMMER20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{
                fontFamily: "var(--display)",
                fontWeight: 700,
                letterSpacing: ".05em",
              }}
            />
          </div>
          <div>
            <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
              Description
            </div>
            <Input
              placeholder="15% off any wellness session"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="flex gap-[12px]">
            <div className="flex-1">
              <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
                Discount
              </div>
              <div className="flex gap-[8px]">
                <Input
                  value={amt}
                  onChange={(e) => setAmt(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Seg
                  value={unit}
                  options={[
                    { v: "%", l: "%" },
                    { v: "₽", l: "₽" },
                  ]}
                  onChange={setUnit}
                />
              </div>
            </div>
            <div className="w-[110px]">
              <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
                Max uses
              </div>
              <Input value={cap} onChange={(e) => setCap(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex gap-[10px] mt-[22px]">
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>
            Cancel
          </button>
          <Btn
            size="md"
            block
            onClick={() =>
              onAdd({
                code: code || "NEWCODE",
                desc: desc || `${amt}${unit} off`,
                cap: +cap || 100,
                expires: "31 Jul",
              })
            }
          >
            <Icons.check size={16} />
            Create code
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
