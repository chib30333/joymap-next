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
      <div className="bg-surface border border-line rounded-lg p-6 mb-[var(--gap)]">
        <div className="flex items-end justify-between gap-4 mb-3.5">
          <div>
            <h3 className="text-base">{t("Base prices")}</h3>
            <div className="text-sm text-ink-3 font-semibold">
              {t("Per person, before dynamic rules")}
            </div>
          </div>
        </div>
        {svcs.length === 0 ? (
          <div className="py-5 px-0 text-ink-3 font-semibold text-sm">
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
              <tr key={s.id} className="duration-[120ms] cursor-pointer">
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
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h3 className="text-base">{t("Dynamic pricing rules")}</h3>
          <div className="text-sm text-ink-3 font-semibold">
            {t("Automatically adjust prices to fill capacity")}
          </div>
        </div>
        <Button ctx="dash" variant="primary" size="md" icon={<Icons.plus size={16} />}>
          {t("New rule")}
        </Button>
      </div>
      <div className="flex flex-col gap-3">
        {rules.map((r) => (
          <div
            key={r.id}
            className={`bg-surface border border-line rounded-lg py-4 px-5 flex items-center gap-4 ${r.active ? "opacity-100" : "opacity-60"}`}
          >
            <span
              className="w-11 h-11 rounded-sm flex-none grid place-items-center [background:var(--bg)] [color:var(--c)]"
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
              <div className="font-bold text-base">{t(r.name)}</div>
              <div className="text-sm text-ink-3 font-semibold">
                {t(r.cond)}
              </div>
            </div>
            <span
              className="font-extrabold text-lg [font-family:var(--display)] [color:var(--c)]"
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
