"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { useBusy } from "@/hooks";
import {
  MOODS,
  MOOD_ORDER,
  fmt,
  bg,
  Avatar,
  MoodChip,
  type Exp,
} from "./primitives";
import { Button, Input } from "@/components/ui";
import { useT } from "@/components/Language";

type B = {
  id: string;
  date: string;
  total: number;
  status: string;
  rated?: number | null;
  exp: Exp | null;
};

type Tab = "account" | "history" | "moods";
type FormKey = "name" | "email" | "phone" | "city";

type TabDef = { key: Tab; label: string };
type FieldDef = { key: FormKey; label: string; icon: keyof typeof Icons };

export function CProfile({
  user,
  bookings,
}: {
  user: {
    name: string;
    email: string;
    phone?: string;
    city: string;
    plan?: string;
    moods?: string[];
  };
  bookings: { upcoming: B[]; past: B[] };
}) {
  const t = useT();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("account");
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "+7 — — —",
    city: user.city || "Moscow",
  });
  const { busy, run } = useBusy();
  const past = (bookings.past || []).filter((b) => b.status !== "cancelled");
  const total = bookings.upcoming.length + past.length;
  const spent = past.reduce((a, b) => a + b.total, 0);
  const saveOrEdit = () => {
    if (!edit) {
      setEdit(true);
      return;
    }
    run(
      () =>
        rpc("updateUser", {
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
        }),
      () => {
        setEdit(false);
        router.refresh();
      },
    );
  };

  const tabs: TabDef[] = [
    { key: "account", label: t("Personal data") },
    { key: "history", label: t("Activity history") },
    { key: "moods", label: t("Moods") },
  ];

  const fields: FieldDef[] = [
    { key: "name", label: t("Full name"), icon: "user" },
    { key: "email", label: t("Email"), icon: "mail" },
    { key: "phone", label: t("Phone"), icon: "phone" },
    { key: "city", label: t("City"), icon: "pin" },
  ];

  return (
    <div className="animate-anim-fade-app">
      <div className="bg-surface border border-line rounded-lg p-5 sm:p-6 flex gap-4 sm:gap-5 items-center mb-5 flex-wrap">
        <div className="relative">
          <Avatar name={form.name || "?"} size={72} />
          <button
            className="rounded-pill grid place-items-center duration-150 cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2 absolute -bottom-1 -right-1 w-8 h-8 [background:var(--coral)] text-white [border:2px_solid_var(--surface)]"
          >
            <Icons.camera size={15} />
          </button>
        </div>
        <div className="flex-1 min-w-[min(100%,180px)]">
          <h2 className="text-2xl">{form.name}</h2>
          <div className="text-ink-3 font-semibold mt-1 flex gap-3 flex-wrap">
            <span className="inline-flex gap-1.5 items-center">
              <Icons.pin size={14} />
              {form.city}
            </span>
            <span className="inline-flex gap-1.5 items-center">
              <Icons.sparkle size={14} />
              {user.plan || "Joy Map"} {t("member")}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 text-right">
          <span className="font-display font-extrabold text-2xl">
            {total}
          </span>
          <span className="text-xs text-ink-3 font-semibold">
            {t("experiences booked")}
          </span>
        </div>
      </div>

      <div className="flex gap-1.5 mb-5 bg-surface-2 p-1.5 rounded-pill w-fit border border-line">
        {tabs.map(({ key, label }) => (
          <Button
            key={key}
            ctx="app"
            size="sm"
            onClick={() => setTab(key)}
            className={
              tab === key
                ? "bg-surface text-ink shadow-sm"
                : "bg-transparent text-ink-3 shadow-none"
            }
          >
            {label}
          </Button>
        ))}
      </div>

      {tab === "account" && (
        <div className="bg-surface border border-line rounded-lg p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base">{t("Personal data")}</h3>
            <Button
              busy={busy}
              ctx="app"
              variant="ghost"
              size="sm"
              icon={edit ? <Icons.check size={15} /> : <Icons.edit size={15} />}
              onClick={saveOrEdit}
            >
              {edit ? t("Save") : t("Edit")}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {fields.map(({ key, label, icon }) => {
              const I = Icons[icon];
              return (
                <div
                  key={key}
                  className={
                    key === "name" ? "[grid-column:1/-1]" : "[grid-column:auto]"
                  }
                >
                  <div className="text-xs font-bold text-ink-3 mb-2">
                    {label}
                  </div>
                  {edit ? (
                    <Input
                      value={form[key]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [key]: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-2 py-3 px-3.5 rounded-sm bg-surface-2 font-semibold text-sm">
                      <span className="text-ink-3">
                        <I size={17} />
                      </span>
                      {form[key]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <hr className="h-px bg-line border-0 my-6 mx-0" />
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-md grid place-items-center [background:color-mix(in_srgb,#1FA46E_14%,transparent)] text-[#1FA46E] flex-none">
              <Icons.shield size={19} />
            </span>
            <div className="flex-1">
              <div className="font-bold text-sm">{t("Account secured")}</div>
              <div className="text-xs text-ink-3 font-semibold">
                {t("Signed in as")} {user.email}
              </div>
            </div>
            <Button
              ctx="app"
              variant="ghost"
              size="sm"
              onClick={() => rpc("logout").then(() => router.push("/auth"))}
            >
              {t("Log out")}
            </Button>
          </div>
        </div>
      )}

      {tab === "history" && (
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <span className="font-bold text-sm text-ink-2">
              {past.length} {t("past experiences")} · {fmt(spent)} {t("spent")}
            </span>
          </div>
          {past.length === 0 ? (
            <div className="bg-surface border border-line rounded-lg px-5 py-10 text-center text-ink-3 font-semibold text-sm">
              {t("Your completed experiences will appear here.")}
            </div>
          ) : (
            <div className="bg-surface border border-line rounded-lg overflow-hidden">
              {past.map((h, i) => {
                const e = h.exp;
                const m = e ? MOODS[e.mood] : MOODS.calm;
                return (
                  <div
                    key={h.id}
                    className={`flex items-center gap-3.5 px-5 py-4 ${i ? "border-t border-line" : ""}`}
                  >
                    <div
                      className="w-11 h-11 rounded-md [background:var(--bg)] bg-cover flex-none opacity-95"
                      style={{ ["--bg"]: e ? bg(e) : m.color } as React.CSSProperties}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">
                        {e ? e.title : t("Experience")}
                      </div>
                      <div className="text-xs text-ink-3 font-semibold">
                        {e ? e.provider : ""} · {h.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-sm">
                        {fmt(h.total)}
                      </div>
                      {h.rated ? (
                        <div className="text-[var(--m-joy)] text-xs">
                          {"★".repeat(h.rated)}
                        </div>
                      ) : h.status === "completed" ? (
                        <span className="text-xs text-ink-3 font-semibold">
                          {t("Not rated")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "moods" && (
        <div className="bg-surface border border-line rounded-lg p-6">
          <h3 className="text-base mb-2">{t("Your moods")}</h3>
          <p className="text-ink-2 text-sm mb-4">
            {t(
              "Joy tunes your weekly map around these. Tap to toggle — your next Joy Map uses them.",
            )}
          </p>
          <MoodPicker initial={user.moods || []} />
        </div>
      )}
    </div>
  );
}

function MoodPicker({ initial }: { initial: string[] }) {
  const [sel, setSel] = useState(initial);
  const toggle = (k: string) => {
    const next = sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k];
    setSel(next);
    rpc("updateUser", { moods: next });
  };
  return (
    <div className="flex flex-wrap gap-2">
      {MOOD_ORDER.map((k) => (
        <MoodChip
          key={k}
          mood={k}
          active={sel.includes(k)}
          onClick={() => toggle(k)}
        />
      ))}
    </div>
  );
}
