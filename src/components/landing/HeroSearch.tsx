"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icons } from "@/components/Icons";

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

/** One rail per array: the rows drift in opposite directions under the field. */
const SUGGESTIONS: string[][] = [
  [
    "Rooftop yoga at sunrise",
    "Something calm after work",
    "Wow me tonight",
    "Date night under 3000 ₽",
    "Neon karting",
    "A slow Sunday",
    "Learn something new",
  ],
  [
    "Team offsite for 20",
    "Live jazz nearby",
    "Weekend adventure",
    "Family day out",
    "Spa & banya",
    "Cooking class",
    "Golden hour sailing",
  ],
];

/** The rails read left-to-right, so the ghost typing walks them in that order. */
const IDEAS: string[] = SUGGESTIONS.flat();

const PLACEHOLDER = "Search or ask the AI assistant…";

/** Ghost-typing rhythm, in ms. */
const TYPE = {
  /** Per character while writing a suggestion. */
  in: 46,
  /** Per character while erasing it again. */
  out: 24,
  /** How long a finished suggestion stays up. */
  hold: 1900,
  /** Empty beat before the next suggestion starts. */
  gap: 600,
  /** Per character when the sparkle drops an idea into the field. */
  fill: 32,
} as const;

/** Read at call time, not render time: the server has no matchMedia. */
const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

/** Round action button inside the field (the sparkle and the submit magnifier). */
function FieldButton({
  label,
  tone,
  onClick,
  type = "button",
  children,
}: {
  label: string;
  /** `ai` is the glass + orange sparkle, `go` the solid coral submit. */
  tone: "ai" | "go";
  onClick?: () => void;
  type?: "button" | "submit";
  children: React.ReactNode;
}) {
  const skin =
    tone === "ai"
      ? "bg-white/[0.16] border border-white/25 text-orange hover:bg-white/25"
      : "bg-coral text-white border border-transparent shadow-coral hover:bg-coral-deep";
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`w-10 h-10 sm:w-11 sm:h-11 flex-none rounded-pill grid place-items-center cursor-pointer [transition:0.16s] hover:[transform:translateY(-1px)] active:[transform:scale(0.96)] ${skin}`}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Hero search: the marketplace's front door. Typing (or picking a suggestion)
 * drops the visitor straight into Discover with the query applied — signed-out
 * visitors meet the auth wall there, the same funnel the hero CTAs use.
 *
 * Everything that moves here is idle-state only and stops the moment the
 * visitor engages: the ghost text clears on focus, the rails freeze while the
 * field is in use, and `prefers-reduced-motion` turns the lot off.
 */
