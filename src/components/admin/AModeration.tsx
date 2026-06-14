"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/Language";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { useBusy } from "@/hooks";
import { money, Pill, Modal, Avatar } from "@/components/dash/primitives";
import { Select, Button } from "@/components/ui";
import { MOODS } from "@/components/customer/primitives";
import { AdminHeader } from "./AdminHeader";
import { EmptyState } from "@/components/admin/AdminShared";

const REJECT_REASONS = [
  "Incomplete documents",
  "Unverified business license",
  "Low-quality photos",
  "Pricing policy violation",
  "Duplicate listing",
  "Other",
];

export function AModeration({ apps, svcs }: { apps: any[]; svcs: any[] }) {
  const t = useT();
  const [sel, setSel] = useState<any>(null);
  const empty = apps.length === 0 && svcs.length === 0;
  return (
    <div className="animate-anim-fade-dash">
      <AdminHeader
        eyebrow={`${apps.length + svcs.length} ${t("awaiting review")}`}
        title={t("Moderation")}
      />
      {empty && (
        <EmptyState title={t("Queue cleared 🎉")}>
          {t("New provider applications and service submissions land here.")}
        </EmptyState>
      )}
      {apps.length > 0 && (
        <>
          <h3 className="text-[16px] mt-[4px] mx-0 mb-[14px]">
            {t("Provider applications")}
          </h3>
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))] gap-[var(--gap)] mb-[var(--gap)]">
            {apps.map((m) => (
              <div key={m.id} className="bg-surface border border-line rounded-lg animate-anim-pop-dash p-[20px]">
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
                  <Button
                    ctx="dash"
                    variant="primary"
                    size="sm"
                    block
                    onClick={() =>
                      setSel({ kind: "provider", item: m, mode: "approve" })
                    }
                  >
                    <Icons.check size={15} />
                    {t("Approve")}
                  </Button>
                  <Button
                    ctx="dash"
                    variant="ghost"
                    size="sm"
                    block
                    onClick={() =>
                      setSel({ kind: "provider", item: m, mode: "reject" })
                    }
                  >
                    {t("Reject")}
                  </Button>
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
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))] gap-[var(--gap)]">
            {svcs.map((s) => {
              const m = MOODS[s.mood] || MOODS.calm;
              return (
                <div
                  key={s.id}
                  className="bg-surface border border-line rounded-lg animate-anim-pop-dash p-[20px]"
                >
                  <div className="flex items-center gap-[12px] mb-[12px]">
                    <span
                      className="w-[42px] h-[42px] rounded-sm flex-none [background:var(--sw-bg)]"
                      style={
                        {
                          "--sw-bg": `linear-gradient(135deg,${m.color},color-mix(in srgb,${m.color} 60%,#000))`,
                        } as React.CSSProperties
                      }
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
                    <Button
                      ctx="dash"
                      variant="primary"
                      size="sm"
                      block
                      onClick={() =>
                        setSel({ kind: "service", item: s, mode: "approve" })
                      }
                    >
                      <Icons.check size={15} />
                      {t("Approve & publish")}
                    </Button>
                    <Button
                      ctx="dash"
                      variant="ghost"
                      size="sm"
                      block
                      onClick={() =>
                        setSel({ kind: "service", item: s, mode: "reject" })
                      }
                    >
                      {t("Reject")}
                    </Button>
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
          <div className="bg-[var(--surface-2)] border border-line rounded-lg p-[14px] mb-[18px]">
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
                  <Icons.checkCirc size={17} className="text-[#1FA46E]" />
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
          <Button ctx="dash" variant="ghost" size="md" block onClick={onClose}>
            {t("Cancel")}
          </Button>
          {reject ? (
            <Button
              busy={busy}
              ctx="dash"
              size="md"
              block
              className="bg-coral text-white"
              onClick={decide}
            >
              {t("Reject")}
            </Button>
          ) : (
            <Button
              busy={busy}
              ctx="dash"
              variant="primary"
              size="md"
              block
              icon={<Icons.check size={16} />}
              onClick={decide}
            >
              {t("Approve")}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
