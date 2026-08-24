"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { useBusy } from "@/hooks";
import { money, Toggle, Modal } from "@/components/dash/primitives";
import { Button, Input, Select, Textarea } from "@/components/ui";
import { MOODS, MOOD_ORDER, CATS } from "@/components/customer/primitives";
import { useT } from "@/components/Language";

type Svc = any;

const DURATIONS = [
  "45 min",
  "60 min",
  "75 min",
  "90 min",
  "120 min",
  "150 min",
  "180 min",
] as const;

type StatusBadge = { status: string; className: string; label: string };

const STATUS_BADGES: StatusBadge[] = [
  {
    status: "review",
    className:
      "bg-[rgba(232,144,21,.92)] text-white py-1 px-2.5 rounded-pill text-xs font-extrabold",
    label: "IN REVIEW",
  },
  {
    status: "rejected",
    className:
      "bg-[rgba(224,33,47,.92)] text-white py-1 px-2.5 rounded-pill text-xs font-extrabold",
    label: "REJECTED",
  },
];

export function PServices({ svcs }: { svcs: Svc[] }) {
  const t = useT();
  const router = useRouter();
  const [modal, setModal] = useState<"new" | Svc | null>(null);
  const toggle = (id: string) =>
    rpc("toggleService", { id }).then(() => router.refresh());
  return (
    <div className="animate-anim-fade-dash">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div />
        <Button
          ctx="dash"
          variant="primary"
          size="md"
          icon={<Icons.plus size={17} />}
          onClick={() => setModal("new")}
        >
          {t("New service")}
        </Button>
      </div>
      {svcs.length === 0 ? (
        <div className="bg-surface border border-line rounded-lg py-16 px-6 text-center">
          <div className="w-16 h-16 rounded-pill bg-coral-soft text-coral-deep grid place-items-center mt-0 mx-auto mb-3.5">
            <Icons.compass size={26} />
          </div>
          <h3 className="text-xl">{t("List your first experience")}</h3>
          <p className="text-ink-2 text-sm mt-2 mx-auto mb-5 max-w-[420px] leading-normal">
            {t(
              "Create a service, send it for review, and once the platform team approves it customers can book it.",
            )}
          </p>
          <Button
            ctx="dash"
            variant="primary"
            size="md"
            icon={<Icons.plus size={16} />}
            onClick={() => setModal("new")}
          >
            {t("Create a service")}
          </Button>
        </div>
      ) : (
        <div className="grid [grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-[var(--gap)]">
          {svcs.map((s) => {
            const m = MOODS[s.mood];
            return (
              <div
                key={s.id}
                className={`bg-surface border border-line rounded-lg animate-anim-pop-dash p-0 overflow-hidden ${s.active !== false ? "opacity-100" : "opacity-60"}`}
              >
                <div
                  className="relative h-32 [background:var(--card-bg)]"
                  style={
                    {
                      ["--card-bg"]: s.img
                        ? `center/cover no-repeat url('${s.img}')`
                        : `linear-gradient(135deg,${m.color},color-mix(in srgb,${m.color} 68%,#000))`,
                    } as React.CSSProperties
                  }
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.5))]" />
                  <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                    <div className="flex gap-1.5">
                      <span
                        className="bg-[rgba(255,255,255,.92)] py-1 px-2.5 rounded-pill text-xs font-extrabold inline-flex items-center gap-1.5 text-[var(--mood)]"
                        style={{ ["--mood"]: m.color } as React.CSSProperties}
                      >
                        <span
                          className="w-2 h-2 rounded-pill [background:var(--mood)]"
                          style={{ ["--mood"]: m.color } as React.CSSProperties}
                        />
                        {m.label}
                      </span>
                      {STATUS_BADGES.filter((b) => b.status === s.status).map(
                        (b) => (
                          <span key={b.status} className={b.className}>
                            {t(b.label)}
                          </span>
                        ),
                      )}
                    </div>
                    <Toggle
                      on={s.active !== false}
                      onChange={() => toggle(s.id)}
                    />
                  </div>
                  <h3 className="absolute left-3.5 bottom-3 right-3.5 text-white text-lg [text-shadow:0_1px_10px_rgba(0,0,0,.4)]">
                    {s.name}
                  </h3>
                </div>
                <div className="pt-3.5 px-5 pb-5">
                  <div className="flex gap-3.5 text-ink-3 text-sm font-semibold mb-3.5">
                    <span className="inline-flex gap-1.5 items-center">
                      <Icons.clock size={14} />
                      {s.dur}
                    </span>
                    <span className="inline-flex gap-1.5 items-center">
                      <Icons.user size={14} />
                      {s.cap} {t("cap")}
                    </span>
                    <span className="inline-flex gap-1.5 items-center">
                      <Icons.star size={14} />
                      {s.rating || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3.5 border-t border-line">
                    <div>
                      <div className="font-display font-extrabold text-xl">
                        {money(s.price)}
                      </div>
                      <div className="text-xs text-ink-3 font-semibold">
                        {s.booked} {t("booked all-time")}
                      </div>
                    </div>
                    <Button
                      ctx="dash"
                      variant="ghost"
                      size="sm"
                      onClick={() => setModal(s)}
                    >
                      <Icons.settings size={15} />
                      {t("Edit")}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {modal && (
        <ServiceFormModal
          svc={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

function ServiceFormModal({
  svc,
  onClose,
}: {
  svc: Svc | null;
  onClose: () => void;
}) {
  const t = useT();
  const router = useRouter();
  const isNew = !svc;
  const [f, setF] = useState<any>(
    svc
      ? { ...svc }
      : {
          name: "",
          cat: "Wellness",
          mood: "calm",
          price: 1500,
          dur: "60 min",
          cap: 8,
          about: "",
          area: "",
        },
  );
  const { busy, run, error } = useBusy();
  const set = (k: string, v: any) => setF((p: any) => ({ ...p, [k]: v }));
  const ok = f.name.length > 2 && f.price > 0 && f.cap > 0;
  const save = () =>
    run(
      () =>
        isNew
          ? rpc("createService", {
              name: f.name,
              cat: f.cat,
              mood: f.mood,
              price: +f.price,
              dur: f.dur,
              cap: +f.cap,
              about: f.about,
              area: f.area || "Center",
              tags: ["New"],
            })
          : rpc("updateService", {
              id: svc.id,
              patch: {
                name: f.name,
                cat: f.cat,
                mood: f.mood,
                price: +f.price,
                dur: f.dur,
                cap: +f.cap,
                about: f.about,
              },
            }),
      () => {
        onClose();
        router.refresh();
      },
    );
  return (
    <Modal onClose={onClose} maxWidth={500}>
      <div className="py-6 px-7">
        <h3 className="text-xl mb-1">
          {isNew ? t("New service") : t("Edit service")}
        </h3>
        <p className="text-ink-2 text-sm mt-0 mx-0 mb-5">
          {isNew
            ? t(
                "New services go to platform review before customers can see them.",
              )
            : t("Changes apply immediately.")}
        </p>
        <div className="flex flex-col gap-3.5">
          <div>
            <L>{t("Name")}</L>
            <Input
              placeholder={t("Sunrise Rooftop Yoga")}
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <L>{t("Category")}</L>
              <Select
                value={f.cat}
                onChange={(e) => set("cat", e.target.value)}
              >
                {CATS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div className="flex-1">
              <L>{t("Mood")}</L>
              <Select
                value={f.mood}
                onChange={(e) => set("mood", e.target.value)}
              >
                {MOOD_ORDER.map((k) => (
                  <option key={k} value={k}>
                    {MOODS[k].label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <L>{t("Price")} (₽)</L>
              <Input
                type="number"
                value={f.price}
                onChange={(e) => set("price", e.target.value)}
              />
            </div>
            <div className="flex-1">
              <L>{t("Duration")}</L>
              <Select
                value={f.dur}
                onChange={(e) => set("dur", e.target.value)}
              >
                {DURATIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </Select>
            </div>
            <div className="w-[90px]">
              <L>{t("Capacity")}</L>
              <Input
                type="number"
                value={f.cap}
                onChange={(e) => set("cap", e.target.value)}
              />
            </div>
          </div>
          <div>
            <L>{t("About")}</L>
            <Textarea
              rows={3}
              value={f.about}
              onChange={(e) => set("about", e.target.value)}
              placeholder={t("What makes this experience special?")}
              className="[resize:vertical]"
            />
          </div>
        </div>
        {error && (
          <div className="mt-3 text-coral-deep font-bold text-sm">
            {error}
          </div>
        )}
        <div className="flex gap-2.5 mt-5">
          <Button ctx="dash" variant="ghost" size="md" block onClick={onClose}>
            {t("Cancel")}
          </Button>
          <Button
            busy={busy}
            ctx="dash"
            variant="primary"
            size="md"
            block
            disabled={!ok}
            icon={<Icons.check size={16} />}
            onClick={save}
          >
            {isNew ? t("Submit for review") : t("Save changes")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function L({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-bold text-ink-2 mb-2">
      {children}
    </div>
  );
}
