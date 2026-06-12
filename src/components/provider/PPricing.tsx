"use client";

import { useState } from "react";
import { Icons } from "@/components/Icons";
import { money, Toggle, Btn } from "@/components/dash/primitives";
import { useT } from "@/components/Language";

const P_RULES = [
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

export function PPricing({ svcs }: { svcs: any[] }) {
  const t = useT();
  const [rules, setRules] = useState(P_RULES);
  const toggle = (id: string) =>
    setRules((r) =>
      r.map((x) => (x.id === id ? { ...x, active: !x.active } : x)),
    );
  return (
    <div className="anim-fade">
      <div className="card" style={{ padding: 22, marginBottom: "var(--gap)" }}>
        <div className="shead" style={{ marginBottom: 14 }}>
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
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("Service")}</th>
                <th>{t("Duration")}</th>
                <th>{t("Capacity")}</th>
                <th>{t("Base price")}</th>
              </tr>
            </thead>
            <tbody>
              {svcs.map((s) => (
                <tr key={s.id} className="row">
                  <td>
                    <b className="font-bold">{s.name}</b>
                  </td>
                  <td className="text-ink-2">{s.dur}</td>
                  <td className="text-ink-2">{s.cap}</td>
                  <td
                    className="font-bold"
                    style={{ fontFamily: "var(--display)" }}
                  >
                    {money(s.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="shead">
        <div>
          <h3 className="text-[17px]">{t("Dynamic pricing rules")}</h3>
          <div className="text-[13px] text-ink-3 font-semibold">
            {t("Automatically adjust prices to fill capacity")}
          </div>
        </div>
        <Btn size="md" icon={<Icons.plus size={16} />}>
          {t("New rule")}
        </Btn>
      </div>
      <div className="flex flex-col gap-[12px]">
        {rules.map((r) => (
          <div
            key={r.id}
            className="card"
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: r.active ? 1 : 0.6,
            }}
          >
            <span
              className="w-[42px] h-[42px] rounded-sm flex-none grid"
              style={{
                placeItems: "center",
                background:
                  r.type === "up"
                    ? "rgba(224,33,47,.12)"
                    : "rgba(31,164,110,.13)",
                color: r.type === "up" ? "var(--coral)" : "#1FA46E",
              }}
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
              className="font-extrabold text-[18px]"
              style={{
                fontFamily: "var(--display)",
                color: r.type === "up" ? "var(--coral)" : "#1FA46E",
              }}
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
