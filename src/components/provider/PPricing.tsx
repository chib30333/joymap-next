"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";
import { money, Toggle } from "@/components/dash/primitives";
import { Button, DataTable } from "@/components/ui";
import { useT } from "@/components/Language";

type RuleType = "up" | "down";

interface PricingRule {
  id: string;
  name: string;
  cond: string;
  adj: string;
  type: RuleType;
  active: boolean;
}

interface PricingService {
  id: string;
  name: string;
  dur: string;
  cap: string;
  price: number;
}

const P_RULES: PricingRule[] = [
  {
    id: "r1",
    name: "Peak weekend surge",
    cond: "Sat–Sun · all services",
    adj: "+15%",
    type: "up",
    active: true,
  },
  {
    id: "r2",
    name: "Early bird discount",
    cond: "Before 09:00",
    adj: "−10%",
    type: "down",
    active: true,
  },
  {
    id: "r3",
    name: "Last-minute fill",
    cond: "< 3h to start & seats open",
    adj: "−20%",
    type: "down",
    active: true,
  },
  {
    id: "r4",
    name: "Group of 4+",
    cond: "4 or more spots",
    adj: "−12%",
    type: "down",
    active: false,
  },
];

const ruleColor = (type: RuleType) =>
  type === "up" ? "var(--coral)" : "#1FA46E";

export function PPricing({ svcs }: { svcs: PricingService[] }) {
  const t = useT();
  const [rules, setRules] = useState(P_RULES);
  const toggle = (id: string) =>
    setRules((r) =>
      r.map((x) => (x.id === id ? { ...x, active: !x.active } : x)),
    );
  return (
    <div className="animate-anim-fade-dash">
      <div className="bg-surface border border-line rounded-lg p-[22px] mb-[var(--gap)]">
        <div className="flex items-end justify-between gap-4 mb-[14px]">
          <div>
            <h3 className="text-[17px]">{t("Base prices")}</h3>
            <div className="text-[13px] text-ink-3 font-semibold">
              {t("Per person, before dynamic rules")}
            </div>
          </div>
        </div>
        {svcs.length === 0 ? (
          <div className="py-[20px] px-0 text-ink-3 font-semibold text-[13.5px]">
            {t("No services yet — create one in Services.")}
          </div>
        ) : (
          <DataTable
            head={
              <>
                <th>{t("Service")}</th>
                <th>{t("Duration")}</th>
                <th>{t("Capacity")}</th>
                <th>{t("Base price")}</th>
              </>
            }
          >
            {svcs.map((s) => (
              <tr key={s.id} className="[transition:0.12s] cursor-pointer">
                <td>
                  <b className="font-bold">{s.name}</b>
                </td>
                <td className="text-ink-2">{s.dur}</td>
                <td className="text-ink-2">{s.cap}</td>
                <td className="font-bold [font-family:var(--display)]">
                  {money(s.price)}
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
      <div className="flex items-end justify-between gap-4 mb-[18px]">
        <div>
          <h3 className="text-[17px]">{t("Dynamic pricing rules")}</h3>
          <div className="text-[13px] text-ink-3 font-semibold">
            {t("Automatically adjust prices to fill capacity")}
          </div>
        </div>
        <Button ctx="dash" variant="primary" size="md" icon={<Icons.plus size={16} />}>
          {t("New rule")}
        </Button>
      </div>
      <div className="flex flex-col gap-[12px]">
        {rules.map((r) => (
          <div
            key={r.id}
            className="bg-surface border border-line rounded-lg py-[16px] px-[20px] flex items-center gap-[16px] [opacity:var(--op)]"
            style={{ ["--op"]: r.active ? 1 : 0.6 } as React.CSSProperties}
          >
            <span
              className="w-[42px] h-[42px] rounded-sm flex-none grid place-items-center [background:var(--bg)] [color:var(--c)]"
              style={
                {
                  ["--bg"]:
                    r.type === "up"
                      ? "rgba(224,33,47,.12)"
                      : "rgba(31,164,110,.13)",
                  ["--c"]: ruleColor(r.type),
                } as React.CSSProperties
              }
            >
              <Icons.percent size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[15px]">{t(r.name)}</div>
              <div className="text-[13px] text-ink-3 font-semibold">
                {t(r.cond)}
              </div>
            </div>
            <span
              className="font-extrabold text-[18px] [font-family:var(--display)] [color:var(--c)]"
              style={
                {
                  ["--c"]: ruleColor(r.type),
                } as React.CSSProperties
              }
            >
              {r.adj}
            </span>
            <Toggle on={r.active} onChange={() => toggle(r.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
