import type { ReactNode } from "react";
import Image from "next/image";
import { Reveal } from "@/components/landing/Reveal";
import { Button } from "@/components/ui";
import { Header } from "@/components/landing/Header";
import { HeroSearch } from "@/components/landing/HeroSearch";
import { Footer } from "@/components/landing/Footer";
import { Testimonials } from "@/components/landing/Testimonials";

/* -------------------------------------------------------------------------- */
/* Content                                                                    */
/* -------------------------------------------------------------------------- */

type Stat = { count: string; label: string };
type Mood = { bg: string; title: string; sub: string };
type Feature = { icon: string; text: string };

const STATS: Stat[] = [
  { count: "240+", label: "experiences in the city" },
  { count: "6", label: "moods, one Joy Map" },
  { count: "499 ₽", label: "/ month, cancel anytime" },
];

const MOODS: Mood[] = [
  { bg: "[background:linear-gradient(150deg,#6FD4C4,#2E8C80)]", title: "Calm", sub: "Slow down & restore" },
  { bg: "[background:linear-gradient(150deg,#FBC15B,#E08B12)]", title: "Joy", sub: "Light, playful fun" },
  { bg: "[background:linear-gradient(150deg,#FF6F8E,#D81E52)]", title: "Energy", sub: "Move & feel alive" },
  { bg: "[background:linear-gradient(150deg,#7E8BE6,#3F49B0)]", title: "Focus", sub: "Learn & sharpen" },
  { bg: "[background:linear-gradient(150deg,#9E7BF6,#5B33C9)]", title: "Adventure", sub: "Thrill & the new" },
  { bg: "[background:linear-gradient(150deg,#FF9A57,#E36A1E)]", title: "Connection", sub: "Together with others" },
];

const FEATURES: Feature[] = [
  { icon: "✦", text: "AI Joy Map tuned to your moods" },
  { icon: "✓", text: "Instant booking with QR tickets" },
  { icon: "♥", text: "Free cancellation up to 12h before" },
];

/* -------------------------------------------------------------------------- */
/* Primitives                                                                 */
/* -------------------------------------------------------------------------- */

