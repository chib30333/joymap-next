"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { MOODS, MOOD_ORDER, MoodChip } from "./primitives";
import { Button, Textarea } from "@/components/ui";
import { useT } from "@/components/Language";

type Suggestion = { key: string };

const SUGGESTIONS: Suggestion[] = [
  { key: "Fun date idea" },
  { key: "Something calm after work" },
  { key: "A thrill this weekend" },
  { key: "Meet new people" },
];

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
    // Intro sequence must run exactly once on mount; re-running would duplicate messages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    scroll.current?.scrollTo({ top: 9e9, behavior: "smooth" });
  }, [msgs, typing]);

  // Drop the `?new=` that opened this chat on the way out, otherwise finishing
  // it would just land back here and start the conversation over.
  const complete = (moods: string[]) =>
    rpc("generateJoyMap", { moods }).then(() => {
      router.replace("/joymap");
      router.refresh();
    });
  const toggleMood = (k: string) =>
    setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const submitMoods = async () => {
    if (picked.length === 0) return;
    push(
      "me",
      <div className="flex gap-2 flex-wrap">
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
      className="min-h-[calc(100dvh-130px)] grid place-items-center px-4 py-7 [background:radial-gradient(1000px_560px_at_82%_-12%,color-mix(in_srgb,var(--red)_24%,transparent),transparent_60%),radial-gradient(820px_480px_at_-8%_112%,color-mix(in_srgb,var(--orange)_16%,transparent),transparent_56%),var(--bg)]"
    >
      <div
        className="bg-surface border border-line rounded-lg animate-anim-pop-app w-full max-w-[560px] [box-shadow:var(--sh-lg)] overflow-hidden flex flex-col h-[min(86dvh,720px)]"
      >
        <div className="flex items-center gap-3 py-5 px-6 border-b border-line">
          <div className="relative">
            <div
              className="w-10 h-10 rounded-pill text-white grid place-items-center font-extrabold font-display flex-none bg-[linear-gradient(140deg,var(--orange),var(--red))] [animation:float_4s_ease-in-out_infinite]"
            >
              <Icons.sparkle size={20} />
            </div>
            <span
              className="absolute bottom-0 right-0 w-3 h-3 rounded-pill bg-[var(--m-calm)] [border:2px_solid_var(--surface)]"
            />
          </div>
          <div>
            <div className="font-display font-extrabold text-base">{t("Joy")}</div>
            <div className="text-xs text-ink-3 font-semibold">
              {t("Building your map · step")} {Math.max(1, Math.min(step, 2))} {t("of 2")}
            </div>
          </div>
          <Button
            ctx="app"
            variant="ghost"
            size="sm"
            className="ms-auto"
            onClick={() => complete([])}
          >
            {t("Skip")}
          </Button>
        </div>

        <div
          ref={scroll}
          className="[scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 p-6 flex flex-col gap-3.5 overflow-auto"
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
          <div className="border-t border-line py-4 px-5 bg-surface-2">
            {step === 1 && (
              <>
                <div className="flex flex-wrap gap-2 mb-3.5">
                  {MOOD_ORDER.map((k) => (
                    <MoodChip
                      key={k}
                      mood={k}
                      active={picked.includes(k)}
                      onClick={() => toggleMood(k)}
                    />
                  ))}
                </div>
                <Button
                  ctx="app"
                  variant="primary"
                  block
                  size="lg"
                  onClick={submitMoods}
                  disabled={!picked.length}
                  iconR={<Icons.arrowR size={19} />}
                  className={
                    !picked.length ? "opacity-50 [box-shadow:none]" : undefined
                  }
                >
                  {picked.length
                    ? `${t("Continue with")} ${picked.length} ${picked.length > 1 ? t("moods") : t("mood")}`
                    : t("Pick at least one")}
                </Button>
              </>
            )}
            {step === 2 && (
              <div className="flex gap-2.5 items-end">
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
                  className="resize-none min-h-12"
                />
                <button
                  className="rounded-pill grid place-items-center duration-150 relative cursor-pointer bg-[var(--coral)] text-white border-none flex-none w-12 h-12"
                  onClick={submitText}
                >
                  <Icons.send size={20} />
                </button>
              </div>
            )}
            {step === 2 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {SUGGESTIONS.map(({ key }) => (
                  <button key={key} className="inline-flex items-center gap-2 py-2 px-3.5 rounded-pill text-sm font-semibold border border-line-2 bg-surface text-ink-2 cursor-pointer duration-[140ms] whitespace-nowrap hover:border-ink-3 hover:text-ink" onClick={() => setText(t(key))}>
                    {t(key)}
                  </button>
                ))}
              </div>
            )}
            {step === 0 && (
              <div className="text-center text-ink-3 text-sm font-semibold py-1.5 px-0">
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
      className={`animate-anim-pop-app max-w-[82%] ${me ? "self-end" : "self-start"}`}
    >
      <div
        className={`py-3 px-4 text-sm leading-normal shadow-sm ${
          me
            ? "[border-radius:18px_18px_6px_18px] bg-coral text-white border-none"
            : "[border-radius:18px_18px_18px_6px] bg-surface-2 text-ink border border-line"
        }`}
      >
        {children}
      </div>
    </div>
  );
}
function Typing() {
  return (
    <div className="flex gap-1.5 py-1 px-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-pill bg-[var(--ink-3)] [animation:var(--anim)]"
          style={
            { "--anim": `float 1s ease-in-out ${i * 0.15}s infinite` } as React.CSSProperties
          }
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
  }, [steps.length]);
  return (
    <div
      className="animate-anim-pop-app border border-line rounded-lg p-5 bg-surface-2 self-stretch"
    >
      <div className="flex items-center gap-2.5 mb-3.5">
        <Icons.sparkle size={20} className="text-[var(--coral)]" />
        <span className="font-display font-bold text-base">
          {t("Composing your Joy Map…")}
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        {steps.map((s, k) => (
          <div
            key={k}
            className={`flex items-center gap-2.5 text-sm font-semibold duration-300 ${
              k <= i ? "text-ink" : "text-ink-3"
            }`}
          >
            <span
              className={`w-5 h-5 rounded-pill grid place-items-center flex-none text-white ${
                k < i ? "bg-m-calm" : k === i ? "bg-coral" : "bg-line-2"
              }`}
            >
              {k < i ? (
                <Icons.check size={12} />
              ) : k === i ? (
                <span
                  className="w-1.5 h-1.5 rounded-pill bg-white [animation:float_.8s_infinite]"
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
