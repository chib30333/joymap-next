"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useT } from "@/components/Language";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { useBusy } from "@/hooks";
import {
  MOODS,
  fmt,
  bg,
  WD,
  dow,
  Modal,
  PhotoFrame,
  MoodDot,
  Rating,
  QR,
  type Exp,
} from "./primitives";
import { Button } from "@/components/ui";

type PayMethod = { key: string; label: string; detail: string | null };

const PAY_METHODS: PayMethod[] = [
  { key: "card", label: "Bank card", detail: "•••• 4291" },
  { key: "sber", label: "Sber Pay", detail: "Linked" },
  { key: "wallet", label: "Joymap balance", detail: null },
];
const dateLabel = (d: number) => `${WD[dow(d)]} ${d} Jun`;

export type Slot = { day: number; time: string };

export function ServiceModal({
  exp,
  slots,
  wallet,
  fav,
  onFav,
  onClose,
}: {
  exp: Exp;
  slots: Slot[];
  wallet: number;
  fav: boolean;
  onFav: (id: string) => void;
  onClose: () => void;
}) {
  const t = useT();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const m = MOODS[exp.mood];

  const slotDays = [...new Set(slots.map((s) => s.day))]
    .sort((a, b) => a - b)
    .slice(0, 7);
  const days = slotDays.length
    ? slotDays
    : Array.from({ length: 7 }, (_, i) => 10 + i).filter((d) => d <= 30);
  const timesFor = (d: number) => {
    const ts = slots.filter((s) => s.day === d).map((s) => s.time);
    return ts.length ? ts : ["07:30", "11:00", "15:00", "18:30", "20:00"];
  };

  const [day, setDay] = useState(days[0]);
  const [time, setTime] = useState(timesFor(days[0])[0]);
  const [spots, setSpots] = useState(1);
  const [pay, setPay] = useState("card");
  const [booking, setBooking] = useState<{ code: string } | null>(null);
  const { busy, run, error, setError } = useBusy();
  const total = exp.price * spots;

  const confirm = () =>
    run(
      () =>
        rpc<{ code: string }>("createBooking", {
          serviceId: exp.id,
          day,
          time,
          people: spots,
          pay,
        }),
      (b) => {
        setBooking(b);
        setStep(3);
        router.refresh();
      },
    );

  const Header = ({ sub }: { sub?: string }) => (
    <div className="relative">
      <PhotoFrame exp={exp} ratio="16/8">
        <button
          className="w-[42px] h-[42px] rounded-pill grid place-items-center text-ink-2 [transition:0.15s] cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2 absolute top-[14px] right-[14px] bg-[rgba(255,255,255,.92)] border-none text-[#241C2E]"
          onClick={onClose}
        >
          <Icons.close size={18} />
        </button>
        <button
          className={`absolute rounded-pill border-none grid place-items-center [transition:0.15s] cursor-pointer hover:bg-[#fff] hover:scale-[1.08] top-[14px] right-[64px] w-[42px] h-[42px] bg-[rgba(255,255,255,.9)] ${fav ? "text-m-energy" : "text-[#241C2E]"}`}
          onClick={() => onFav(exp.id)}
        >
          <Icons.heart size={19} fill={fav} />
        </button>
        <div className="absolute left-[18px] bottom-[16px] right-[18px]">
          <span
            className="inline-flex items-center gap-[8px] pt-[7px] pr-[13px] pb-[7px] pl-[11px] rounded-pill text-[13px] font-bold cursor-pointer [transition:0.14s] border-[1.5px] border-solid border-transparent bg-[rgba(255,255,255,.92)] [color:var(--fg)] mb-[10px]"
            style={{ ["--fg"]: m.color } as React.CSSProperties}
          >
            <MoodDot mood={exp.mood} size={7} />
            {t(m.label)}
          </span>
          <h2 className="text-[#fff] text-[28px] [text-shadow:0_2px_16px_rgba(0,0,0,.4)]">
            {exp.title}
          </h2>
          {sub && (
            <div className="text-[rgba(255,255,255,.9)] font-semibold mt-[4px]">
              {sub}
            </div>
          )}
        </div>
      </PhotoFrame>
    </div>
  );

  return (
    <Modal onClose={onClose} maxWidth={step === 3 ? 460 : 560}>
      {step === 0 && (
        <div>
          <Header />
          <div className="pt-[22px] px-[24px] pb-0">
            <div className="flex items-center gap-[16px] flex-wrap mb-[18px]">
              {exp.rating ? (
                <Rating value={exp.rating} reviews={exp.reviews} />
              ) : (
                <span className="inline-flex items-center px-[11px] py-[5px] rounded-pill text-[12px] bg-[var(--coral-soft)] text-[var(--coral-deep)] border-none font-bold">
                  {t("New on Joymap")}
                </span>
              )}
              <span className="text-[var(--line-2)]">•</span>
              <span className="inline-flex gap-[6px] items-center text-ink-2 font-semibold text-[14px]">
                <Icons.pin size={16} />
                {exp.area}, {exp.city}
              </span>
              <span className="text-[var(--line-2)]">•</span>
              <span className="inline-flex gap-[6px] items-center text-ink-2 font-semibold text-[14px]">
                <Icons.clock size={16} />
                {exp.dur}
              </span>
            </div>
            <div className="flex items-center gap-[12px] py-[14px] border-t border-b border-line mb-[18px]">
              <div className="w-[40px] h-[40px] rounded-pill grid place-items-center font-extrabold font-display flex-none bg-[var(--bg-2)] text-[var(--ink-2)]">
                {exp.provider[0]}
              </div>
              <div>
                <div className="font-bold text-[14.5px]">{exp.provider}</div>
                <div className="text-[12.5px] text-ink-3 font-semibold">
                  {t("Verified provider · responds in ~1h")}
                </div>
              </div>
              <span className="inline-flex items-center px-[11px] py-[5px] rounded-pill text-[12px] font-semibold ml-auto bg-[var(--m-calm-soft)] text-[var(--m-calm)] border-none">
                <Icons.check size={13} className="mr-[4px]" />
                {t("Verified")}
              </span>
            </div>
            <p className="text-ink-2 text-[15px] leading-[1.6] mb-[18px]">
              {exp.about}
            </p>
            <div className="flex gap-[8px] flex-wrap mb-[6px]">
              {exp.tags.map((tg) => (
                <span key={tg} className="inline-flex items-center px-[11px] py-[5px] rounded-pill text-[12px] font-semibold bg-surface-2 text-ink-2 border border-line">
                  {tg}
                </span>
              ))}
              <span className="inline-flex items-center px-[11px] py-[5px] rounded-pill text-[12px] font-semibold bg-[var(--coral-soft)] text-[var(--coral-deep)] border-none">
                <Icons.flame size={13} className="mr-[4px]" />
                {exp.spots} {t("spots / session")}
              </span>
            </div>
          </div>
          <Footer>
            <div>
              <div className="text-[12.5px] text-ink-3 font-semibold">{t("From")}</div>
              <div className="font-display font-bold text-ink whitespace-nowrap [&_small]:font-semibold [&_small]:text-[12.5px] [&_small]:text-ink-3 text-[22px]">
                {fmt(exp.price)}
              </div>
            </div>
            <Button
              ctx="app"
              variant="primary"
              size="lg"
              iconR={<Icons.arrowR size={19} />}
              onClick={() => setStep(1)}
            >
              {t("Book a spot")}
            </Button>
          </Footer>
        </div>
      )}

      {step === 1 && (
        <div>
          <Header sub={t("Choose your day & time")} />
          <div className="pt-[22px] px-[24px] pb-0">
            <Label n="1" t={t("Pick a day")} />
            <div className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex gap-[9px] overflow-x-auto mb-[22px]">
              {days.map((d) => (
                <button
                  key={d}
                  onClick={() => {
                    setDay(d);
                    setTime(timesFor(d)[0]);
                  }}
                  className={`flex-none w-[64px] p-[12px_0] rounded-sm [border-width:1.5px] [border-style:solid] cursor-pointer [transition:.15s] ${day === d ? "border-coral bg-coral-soft" : "border-line-2 bg-surface"}`}
                >
                  <div
                    className={`text-[12px] font-bold ${day === d ? "text-coral-deep" : "text-ink-3"}`}
                  >
                    {WD[dow(d)]}
                  </div>
                  <div
                    className={`[font-family:var(--display)] font-extrabold text-[20px] ${day === d ? "text-coral-deep" : "text-ink"}`}
                  >
                    {d}
                  </div>
                </button>
              ))}
            </div>
            <Label n="2" t={t("Pick a time")} />
            <div className="flex gap-[9px] flex-wrap mb-[22px]">
              {timesFor(day).map((tm) => (
                <button
                  key={tm}
                  className={`inline-flex items-center gap-[7px] rounded-pill text-[13px] font-semibold border cursor-pointer [transition:0.14s] whitespace-nowrap p-[10px_16px] ${time === tm ? "bg-coral text-white border-coral" : "bg-surface text-ink-2 border-line-2 hover:border-ink-3 hover:text-ink"}`}
                  onClick={() => setTime(tm)}
                >
                  {tm}
                </button>
              ))}
            </div>
            {slotDays.length > 0 && (
              <div className="flex gap-[8px] items-center text-[12.5px] text-ink-3 font-semibold mb-[18px]">
                <Icons.sparkle size={14} className="text-coral" />
                {t("Times come straight from the provider's live schedule.")}
              </div>
            )}
            <Label n="3" t={t("How many spots?")} />
            <div className="flex items-center gap-[16px] mb-[8px]">
              <button
                className="w-[42px] h-[42px] rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
                onClick={() => setSpots((s) => Math.max(1, s - 1))}
              >
                <Icons.minus size={18} />
              </button>
              <span className="font-display font-extrabold text-[26px] min-w-[30px] text-center">
                {spots}
              </span>
              <button
                className="w-[42px] h-[42px] rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
                onClick={() => setSpots((s) => Math.min(exp.spots, s + 1))}
              >
                <Icons.plus size={18} />
              </button>
              <span className="text-ink-3 text-[13.5px] font-semibold">
                {exp.spots} {t("available")}
              </span>
            </div>
          </div>
          <Footer>
            <Button ctx="app" variant="ghost" size="md" onClick={() => setStep(0)}>
              <Icons.arrowL size={18} />
              {t("Back")}
            </Button>
            <Button
              ctx="app"
              variant="primary"
              size="lg"
              onClick={() => setStep(2)}
              iconR={<Icons.arrowR size={19} />}
            >
              {t("Continue")} · {fmt(total)}
            </Button>
          </Footer>
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="pt-[22px] px-[24px] pb-0">
            <div className="flex items-center gap-[10px] mb-[20px]">
              <button className="w-[42px] h-[42px] rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2" onClick={() => setStep(1)}>
                <Icons.arrowL size={18} />
              </button>
              <h2 className="text-[22px]">{t("Confirm & pay")}</h2>
            </div>
            <div className="border border-line rounded-lg p-[16px] flex gap-[14px] mb-[20px] bg-[var(--surface-2)]">
              <div
                className="w-[64px] h-[64px] rounded-sm flex-none [background:var(--bg)]"
                style={{ ["--bg"]: bg(exp) } as React.CSSProperties}
              />
              <div className="flex-1">
                <div className="font-bold text-[15px]">{exp.title}</div>
                <div className="text-[13px] text-ink-3 font-semibold mt-[4px]">
                  {dateLabel(day)} · {time} · {spots}{" "}
                  {t(spots > 1 ? "spots" : "spot")}
                </div>
                <div className="text-[13px] text-ink-3 font-semibold">
                  {exp.area}, {exp.city}
                </div>
              </div>
            </div>
            <Label n="" t={t("Payment method")} />
            <div className="flex flex-col gap-[9px] mb-[20px]">
              {PAY_METHODS.map(({ key: k, label: l, detail: s }) => (
                <button
                  key={k}
                  onClick={() => {
                    setPay(k);
                    setError(null);
                  }}
                  className={`flex items-center gap-[12px] p-[13px_16px] rounded-sm cursor-pointer [transition:.15s] [border-width:1.5px] [border-style:solid] ${pay === k ? "border-coral bg-coral-soft" : "border-line-2 bg-surface"}`}
                >
                  <span
                    className={`w-[20px] h-[20px] rounded-[99px] [border-width:2px] [border-style:solid] grid place-items-center ${pay === k ? "border-coral" : "border-line-2"}`}
                  >
                    {pay === k && (
                      <span className="w-[10px] h-[10px] rounded-[99px] bg-[var(--coral)]" />
                    )}
                  </span>
                  <div className="text-left">
                    <div className="font-bold text-[14px]">{t(l)}</div>
                    <div className="text-[12.5px] text-ink-3 font-semibold">
                      {k === "wallet"
                        ? fmt(wallet)
                        : s === "Linked"
                          ? t("Linked")
                          : s}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="border-t border-line pt-[14px] mb-[4px]">
              <Row l={`${fmt(exp.price)} × ${spots}`} r={fmt(total)} />
              <Row l={t("Service fee")} r={t("Included")} muted />
              <Row l={t("Free cancellation")} r={t("up to 12h before")} muted />
            </div>
            {(error || (pay === "wallet" && wallet < total)) && (
              <div className="flex gap-[9px] items-center py-[11px] px-[14px] rounded-sm bg-coral-soft text-coral-deep font-bold text-[13.5px] mt-[10px]">
                <Icons.flame size={16} />
                {error ||
                  t(
                    "Not enough Joymap balance — top up in Wallet or pick another method.",
                  )}
              </div>
            )}
          </div>
          <Footer>
            <div>
              <div className="text-[12.5px] text-ink-3 font-semibold">
                {t("Total")}
              </div>
              <div className="font-display font-bold text-ink whitespace-nowrap [&_small]:font-semibold [&_small]:text-[12.5px] [&_small]:text-ink-3 text-[22px]">
                {fmt(total)}
              </div>
            </div>
            <Button
              busy={busy}
              ctx="app"
              variant="primary"
              size="lg"
              icon={<Icons.check size={19} />}
              disabled={pay === "wallet" && wallet < total}
              onClick={confirm}
            >
              {t("Pay")} {fmt(total)}
            </Button>
          </Footer>
        </div>
      )}

      {step === 3 && (
        <div className="py-[30px] px-6 text-center">
          <div className="animate-anim-pop-app w-[72px] h-[72px] rounded-[99px] bg-[var(--m-calm)] grid place-items-center mt-0 mx-auto mb-[18px] text-[#fff] [box-shadow:0_12px_30px_rgba(63,168,155,.4)]">
            <Icons.check size={38} />
          </div>
          <h2 className="text-[26px] mb-[8px]">{t("Request sent!")}</h2>
          <p className="text-ink-2 text-[15px] mb-[22px] max-w-[340px] mx-auto">
            <b>{exp.title}</b> · {dateLabel(day)} {t("at")} {time}.{" "}
            {exp.provider}{" "}
            {t("will confirm shortly — watch your notifications.")}
          </p>
          <div className="border border-line rounded-lg p-[22px] max-w-[300px] m-[0_auto_22px] bg-[var(--surface-2)]">
            <QR />
            <div className="mt-[14px] font-display font-extrabold tracking-[.12em] text-[18px]">
              {booking?.code ?? ""}
            </div>
            <div className="text-[12.5px] text-ink-3 font-semibold mt-[3px]">
              {t("Show this at the door")}
            </div>
          </div>
          <div className="flex gap-[10px] justify-center">
            <Button ctx="app" variant="primary" size="md" onClick={onClose}>
              {t("Done")}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function Label({ n, t }: { n: string; t: string }) {
  return (
    <div className="flex items-center gap-[9px] mb-[12px]">
      {n && (
        <span className="w-[22px] h-[22px] flex-none rounded-[99px] bg-[var(--ink)] text-[var(--bg)] text-[12px] font-extrabold grid place-items-center">
          {n}
        </span>
      )}
      <span className="font-bold text-[15px] whitespace-nowrap">{t}</span>
    </div>
  );
}
function Row({ l, r, muted }: { l: string; r: string; muted?: boolean }) {
  return (
    <div className="flex justify-between py-[6px] text-[14px]">
      <span
        className={`font-semibold ${muted ? "text-ink-3" : "text-ink-2"}`}
      >
        {l}
      </span>
      <span
        className={`${muted ? "font-semibold text-ink-3" : "font-bold text-ink"}`}
      >
        {r}
      </span>
    </div>
  );
}
function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="sticky bottom-0 flex items-center justify-between gap-[14px] py-[18px] px-[24px] border-t border-line bg-bg mt-[22px]">
      {children}
    </div>
  );
}