function Container({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 ${className}`.trimEnd()}>
      {children}
    </div>
  );
}

/** Small uppercase orange kicker used above every section heading. */
function Eyebrow({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`font-extrabold tracking-widest uppercase text-orange ${className}`.trimEnd()}>
      {children}
    </div>
  );
}

function StatCard({ count, label }: Stat) {
  return (
    <div>
      <div className="font-display font-extrabold text-3xl text-white leading-none">{count}</div>
      <div className="text-sm text-white/70 font-semibold mt-2">{label}</div>
    </div>
  );
}

function MoodCard({ bg, title, sub }: Mood) {
  return (
    <div
      className={`rounded-lg p-5 text-white min-h-[150px] flex flex-col justify-end relative overflow-hidden duration-200 cursor-default hover:[transform:translateY(-5px)] hover:shadow-lg ${bg}`}
    >
      <span className="w-3 h-3 rounded-pill bg-white/90 absolute top-4 left-4" />
      <h4 className="text-lg text-white">{title}</h4>
      <span className="text-xs text-white/85 font-semibold mt-1">{sub}</span>
    </div>
  );
}

function FeatureItem({ icon, text }: Feature) {
  return (
    <li className="flex gap-4 items-start list-none text-base font-semibold text-ink">
      <span className="w-8 h-8 rounded-md flex-none grid place-items-center bg-coral-soft text-coral-deep">
        {icon}
      </span>
      {text}
    </li>
  );
}

/** Full-bleed promo band with a background image, gradient scrim and copy. */
function PromoBanner({
  id,
  image,
  position,
  gradient,
  align = "",
  eyebrow,
  title,
  body,
  children,
}: {
  id: string;
  /** Background-image utility class for the section (a full literal so the JIT keeps it). */
  image: string;
  /** Background focal-point utility class. */
  position: string;
  /** Background gradient scrim utility class. */
  gradient: string;
  /** Extra alignment classes for the copy column. */
  align?: string;
  eyebrow: string;
  title: string;
  body: string;
  children: ReactNode;
}) {
  return (
    <section className="pb-24 max-[760px]:pb-16" id={id}>
      <Container>
        <Reveal className="relative overflow-hidden rounded-xl min-h-[420px] max-[760px]:min-h-[340px] flex items-center text-white">
          <div className={`absolute inset-0 bg-cover ${position} ${image}`} />
          <div className={`absolute inset-0 ${gradient}`} />
          <div className={`relative p-14 max-[760px]:p-7 max-w-2xl ${align}`.trimEnd()}>
            <Eyebrow className="text-xs">{eyebrow}</Eyebrow>
            <h2 className="text-[clamp(28px,3.4vw,44px)] text-white">{title}</h2>
            <p className="text-base text-white/85 leading-normal mt-4 mb-7">{body}</p>
            {children}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Sections                                                                   */
/* -------------------------------------------------------------------------- */

function Hero() {
  return (
    <section className="relative min-h-[88svh] flex items-center overflow-hidden text-white">
      <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-[center_40%]" />
      {/* The scrim is centred on the copy rather than weighted to one side: a
          left-heavy gradient would leave the middle of the headline sitting on
          the bright part of the photo. */}
      <div className="absolute inset-0 [background:radial-gradient(115%_85%_at_50%_50%,rgba(20,8,10,0.7)_0%,rgba(20,8,10,0.9)_100%),linear-gradient(0deg,rgba(20,8,10,0.7)_0%,transparent_38%)]" />
      <Container className="relative py-14 max-[760px]:py-10 w-full text-center">
        <Eyebrow className="text-sm mb-4">Moscow · marketplace of real-life experiences</Eyebrow>
        <h1 className="text-[clamp(38px,6vw,76px)] text-white">
          Your week,{" "}
          <span className="text-orange">
            mapped <br className="max-[760px]:hidden" /> to your mood.
          </span>
        </h1>
        <p className="text-[clamp(16px,1.7vw,20px)] text-white/85 max-w-[52ch] mx-auto mt-5">
          From sunrise rooftop yoga to neon karting, Joymap&apos;s AI reads how you want to
          feel and books the experiences that get you there. <br className="max-[760px]:hidden" />
          One subscription, infinite joy.
        </p>
        <HeroSearch />
        <div className="flex gap-3 flex-wrap justify-center mt-8 max-[760px]:mt-7">
          <Button ctx="lp" variant="primary" href="/auth">
            Start exploring →
          </Button>
          <Button ctx="lp" variant="glass" href="#experiences">
            See how it works
          </Button>
        </div>
        <div className="flex gap-x-10 gap-y-6 mt-12 max-[760px]:mt-9 flex-wrap justify-center">
          {STATS.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function MoodPicker() {
  return (
    <section className="py-24 max-[760px]:py-16" id="experiences">
      <Container>
        <Reveal className="max-w-2xl mx-auto mb-12 text-center">
          <Eyebrow className="text-xs">Discover by feeling</Eyebrow>
          <h2 className="text-[clamp(28px,3.6vw,46px)] mt-4">Pick a mood. We&apos;ll map the week.</h2>
          <p className="text-base text-ink-2 leading-normal mt-4">
            Tell our AI how you want to feel and it composes a personal weekly plan —
            balanced, surprising, and entirely yours.
          </p>
        </Reveal>
        <Reveal className="grid grid-cols-6 gap-3.5 max-[880px]:grid-cols-3 max-[480px]:grid-cols-2">
          {MOODS.map((mood) => (
            <MoodCard key={mood.title} {...mood} />
          ))}
        </Reveal>
      </Container>
    </section>
  );
}

function Explorers() {
  return (
    <section className="pb-24 max-[760px]:pb-16">
      <Container>
        <Reveal className="grid grid-cols-2 gap-14 items-center max-[880px]:grid-cols-1 max-[880px]:gap-8">
          <div className="rounded-xl overflow-hidden aspect-[4/3] shadow-lg relative">
            <Image
              className="object-cover"
              src="/images/hero-bg.jpg"
              alt="Experiences across the city"
              fill
              sizes="(max-width: 880px) 100vw, 50vw"
            />
          </div>
          <div>
            <Eyebrow className="text-xs">For explorers</Eyebrow>
            <h2 className="text-[clamp(26px,3.2vw,40px)] mt-4 mb-4">A new thing to love, every week.</h2>
            <p className="text-base text-ink-2 leading-normal mb-4">
              Joymap turns &quot;what should we do?&quot; into a beautiful weekly Joy Map —
              booked, balanced and ready. Swap anything in a tap; we keep the rhythm.
            </p>
            <ul className="flex flex-col gap-4 mt-5 mb-7 p-0">
              {FEATURES.map((feature) => (
                <FeatureItem key={feature.text} {...feature} />
              ))}
            </ul>
            <Button ctx="lp" variant="primary" href="/auth">
              Build my Joy Map →
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="text-center py-24 max-[760px]:py-16">
      <Container>
        <Reveal>
          <Eyebrow className="text-xs mb-3.5">Live now in Moscow</Eyebrow>
          <h2 className="text-[clamp(30px,4vw,52px)] max-w-[18ch] mx-auto mb-5">
            Turn this week into a week worth remembering.
          </h2>
          <p className="text-lg text-ink-2 max-w-[52ch] mx-auto mb-8">
            Join thousands discovering real-life joy, one perfectly-timed experience at a time.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button ctx="lp" variant="primary" href="/auth">
              Get started — 499 ₽/mo
            </Button>
            <Button ctx="lp" variant="ghost" href="#partners">
              I&apos;m a provider
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function Landing() {
  return (
    <div>
      <Header />

      <Hero />
      <MoodPicker />
      <Explorers />

      <PromoBanner
        id="partners"
        image="bg-[url('/images/corporate-team-strategy.jpg')]"
        position="bg-[center_35%]"
        gradient="[background:linear-gradient(90deg,rgba(20,8,10,.9)_0%,rgba(28,10,12,.7)_50%,rgba(28,10,12,.2)_100%)]"
        eyebrow="For service providers"
        title="Fill every session. Grow your studio."
        body="List your experiences, manage your calendar with drag-and-drop scheduling, and get matched to customers by mood. Real-time bookings, analytics and fast payouts — all in one partner dashboard."
      >
        <div className="flex gap-3 flex-wrap">
          <Button ctx="lp" variant="light" href="/auth">
            Become a partner
          </Button>
          <Button ctx="lp" variant="glass" href="/provider">
            Preview the dashboard
          </Button>
        </div>
      </PromoBanner>

      <PromoBanner
        id="corporate"
        image="bg-[url('/images/corporate-hero.jpg')]"
        position="bg-[center_25%]"
        gradient="[background:linear-gradient(90deg,rgba(40,9,12,.55)_0%,rgba(40,9,12,.7)_55%,rgba(28,6,8,.94)_100%)]"
        align="ms-auto text-right"
        eyebrow="For teams"
        title="Wellbeing your team will actually use."
        body="Sponsor monthly experience credits, run team-building events, and gift the joy — with seats, budgets and invoices handled in one place. Happier teams, zero admin."
      >
        <Button
          ctx="lp"
          variant="light"
          href="/auth"
          className="[background:var(--orange)] text-[#3a0a0d]"
        >
          Explore Joymap for Teams
        </Button>
      </PromoBanner>

      <Testimonials />

      <FinalCta />

      <Footer />
    </div>
  );
}
