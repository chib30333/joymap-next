"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc, useBusy } from "@/lib/client";
import {
  money,
  Pill,
  Seg,
  Toggle,
  Modal,
  Btn,
  BusyBtn,
} from "@/components/dash/primitives";
import { Input, Textarea } from "@/components/ui";

const P_GALLERY = [
  {
    id: "g1",
    g: "linear-gradient(150deg,#6FD4C4,#2E8C80)",
    cover: true,
    label: "Rooftop at sunrise",
  },
  {
    id: "g2",
    g: "linear-gradient(150deg,#5FC8B6,#268070)",
    label: "Sound bath setup",
  },
  {
    id: "g3",
    g: "linear-gradient(150deg,#7E8BE6,#3F49B0)",
    label: "Breathwork circle",
  },
  {
    id: "g4",
    g: "linear-gradient(150deg,#FBC15B,#E08B12)",
    label: "Golden hour flow",
  },
  {
    id: "g5",
    g: "linear-gradient(150deg,#FF9A57,#E36A1E)",
    label: "Studio interior",
  },
  {
    id: "g6",
    g: "linear-gradient(150deg,#9E7BF6,#5B33C9)",
    label: "Evening candlelit",
    video: true,
  },
] as {
  id: string;
  g: string;
  cover?: boolean;
  label: string;
  video?: boolean;
}[];

const P_RULES = [
  {
    id: "r1",
    name: "Peak weekend surge",
    cond: "Sat–Sun · all services",
    adj: "+15%",
    type: "up",
    active: true,
  },
  {
    id: "r2",
    name: "Early bird discount",
    cond: "Before 09:00",
    adj: "−10%",
    type: "down",
    active: true,
  },
  {
    id: "r3",
    name: "Last-minute fill",
    cond: "< 3h to start & seats open",
    adj: "−20%",
    type: "down",
    active: true,
  },
  {
    id: "r4",
    name: "Group of 4+",
    cond: "4 or more spots",
    adj: "−12%",
    type: "down",
    active: false,
  },
];

const P_PROMOS = [
  {
    code: "CALM15",
    desc: "15% off any wellness session",
    uses: 42,
    cap: 100,
    expires: "30 Jun",
    status: "active",
  },
  {
    code: "FIRSTYOGA",
    desc: "−500 ₽ on a first booking",
    uses: 88,
    cap: 200,
    expires: "15 Jul",
    status: "active",
  },
  {
    code: "SUNRISE",
    desc: "Free tea with sunrise classes",
    uses: 120,
    cap: 120,
    expires: "1 Jun",
    status: "rejected",
  },
];

type Provider = any;

