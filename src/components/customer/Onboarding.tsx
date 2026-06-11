"use client";
// Onboarding — 1:1 port of onboarding.jsx (AI conversational Joy Map builder).
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";
import { rpc } from "@/lib/client";
import { MOODS, MOOD_ORDER, Btn, MoodChip } from "./primitives";
import { Textarea } from "@/components/ui";

export function Onboarding() {
  const router = useRouter();
  const [msgs, setMsgs] = useState<{ from: "ai" | "me"; node: ReactNode }[]>([]);
  const [step, setStep] = useState(0);
  const [typing, setTyping] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [text, setText] = useState("");
  const [building, setBuilding] = useState(false);
  const scroll = useRef<HTMLDivElement>(null);

  const push = (from: "ai" | "me", node: ReactNode) => setMsgs((m) => [...m, { from, node }]);
  const ai = (node: ReactNode, delay = 650) => { setTyping(true); return new Promise<void>((r) => setTimeout(() => { setTyping(false); push("ai", node); r(); }, delay)); };

  useEffect(() => {
    (async () => {
      await ai(<>Hi, I&apos;m <b>Joy</b> — your guide. ✦ Over a minute I&apos;ll learn your vibe and build a personal weekly <b>Joy Map</b>.</>, 500);
      await ai(<>First — how are you hoping to <b>feel</b> more often? Pick a few.</>, 800);
      setStep(1);
    })();
  }, []);
  useEffect(() => { scroll.current?.scrollTo({ top: 9e9, behavior: "smooth" }); }, [msgs, typing]);

  const complete = (moods: string[]) => rpc("generateJoyMap", { moods }).then(() => router.refresh());
  const toggleMood = (k: string) => setPicked((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]));

  const submitMoods = async () => {
    if (picked.length === 0) return;
    push("me", <div className="flex gap-[7px] flex-wrap">{picked.map((k) => <MoodChip key={k} mood={k} active />)}</div>);
    setStep(0);
    await ai(<>Lovely — more <b>{picked.map((k) => MOODS[k].label).join(", ").toLowerCase()}</b>. Got it.</>, 600);
    await ai(<>Now tell me in your own words. What are you in the mood for this week?</>, 900);
    setStep(2);
  };

  const submitText = async () => {
    const tx = text.trim() || "Something fun and a little new, mostly evenings.";
    push("me", <span>{tx}</span>); setText(""); setStep(0);
    await ai(<>Perfect. I&apos;m reading between the lines… 🔎</>, 600);
    setBuilding(true);
    await new Promise((r) => setTimeout(r, 2400));
    complete(picked.length ? picked : ["calm", "joy", "focus"]);
  };

  return (
    <div style={{ minHeight: "calc(100vh - 130px)", display: "grid", placeItems: "center", padding: "28px 16px", background: "radial-gradient(1000px 560px at 82% -12%, color-mix(in srgb,var(--red) 24%,transparent), transparent 60%), radial-gradient(820px 480px at -8% 112%, color-mix(in srgb,var(--orange) 16%,transparent), transparent 56%), var(--bg)" }}>
      <div className="card anim-pop" style={{ width: "100%", maxWidth: 560, boxShadow: "var(--sh-lg)", overflow: "hidden", display: "flex", flexDirection: "column", height: "min(86vh,720px)" }}>
        <div className="flex items-center gap-[12px] py-[18px] px-[22px] border-b border-line">
          <div className="relative">
            <div className="avatar" style={{ background: "linear-gradient(140deg,var(--orange),var(--red))", animation: "float 4s ease-in-out infinite" }}><Icons.sparkle size={20} /></div>
            <span className="absolute bottom-0 right-0 w-[11px] h-[11px] rounded-[99px] bg-[var(--m-calm)]" style={{ border: "2px solid var(--surface)" }} />
          </div>
          <div><div className="font-display font-extrabold text-[16px]">Joy</div>
            <div className="text-[12.5px] text-ink-3 font-semibold">Building your map · step {Math.max(1, Math.min(step, 2))} of 2</div></div>
          <button className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }} onClick={() => complete(["calm", "joy", "focus"])}>Skip</button>
        </div>

        <div ref={scroll} className="no-scrollbar flex-1 p-[22px] flex flex-col gap-[14px]" style={{ overflow: "auto" }}>
          {msgs.map((m, i) => <Bubble key={i} from={m.from}>{m.node}</Bubble>)}
          {typing && <Bubble from="ai"><Typing /></Bubble>}
          {building && <BuildingMap />}
        </div>

        {!building && (
          <div className="border-t border-line py-[16px] px-[18px] bg-surface-2">
            {step === 1 && (
              <>
                <div className="flex flex-wrap gap-[8px] mb-[14px]">
                  {MOOD_ORDER.map((k) => <MoodChip key={k} mood={k} active={picked.includes(k)} onClick={() => toggleMood(k)} />)}
                </div>
                <Btn block size="lg" onClick={submitMoods} disabled={!picked.length} iconR={<Icons.arrowR size={19} />} style={!picked.length ? { opacity: 0.5, boxShadow: "none" } : undefined}>
                  {picked.length ? `Continue with ${picked.length} mood${picked.length > 1 ? "s" : ""}` : "Pick at least one"}
                </Btn>
              </>
            )}
            {step === 2 && (
              <div className="flex gap-[10px] items-end">
                <Textarea rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitText(); } }} placeholder="e.g. A fun date idea under 3000 ₽…" style={{ resize: "none", minHeight: 48 }} />
                <button className="icon-btn" style={{ background: "var(--coral)", color: "#fff", border: "none", flex: "none", width: 48, height: 48, boxShadow: "var(--sh-coral)" }} onClick={submitText}><Icons.send size={20} /></button>
              </div>
            )}
            {step === 2 && (
              <div className="flex gap-[7px] flex-wrap mt-[12px]">
                {["Fun date idea", "Something calm after work", "A thrill this weekend", "Meet new people"].map((s) => <button key={s} className="chip" onClick={() => setText(s)}>{s}</button>)}
              </div>
            )}
            {step === 0 && <div className="text-center text-ink-3 text-[13px] font-semibold py-[6px] px-0">Joy is thinking…</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function Bubble({ from, children }: { from: "ai" | "me"; children: ReactNode }) {
  const me = from === "me";
  return (
    <div className="anim-pop max-w-[82%]" style={{ alignSelf: me ? "flex-end" : "flex-start" }}>
      <div className="py-[12px] px-[16px] text-[14.5px] leading-[1.5]" style={{ borderRadius: me ? "18px 18px 6px 18px" : "18px 18px 18px 6px", background: me ? "var(--coral)" : "var(--surface-2)", color: me ? "#fff" : "var(--ink)", border: me ? "none" : "1px solid var(--line)", boxShadow: "var(--sh-sm)" }}>{children}</div>
    </div>
  );
}
function Typing() {
  return <div className="flex gap-[5px] py-[4px] px-[2px]">{[0, 1, 2].map((i) => <span key={i} style={{ width: 7, height: 7, borderRadius: 99, background: "var(--ink-3)", animation: `float 1s ease-in-out ${i * 0.15}s infinite` }} />)}</div>;
}
function BuildingMap() {
  const steps = ["Reading your moods", "Scanning 240 experiences in Moscow", "Balancing your week", "Placing the perfect days"];
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), 560); return () => clearInterval(t); }, []);
  return (
    <div className="anim-pop card" style={{ padding: 20, background: "var(--surface-2)", alignSelf: "stretch" }}>
      <div className="flex items-center gap-[10px] mb-[14px]">
        <Icons.sparkle size={20} style={{ color: "var(--coral)" }} />
        <span className="font-display font-bold text-[16px]">Composing your Joy Map…</span>
      </div>
      <div className="flex flex-col gap-[9px]">
        {steps.map((s, k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 600, color: k <= i ? "var(--ink)" : "var(--ink-3)", transition: ".3s" }}>
            <span style={{ width: 18, height: 18, borderRadius: 99, display: "grid", placeItems: "center", flex: "none", background: k < i ? "var(--m-calm)" : k === i ? "var(--coral)" : "var(--line-2)", color: "#fff" }}>
              {k < i ? <Icons.check size={12} /> : k === i ? <span className="w-[6px] h-[6px] rounded-[99px] bg-[#fff]" style={{ animation: "float .8s infinite" }} /> : ""}
            </span>{s}
          </div>
        ))}
      </div>
    </div>
  );
}
