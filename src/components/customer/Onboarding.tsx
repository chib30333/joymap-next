"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { btnCls } from "@/lib/btn";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { MOODS, MOOD_ORDER, Btn, MoodChip } from "./primitives";
import { Textarea } from "@/components/ui";
import { useT } from "@/components/Language";

export function Onboarding() {
  const t = useT();
  const router = useRouter();
  const [msgs, setMsgs] = useState<{ from: "ai" | "me"; node: ReactNode }[]>(
    [],
  );
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [building, setBuilding] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);

  const push = (from: "ai" | "me", node: ReactNode) =>
    setMsgs((m) => [...m, { from, node }]);
  const ai = (node: ReactNode, delay = 650) => {
    setTyping(true);
    return new Promise<void>((r) =>
      setTimeout(() => {
        setTyping(false);
        push("ai", node);
        r();
      }, delay),
    );
  };

  useEffect(() => {
    (async () => {
      await ai(
        <>
          {t("Hi, I'm")} <b>{t("Joy")}</b>{" "}
          {t("— your guide. ✦ Over a minute I'll learn your vibe and build a personal weekly")}{" "}
          <b>{t("Joy Map")}</b>.
        </>,
        500,
      );
      await ai(
        <>
          {t("First — how are you hoping to")} <b>{t("feel")}</b>{" "}
          {t("more often? Pick a few.")}
        </>,
        800,
      );
      setStep(1);
    })();
  }, []);
  useEffect(() => {
    scroll.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [msgs, typing]);

  const complete = (moods: string[]) =>
    rpc("generateJoyMap", { moods }).then(() => router.refresh());
  const toggleMood = (k: string) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const submitMoods = async () => {
    if (picked.length === 0) return;
    push(
      "me",
      <div className="flex gap-[7px] flex-wrap">
        {picked.map((k) => (
          <MoodChip key={k} mood={k} active />
        ))}
      </div>,
    );
    setStep(0);
    await ai(
      <>
        {t("Lovely — more")}{" "}
        <b>
          {picked
            .map((k) => t(MOODS[k].label))
            .join(", ")
            .toLowerCase()}
        </b>
        . {t("Got it.")}
      </>,
      600,
    );
    await ai(
      <>
        {t("Now tell me in your own words. What are you in the mood for this week?")}
      </>,
      900,
    );
    setStep(2);
  };

  const submitText = async () => {
    const tx =
      text.trim() || t("Something fun and a little new, mostly evenings.");
    push("me", <span>{tx}</span>);
    setText("");
    setStep(0);
    await ai(<>{t("Perfect. I'm reading between the lines… 🔎")}</>, 600);
    setBuilding(true);
    await new Promise((r) => setTimeout(r, 2400));
    complete(picked.length ? picked : ["calm", "joy", "focus"]);
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 130px)",
        display: "grid",
        placeItems: "center",
        padding: "28px 16px",
        background:
          "radial-gradient(1000px 560px at 82% -12%, color-mix(in srgb,var(--red) 24%,transparent), transparent 60%), radial-gradient(820px 480px at -8% 112%, color-mix(in srgb,var(--orange) 16%,transparent), transparent 56%), var(--bg)",
      }}
    >
      <div
        className="bg-surface border border-line rounded-lg animate-anim-pop-app"
        style={{
          width: "100%",
          maxWidth: 560,
          boxShadow: "var(--sh-lg)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          height: "min(86vh,720px)",
        }}
      >
        <div className="flex items-center gap-[12px] py-[18px] px-[22px] border-b border-line">
          <div className="relative">
            <div
              className="w-[40px] h-[40px] rounded-pill bg-[linear-gradient(140deg,var(--red),var(--orange))] text-[#fff] grid place-items-center font-extrabold font-display flex-none"
              style={{
                background: "linear-gradient(140deg,var(--orange),var(--red))",
                animation: "float 4s ease-in-out infinite",
              }}
            >
              <Icons.sparkle size={20} />
            </div>
            <span
              className="absolute bottom-0 right-0 w-[11px] h-[11px] rounded-[99px] bg-[var(--m-calm)]"
              style={{ border: "2px solid var(--surface)" }}
            />
          </div>
          <div>
            <div className="font-display font-extrabold text-[16px]">{t("Joy")}</div>
            <div className="text-[12.5px] text-ink-3 font-semibold">
              {t("Building your map · step")} {Math.max(1, Math.min(step, 2))} {t("of 2")}
            </div>
          </div>
          <button
            className={btnCls("app", "ghost", "sm")}
            style={{ marginLeft: "auto" }}
            onClick={() => complete(["calm", "joy", "focus"])}
          >
            {t("Skip")}
          </button>
        </div>

        <div
          ref={scroll}
          className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 p-[22px] flex flex-col gap-[14px]"
          style={{ overflow: "auto" }}
        >
          {msgs.map((m, i) => (
            <Bubble key={i} from={m.from}>
              {m.node}
            </Bubble>
          ))}
          {typing && (
            <Bubble from="ai">
              <Typing />
            </Bubble>
          )}
          {building && <BuildingMap />}
        </div>

        {!building && (
          <div className="border-t border-line py-[16px] px-[18px] bg-surface-2">
            {step === 1 && (
              <>
                <div className="flex flex-wrap gap-[8px] mb-[14px]">
                  {MOOD_ORDER.map((k) => (
                    <MoodChip
                      key={k}
                      mood={k}
                      active={picked.includes(k)}
                      onClick={() => toggleMood(k)}
                    />
                  ))}
                </div>
                <Btn
                  block
                  size="lg"
                  onClick={submitMoods}
                  disabled={!picked.length}
                  iconR={<Icons.arrowR size={19} />}
                  style={
                    !picked.length
                      ? { opacity: 0.5, boxShadow: "none" }
                      : undefined
                  }
                >
                  {picked.length
                    ? `${t("Continue with")} ${picked.length} ${picked.length > 1 ? t("moods") : t("mood")}`
                    : t("Pick at least one")}
                </Btn>
              </>
            )}
            {step === 2 && (
              <div className="flex gap-[10px] items-end">
                <Textarea
                  rows={1}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitText();
                    }
                  }}
                  placeholder={t("e.g. A fun date idea under 3000 ₽…")}
                  style={{ resize: "none", minHeight: 48 }}
                />
                <button
                  className="w-[42px] h-[42px] rounded-pill grid place-items-center bg-surface border border-line text-ink-2 [transition:0.15s] relative cursor-pointer hover:text-ink hover:border-line-2 hover:bg-surface-2"
                  style={{
                    background: "var(--coral)",
                    color: "#fff",
                    border: "none",
                    flex: "none",
                    width: 48,
                    height: 48,
                    boxShadow: "var(--sh-coral)",
                  }}
                  onClick={submitText}
                >
                  <Icons.send size={20} />
                </button>
              </div>
            )}
            {step === 2 && (
              <div className="flex gap-[7px] flex-wrap mt-[12px]">
                {[
                  "Fun date idea",
                  "Something calm after work",
                  "A thrill this weekend",
                  "Meet new people",
                ].map((s) => (
                  <button key={s} className="inline-flex items-center gap-[7px] py-[7px] px-[13px] rounded-pill text-[13px] font-semibold border border-line-2 bg-surface text-ink-2 cursor-pointer [transition:0.14s] whitespace-nowrap hover:border-ink-3 hover:text-ink" onClick={() => setText(t(s))}>
                    {t(s)}
                  </button>
                ))}
              </div>
            )}
            {step === 0 && (
              <div className="text-center text-ink-3 text-[13px] font-semibold py-[6px] px-0">
                {t("Joy is thinking…")}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Bubble({
  from,
  children,
}: {
  from: "ai" | "me";
  children: ReactNode;
}) {
  const me = from === "me";
  return (
    <div
      className="animate-anim-pop-app max-w-[82%]"
      style={{ alignSelf: me ? "flex-end" : "flex-start" }}
    >
      <div
        className="py-[12px] px-[16px] text-[14.5px] leading-[1.5]"
        style={{
          borderRadius: me ? "18px 18px 6px 18px" : "18px 18px 18px 6px",
          background: me ? "var(--coral)" : "var(--surface-2)",
          color: me ? "#fff" : "var(--ink)",
          border: me ? "none" : "1px solid var(--line)",
          boxShadow: "var(--sh-sm)",
        }}
      >
        {children}
      </div>
    </div>
  );
}
function Typing() {
  return (
    <div className="flex gap-[5px] py-[4px] px-[2px]">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: 99,
            background: "var(--ink-3)",
            animation: `float 1s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
function BuildingMap() {
  const t = useT();
  const steps = [
    t("Reading your moods"),
    t("Scanning 240 experiences in Moscow"),
    t("Balancing your week"),
    t("Placing the perfect days"),
  ];
  const [i, setI] = useState(0);
  useEffect(() => {
    const timer = setInterval(
      () => setI((x) => Math.min(x + 1, steps.length - 1)),
      560,
    );
    return () => clearInterval(timer);
  }, []);
  return (
    <div
      className="animate-anim-pop-app bg-surface border border-line rounded-lg"
      style={{
        padding: 20,
        background: "var(--surface-2)",
        alignSelf: "stretch",
      }}
    >
      <div className="flex items-center gap-[10px] mb-[14px]">
        <Icons.sparkle size={20} style={{ color: "var(--coral)" }} />
        <span className="font-display font-bold text-[16px]">
          {t("Composing your Joy Map…")}
        </span>
      </div>
      <div className="flex flex-col gap-[9px]">
        {steps.map((s, k) => (
          <div
            key={k}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13.5,
              fontWeight: 600,
              color: k <= i ? "var(--ink)" : "var(--ink-3)",
              transition: ".3s",
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 99,
                display: "grid",
                placeItems: "center",
                flex: "none",
                background:
                  k < i
                    ? "var(--m-calm)"
                    : k === i
                      ? "var(--coral)"
                      : "var(--line-2)",
                color: "#fff",
              }}
            >
              {k < i ? (
                <Icons.check size={12} />
              ) : k === i ? (
                <span
                  className="w-[6px] h-[6px] rounded-[99px] bg-[#fff]"
                  style={{ animation: "float .8s infinite" }}
                />
              ) : (
                ""
              )}
            </span>
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
