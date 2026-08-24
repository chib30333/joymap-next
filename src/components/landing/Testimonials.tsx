import { Reveal } from "@/components/landing/Reveal";

const ITEMS: {
  quote: string;
  name: string;
  role: string;
  grad: string;
}[] = [
  {
    quote:
      "Joymap turned my chaotic weekends into something I actually look forward to. Every week feels handpicked for my mood.",
    name: "Mira Volkova",
    role: "Designer · Moscow",
    grad: "linear-gradient(150deg,#FF6F8E,#D81E52)",
  },
  {
    quote:
      "I host pottery classes and Joymap keeps every session full. The mood matching brings exactly the right people through my door.",
    name: "Daniil Orlov",
    role: "Studio owner · Partner",
    grad: "linear-gradient(150deg,#6FD4C4,#2E8C80)",
  },
  {
    quote:
      "We gave the whole team monthly Joymap credits. Morale is up, and I haven't touched a single spreadsheet to make it happen.",
    name: "Anna Petrova",
    role: "People lead · Yandex",
    grad: "linear-gradient(150deg,#9E7BF6,#5B33C9)",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonials() {
  return (
    <section className="pb-24 max-[760px]:pb-16 pt-0" id="stories">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <Reveal className="max-w-[680px] mx-auto mb-12 text-center">
          <div className="text-xs font-extrabold tracking-widest uppercase text-orange">Loved in the city</div>
          <h2 className="text-[clamp(28px,3.6vw,46px)] mt-3.5">Real weeks, real joy.</h2>
          <p className="text-4 text-ink-2 leading-normal mt-4">
            Explorers, partners and teams across Moscow share what a week with
            Joymap feels like.
          </p>
        </Reveal>
        <Reveal className="grid grid-cols-3 gap-5 max-[880px]:grid-cols-1">
          {ITEMS.map((it) => (
            <figure
              className="flex flex-col bg-surface border border-line rounded-xl p-7 shadow-sm duration-200 hover:[transform:translateY(-5px)] hover:shadow-lg"
              key={it.name}
            >
              <div className="flex gap-1 text-orange text-base mb-4">
                {"★★★★★"}
              </div>
              <blockquote className="text-base text-ink leading-normal flex-1 m-0">
                “{it.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-3 mt-5">
                <span
                  className="w-11 h-11 rounded-pill grid place-items-center text-white font-extrabold font-display text-base flex-none [background:var(--av-bg)]"
                  style={{ "--av-bg": it.grad } as React.CSSProperties}
                >
                  {initials(it.name)}
                </span>
                <span className="flex flex-col">
                  <b className="text-sm text-ink font-display font-extrabold">{it.name}</b>
                  <span className="text-xs text-ink-3 font-semibold">{it.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
