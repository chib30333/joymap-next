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

const PROVIDER_DOCS = [
  "Business license",
  "Identity verification",
  "Insurance certificate",
];

type ProviderApp = {
  id: string;
  name: string;
  cat: string;
  city: string;
  email: string;
  docs: number;
};

type PendingService = {
  id: string;
  name: string;
  mood: string;
  cat: string;
  price: number;
  about: string;
  providerName: string;
};

type Selection =
  | { kind: "provider"; item: ProviderApp; mode: "approve" | "reject" }
  | { kind: "service"; item: PendingService; mode: "approve" | "reject" };

export function AModeration({
  apps,
  svcs,
}: {
  apps: ProviderApp[];
  svcs: PendingService[];
}) {
  const t = useT();
  const [sel, setSel] = useState<Selection | null>(null);
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
          <h3 className="text-base mt-1 mx-0 mb-3.5">
            {t("Provider applications")}
          </h3>
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-[var(--gap)] mb-[var(--gap)]">
            {apps.map((m) => (
              <div key={m.id} className="bg-surface border border-line rounded-lg animate-anim-pop-dash p-5">
                <div className="flex items-center gap-3 mb-3.5">
                  <Avatar
                    name={m.name}
                    size={42}
                    grad="linear-gradient(140deg,var(--m-focus),#3742A8)"
                  />
                  <div className="flex-1">
                    <div className="font-extrabold text-base">{m.name}</div>
                    <div className="text-xs text-ink-3 font-semibold">
                      {m.cat} · {m.city}
                    </div>
                  </div>
                  <Pill status="review" label={t("new")} />
                </div>
                <div className="flex gap-3.5 text-sm text-ink-2 font-semibold mb-4">
                  <span className="inline-flex gap-1.5 items-center">
                    <Icons.mail size={15} />
                    {m.email}
                  </span>
                  <span className="inline-flex gap-1.5 items-center">
                    <Icons.checkCirc size={15} />
                    {m.docs || 3} {t("documents")}
                  </span>
                </div>
                <div className="flex gap-2">
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
          <h3 className="text-base mt-1 mx-0 mb-3.5">
            {t("Service submissions")}
          </h3>
          <div className="grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr))] gap-[var(--gap)]">
            {svcs.map((s) => {
              const m = MOODS[s.mood] || MOODS.calm;
              return (
                <div
                  key={s.id}
                  className="bg-surface border border-line rounded-lg animate-anim-pop-dash p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className="w-[42px] h-[42px] rounded-sm flex-none [background:var(--sw-bg)]"
                      style={
                        {
                          "--sw-bg": `linear-gradient(135deg,${m.color},color-mix(in srgb,${m.color} 60%,#000))`,
                        } as React.CSSProperties
                      }
                    />
                    <div className="flex-1">
                      <div className="font-extrabold text-base">{s.name}</div>
                      <div className="text-xs text-ink-3 font-semibold">
                        {t("by")} {s.providerName} · {s.cat} · {money(s.price)}
                      </div>
                    </div>
                    <Pill status="review" label={t("new")} />
                  </div>
                  {s.about && (
                    <p className="mt-0 mx-0 mb-3.5 text-sm text-ink-2 leading-normal">
                      {s.about.slice(0, 140)}
                      {s.about.length > 140 ? "…" : ""}
                    </p>
                  )}
                  <div className="flex gap-2">
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

function ModerationModal({
  sel,
  onClose,
}: {
  sel: Selection;
  onClose: () => void;
}) {
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
      <div className="px-7 py-6">
        <div className="flex items-center gap-3 mb-5">
          <Avatar
            name={it.name}
            size={44}
            grad="linear-gradient(140deg,var(--m-focus),#3742A8)"
          />
          <div>
            <h3 className="text-lg">{it.name}</h3>
            <div className="text-sm text-ink-3 font-semibold">
              {sel.kind === "provider"
                ? `${sel.item.cat} · ${sel.item.city}`
                : `${t("Service")} · ${t("by")} ${sel.item.providerName}`}
            </div>
          </div>
        </div>
        {sel.kind === "provider" && (
          <div className="bg-[var(--surface-2)] border border-line rounded-lg p-3.5 mb-5">
            {PROVIDER_DOCS.slice(0, sel.item.docs || 3).map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-0 py-2 text-sm font-semibold"
                >
                  <Icons.checkCirc size={17} className="text-[#1FA46E]" />
                  {t(d)}
                  <span className="ml-auto text-xs text-ink-3">
                    {t("Verified")}
                  </span>
                </div>
              ))}
          </div>
        )}
        {reject ? (
          <div className="mb-5">
            <div className="font-bold text-sm mb-2">
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
          <p className="text-ink-2 text-sm mb-5">
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
        <div className="flex gap-2.5">
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
