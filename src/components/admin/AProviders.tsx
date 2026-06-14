"use client";

import { useState } from "react";
import { useT } from "@/components/Language";
import { Icons } from "@/components/Icons";
import { money, Pill, Seg, Modal, Avatar } from "@/components/dash/primitives";
import { Input, DataTable, TableCard, Button } from "@/components/ui";
import { downloadCSV } from "@/lib/csv";
import { EmptyCard } from "@/components/admin/AdminShared";

export function AProviders({ rows }: { rows: any[] }) {
  const t = useT();
  const [q, setQ] = useState("");
  const [st, setSt] = useState("all");
  const [sel, setSel] = useState<any>(null);
  const list = rows.filter(
    (p) =>
      (st === "all" || p.status === st) &&
      (p.name + p.cat + p.city).toLowerCase().includes(q.toLowerCase()),
  );
  const exportCsv = () =>
    downloadCSV("joymap-providers.csv", [
      [
        t("Provider"),
        t("Category"),
        t("City"),
        t("Bookings"),
        t("GMV"),
        t("Rating"),
        t("Status"),
      ],
      ...rows.map((p) => [
        p.name,
        p.cat,
        p.city,
        p.bookings,
        p.gmv,
        p.rating || "",
        p.status,
      ]),
    ]);
  return (
    <div className="animate-anim-fade-dash">
      <div className="flex items-end justify-between gap-[16px] mb-[18px]">
        <div className="relative flex-1 max-w-[340px]">
          <span className="absolute left-[14px] top-[50%] text-ink-3 [transform:translateY(-50%)]">
            <Icons.search size={17} />
          </span>
          <Input
            placeholder={t("Search providers…")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="!pl-[42px] !rounded-[var(--r-pill)]"
          />
        </div>
        <div className="flex gap-[10px]">
          <Seg
            value={st}
            options={[
              { v: "all", l: t("All") },
              { v: "active", l: t("Active") },
              { v: "review", l: t("In review") },
              { v: "rejected", l: t("Rejected") },
            ]}
            onChange={setSt}
          />
          <Button
            ctx="dash"
            variant="ghost"
            size="md"
            icon={<Icons.download size={16} />}
            onClick={exportCsv}
          >
            {t("Export CSV")}
          </Button>
        </div>
      </div>
      {list.length === 0 ? (
        <EmptyCard>
          {t("No providers")}
          {st !== "all" ? ` ${t("with status")} “${t(st)}”` : ""}{" "}
          {t("yet — they appear here after signing up.")}
        </EmptyCard>
      ) : (
        <TableCard scroll>
          <DataTable
            head={
              <>
                <th>{t("Provider")}</th>
                <th>{t("Category")}</th>
                <th>{t("City")}</th>
                <th>{t("Bookings")}</th>
                <th>{t("GMV")}</th>
                <th>{t("Rating")}</th>
                <th>{t("Status")}</th>
              </>
            }
          >
            {list.map((p) => (
              <tr
                key={p.id}
                className="[transition:0.12s] cursor-pointer hover:[&>td]:bg-surface-2"
                onClick={() => setSel(p)}
              >
                <td>
                  <div className="flex items-center gap-[10px]">
                    <Avatar name={p.name} size={32} />
                    <b className="font-bold">{p.name}</b>
                  </div>
                </td>
                <td className="text-ink-2">{p.cat}</td>
                <td className="text-ink-2">{p.city}</td>
                <td>{p.bookings}</td>
                <td className="font-display font-bold">{money(p.gmv)}</td>
                <td>
                  {p.rating ? (
                    <span className="inline-flex gap-[4px] items-center font-bold">
                      <Icons.star size={14} className="text-[var(--m-joy)]" />
                      {p.rating}
                    </span>
                  ) : (
                    <span className="text-ink-3">—</span>
                  )}
                </td>
                <td>
                  <Pill
                    status={p.status}
                    label={
                      p.status === "review"
                        ? t("In review")
                        : p.status === "rejected"
                          ? t("Rejected")
                          : t("Active")
                    }
                  />
                </td>
              </tr>
            ))}
          </DataTable>
        </TableCard>
      )}
      {sel && <ProviderDrawer p={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function ProviderDrawer({ p, onClose }: { p: any; onClose: () => void }) {
  const t = useT();
  const comm = Math.round(p.gmv * ((p.commission || 15) / 100));
  return (
    <Modal onClose={onClose} maxWidth={520}>
      <div>
        <div className="h-[90px] bg-[linear-gradient(140deg,var(--red),var(--orange))] relative">
          <button
            className="w-10 h-10 rounded-pill grid place-items-center text-ink-2 [transition:0.15s] cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2 absolute top-[12px] right-[12px] !bg-[rgba(255,255,255,.9)] !border-none"
            onClick={onClose}
          >
            <Icons.close size={18} />
          </button>
        </div>
        <div className="pt-0 px-[24px] pb-[24px] mt-[-30px] relative z-[1]">
          <div className="flex items-end gap-[14px] mb-[18px]">
            <Avatar
              name={p.name}
              size={64}
              grad="linear-gradient(140deg,var(--m-calm),#2E8C80)"
            />
            <div className="flex-1 pb-[4px]">
              <h3 className="text-[21px]">{p.name}</h3>
              <div className="text-[13px] text-ink-3 font-semibold">
                {p.cat} · {p.city} · {t("joined")} {p.joined || "Jun 2026"}
              </div>
            </div>
            <Pill
              status={p.status}
              label={
                p.status === "review"
                  ? t("In review")
                  : p.status === "rejected"
                    ? t("Rejected")
                    : t("Active")
              }
            />
          </div>
          <div className="text-[12px] font-extrabold tracking-[.06em] uppercase text-ink-3 mb-[10px]">
            {t("Financials")}
          </div>
          <div className="grid gap-[10px] mb-[20px] [grid-template-columns:1fr_1fr_1fr]">
            {[
              [t("GMV"), money(p.gmv)],
              [t("Commission (15%)"), money(comm)],
              [t("Bookings"), String(p.bookings)],
            ].map(([l, v]) => (
              <div
                key={l}
                className="bg-[var(--surface-2)] border border-line rounded-lg p-[13px_14px]"
              >
                <div className="text-[11.5px] text-ink-3 font-semibold mb-[4px]">
                  {l}
                </div>
                <div className="font-display font-extrabold text-[17px]">
                  {v}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-[8px] mb-[12px]">
            <div className="text-[12px] font-extrabold tracking-[.06em] uppercase text-ink-3">
              {t("Rating & complaints")}
            </div>
            <span className="ml-auto inline-flex gap-[4px] items-center font-bold">
              <Icons.star size={14} className="text-[var(--m-joy)]" />
              {p.rating || "—"}
            </span>
          </div>
          <div className="bg-[var(--surface-2)] border border-line rounded-lg p-[16px] flex items-center gap-[10px] text-[var(--ink-2)] font-semibold text-[13.5px]">
            <Icons.checkCirc size={18} className="text-[#1FA46E]" />
            {t("No open complaints — a clean record.")}
          </div>
          <div className="flex gap-[10px] mt-[22px]">
            <Button
              ctx="dash"
              variant="ghost"
              size="md"
              block
              onClick={onClose}
            >
              {t("Close")}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
