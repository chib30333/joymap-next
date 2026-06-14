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
  const [tab, setTab] = useState<"account" | "history" | "moods">("account");
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

  return (
    <div className="animate-anim-fade-app">
      <div className="bg-surface border border-line rounded-lg p-[24px] flex gap-[18px] items-center mb-[18px] flex-wrap">
        <div className="relative">
          <Avatar name={form.name || "?"} size={72} />
          <button
            className="rounded-pill grid place-items-center [transition:0.15s] cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2 absolute bottom-[-4px] right-[-4px] w-[30px] h-[30px] [background:var(--coral)] text-[#fff] [border:2px_solid_var(--surface)]"
          >
            <Icons.camera size={15} />
          </button>
        </div>
        <div className="flex-1 min-w-[180px]">
          <h2 className="text-[24px]">{form.name}</h2>
          <div className="text-ink-3 font-semibold mt-[4px] flex gap-[12px] flex-wrap">
            <span className="inline-flex gap-[5px] items-center">
              <Icons.pin size={14} />
              {form.city}
            </span>
            <span className="inline-flex gap-[5px] items-center">
              <Icons.sparkle size={14} />
              {user.plan || "Joy Map"} {t("member")}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-[6px] text-right">
          <span className="font-display font-extrabold text-[26px]">
            {total}
          </span>
          <span className="text-[12.5px] text-ink-3 font-semibold">
            {t("experiences booked")}
          </span>
        </div>
      </div>

      <div className="flex gap-[6px] mb-[20px] bg-surface-2 p-[5px] rounded-pill w-fit border border-line">
        {(
          [
            ["account", t("Personal data")],
            ["history", t("Activity history")],
            ["moods", t("Moods")],
          ] as const
        ).map(([k, l]) => (
          <Button
            key={k}
            ctx="app"
            size="sm"
            onClick={() => setTab(k as any)}
            className="[background:var(--btn-bg)] [color:var(--btn-fg)] [box-shadow:var(--btn-sh)]"
            style={
              (tab === k
                ? {
                    ["--btn-bg"]: "var(--surface)",
                    ["--btn-fg"]: "var(--ink)",
                    ["--btn-sh"]: "var(--sh-sm)",
                  }
                : {
                    ["--btn-bg"]: "transparent",
                    ["--btn-fg"]: "var(--ink-3)",
                    ["--btn-sh"]: "none",
                  }) as React.CSSProperties
            }
          >
            {l}
          </Button>
        ))}
      </div>

      {tab === "account" && (
        <div className="bg-surface border border-line rounded-lg p-[24px]">
          <div className="flex items-center justify-between mb-[18px]">
            <h3 className="text-[17px]">{t("Personal data")}</h3>
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
          <div className="grid grid-cols-2 gap-[16px]">
            {(
              [
                ["name", t("Full name"), "user"],
                ["email", t("Email"), "mail"],
                ["phone", t("Phone"), "phone"],
                ["city", t("City"), "pin"],
              ] as const
            ).map(([k, l, ic]) => {
              const I = Icons[ic];
              return (
                <div
                  key={k}
                  className="[grid-column:var(--gc)]"
                  style={{ ["--gc"]: k === "name" ? "1 / -1" : "auto" } as React.CSSProperties}
                >
                  <div className="text-[12.5px] font-bold text-ink-3 mb-[7px]">
                    {l}
                  </div>
                  {edit ? (
                    <Input
                      value={(form as any)[k]}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, [k]: e.target.value }))
                      }
                    />
                  ) : (
                    <div className="flex items-center gap-[9px] py-[12px] px-[14px] rounded-sm bg-surface-2 font-semibold text-[14.5px]">
                      <span className="text-ink-3">
                        <I size={17} />
                      </span>
                      {(form as any)[k]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <hr className="h-px bg-line border-0 m-[22px_0]" />
          <div className="flex items-center gap-[12px]">
            <span className="w-[38px] h-[38px] rounded-[11px] grid place-items-center [background:color-mix(in_srgb,#1FA46E_14%,transparent)] text-[#1FA46E] flex-none">
              <Icons.shield size={19} />
            </span>
            <div className="flex-1">
              <div className="font-bold text-[14px]">{t("Account secured")}</div>
              <div className="text-[12.5px] text-ink-3 font-semibold">
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
          <div className="flex items-center justify-between mb-[14px]">
            <span className="font-bold text-[14px] text-ink-2">
              {past.length} {t("past experiences")} · {fmt(spent)} {t("spent")}
            </span>
          </div>
          {past.length === 0 ? (
            <div className="bg-surface border border-line rounded-lg p-[40px_20px] text-center text-ink-3 font-semibold text-[14px]">
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
                    className="flex items-center gap-[14px] p-[15px_18px] [border-top:var(--bt)]"
                    style={{ ["--bt"]: i ? "1px solid var(--line)" : "none" } as React.CSSProperties}
                  >
                    <div
                      className="w-[44px] h-[44px] rounded-[12px] [background:var(--bg)] bg-cover flex-none opacity-[0.95]"
                      style={{ ["--bg"]: e ? bg(e) : m.color } as React.CSSProperties}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[14.5px]">
                        {e ? e.title : t("Experience")}
                      </div>
                      <div className="text-[12.5px] text-ink-3 font-semibold">
                        {e ? e.provider : ""} · {h.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display font-bold text-[14px]">
                        {fmt(h.total)}
                      </div>
                      {h.rated ? (
                        <div className="text-[var(--m-joy)] text-[12px]">
                          {"★".repeat(h.rated)}
                        </div>
                      ) : h.status === "completed" ? (
                        <span className="text-[12px] text-ink-3 font-semibold">
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
        <div className="bg-surface border border-line rounded-lg p-[24px]">
          <h3 className="text-[17px] mb-[8px]">{t("Your moods")}</h3>
          <p className="text-ink-2 text-[14px] mb-[16px]">
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
    <div className="flex flex-wrap gap-[9px]">
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
