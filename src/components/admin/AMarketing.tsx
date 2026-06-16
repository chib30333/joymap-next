"use client";

import { useState } from "react";
import { useT } from "@/components/Language";
import { Icons } from "@/components/Icons";
import { Pill, Modal } from "@/components/dash/primitives";
import { Input, DataTable, TableCard, Button } from "@/components/ui";
import { downloadCSV } from "@/lib/csv";
import { Chip } from "@/components/admin/AdminShared";

type CampaignStatus = "active" | "review";

interface Campaign {
  name: string;
  channel: string;
  audience: string;
  sent: number;
  ctr: string;
  status: CampaignStatus;
}

const A_CAMPAIGNS: Campaign[] = [
  {
    name: "Weekend in Moscow",
    channel: "Push",
    audience: "All users · Moscow",
    sent: 42100,
    ctr: "7.4%",
    status: "active",
  },
  {
    name: "First booking −20%",
    channel: "Email",
    audience: "New users",
    sent: 18600,
    ctr: "12.1%",
    status: "active",
  },
  {
    name: "Win-back: dormant 30d",
    channel: "Push",
    audience: "Dormant",
    sent: 9300,
    ctr: "4.8%",
    status: "review",
  },
];

export function AMarketing() {
  const t = useT();
  const [promo, setPromo] = useState(false);
  return (
    <div className="animate-anim-fade-dash">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div />
        <div className="flex gap-2.5">
          <Button
            ctx="dash"
            variant="ghost"
            size="md"
            onClick={() => setPromo(true)}
          >
            <Icons.percent size={16} />
            {t("Mass-create promos")}
          </Button>
          <Button ctx="dash" variant="primary" size="md">
            <Icons.send size={16} />
            {t("New campaign")}
          </Button>
        </div>
      </div>
      <TableCard className="mb-[var(--gap)]">
        <h3 className="text-base pt-5 px-5 pb-1">
          {t("Campaigns")}
        </h3>
        <DataTable
          head={
            <>
              <th>{t("Campaign")}</th>
              <th>{t("Channel")}</th>
              <th>{t("Audience")}</th>
              <th>{t("Sent")}</th>
              <th>{t("CTR")}</th>
              <th>{t("Status")}</th>
            </>
          }
        >
          {A_CAMPAIGNS.map((c, i) => (
            <tr
              key={i}
              className="duration-[120ms] cursor-pointer hover:[&>td]:bg-surface-2"
            >
              <td>
                <b className="font-bold">{t(c.name)}</b>
              </td>
              <td>
                <Chip
                  bg="var(--surface-2)"
                  color="var(--ink-2)"
                  border="1px solid var(--line)"
                >
                  {t(c.channel)}
                </Chip>
              </td>
              <td className="text-ink-2">{t(c.audience)}</td>
              <td>{c.sent.toLocaleString("ru-RU")}</td>
              <td className="font-bold">{c.ctr}</td>
              <td>
                <Pill
                  status={c.status === "active" ? "active" : "review"}
                  label={c.status === "active" ? t("Active") : t("Scheduled")}
                />
              </td>
            </tr>
          ))}
        </DataTable>
      </TableCard>
      {promo && <PromoMassModal onClose={() => setPromo(false)} />}
    </div>
  );
}

function PromoMassModal({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [prefix, setPrefix] = useState("SUMMER");
  const [count, setCount] = useState(50);
  const [disc, setDisc] = useState("20");
  const [done, setDone] = useState(false);
  const sample = Array.from(
    { length: 3 },
    () => `${prefix}-${1000 + Math.floor(Math.random() * 9000)}`,
  );
  return (
    <Modal onClose={onClose} maxWidth={460}>
      <div className="px-7 py-6">
        {!done ? (
          <>
            <h3 className="text-xl mb-1.5">
              {t("Mass-create promo codes")}
            </h3>
            <p className="text-ink-2 text-sm mt-0 mx-0 mb-5">
              {t("Generate a batch of unique single-use codes for a campaign.")}
            </p>
            <div className="flex flex-col gap-3.5">
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="text-xs font-bold text-ink-2 mb-2">
                    {t("Code prefix")}
                  </div>
                  <Input
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    className="[font-family:var(--display)] font-bold"
                  />
                </div>
                <div className="w-[120px]">
                  <div className="text-xs font-bold text-ink-2 mb-2">
                    {t("How many")}
                  </div>
                  <Input
                    type="number"
                    value={count}
                    onChange={(e) => setCount(+e.target.value)}
                  />
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-ink-2 mb-2">
                  {t("Discount (%)")}
                </div>
                <Input value={disc} onChange={(e) => setDisc(e.target.value)} />
              </div>
              <div className="bg-[var(--surface-2)] border border-line rounded-lg p-3.5">
                <div className="text-xs font-bold text-ink-3 mb-2">
                  {t("PREVIEW")}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {sample.map((sm, i) => (
                    <span
                      key={i}
                      className="font-display font-bold text-sm px-2.5 py-1 rounded-md bg-surface [border:1px_dashed_var(--line-2)]"
                    >
                      {sm}
                    </span>
                  ))}
                  <span className="text-sm text-ink-3 font-semibold self-center">
                    +{Math.max(count - 3, 0)} {t("more")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2.5 mt-6">
              <Button
                ctx="dash"
                variant="ghost"
                size="md"
                block
                onClick={onClose}
              >
                {t("Cancel")}
              </Button>
              <Button ctx="dash" variant="primary" size="md" block onClick={() => setDone(true)}>
                <Icons.sparkle size={16} />
                {t("Generate")} {count} {t("codes")}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center px-0 py-2.5">
            <div className="w-[60px] h-[60px] rounded-pill bg-[rgba(31,164,110,.14)] text-[#1FA46E] grid place-items-center mt-0 mx-auto mb-4">
              <Icons.check size={32} />
            </div>
            <h3 className="text-xl mb-1.5">
              {count} {t("codes created")}
            </h3>
            <p className="text-ink-2 text-sm mt-0 mx-0 mb-5">
              {t("Download the batch as CSV to share with your campaign.")}
            </p>
            <div className="flex gap-2.5">
              <Button
                ctx="dash"
                variant="ghost"
                size="md"
                block
                onClick={onClose}
              >
                {t("Close")}
              </Button>
              <Button
                ctx="dash"
                variant="primary"
                size="md"
                block
                onClick={() => {
                  downloadCSV(`${prefix}-codes.csv`, [
                    [t("Code"), t("Discount")],
                    ...Array.from({ length: count }, (_, i) => [
                      `${prefix}-${1000 + i}`,
                      disc + "%",
                    ]),
                  ]);
                  onClose();
                }}
              >
                <Icons.download size={16} />
                {t("Download CSV")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