export function HeroSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  // Cursor into IDEAS, shared by the ghost typing and the sparkle button, so
  // the two never offer the same idea twice in a row. Stepping through in order
  // also keeps the first render identical on the server and the client.
  const [idea, setIdea] = useState(0);
  const [ghost, setGhost] = useState("");
  /** Suggestion the sparkle is currently typing into the field. */
  const [fill, setFill] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  const idle = !query && !focused && fill === null;

  // Ghost typing: write a suggestion, hold it, erase it, move on. Only while
  // the field is untouched — it must never compete with real input.
  useEffect(() => {
    if (!idle || reducedMotion()) {
      setGhost("");
      return;
    }
    const word = IDEAS[idea % IDEAS.length];
    let timer: ReturnType<typeof setTimeout>;
    const run = (n: number, phase: "in" | "hold" | "out") => {
      setGhost(word.slice(0, n));
      if (phase === "in") {
        timer = setTimeout(
          () => run(n + 1, n + 1 < word.length ? "in" : "hold"),
          TYPE.in,
        );
      } else if (phase === "hold") {
        timer = setTimeout(() => run(word.length - 1, "out"), TYPE.hold);
      } else {
        timer =
          n > 0
            ? setTimeout(() => run(n - 1, "out"), TYPE.out)
            : setTimeout(() => setIdea((k) => k + 1), TYPE.gap);
      }
    };
    run(0, "in");
    return () => clearTimeout(timer);
  }, [idle, idea]);

  // The sparkle types its idea in rather than pasting it, so the field looks
  // answered rather than filled. Any real keystroke cancels it (see onChange).
  useEffect(() => {
    if (fill === null) return;
    if (reducedMotion()) {
      setQuery(fill);
      setFill(null);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const step = (n: number) => {
      setQuery(fill.slice(0, n));
      timer = setTimeout(
        () => (n < fill.length ? step(n + 1) : setFill(null)),
        TYPE.fill,
      );
    };
    step(1);
    return () => clearTimeout(timer);
  }, [fill]);

  const go = (q: string) => {
    const trimmed = q.trim();
    router.push(`/discover${trimmed ? `?q=${encodeURIComponent(trimmed)}` : ""}`);
  };

  const inspire = () => {
    setFill(IDEAS[idea % IDEAS.length]);
    setIdea((k) => k + 1);
    setSpinning(true);
    inputRef.current?.focus();
  };

  return (
    <div className="mt-8 max-[760px]:mt-7 w-full max-w-[640px] mx-auto">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(query);
        }}
        className="group relative animate-anim-slideup [animation-delay:120ms] motion-reduce:animate-none"
      >
        {/* AI halo: a conic gradient whose angle sweeps (see the --jm-halo
            @property). Parked at opacity 0 and paused until the field is
            hovered or focused, so an idle hero costs nothing to composite. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-pill opacity-0 blur-[16px] [background:conic-gradient(from_var(--jm-halo),var(--coral),var(--orange),var(--coral-deep),var(--coral))] [transition:opacity_.4s] animate-anim-halo [animation-play-state:paused] group-hover:opacity-40 group-hover:[animation-play-state:running] group-focus-within:opacity-75 group-focus-within:[animation-play-state:running] motion-reduce:animate-none"
        />
        <div className="relative flex items-center gap-2 rounded-pill p-1.5 ps-4 sm:ps-5 bg-white/[0.14] border border-white/25 [backdrop-filter:blur(10px)] [-webkit-backdrop-filter:blur(10px)] [transition:0.25s] group-focus-within:bg-white/20 group-focus-within:border-white/45">
          <div className="relative flex-1 min-w-0">
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setFill(null);
                setQuery(e.target.value);
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              aria-label={PLACEHOLDER}
              placeholder={PLACEHOLDER}
              enterKeyHint="search"
              autoComplete="off"
              className={`w-full bg-transparent border-0 outline-none py-3 text-start text-base text-white ${
                ghost ? "placeholder:text-transparent" : "placeholder:text-white/65"
              }`}
            />
            {/* The ghost line replaces the placeholder while it runs, so the
                two never stack on top of each other. */}
            {ghost && (
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap text-base text-white/65"
              >
                <span className="min-w-0 truncate">{ghost}</span>
                <span className="w-px h-[1.05em] ms-0.5 flex-none bg-white/85 animate-anim-caret motion-reduce:animate-none" />
              </span>
            )}
          </div>
          <FieldButton label="Suggest an idea" tone="ai" onClick={inspire}>
            <span
              className={spinning ? "animate-anim-sparkle" : undefined}
              onAnimationEnd={() => setSpinning(false)}
            >
              <Icons.sparkle size={19} />
            </span>
          </FieldButton>
          <FieldButton label="Search" tone="go" type="submit">
            <Icons.search size={19} />
          </FieldButton>
        </div>
      </form>

      {/* Suggestion rails. Each row is duplicated so the loop is seamless, and
          the copy is hidden from assistive tech and the tab order. The rails
          pause on hover/focus and while the field is in use, and with reduced
          motion they stop moving and become a plain horizontal scroller. */}
      <div className="mt-4 flex flex-col gap-2.5">
        {SUGGESTIONS.map((row, i) => (
          <div
            key={i}
            className={`overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)] motion-reduce:overflow-x-auto animate-anim-slideup motion-reduce:animate-none ${
              i % 2 ? "[animation-delay:300ms]" : "[animation-delay:210ms]"
            }`}
          >
            <div
              className={`flex w-max hover:[animation-play-state:paused] focus-within:[animation-play-state:paused] motion-reduce:animate-none ${
                i % 2 ? "animate-anim-marquee-rev" : "animate-anim-marquee"
              } ${focused ? "[animation-play-state:paused]" : ""}`}
            >
              {[...row, ...row].map((s, j) => {
                const copy = j >= row.length;
                return (
                  <button
                    key={`${s}-${j}`}
                    type="button"
                    aria-hidden={copy}
                    tabIndex={copy ? -1 : 0}
                    onClick={() => go(s)}
                    className="inline-flex flex-none items-center me-2 rounded-pill px-4 py-2 text-sm font-bold whitespace-nowrap bg-coral text-white cursor-pointer [transition:0.16s] hover:bg-coral-deep hover:[transform:translateY(-2px)] hover:shadow-coral active:[transform:translateY(0)_scale(0.98)]"
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
