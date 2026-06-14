"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { useBusy } from "@/hooks";
import { Button, Input, Textarea } from "@/components/ui";
import { P_GALLERY } from "@/components/provider/data";
import { useT } from "@/components/Language";

type Provider = any;

export function PBusinessProfile({ provider }: { provider: Provider }) {
  const t = useT();
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const { busy, run } = useBusy();
  const p = provider || {};
  const [f, setF] = useState({
    name: p.name || "",
    tagline: p.tagline || "",
    about: p.about || "",
    email: p.email || "",
    phone: p.phone || "",
    site: p.site || "",
    address: p.address || (p.area ? p.area + ", " + p.city : ""),
    cats: p.cats || [p.cat || "Wellness"],
    founded: p.founded || "2026",
    team: p.team || 1,
  });
  const cover = P_GALLERY.find((g) => g.cover) || P_GALLERY[0];
  const set = (k: string, v: any) => setF((prev) => ({ ...prev, [k]: v }));
  const saveOrEdit = () => {
    if (!edit) {
      setEdit(true);
      return;
    }
    run(
      () =>
        rpc("updateProvider", {
          name: f.name,
          tagline: f.tagline,
          about: f.about,
          email: f.email,
          phone: f.phone,
          site: f.site,
          address: f.address,
        }),
      () => {
        setEdit(false);
        router.refresh();
      },
    );
  };
  return (
    <div className="animate-anim-fade-dash">
      <div className="bg-surface border border-line rounded-lg overflow-hidden mb-[var(--gap)]">
        <div
          className="h-[150px] relative [background:var(--cover-bg)]"
          style={{ ["--cover-bg"]: cover.g } as React.CSSProperties}
        >
          <Button
            ctx="dash"
            variant="ghost"
            size="sm"
            className="absolute right-[14px] top-[14px]"
          >
            <Icons.camera size={15} />
            {t("Change cover")}
          </Button>
        </div>
        <div className="pt-0 px-[24px] pb-[22px] flex gap-[18px] items-end mt-[-36px] flex-wrap relative z-[1]">
          <div className="w-[84px] h-[84px] rounded-[22px] bg-[linear-gradient(140deg,var(--m-calm),#2E8C80)] grid text-[#fff] font-extrabold text-[34px] flex-none [border:4px_solid_var(--surface)] place-items-center [font-family:var(--display)]">
            {(f.name || "?")[0]}
          </div>
          <div className="flex-1 min-w-[200px] pb-[4px]">
            <h2 className="text-[24px]">{f.name}</h2>
            <div className="text-ink-3 font-semibold mt-[3px]">
              {edit ? (
                <Input
                  placeholder={t("A short tagline customers see")}
                  value={f.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  className="mt-[6px]"
                />
              ) : (
                f.tagline || t("Add a tagline so customers know your vibe")
              )}
            </div>
          </div>
          <div className="flex gap-[8px] pb-[4px]">
            {p.status === "active" ? (
              <span className="inline-flex items-center gap-[6px] py-1 px-[11px] rounded-pill text-[12px] font-bold whitespace-nowrap text-[#1FA46E] bg-[rgba(31,164,110,.13)]">
                <Icons.shield size={13} />
                {t("Verified")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-[6px] py-1 px-[11px] rounded-pill text-[12px] font-bold whitespace-nowrap text-[#E89015] bg-[rgba(232,144,21,.14)]">
                <Icons.clock size={13} />
                {t("In review")}
              </span>
            )}
            <Button
              busy={busy}
              ctx="dash"
              variant="ghost"
              size="sm"
              icon={edit ? <Icons.check size={15} /> : <Icons.edit size={15} />}
              onClick={saveOrEdit}
            >
              {edit ? t("Save") : t("Edit")}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-[var(--gap)] items-start">
        <div className="bg-surface border border-line rounded-lg p-[24px]">
          <h3 className="text-[17px] mb-[14px]">{t("About the business")}</h3>
          {edit ? (
            <Textarea
              rows={5}
              value={f.about}
              onChange={(e) => set("about", e.target.value)}
              placeholder={t("Tell customers your story…")}
              className="[resize:vertical] leading-[1.5]"
            />
          ) : (
            <p className="text-ink-2 text-[14.5px] leading-[1.6] m-0">
              {f.about ||
                t(
                  "No description yet — hit Edit and tell customers what makes you special.",
                )}
            </p>
          )}
          <hr className="h-px bg-line border-0 my-5" />
          <div className="grid grid-cols-[1fr_1fr] gap-[16px]">
            {(
              [
                ["email", "Email", "mail"],
                ["phone", "Phone", "phone"],
                ["site", "Website", "compass"],
                ["address", "Address", "pin"],
              ] as const
            ).map(([k, l, ic]) => {
              const I = Icons[ic];
              return (
                <div
                  key={k}
                  className="[grid-column:var(--gc)]"
                  style={
                    {
                      ["--gc"]: k === "address" ? "1 / -1" : "auto",
                    } as React.CSSProperties
                  }
                >
                  <div className="text-[12px] font-bold text-ink-3 mb-[6px]">
                    {t(l)}
                  </div>
                  {edit ? (
                    <Input
                      value={(f as any)[k]}
                      onChange={(e) => set(k, e.target.value)}
                    />
                  ) : (
                    <div className="flex gap-[8px] items-center font-semibold text-[14px]">
                      <span className="text-ink-3">
                        <I size={16} />
                      </span>
                      {(f as any)[k] || "—"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-[var(--gap)]">
          <div className="bg-surface border border-line rounded-lg p-[22px]">
            <h3 className="text-[16px] mb-[14px]">{t("Categories")}</h3>
            <div className="flex flex-wrap gap-[8px]">
              {f.cats.map((c: string) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-[5px] py-1 px-[10px] rounded-pill text-[12px] font-bold whitespace-nowrap bg-surface-2 text-ink-2 [border:1px_solid_var(--line)]"
                >
                  {c}
                </span>
              ))}
              {edit && (
                <button className="inline-flex items-center gap-[7px] rounded-pill text-[13px] font-semibold border border-line-2 bg-surface text-ink-2 cursor-pointer [transition:0.14s] whitespace-nowrap hover:border-ink-3 hover:text-ink py-[4px] px-[12px]">
                  <Icons.plus size={13} />
                  {t("Add")}
                </button>
              )}
            </div>
            <hr className="h-px bg-line border-0 my-[18px]" />
            <div className="flex justify-between text-[13.5px]">
              <div>
                <div className="text-ink-3 font-semibold mb-[4px]">
                  {t("Founded")}
                </div>
                <b>{f.founded}</b>
              </div>
              <div>
                <div className="text-ink-3 font-semibold mb-[4px]">
                  {t("Team")}
                </div>
                <b>
                  {f.team} {t("people")}
                </b>
              </div>
              <div>
                <div className="text-ink-3 font-semibold mb-[4px]">
                  {t("Joined")}
                </div>
                <b>{p.joined || "Jun 2026"}</b>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-line rounded-lg p-[22px]">
            <div className="flex items-center justify-between mb-[6px]">
              <h3 className="text-[16px]">{t("Gallery")}</h3>
              <span className="text-[12.5px] text-ink-3 font-semibold">
                {P_GALLERY.length} {t("items")}
              </span>
            </div>
            <div className="grid grid-cols-[repeat(3,1fr)] gap-[8px] mt-[10px]">
              {P_GALLERY.slice(0, 6).map((g) => (
                <div
                  key={g.id}
                  className="rounded-xs [aspect-ratio:1] [background:var(--g-bg)]"
                  style={{ ["--g-bg"]: g.g } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
