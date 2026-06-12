"use client";

import { useState } from "react";
import { btnCls } from "@/lib/btn";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import {
  MOODS,
  MOOD_ORDER,
  fmt,
  bg,
  Avatar,
  BusyBtn,
  MoodChip,
  type Exp,
} from "./primitives";
import { Input } from "@/components/ui";
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
      <div
        className="bg-surface border border-line rounded-lg"
        style={{
          padding: 24,
          display: "flex",
          gap: 18,
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <div className="relative">
          <Avatar name={form.name || "?"} size={72} />
          <button
            className="w-[42px] h-[42px] rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
            style={{
              position: "absolute",
              bottom: -4,
              right: -4,
              width: 30,
              height: 30,
              background: "var(--coral)",
              color: "#fff",
              border: "2px solid var(--surface)",
            }}
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
          <button
            key={k}
            className={btnCls("app", undefined, "sm")}
            onClick={() => setTab(k as any)}
            style={
              tab === k
                ? {
                    background: "var(--surface)",
                    color: "var(--ink)",
                    boxShadow: "var(--sh-sm)",
                  }
                : { color: "var(--ink-3)" }
            }
          >
            {l}
          </button>
        ))}
      </div>

      {tab === "account" && (
        <div className="bg-surface border border-line rounded-lg" style={{ padding: 24 }}>
          <div className="flex items-center justify-between mb-[18px]">
            <h3 className="text-[17px]">{t("Personal data")}</h3>
            <BusyBtn
              busy={busy}
              className={btnCls("app", "ghost", "sm")}
              icon={edit ? <Icons.check size={15} /> : <Icons.edit size={15} />}
              onClick={saveOrEdit}
            >
              {edit ? t("Save") : t("Edit")}
            </BusyBtn>
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
                  style={{ gridColumn: k === "name" ? "1 / -1" : "auto" }}
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
          <hr className="divider" style={{ margin: "22px 0" }} />
          <div className="flex items-center gap-[12px]">
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                display: "grid",
                placeItems: "center",
                background: "color-mix(in srgb,#1FA46E 14%,transparent)",
                color: "#1FA46E",
                flex: "none",
              }}
            >
              <Icons.shield size={19} />
            </span>
            <div className="flex-1">
              <div className="font-bold text-[14px]">{t("Account secured")}</div>
              <div className="text-[12.5px] text-ink-3 font-semibold">
                {t("Signed in as")} {user.email}
              </div>
            </div>
            <button
              className={btnCls("app", "ghost", "sm")}
              onClick={() => rpc("logout").then(() => router.push("/auth"))}
            >
              {t("Log out")}
            </button>
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
            <div
              className="bg-surface border border-line rounded-lg"
              style={{
                padding: "40px 20px",
                textAlign: "center",
                color: "var(--ink-3)",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              {t("Your completed experiences will appear here.")}
            </div>
          ) : (
            <div className="bg-surface border border-line rounded-lg" style={{ overflow: "hidden" }}>
              {past.map((h, i) => {
                const e = h.exp;
                const m = e ? MOODS[e.mood] : MOODS.calm;
                return (
                  <div
                    key={h.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "15px 18px",
                      borderTop: i ? "1px solid var(--line)" : "none",
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: e ? bg(e) : m.color,
                        backgroundSize: "cover",
                        flex: "none",
                        opacity: 0.95,
                      }}
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
        <div className="bg-surface border border-line rounded-lg" style={{ padding: 24 }}>
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
