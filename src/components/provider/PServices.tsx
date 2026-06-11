"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import { money, Toggle, Modal, Btn, BusyBtn } from "@/components/dash/primitives";
import { Input, Select, Textarea } from "@/components/ui";
import { MOODS, MOOD_ORDER, CATS } from "@/components/customer/primitives";
import { useT } from "@/components/i18n";

type Svc = any;

export function PServices({ svcs }: { svcs: Svc[] }) {
  const t = useT();
  const router = useRouter();
  const [modal, setModal] = useState<"new" | Svc | null>(null);
  const toggle = (id: string) =>
    rpc("toggleService", { id }).then(() => router.refresh());
  return (
    <div className="anim-fade">
      <div className="shead">
        <div />
        <Btn
          size="md"
          icon={<Icons.plus size={17} />}
          onClick={() => setModal("new")}
        >
          {t("New service")}
        </Btn>
      </div>
      {svcs.length === 0 ? (
        <div
          className="card"
          style={{ padding: "60px 24px", textAlign: "center" }}
        >
          <div className="w-[60px] h-[60px] rounded-[99px] bg-coral-soft text-coral-deep grid place-items-center mt-0 mx-auto mb-[14px]">
            <Icons.compass size={26} />
          </div>
          <h3 className="text-[20px]">{t("List your first experience")}</h3>
          <p className="text-ink-2 text-[14.5px] mt-[8px] mx-auto mb-[18px] max-w-[420px] leading-[1.55]">
            {t(
              "Create a service, send it for review, and once the platform team approves it customers can book it.",
            )}
          </p>
          <Btn
            size="md"
            icon={<Icons.plus size={16} />}
            onClick={() => setModal("new")}
          >
            {t("Create a service")}
          </Btn>
        </div>
      ) : (
        <div
          className="grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))",
            gap: "var(--gap)",
          }}
        >
          {svcs.map((s) => {
            const m = MOODS[s.mood];
            return (
              <div
                key={s.id}
                className="card anim-pop"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  opacity: s.active !== false ? 1 : 0.62,
                }}
              >
                <div
                  className="relative h-[128px]"
                  style={{
                    background: s.img
                      ? `center/cover no-repeat url('${s.img}')`
                      : `linear-gradient(135deg,${m.color},color-mix(in srgb,${m.color} 68%,#000))`,
                  }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.05),rgba(0,0,0,.5))]" />
                  <div className="absolute top-[12px] left-[12px] right-[12px] flex justify-between items-start">
                    <div className="flex gap-[6px]">
                      <span
                        className="bg-[rgba(255,255,255,.92)] py-[4px] px-[10px] rounded-[99px] text-[11.5px] font-extrabold inline-flex items-center gap-[5px]"
                        style={{ color: m.color }}
                      >
                        <span
                          className="w-[7px] h-[7px] rounded-[99px]"
                          style={{ background: m.color }}
                        />
                        {m.label}
                      </span>
                      {s.status === "review" && (
                        <span className="bg-[rgba(232,144,21,.92)] text-[#fff] py-[4px] px-[10px] rounded-[99px] text-[11px] font-extrabold">
                          {t("IN REVIEW")}
                        </span>
                      )}
                      {s.status === "rejected" && (
                        <span className="bg-[rgba(224,33,47,.92)] text-[#fff] py-[4px] px-[10px] rounded-[99px] text-[11px] font-extrabold">
                          {t("REJECTED")}
                        </span>
                      )}
                    </div>
                    <Toggle
                      on={s.active !== false}
                      onChange={() => toggle(s.id)}
                    />
                  </div>
                  <h3
                    className="absolute left-[14px] bottom-[11px] right-[14px] text-[#fff] text-[18px]"
                    style={{ textShadow: "0 1px 10px rgba(0,0,0,.4)" }}
                  >
                    {s.name}
                  </h3>
                </div>
                <div className="pt-[14px] px-[18px] pb-[18px]">
                  <div className="flex gap-[14px] text-ink-3 text-[13px] font-semibold mb-[14px]">
                    <span className="inline-flex gap-[5px] items-center">
                      <Icons.clock size={14} />
                      {s.dur}
                    </span>
                    <span className="inline-flex gap-[5px] items-center">
                      <Icons.user size={14} />
                      {s.cap} {t("cap")}
                    </span>
                    <span className="inline-flex gap-[5px] items-center">
                      <Icons.star size={14} />
                      {s.rating || "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-[14px] border-t border-line">
                    <div>
                      <div className="font-display font-extrabold text-[20px]">
                        {money(s.price)}
                      </div>
                      <div className="text-[12px] text-ink-3 font-semibold">
                        {s.booked} {t("booked all-time")}
                      </div>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setModal(s)}
                    >
                      <Icons.settings size={15} />
                      {t("Edit")}
                    </button>
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
      <div className="py-[24px] px-[26px]">
        <h3 className="text-[20px] mb-[4px]">
          {isNew ? t("New service") : t("Edit service")}
        </h3>
        <p className="text-ink-2 text-[13.5px] mt-0 mx-0 mb-[18px]">
          {isNew
            ? t(
                "New services go to platform review before customers can see them.",
              )
            : t("Changes apply immediately.")}
        </p>
        <div className="flex flex-col gap-[14px]">
          <div>
            <L>{t("Name")}</L>
            <Input
              placeholder={t("Sunrise Rooftop Yoga")}
              value={f.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>
          <div className="flex gap-[12px]">
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
          <div className="flex gap-[12px]">
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
                {[
                  "45 min",
                  "60 min",
                  "75 min",
                  "90 min",
                  "120 min",
                  "150 min",
                  "180 min",
                ].map((d) => (
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
              style={{ resize: "vertical" }}
            />
          </div>
        </div>
        {error && (
          <div className="mt-[12px] text-coral-deep font-bold text-[13.5px]">
            {error}
          </div>
        )}
        <div className="flex gap-[10px] mt-[20px]">
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>
            {t("Cancel")}
          </button>
          <BusyBtn
            busy={busy}
            className="btn btn-primary btn-md btn-block"
            disabled={!ok}
            icon={<Icons.check size={16} />}
            onClick={save}
          >
            {isNew ? t("Submit for review") : t("Save changes")}
          </BusyBtn>
        </div>
      </div>
    </Modal>
  );
}

function L({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
      {children}
    </div>
  );
}
