"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";
import { Pill, Seg, Modal } from "@/components/dash/primitives";
import { Button, Input } from "@/components/ui";
import { useT } from "@/components/Language";

type PromoStatus = "active" | "rejected" | string;

type Promo = {
  code: string;
  desc: string;
  uses: number;
  cap: number;
  expires: string;
  status: PromoStatus;
};

type NewPromo = Pick<Promo, "code" | "desc" | "cap" | "expires">;

const P_PROMOS: Promo[] = [
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
  const t = useT();
  const [promos, setPromos] = useState(P_PROMOS);
  const [modal, setModal] = useState(false);
  const add = (p: NewPromo) => {
    setPromos((ps) => [{ ...p, uses: 0, status: "active" }, ...ps]);
    setModal(false);
  };
  return (
    <div className="animate-anim-fade-dash">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base">{t("Promo codes")}</h3>
          <div className="text-sm text-ink-3 font-semibold">
            {t("Drive bookings with limited-time offers")}
          </div>
        </div>
        <Button
          ctx="dash"
          variant="primary"
          size="md"
          icon={<Icons.plus size={16} />}
          onClick={() => setModal(true)}
        >
          {t("Create code")}
        </Button>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[var(--gap)]">
        {promos.map((p) => (
          <div key={p.code} className="bg-surface border border-line rounded-lg animate-anim-pop-dash p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-lg tracking-wider py-1.5 px-3 rounded-xs bg-[color-mix(in_srgb,var(--orange)_14%,transparent)] text-[var(--orange-deep)] [font-family:var(--display)] [border:1px_dashed_color-mix(in_srgb,var(--orange)_45%,transparent)]">
                {p.code}
              </span>
              <Pill
                status={p.status}
                label={
                  p.status === "active"
                    ? t("Active")
                    : p.status === "rejected"
                      ? t("Expired")
                      : p.status
                }
              />
            </div>
            <p className="mt-0 mx-0 mb-3.5 text-sm text-ink-2 font-semibold">
              {p.desc}
            </p>
            <div className="h-2 rounded-pill bg-surface-2 overflow-hidden mb-2">
              <div
                className="h-full rounded-pill w-[var(--w)] [background:var(--bg)]"
                style={
                  {
                    ["--w"]: `${Math.min((p.uses / p.cap) * 100, 100)}%`,
                    ["--bg"]:
                      p.uses >= p.cap ? "var(--ink-3)" : "var(--coral)",
                  } as React.CSSProperties
                }
              />
            </div>
            <div className="flex justify-between text-xs text-ink-3 font-semibold">
              <span>
                {p.uses}/{p.cap} {t("redeemed")}
              </span>
              <span>
                {t("Expires")} {p.expires}
              </span>
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
  onAdd: (p: NewPromo) => void;
}) {
  const t = useT();
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("15");
  const [unit, setUnit] = useState("%");
  const [cap, setCap] = useState("100");
  return (
    <Modal onClose={onClose} maxWidth={460}>
      <div className="py-6 px-7">
        <h3 className="text-xl mb-5">{t("Create promo code")}</h3>
        <div className="flex flex-col gap-3.5">
          <div>
            <div className="text-xs font-bold text-ink-2 mb-2">
              {t("Code")}
            </div>
            <Input
              placeholder="SUMMER20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="[font-family:var(--display)] font-bold tracking-wider"
            />
          </div>
          <div>
            <div className="text-xs font-bold text-ink-2 mb-2">
              {t("Description")}
            </div>
            <Input
              placeholder={t("15% off any wellness session")}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <div className="text-xs font-bold text-ink-2 mb-2">
                {t("Discount")}
              </div>
              <div className="flex gap-2">
                <Input
                  value={amt}
                  onChange={(e) => setAmt(e.target.value)}
                  className="flex-1"
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
              <div className="text-xs font-bold text-ink-2 mb-2">
                {t("Max uses")}
              </div>
              <Input value={cap} onChange={(e) => setCap(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex gap-2.5 mt-6">
          <Button ctx="dash" variant="ghost" size="md" block onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button
            ctx="dash"
            variant="primary"
            size="md"
            block
            onClick={() =>
              onAdd({
                code: code || "NEWCODE",
                desc: desc || `${amt}${unit} ${t("off")}`,
                cap: +cap || 100,
                expires: "31 Jul",
              })
            }
          >
            <Icons.check size={16} />
            {t("Create code")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
