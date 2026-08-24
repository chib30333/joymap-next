"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { useBusy } from "@/hooks";
import { Button, Input, Textarea } from "@/components/ui";
import { P_GALLERY } from "@/components/provider/data";
import { useT } from "@/components/Language";

type Provider = {
  name?: string;
  tagline?: string;
  about?: string;
  email?: string;
  phone?: string;
  site?: string;
  address?: string;
  area?: string;
  city?: string;
  cats?: string[];
  cat?: string;
  founded?: string;
  team?: number;
  status?: string;
  joined?: string;
};

type Form = {
  name: string;
  tagline: string;
  about: string;
  email: string;
  phone: string;
  site: string;
  address: string;
  cats: string[];
  founded: string;
  team: number;
};

type ContactField = {
  key: "email" | "phone" | "site" | "address";
  label: string;
  icon: keyof typeof Icons;
};

const CONTACT_FIELDS: ContactField[] = [
  { key: "email", label: "Email", icon: "mail" },
  { key: "phone", label: "Phone", icon: "phone" },
  { key: "site", label: "Website", icon: "compass" },
  { key: "address", label: "Address", icon: "pin" },
];

export function PBusinessProfile({ provider }: { provider: Provider }) {
  const t = useT();
  const router = useRouter();
  const [edit, setEdit] = useState(false);
  const { busy, run } = useBusy();
  const p = provider || {};
  const [f, setF] = useState<Form>({
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
  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setF((prev) => ({ ...prev, [k]: v }));
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
            className="absolute right-3.5 top-3.5"
          >
            <Icons.camera size={15} />
            {t("Change cover")}
          </Button>
        </div>
        <div className="pt-0 px-6 pb-6 flex gap-5 items-end -mt-9 flex-wrap relative z-[1]">
          <div className="w-[84px] h-[84px] rounded bg-[linear-gradient(140deg,var(--m-calm),#2E8C80)] grid text-white font-extrabold text-4xl flex-none [border:4px_solid_var(--surface)] place-items-center [font-family:var(--display)]">
            {(f.name || "?")[0]}
          </div>
          <div className="flex-1 min-w-[min(100%,200px)] pb-1">
            <h2 className="text-2xl">{f.name}</h2>
            <div className="text-ink-3 font-semibold mt-1">
              {edit ? (
                <Input
                  placeholder={t("A short tagline customers see")}
                  value={f.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  className="mt-1.5"
                />
              ) : (
                f.tagline || t("Add a tagline so customers know your vibe")
              )}
            </div>
          </div>
          <div className="flex gap-2 pb-1">
            {p.status === "active" ? (
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-pill text-xs font-bold whitespace-nowrap text-[#1FA46E] bg-[rgba(31,164,110,.13)]">
                <Icons.shield size={13} />
                {t("Verified")}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-pill text-xs font-bold whitespace-nowrap text-[#E89015] bg-[rgba(232,144,21,.14)]">
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

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-[var(--gap)] items-start">
        <div className="bg-surface border border-line rounded-lg p-6">
          <h3 className="text-base mb-3.5">{t("About the business")}</h3>
          {edit ? (
            <Textarea
              rows={5}
              value={f.about}
              onChange={(e) => set("about", e.target.value)}
              placeholder={t("Tell customers your story…")}
              className="[resize:vertical] leading-normal"
            />
          ) : (
            <p className="text-ink-2 text-sm leading-relaxed m-0">
              {f.about ||
                t(
                  "No description yet — hit Edit and tell customers what makes you special.",
                )}
            </p>
          )}
          <hr className="h-px bg-line border-0 my-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CONTACT_FIELDS.map(({ key, label, icon }) => {
              const I = Icons[icon];
              return (
                <div
                  key={key}
                  className={key === "address" ? "[grid-column:1/-1]" : "[grid-column:auto]"}
                >
                  <div className="text-xs font-bold text-ink-3 mb-1.5">
                    {t(label)}
                  </div>
                  {edit ? (
                    <Input
                      value={f[key]}
                      onChange={(e) => set(key, e.target.value)}
                    />
                  ) : (
                    <div className="flex gap-2 items-center font-semibold text-sm">
                      <span className="text-ink-3">
                        <I size={16} />
                      </span>
                      {f[key] || "—"}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-[var(--gap)]">
          <div className="bg-surface border border-line rounded-lg p-6">
            <h3 className="text-base mb-3.5">{t("Categories")}</h3>
            <div className="flex flex-wrap gap-2">
              {f.cats.map((c) => (
                <span
                  key={c}
                  className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-pill text-xs font-bold whitespace-nowrap bg-surface-2 text-ink-2 [border:1px_solid_var(--line)]"
                >
                  {c}
                </span>
              ))}
              {edit && (
                <button className="inline-flex items-center gap-2 rounded-pill text-sm font-semibold border border-line-2 bg-surface text-ink-2 cursor-pointer duration-[140ms] whitespace-nowrap hover:border-ink-3 hover:text-ink py-1 px-3">
                  <Icons.plus size={13} />
                  {t("Add")}
                </button>
              )}
            </div>
            <hr className="h-px bg-line border-0 my-5" />
            <div className="flex justify-between text-sm">
              <div>
                <div className="text-ink-3 font-semibold mb-1">
                  {t("Founded")}
                </div>
                <b>{f.founded}</b>
              </div>
              <div>
                <div className="text-ink-3 font-semibold mb-1">
                  {t("Team")}
                </div>
                <b>
                  {f.team} {t("people")}
                </b>
              </div>
              <div>
                <div className="text-ink-3 font-semibold mb-1">
                  {t("Joined")}
                </div>
                <b>{p.joined || "Jun 2026"}</b>
              </div>
            </div>
          </div>
          <div className="bg-surface border border-line rounded-lg p-6">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-base">{t("Gallery")}</h3>
              <span className="text-xs text-ink-3 font-semibold">
                {P_GALLERY.length} {t("items")}
              </span>
            </div>
            <div className="grid grid-cols-[repeat(3,1fr)] gap-2 mt-2.5">
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