/* ===== Business Profile ===== */
export function PBusinessProfile({ provider }: { provider: Provider }) {
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
    <div className="anim-fade max-w-[840px]">
      <div
        className="card"
        style={{ overflow: "hidden", marginBottom: "var(--gap)" }}
      >
        <div className="h-[150px] relative" style={{ background: cover.g }}>
          <button
            className="btn btn-ghost btn-sm"
            style={{ position: "absolute", right: 14, top: 14 }}
          >
            <Icons.camera size={15} />
            Change cover
          </button>
        </div>
        <div className="pt-0 px-[24px] pb-[22px] flex gap-[18px] items-end mt-[-36px] flex-wrap relative z-[1]">
          <div
            className="w-[84px] h-[84px] rounded-[22px] bg-[linear-gradient(140deg,var(--m-calm),#2E8C80)] grid text-[#fff] font-extrabold text-[34px] flex-none"
            style={{
              border: "4px solid var(--surface)",
              placeItems: "center",
              fontFamily: "var(--display)",
            }}
          >
            {(f.name || "?")[0]}
          </div>
          <div className="flex-1 min-w-[200px] pb-[4px]">
            <h2 className="text-[24px]">{f.name}</h2>
            <div className="text-ink-3 font-semibold mt-[3px]">
              {edit ? (
                <Input
                  placeholder="A short tagline customers see"
                  value={f.tagline}
                  onChange={(e) => set("tagline", e.target.value)}
                  style={{ marginTop: 6 }}
                />
              ) : (
                f.tagline || "Add a tagline so customers know your vibe"
              )}
            </div>
          </div>
          <div className="flex gap-[8px] pb-[4px]">
            {p.status === "active" ? (
              <span
                className="pill"
                style={{ color: "#1FA46E", background: "rgba(31,164,110,.13)" }}
              >
                <Icons.shield size={13} />
                Verified
              </span>
            ) : (
              <span
                className="pill"
                style={{ color: "#E89015", background: "rgba(232,144,21,.14)" }}
              >
                <Icons.clock size={13} />
                In review
              </span>
            )}
            <BusyBtn
              busy={busy}
              className="btn btn-ghost btn-sm"
              icon={edit ? <Icons.check size={15} /> : <Icons.edit size={15} />}
              onClick={saveOrEdit}
            >
              {edit ? "Save" : "Edit"}
            </BusyBtn>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-[var(--gap)] items-start">
        <div className="card" style={{ padding: 24 }}>
          <h3 className="text-[17px] mb-[14px]">About the business</h3>
          {edit ? (
            <Textarea
              rows={5}
              value={f.about}
              onChange={(e) => set("about", e.target.value)}
              placeholder="Tell customers your story…"
              style={{ resize: "vertical", lineHeight: 1.5 }}
            />
          ) : (
            <p className="text-ink-2 text-[14.5px] leading-[1.6] m-0">
              {f.about ||
                "No description yet — hit Edit and tell customers what makes you special."}
            </p>
          )}
          <hr
            className="divider"
            style={{
              margin: "20px 0",
              border: 0,
              height: 1,
              background: "var(--line)",
            }}
          />
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
                  style={{ gridColumn: k === "address" ? "1 / -1" : "auto" }}
                >
                  <div className="text-[12px] font-bold text-ink-3 mb-[6px]">
                    {l}
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
          <div className="card" style={{ padding: 22 }}>
            <h3 className="text-[16px] mb-[14px]">Categories</h3>
            <div className="flex flex-wrap gap-[8px]">
              {f.cats.map((c: string) => (
                <span
                  key={c}
                  className="tag"
                  style={{
                    background: "var(--surface-2)",
                    color: "var(--ink-2)",
                    border: "1px solid var(--line)",
                  }}
                >
                  {c}
                </span>
              ))}
              {edit && (
                <button className="chip" style={{ padding: "4px 12px" }}>
                  <Icons.plus size={13} />
                  Add
                </button>
              )}
            </div>
            <hr
              className="divider"
              style={{
                margin: "18px 0",
                border: 0,
                height: 1,
                background: "var(--line)",
              }}
            />
            <div className="flex justify-between text-[13.5px]">
              <div>
                <div className="text-ink-3 font-semibold mb-[4px]">Founded</div>
                <b>{f.founded}</b>
              </div>
              <div>
                <div className="text-ink-3 font-semibold mb-[4px]">Team</div>
                <b>{f.team} people</b>
              </div>
              <div>
                <div className="text-ink-3 font-semibold mb-[4px]">Joined</div>
                <b>{p.joined || "Jun 2026"}</b>
              </div>
            </div>
          </div>
          <div className="card" style={{ padding: 22 }}>
            <div className="flex items-center justify-between mb-[6px]">
              <h3 className="text-[16px]">Gallery</h3>
              <span className="text-[12.5px] text-ink-3 font-semibold">
                {P_GALLERY.length} items
              </span>
            </div>
            <div className="grid grid-cols-[repeat(3,1fr)] gap-[8px] mt-[10px]">
              {P_GALLERY.slice(0, 6).map((g) => (
                <div
                  key={g.id}
                  className="rounded-xs"
                  style={{ aspectRatio: "1", background: g.g }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Pricing ===== */
export function PPricing({ svcs }: { svcs: any[] }) {
  const [rules, setRules] = useState(P_RULES);
  const toggle = (id: string) =>
    setRules((r) =>
      r.map((x) => (x.id === id ? { ...x, active: !x.active } : x)),
    );
  return (
    <div className="anim-fade max-w-[820px]">
      <div className="card" style={{ padding: 22, marginBottom: "var(--gap)" }}>
        <div className="shead" style={{ marginBottom: 14 }}>
          <div>
            <h3 className="text-[17px]">Base prices</h3>
            <div className="text-[13px] text-ink-3 font-semibold">
              Per person, before dynamic rules
            </div>
          </div>
        </div>
        {svcs.length === 0 ? (
          <div className="py-[20px] px-0 text-ink-3 font-semibold text-[13.5px]">
            No services yet — create one in Services.
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th>Service</th>
                <th>Duration</th>
                <th>Capacity</th>
                <th>Base price</th>
              </tr>
            </thead>
            <tbody>
              {svcs.map((s) => (
                <tr key={s.id} className="row">
                  <td>
                    <b className="font-bold">{s.name}</b>
                  </td>
                  <td className="text-ink-2">{s.dur}</td>
                  <td className="text-ink-2">{s.cap}</td>
                  <td
                    className="font-bold"
                    style={{ fontFamily: "var(--display)" }}
                  >
                    {money(s.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="shead">
        <div>
          <h3 className="text-[17px]">Dynamic pricing rules</h3>
          <div className="text-[13px] text-ink-3 font-semibold">
            Automatically adjust prices to fill capacity
          </div>
        </div>
        <Btn size="md" icon={<Icons.plus size={16} />}>
          New rule
        </Btn>
      </div>
      <div className="flex flex-col gap-[12px]">
        {rules.map((r) => (
          <div
            key={r.id}
            className="card"
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              gap: 16,
              opacity: r.active ? 1 : 0.6,
            }}
          >
            <span
              className="w-[42px] h-[42px] rounded-sm flex-none grid"
              style={{
                placeItems: "center",
                background:
                  r.type === "up"
                    ? "rgba(224,33,47,.12)"
                    : "rgba(31,164,110,.13)",
                color: r.type === "up" ? "var(--coral)" : "#1FA46E",
              }}
            >
              <Icons.percent size={20} />
            </span>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-[15px]">{r.name}</div>
              <div className="text-[13px] text-ink-3 font-semibold">
                {r.cond}
              </div>
            </div>
            <span
              className="font-extrabold text-[18px]"
              style={{
                fontFamily: "var(--display)",
                color: r.type === "up" ? "var(--coral)" : "#1FA46E",
              }}
            >
              {r.adj}
            </span>
            <Toggle on={r.active} onChange={() => toggle(r.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Gallery ===== */
export function PGalleryView() {
  const [items, setItems] = useState(P_GALLERY);
  const del = (id: string) => setItems((it) => it.filter((g) => g.id !== id));
  const setCover = (id: string) =>
    setItems((it) => it.map((g) => ({ ...g, cover: g.id === id })));
  return (
    <div className="anim-fade">
      <div className="shead">
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            {items.length} items
          </div>
          <h2 className="text-[22px]">Photos & videos</h2>
        </div>
        <Btn size="md" icon={<Icons.plus size={16} />}>
          Upload
        </Btn>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[var(--gap)]">
        <label
          className="rounded-lg flex flex-col items-center justify-center gap-[8px] text-ink-3 cursor-pointer bg-surface-2"
          style={{ aspectRatio: "4/3", border: "2px dashed var(--line-2)" }}
        >
          <Icons.image size={28} />
          <span className="font-bold text-[13.5px]">Add photo or video</span>
        </label>
        {items.map((g) => (
          <div
            key={g.id}
            className="card anim-pop"
            style={{ overflow: "hidden", padding: 0 }}
          >
            <div
              className="relative"
              style={{ aspectRatio: "4/3", background: g.g }}
            >
              {g.cover && (
                <span
                  className="pill"
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    color: "#1A0A04",
                    background: "var(--orange)",
                  }}
                >
                  <Icons.star size={12} />
                  Cover
                </span>
              )}
              {g.video && (
                <span
                  className="absolute inset-0 grid"
                  style={{ placeItems: "center" }}
                >
                  <span
                    className="w-[46px] h-[46px] rounded-[99px] bg-[rgba(0,0,0,.45)] grid text-[#fff]"
                    style={{ placeItems: "center" }}
                  >
                    <Icons.arrowR size={20} />
                  </span>
                </span>
              )}
              <div className="absolute bottom-0 left-0 right-0 pt-[24px] px-[12px] pb-[10px] bg-[linear-gradient(transparent,rgba(0,0,0,.5))] flex items-center gap-[6px]">
                <span
                  className="text-[#fff] font-bold text-[12.5px] flex-1 whitespace-nowrap overflow-hidden"
                  style={{ textOverflow: "ellipsis" }}
                >
                  {g.label}
                </span>
              </div>
            </div>
            <div className="flex gap-[6px] py-[10px] px-[12px]">
              {!g.cover && (
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ flex: 1, fontSize: 12 }}
                  onClick={() => setCover(g.id)}
                >
                  Set cover
                </button>
              )}
              <button
                className="icon-btn"
                style={{ width: 34, height: 34 }}
                onClick={() => del(g.id)}
              >
                <Icons.trash size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ===== Marketing ===== */
export function PMarketing() {
  const [promos, setPromos] = useState(P_PROMOS);
  const [modal, setModal] = useState(false);
  const add = (p: any) => {
    setPromos((ps) => [{ ...p, uses: 0, status: "active" }, ...ps]);
    setModal(false);
  };
  return (
    <div className="anim-fade max-w-[860px]">
      <div className="shead">
        <div>
          <h3 className="text-[17px]">Promo codes</h3>
          <div className="text-[13px] text-ink-3 font-semibold">
            Drive bookings with limited-time offers
          </div>
        </div>
        <Btn
          size="md"
          icon={<Icons.plus size={16} />}
          onClick={() => setModal(true)}
        >
          Create code
        </Btn>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-[var(--gap)]">
        {promos.map((p, i) => (
          <div key={i} className="card anim-pop" style={{ padding: 20 }}>
            <div className="flex items-center justify-between mb-[12px]">
              <span
                className="font-extrabold text-[18px] tracking-[.04em] py-[5px] px-[12px] rounded-xs bg-[color-mix(in_srgb,var(--orange)_14%,transparent)] text-[var(--orange-deep)]"
                style={{
                  fontFamily: "var(--display)",
                  border:
                    "1px dashed color-mix(in srgb,var(--orange) 45%,transparent)",
                }}
              >
                {p.code}
              </span>
              <Pill
                status={p.status}
                label={
                  p.status === "active"
                    ? "Active"
                    : p.status === "rejected"
                      ? "Expired"
                      : p.status
                }
              />
            </div>
            <p className="mt-0 mx-0 mb-[14px] text-[14px] text-ink-2 font-semibold">
              {p.desc}
            </p>
            <div className="h-[7px] rounded-[99px] bg-surface-2 overflow-hidden mb-[8px]">
              <div
                className="h-full rounded-[99px]"
                style={{
                  width: `${Math.min((p.uses / p.cap) * 100, 100)}%`,
                  background: p.uses >= p.cap ? "var(--ink-3)" : "var(--coral)",
                }}
              />
            </div>
            <div className="flex justify-between text-[12.5px] text-ink-3 font-semibold">
              <span>
                {p.uses}/{p.cap} redeemed
              </span>
              <span>Expires {p.expires}</span>
            </div>
          </div>
        ))}
      </div>
      {modal && <PromoModal onClose={() => setModal(false)} onAdd={add} />}
    </div>
  );
}

function PromoModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (p: any) => void;
}) {
  const [code, setCode] = useState("");
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("15");
  const [unit, setUnit] = useState("%");
  const [cap, setCap] = useState("100");
  return (
    <Modal onClose={onClose} maxWidth={460}>
      <div className="py-[24px] px-[26px]">
        <h3 className="text-[20px] mb-[18px]">Create promo code</h3>
        <div className="flex flex-col gap-[14px]">
          <div>
            <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
              Code
            </div>
            <Input
              placeholder="SUMMER20"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              style={{
                fontFamily: "var(--display)",
                fontWeight: 700,
                letterSpacing: ".05em",
              }}
            />
          </div>
          <div>
            <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
              Description
            </div>
            <Input
              placeholder="15% off any wellness session"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="flex gap-[12px]">
            <div className="flex-1">
              <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
                Discount
              </div>
              <div className="flex gap-[8px]">
                <Input
                  value={amt}
                  onChange={(e) => setAmt(e.target.value)}
                  style={{ flex: 1 }}
                />
                <Seg
                  value={unit}
                  options={[
                    { v: "%", l: "%" },
                    { v: "₽", l: "₽" },
                  ]}
                  onChange={setUnit}
                />
              </div>
            </div>
            <div className="w-[110px]">
              <div className="text-[12.5px] font-bold text-ink-2 mb-[7px]">
                Max uses
              </div>
              <Input value={cap} onChange={(e) => setCap(e.target.value)} />
            </div>
          </div>
        </div>
        <div className="flex gap-[10px] mt-[22px]">
          <button className="btn btn-ghost btn-md btn-block" onClick={onClose}>
            Cancel
          </button>
          <Btn
            size="md"
            block
            onClick={() =>
              onAdd({
                code: code || "NEWCODE",
                desc: desc || `${amt}${unit} off`,
                cap: +cap || 100,
                expires: "31 Jul",
              })
            }
          >
            <Icons.check size={16} />
            Create code
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
