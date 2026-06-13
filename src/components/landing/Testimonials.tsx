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
    <section className="py-[96px]" style={{ paddingTop: 0 }} id="stories">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal className="max-w-[680px] mx-auto mb-[52px] text-center">
          <div className="text-[12.5px] font-extrabold tracking-[0.16em] uppercase text-orange">Loved in the city</div>
          <h2 className="text-[clamp(28px,3.6vw,46px)] leading-[1.04] mt-[14px]">Real weeks, real joy.</h2>
          <p className="text-[17px] text-ink-2 leading-[1.6] mt-[16px]">
            Explorers, partners and teams across Moscow share what a week with
            Joymap feels like.
          </p>
        </Reveal>
        <Reveal className="grid grid-cols-3 gap-[20px] max-[880px]:grid-cols-1">
          {ITEMS.map((it) => (
            <figure
              className="flex flex-col bg-surface border border-line rounded-xl p-[28px] shadow-sm [transition:0.2s] hover:[transform:translateY(-5px)] hover:shadow-lg"
              key={it.name}
            >
              <div className="flex gap-[3px] text-orange text-[15px] mb-[16px]">
                {"★★★★★"}
              </div>
              <blockquote className="text-[16px] text-ink leading-[1.6] flex-1 m-0">
                “{it.quote}”
              </blockquote>
              <figcaption className="flex items-center gap-[12px] mt-[22px]">
                <span
                  className="w-[44px] h-[44px] rounded-pill grid place-items-center text-white font-extrabold font-display text-[15px] flex-none"
                  style={{ background: it.grad }}
                >
                  {initials(it.name)}
                </span>
                <span className="flex flex-col">
                  <b className="text-[14.5px] text-ink font-display font-extrabold">{it.name}</b>
                  <span className="text-[12.5px] text-ink-3 font-semibold">{it.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
