"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import {
  money,
  Stat,
  Bars,
  LineChart,
  Donut,
  Pill,
  Seg,
  Modal,
  Btn,
  Avatar,
  BusyBtn,
} from "@/components/dash/primitives";
import { Input, Select } from "@/components/ui";
import { MOODS } from "@/components/customer/primitives";
import { downloadCSV } from "@/lib/csv";

const CAT_COLORS: Record<string, string> = {
  Wellness: "#3FA89B",
  Thrill: "#FF4D74",
  Creative: "#7B53F0",
  Movement: "#5563D6",
  Adventure: "#E89015",
  Mind: "#FF8A4C",
  Other: "#9B8AA0",
};
const REJECT_REASONS = [
  "Incomplete documents",
  "Unverified business license",
  "Low-quality photos",
  "Pricing policy violation",
  "Duplicate listing",
  "Other",
];

/* ===== Dashboard ===== */
export function ADashboard({
  s,
  apps,
  pend,
  top,
}: {
  s: any;
  apps: any[];
  pend: any[];
  top: any[];
}) {
  const t = useT();
  const router = useRouter();
  const days = Object.keys(s.byDay)
    .map(Number)
    .sort((a, b) => a - b);
  const gmvPts = days.map((d) => ({
    label: d + " " + t("Jun"),
    value: s.byDay[d],
  }));
  const cats = Object.keys(s.byCat).map((c) => ({
    label: c,
    value: s.byCat[c],
    color: CAT_COLORS[c] || CAT_COLORS.Other,
  }));
  const queue = [
    ...apps.map((a) => ({
      kind: t("Provider"),
      name: a.name,
      sub: a.cat + " · " + a.city,
    })),
    ...pend.map((p) => ({
      kind: t("Service"),
      name: p.name,
      sub: t("by") + " " + p.providerName,
    })),
  ];
  return (
    <div className="anim-fade">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
          gap: "var(--gap)",
          marginBottom: "var(--gap)",
        }}
      >
        <Stat
          label={t("GMV · June")}
          value={money(s.gmv)}
          icon={<Icons.flame size={16} />}
          accent="#1FA46E"
          sub={t("confirmed bookings")}
        />
        <Stat
          label={t("Platform revenue")}
          value={money(s.revenue)}
          icon={<Icons.wallet size={16} />}
          accent="#5563D6"
          sub={t("15% commission")}
        />
        <Stat
          label={t("Active providers")}
          value={String(s.activeProviders)}
          icon={<Icons.user size={16} />}
          accent="#E89015"
          sub={`${apps.length} ${t("in review")}`}
        />
        <Stat
          label={t("Bookings")}
          value={String(s.bookings)}
          icon={<Icons.calendar size={16} />}
          accent="#FF8A4C"
          sub={`${s.customers} ${t("customers")}`}
        />
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "1.6fr 1fr",
          gap: "var(--gap)",
          marginBottom: "var(--gap)",
        }}
      >
        <div className="card" style={{ padding: 22 }}>
          <div className="shead" style={{ marginBottom: 8 }}>
            <div>
              <h3 className="text-[17px]">{t("Gross merchandise value")}</h3>
              <div className="text-[13px] text-ink-3 font-semibold">
                {t("By booking day · live")}
              </div>
            </div>
            {s.gmv > 0 && (
              <span
                className="tag"
                style={{ background: "rgba(31,164,110,.13)", color: "#1FA46E" }}
              >
                ▴ {t("Live")}
              </span>
            )}
          </div>
          {gmvPts.length > 1 ? (
            <LineChart
              points={gmvPts}
              h={210}
              caption="GMV"
              valFmt={(v) => money(v)}
            />
          ) : gmvPts.length === 1 ? (
            <Bars data={gmvPts} unit="₽" />
          ) : (
            <div
              className="h-[210px] grid text-ink-3 font-semibold text-[13.5px]"
              style={{ placeItems: "center" }}
            >
              {t("GMV charts light up once bookings are confirmed.")}
            </div>
          )}
        </div>
        <div
          className="card"
          style={{
            padding: 22,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <h3
            className="text-[17px] mb-[16px]"
            style={{ alignSelf: "flex-start" }}
          >
            {t("GMV by category")}
          </h3>
          {cats.length === 0 ? (
            <div
              className="flex-1 grid text-ink-3 font-semibold text-[13.5px] text-center"
              style={{ placeItems: "center" }}
            >
              {t("No category data yet.")}
            </div>
          ) : (
            <>
              <Donut
                segments={cats}
                center={{ v: money(s.gmv), l: t("total") }}
                size={170}
                valFmt={(seg, total) =>
                  `${Math.round((seg.value / total) * 100)}% · ${money(seg.value)}`
                }
              />
              <div
                className="grid mt-[18px] w-full"
                style={{ gridTemplateColumns: "1fr 1fr", gap: "8px 14px" }}
              >
                {cats.map((c) => (
                  <span
                    key={c.label}
                    className="inline-flex items-center gap-[7px] text-[12.5px] font-bold text-ink-2"
                  >
                    <span
                      className="w-[9px] h-[9px] rounded-[99px]"
                      style={{ background: c.color }}
                    />
                    {t(c.label)}
                    <span className="ml-auto text-ink-3">
                      {Math.round((c.value / s.gmv) * 100)}%
                    </span>
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <div
        className="grid"
        style={{ gridTemplateColumns: "1fr 1fr", gap: "var(--gap)" }}
      >
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="flex items-center justify-between px-[20px] py-[18px]">
            <h3 className="text-[16px]">{t("Moderation queue")}</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push("/admin/moderation")}
            >
              {t("Review")} <Icons.arrowR size={15} />
            </button>
          </div>
          {queue.length === 0 && (
            <div className="px-[20px] py-[18px] border-t border-line text-ink-3 font-semibold text-[13.5px]">
              {t("Queue is clear — nothing awaiting review.")}
            </div>
          )}
          {queue.slice(0, 3).map((m, i) => (
            <div
              key={i}
              className="flex items-center gap-[12px] px-[20px] py-[12px] border-t border-line"
            >
              <Avatar
                name={m.name}
                size={34}
                grad="linear-gradient(140deg,var(--m-focus),#3742A8)"
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px]">{m.name}</div>
                <div className="text-[12px] text-ink-3 font-semibold">
                  {m.kind} · {m.sub}
                </div>
              </div>
              <Pill status="review" label={t("new")} />
            </div>
          ))}
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="flex items-center justify-between px-[20px] py-[18px]">
            <h3 className="text-[16px]">{t("Top providers by GMV")}</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.push("/admin/providers")}
            >
              {t("All")} <Icons.arrowR size={15} />
            </button>
          </div>
          {top.length === 0 && (
            <div className="px-[20px] py-[18px] border-t border-line text-ink-3 font-semibold text-[13.5px]">
              {t("No providers yet.")}
            </div>
          )}
          {top.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center gap-[12px] px-[20px] py-[12px] border-t border-line"
            >
              <span className="font-display font-extrabold text-ink-3 w-[16px]">
                {i + 1}
              </span>
              <Avatar name={p.name} size={34} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-[14px]">{p.name}</div>
                <div className="text-[12px] text-ink-3 font-semibold">
                  {p.cat} · {p.city}
                </div>
              </div>
              <span className="font-display font-bold text-[14px]">
                {money(p.gmv)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== Providers ===== */
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
    <div className="anim-fade">
      <div className="shead">
        <div className="relative flex-1 max-w-[340px]">
          <span
            className="absolute left-[14px] top-[50%] text-ink-3"
            style={{ transform: "translateY(-50%)" }}
          >
            <Icons.search size={17} />
          </span>
          <Input
            placeholder={t("Search providers…")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ paddingLeft: 42, borderRadius: "var(--r-pill)" }}
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
          <button className="btn btn-ghost btn-md" onClick={exportCsv}>
            <Icons.download size={16} />
            {t("Export CSV")}
          </button>
        </div>
      </div>
      {list.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "56px 20px",
            textAlign: "center",
            color: "var(--ink-3)",
            fontWeight: 600,
          }}
        >
          {t("No providers")}
          {st !== "all" ? ` ${t("with status")} “${t(st)}”` : ""}{" "}
          {t("yet — they appear here after signing up.")}
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>{t("Provider")}</th>
                  <th>{t("Category")}</th>
                  <th>{t("City")}</th>
                  <th>{t("Bookings")}</th>
                  <th>{t("GMV")}</th>
                  <th>{t("Rating")}</th>
                  <th>{t("Status")}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((p) => (
                  <tr key={p.id} className="row" onClick={() => setSel(p)}>
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
                          <Icons.star
                            size={14}
                            style={{ color: "var(--m-joy)" }}
                          />
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
              </tbody>
            </table>
          </div>
        </div>
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
            className="icon-btn"
            style={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(255,255,255,.9)",
              border: "none",
            }}
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
          <div
            className="grid gap-[10px] mb-[20px]"
            style={{ gridTemplateColumns: "1fr 1fr 1fr" }}
          >
            {[
              [t("GMV"), money(p.gmv)],
              [t("Commission (15%)"), money(comm)],
              [t("Bookings"), String(p.bookings)],
            ].map(([l, v]) => (
              <div
                key={l}
                className="card"
                style={{ padding: "13px 14px", background: "var(--surface-2)" }}
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
              <Icons.star size={14} style={{ color: "var(--m-joy)" }} />
              {p.rating || "—"}
            </span>
          </div>
          <div
            className="card"
            style={{
              padding: 16,
              background: "var(--surface-2)",
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "var(--ink-2)",
              fontWeight: 600,
              fontSize: 13.5,
            }}
          >
            <Icons.checkCirc size={18} style={{ color: "#1FA46E" }} />
            {t("No open complaints — a clean record.")}
          </div>
          <div className="flex gap-[10px] mt-[22px]">
            <button
              className="btn btn-ghost btn-md btn-block"
              onClick={onClose}
            >
              {t("Close")}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ===== Moderation ===== */
export function AModeration({ apps, svcs }: { apps: any[]; svcs: any[] }) {
  const t = useT();
  const [sel, setSel] = useState<any>(null);
  const empty = apps.length === 0 && svcs.length === 0;
  return (
    <div className="anim-fade">
      <div className="shead">
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {apps.length + svcs.length} {t("awaiting review")}
          </div>
          <h2 className="text-[22px]">{t("Moderation")}</h2>
        </div>
      </div>
      {empty && (
        <div className="text-center p-[70px] text-ink-3">
          <Icons.checkCirc size={40} />
          <h3 className="text-ink mt-[12px]">{t("Queue cleared 🎉")}</h3>
          <p>
            {t("New provider applications and service submissions land here.")}
          </p>
        </div>
      )}
      {apps.length > 0 && (
        <>
          <h3 className="text-[16px] mt-[4px] mx-0 mb-[14px]">
            {t("Provider applications")}
          </h3>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
              gap: "var(--gap)",
              marginBottom: "var(--gap)",
            }}
          >
            {apps.map((m) => (
              <div key={m.id} className="card anim-pop" style={{ padding: 20 }}>
                <div className="flex items-center gap-[12px] mb-[14px]">
                  <Avatar
                    name={m.name}
                    size={42}
                    grad="linear-gradient(140deg,var(--m-focus),#3742A8)"
                  />
                  <div className="flex-1">
                    <div className="font-extrabold text-[16px]">{m.name}</div>
                    <div className="text-[12.5px] text-ink-3 font-semibold">
                      {m.cat} · {m.city}
                    </div>
                  </div>
                  <Pill status="review" label={t("new")} />
                </div>
                <div className="flex gap-[14px] text-[13px] text-ink-2 font-semibold mb-[16px]">
                  <span className="inline-flex gap-[6px] items-center">
                    <Icons.mail size={15} />
                    {m.email}
                  </span>
                  <span className="inline-flex gap-[6px] items-center">
                    <Icons.checkCirc size={15} />
                    {m.docs || 3} {t("documents")}
                  </span>
                </div>
                <div className="flex gap-[9px]">
                  <Btn
                    size="sm"
                    block
                    onClick={() =>
                      setSel({ kind: "provider", item: m, mode: "approve" })
                    }
                  >
                    <Icons.check size={15} />
                    {t("Approve")}
                  </Btn>
                  <button
                    className="btn btn-ghost btn-sm btn-block"
                    onClick={() =>
                      setSel({ kind: "provider", item: m, mode: "reject" })
                    }
                  >
                    {t("Reject")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {svcs.length > 0 && (
        <>
          <h3 className="text-[16px] mt-[4px] mx-0 mb-[14px]">
            {t("Service submissions")}
          </h3>
          <div
            className="grid"
            style={{
              gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))",
              gap: "var(--gap)",
            }}
          >
            {svcs.map((s) => {
              const m = MOODS[s.mood] || MOODS.calm;
              return (
                <div
                  key={s.id}
                  className="card anim-pop"
                  style={{ padding: 20 }}
                >
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <span
                      className="w-[42px] h-[42px] rounded-sm flex-none"
                      style={{
                        background: `linear-gradient(135deg,${m.color},color-mix(in srgb,${m.color} 60%,#000))`,
                      }}
                    />
                    <div className="flex-1">
                      <div className="font-extrabold text-[16px]">{s.name}</div>
                      <div className="text-[12.5px] text-ink-3 font-semibold">
                        {t("by")} {s.providerName} · {s.cat} · {money(s.price)}
                      </div>
                    </div>
                    <Pill status="review" label={t("new")} />
                  </div>
                  {s.about && (
                    <p className="mt-0 mx-0 mb-[14px] text-[13.5px] text-ink-2 leading-[1.5]">
                      {s.about.slice(0, 140)}
                      {s.about.length > 140 ? "…" : ""}
                    </p>
                  )}
                  <div className="flex gap-[9px]">
                    <Btn
                      size="sm"
                      block
                      onClick={() =>
                        setSel({ kind: "service", item: s, mode: "approve" })
                      }
                    >
                      <Icons.check size={15} />
                      {t("Approve & publish")}
                    </Btn>
                    <button
                      className="btn btn-ghost btn-sm btn-block"
                      onClick={() =>
                        setSel({ kind: "service", item: s, mode: "reject" })
                      }
                    >
                      {t("Reject")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {sel && <ModerationModal sel={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

function ModerationModal({ sel, onClose }: { sel: any; onClose: () => void }) {
  const t = useT();
  const router = useRouter();
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const { busy, run } = useBusy();
  const reject = sel.mode === "reject";
  const it = sel.item;
  const decide = () =>
    run(
      () =>
        rpc(sel.kind === "provider" ? "decideProvider" : "decideService", {
          id: it.id,
          approve: !reject,
          reason: reject ? reason : null,
        }),
      () => {
        onClose();
        router.refresh();
      },
    );
  return (
    <Modal onClose={onClose} maxWidth={440}>
      <div className="px-[26px] py-[24px]">
        <div className="flex items-center gap-[12px] mb-[18px]">
          <Avatar
            name={it.name}
            size={44}
            grad="linear-gradient(140deg,var(--m-focus),#3742A8)"
          />
          <div>
            <h3 className="text-[18px]">{it.name}</h3>
            <div className="text-[13px] text-ink-3 font-semibold">
              {sel.kind === "provider"
                ? `${it.cat} · ${it.city}`
                : `${t("Service")} · ${t("by")} ${it.providerName}`}
            </div>
          </div>
        </div>
        {sel.kind === "provider" && (
          <div
            className="card"
            style={{
              padding: 14,
              background: "var(--surface-2)",
              marginBottom: 18,
            }}
          >
            {[
              "Business license",
              "Identity verification",
              "Insurance certificate",
            ]
              .slice(0, it.docs || 3)
              .map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-[10px] px-0 py-[7px] text-[13.5px] font-semibold"
                >
                  <Icons.checkCirc size={17} style={{ color: "#1FA46E" }} />
                  {t(d)}
                  <span className="ml-auto text-[12px] text-ink-3">
                    {t("Verified")}
                  </span>
                </div>
              ))}
          </div>
        )}
        {reject ? (
          <div className="mb-[18px]">
            <div className="font-bold text-[14px] mb-[8px]">
              {t("Reason for rejection")}
            </div>
            <Select value={reason} onChange={(e) => setReason(e.target.value)}>
              {REJECT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {t(r)}
                </option>
              ))}
            </Select>
          </div>
        ) : (
          <p className="text-ink-2 text-[14px] mb-[18px]">
            {t("Approving will")}{" "}
            {sel.kind === "provider" ? (
              <>
                {t("activate")} <b>{it.name}</b> {t("on the marketplace")}
              </>
            ) : (
              <>
                {t("publish")} <b>{it.name}</b> {t("to the customer catalogue")}
              </>
            )}{" "}
            {t("and notify the owner.")}
          </p>
        )}
        <div className="flex gap-[10px]">
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>
            {t("Cancel")}
          </button>
          {reject ? (
            <BusyBtn
              busy={busy}
              className="btn btn-md btn-block"
              style={{ background: "var(--coral)", color: "#fff" }}
              onClick={decide}
            >
              {t("Reject")}
            </BusyBtn>
          ) : (
            <BusyBtn
              busy={busy}
              className="btn btn-primary btn-md btn-block"
              icon={<Icons.check size={16} />}
              onClick={decide}
            >
              {t("Approve")}
            </BusyBtn>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ===== Content ===== */
export function AContent({ items }: { items: any[] }) {
  const t = useT();
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [acting, setActing] = useState<string | null>(null);
  const act = (id: string) => {
    setActing(id);
    rpc("resolveFlag", { id }).then(() => {
      setActing(null);
      router.refresh();
    });
  };
  const list =
    filter === "all" ? items : items.filter((c) => c.type === filter);
  const TYPE: Record<string, [string, string]> = {
    review: ["Review", "#5563D6"],
    photo: ["Photo", "#E89015"],
    promo: ["Promo material", "#7B53F0"],
  };
  return (
    <div className="anim-fade">
      <div className="shead">
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {items.length} {t("flagged items")}
          </div>
          <h2 className="text-[22px]">{t("Content moderation")}</h2>
        </div>
        <Seg
          value={filter}
          options={[
            { v: "all", l: t("All") },
            { v: "review", l: t("Reviews") },
            { v: "photo", l: t("Photos") },
            { v: "promo", l: t("Promos") },
          ]}
          onChange={setFilter}
        />
      </div>
      {list.length === 0 ? (
        <div className="text-center p-[70px] text-ink-3">
          <Icons.checkCirc size={40} />
          <h3 className="text-ink mt-[12px]">{t("Nothing flagged 🎉")}</h3>
          <p>{t("Reported reviews, photos and promos land here.")}</p>
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))",
            gap: "var(--gap)",
          }}
        >
          {list.map((c) => {
            const [tl, tc] = TYPE[c.type] || ["Item", "#9B8AA0"];
            return (
              <div
                key={c.id}
                className="card anim-pop"
                style={{
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div className="flex items-center gap-[10px]">
                  <span
                    className="tag"
                    style={{
                      background: `color-mix(in srgb,${tc} 14%,transparent)`,
                      color: tc,
                    }}
                  >
                    {t(tl)}
                  </span>
                  <span
                    className="tag"
                    style={{
                      background: "rgba(224,33,47,.1)",
                      color: "var(--coral)",
                    }}
                  >
                    <Icons.flame size={12} />
                    {c.reason}
                  </span>
                  <span className="ml-auto text-[12px] text-ink-3 font-semibold">
                    {c.time}
                  </span>
                </div>
                {c.type === "photo" ? (
                  <div
                    className="h-[140px] rounded-sm"
                    style={{
                      background:
                        c.grad || "linear-gradient(135deg,#9E7BF6,#5B33C9)",
                    }}
                  />
                ) : (
                  <p className="m-0 text-[14px] leading-[1.5] text-ink-2 bg-surface-2 px-[14px] py-[12px] rounded-sm italic">
                    &quot;{c.text}&quot;
                  </p>
                )}
                <div className="flex items-center gap-[8px] text-[12.5px] text-ink-3 font-semibold">
                  <Avatar name={c.author} size={24} />
                  {c.author}
                  <span className="opacity-[.5]">·</span>
                  {t("on")} {c.target}
                </div>
                <div className="flex gap-[8px] mt-[2px]">
                  {acting === c.id ? (
                    <span
                      className="jm-spin"
                      style={{ margin: "8px auto", color: "var(--ink-3)" }}
                    />
                  ) : (
                    <>
                      <button
                        className="btn btn-ghost btn-sm btn-block"
                        onClick={() => act(c.id)}
                      >
                        <Icons.check size={15} />
                        {t("Keep")}
                      </button>
                      <button
                        className="btn btn-sm btn-block"
                        style={{ background: "var(--coral)", color: "#fff" }}
                        onClick={() => act(c.id)}
                      >
                        <Icons.trash size={15} />
                        {t("Remove")}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===== Customers ===== */
export function ACustomers({ list }: { list: any[] }) {
  const t = useT();
  const avgLtv = list.length
    ? Math.round(list.reduce((a, c) => a + c.ltv, 0) / list.length)
    : 0;
  const exportCsv = () =>
    downloadCSV("joymap-customers-ltv.csv", [
      [t("Customer"), t("Tier"), t("Bookings"), t("LTV"), t("Joined")],
      ...list.map((c) => [c.name, c.tier, c.bookings, c.ltv, c.joined]),
    ]);
  return (
    <div className="anim-fade">
      <div className="shead" style={{ marginBottom: "var(--gap)" }}>
        <div />
        <button className="btn btn-ghost btn-md" onClick={exportCsv}>
          <Icons.download size={16} />
          {t("Export LTV")}
        </button>
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: "var(--gap)",
          marginBottom: "var(--gap)",
        }}
      >
        <Stat
          label={t("Customers")}
          value={String(list.length)}
          icon={<Icons.user size={16} />}
          accent="#5563D6"
        />
        <Stat
          label={t("Avg LTV")}
          value={money(avgLtv)}
          icon={<Icons.heart size={16} />}
          accent="#7B53F0"
        />
        <Stat
          label={t("Total bookings")}
          value={String(list.reduce((a, c) => a + c.bookings, 0))}
          icon={<Icons.calendar size={16} />}
          accent="#1FA46E"
        />
      </div>
      {list.length === 0 ? (
        <div
          className="card"
          style={{
            padding: "56px 20px",
            textAlign: "center",
            color: "var(--ink-3)",
            fontWeight: 600,
          }}
        >
          {t("No customers yet — they appear here after signing up.")}
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>{t("Customer")}</th>
                  <th>{t("Tier")}</th>
                  <th>{t("Bookings")}</th>
                  <th>{t("Lifetime value")}</th>
                  <th>{t("Joined")}</th>
                </tr>
              </thead>
              <tbody>
                {list.map((c, i) => (
                  <tr key={i} className="row">
                    <td>
                      <div className="flex items-center gap-[10px]">
                        <Avatar name={c.name} size={32} />
                        <b className="font-bold">{c.name}</b>
                      </div>
                    </td>
                    <td>
                      <Pill
                        status={
                          c.tier === "vip"
                            ? "vip"
                            : c.tier === "new"
                              ? "review"
                              : "active"
                        }
                        label={
                          c.tier === "vip"
                            ? t("VIP")
                            : c.tier === "new"
                              ? t("New")
                              : t("Active")
                        }
                      />
                    </td>
                    <td>{c.bookings}</td>
                    <td className="font-display font-bold">{money(c.ltv)}</td>
                    <td className="text-ink-2">{c.joined}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Financials ===== */
export function AFinancials({ s, queue }: { s: any; queue: any[] }) {
  const t = useT();
  const router = useRouter();
  const [releasing, setReleasing] = useState<string | null>(null);
  const release = (id: string) => {
    setReleasing(id);
    rpc("releasePayout", { id }).then(() => {
      setReleasing(null);
      router.refresh();
    });
  };
  const exportCsv = () =>
    downloadCSV("joymap-payouts.csv", [
      [t("Provider"), t("Amount"), t("Due"), t("Status")],
      ...queue.map((p) => [p.providerName, p.amount, p.due, p.status]),
    ]);
  return (
    <div className="anim-fade">
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
          gap: "var(--gap)",
          marginBottom: "var(--gap)",
        }}
      >
        <Stat
          label={t("GMV · June")}
          value={money(s.gmv)}
          icon={<Icons.flame size={16} />}
          accent="#1FA46E"
        />
        <Stat
          label={t("Commission collected")}
          value={money(s.revenue)}
          icon={<Icons.wallet size={16} />}
          accent="#5563D6"
          sub={t("15% / booking")}
        />
        <Stat
          label={t("Pending payouts")}
          value={money(s.pendingPayouts)}
          icon={<Icons.user size={16} />}
          accent="#FF8A4C"
          sub={`${queue.filter((p) => p.status === "pending").length} ${t("requests")}`}
        />
        <Stat
          label={t("Paid out")}
          value={money(
            queue
              .filter((p) => p.status === "paid")
              .reduce((a, p) => a + p.amount, 0),
          )}
          icon={<Icons.sparkle size={16} />}
          accent="#E89015"
        />
      </div>
      <div className="card" style={{ overflow: "hidden" }}>
        <div className="flex items-center justify-between px-[20px] py-[18px]">
          <h3 className="text-[17px]">{t("Payouts queue")}</h3>
          <button className="btn btn-ghost btn-sm" onClick={exportCsv}>
            <Icons.download size={15} />
            {t("Export CSV")}
          </button>
        </div>
        {queue.length === 0 ? (
          <div className="px-[20px] py-[34px] text-ink-3 font-semibold text-[13.5px] border-t border-line">
            {t(
              "No payout requests yet. When providers hit “Withdraw”, requests land here for release.",
            )}
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("Provider")}</th>
                <th>{t("Amount")}</th>
                <th>{t("Due")}</th>
                <th>{t("Status")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {queue.map((p) => (
                <tr key={p.id} className="row">
                  <td>
                    <div className="flex items-center gap-[10px]">
                      <Avatar name={p.providerName} size={30} />
                      <b className="font-bold">{p.providerName}</b>
                    </div>
                  </td>
                  <td className="font-display font-bold">{money(p.amount)}</td>
                  <td className="text-ink-2">{p.due}</td>
                  <td>
                    <Pill status={p.status} />
                  </td>
                  <td className="text-right">
                    {p.status === "pending" &&
                      (releasing === p.id ? (
                        <span
                          className="jm-spin"
                          style={{ color: "var(--ink-3)" }}
                        />
                      ) : (
                        <button
                          className="btn btn-soft btn-sm"
                          onClick={() => release(p.id)}
                        >
                          {t("Release")}
                        </button>
                      ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* ===== Marketing ===== */
const A_CAMPAIGNS = [
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
    <div className="anim-fade">
      <div className="shead">
        <div />
        <div className="flex gap-[10px]">
          <button
            className="btn btn-ghost btn-md"
            onClick={() => setPromo(true)}
          >
            <Icons.percent size={16} />
            {t("Mass-create promos")}
          </button>
          <Btn size="md">
            <Icons.send size={16} />
            {t("New campaign")}
          </Btn>
        </div>
      </div>
      <div
        className="card"
        style={{ overflow: "hidden", marginBottom: "var(--gap)" }}
      >
        <h3 className="text-[17px] pt-[18px] px-[20px] pb-[4px]">
          {t("Campaigns")}
        </h3>
        <table className="tbl">
          <thead>
            <tr>
              <th>{t("Campaign")}</th>
              <th>{t("Channel")}</th>
              <th>{t("Audience")}</th>
              <th>{t("Sent")}</th>
              <th>{t("CTR")}</th>
              <th>{t("Status")}</th>
            </tr>
          </thead>
          <tbody>
            {A_CAMPAIGNS.map((c, i) => (
              <tr key={i} className="row">
                <td>
                  <b className="font-bold">{t(c.name)}</b>
                </td>
                <td>
                  <span
                    className="tag"
                    style={{
                      background: "var(--surface-2)",
                      color: "var(--ink-2)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    {t(c.channel)}
                  </span>
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
          </tbody>
        </table>
      </div>
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
      <div className="px-[26px] py-[24px]">
        {!done ? (
          <>
            <h3 className="text-[20px] mb-[6px]">
              {t("Mass-create promo codes")}
            </h3>
            <p className="text-ink-2 text-[14px] mt-0 mx-0 mb-[18px]">
              {t("Generate a batch of unique single-use codes for a campaign.")}
            </p>
            <div className="flex flex-col gap-[14px]">
              <div className="flex gap-[12px]">
                <div className="flex-1">
                  <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
                    {t("Code prefix")}
                  </div>
                  <Input
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value.toUpperCase())}
                    style={{ fontFamily: "var(--display)", fontWeight: 700 }}
                  />
                </div>
                <div className="w-[120px]">
                  <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
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
                <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
                  {t("Discount (%)")}
                </div>
                <Input value={disc} onChange={(e) => setDisc(e.target.value)} />
              </div>
              <div
                className="card"
                style={{ padding: 14, background: "var(--surface-2)" }}
              >
                <div className="text-[12px] font-bold text-ink-3 mb-[8px]">
                  {t("PREVIEW")}
                </div>
                <div className="flex gap-[8px] flex-wrap">
                  {sample.map((sm, i) => (
                    <span
                      key={i}
                      className="font-display font-bold text-[13px] px-[10px] py-[4px] rounded-[7px] bg-surface"
                      style={{ border: "1px dashed var(--line-2)" }}
                    >
                      {sm}
                    </span>
                  ))}
                  <span
                    className="text-[13px] text-ink-3 font-semibold"
                    style={{ alignSelf: "center" }}
                  >
                    +{Math.max(count - 3, 0)} {t("more")}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-[10px] mt-[22px]">
              <button
                className="btn btn-ghost btn-md btn-block"
                onClick={onClose}
              >
                {t("Cancel")}
              </button>
              <Btn size="md" block onClick={() => setDone(true)}>
                <Icons.sparkle size={16} />
                {t("Generate")} {count} {t("codes")}
              </Btn>
            </div>
          </>
        ) : (
          <div className="text-center px-0 py-[10px]">
            <div
              className="w-[60px] h-[60px] rounded-[99px] bg-[rgba(31,164,110,.14)] text-[#1FA46E] grid mt-0 mx-auto mb-[16px]"
              style={{ placeItems: "center" }}
            >
              <Icons.check size={32} />
            </div>
            <h3 className="text-[20px] mb-[6px]">
              {count} {t("codes created")}
            </h3>
            <p className="text-ink-2 text-[14px] mt-0 mx-0 mb-[20px]">
              {t("Download the batch as CSV to share with your campaign.")}
            </p>
            <div className="flex gap-[10px]">
              <button
                className="btn btn-ghost btn-md btn-block"
                onClick={onClose}
              >
                {t("Close")}
              </button>
              <Btn
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
              </Btn>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
