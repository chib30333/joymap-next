import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import { btnCls } from "@/lib/btn";
import Logo from "@/components/landing/Logo";

export default function Landing() {
  return (
    <div className="lp">
      <header className="sticky top-0 z-50 bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] backdrop-blur-[16px] border-b border-line">
        <div className="max-w-[1200px] mx-auto px-[28px] flex items-center gap-[26px] h-[68px]">
          <Link className="flex items-center gap-[9px]" href="/">
            <Logo />
            <b className="font-display font-extrabold text-[22px] tracking-[-0.03em]">joymap</b>
            <span className="live">
              <i />
              Live now!
            </span>
          </Link>
          <nav className="flex gap-6 ms-2 max-[760px]:hidden">
            <Link className="font-semibold text-base text-ink-2 [transition:0.14s] hover:text-coral-deep" href="#experiences">Experiences</Link>
            <Link className="font-semibold text-base text-ink-2 [transition:0.14s] hover:text-coral-deep" href="#partners">For partners</Link>
            <Link className="font-semibold text-base text-ink-2 [transition:0.14s] hover:text-coral-deep" href="#corporate">Corporate</Link>
          </nav>
          <div className="flex-1" />
          <Link
            className={btnCls("lp", "ghost")}
            href="/auth"
            style={{ padding: "11px 20px", fontSize: 14 }}
          >
            Sign in
          </Link>
          <Link
            className={btnCls("lp", "primary")}
            href="/auth"
            style={{ padding: "12px 22px", fontSize: 14 }}
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="relative min-h-[88vh] flex items-center overflow-hidden text-white">
        <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-[center_40%]" />
        <div className="absolute inset-0 [background:linear-gradient(95deg,rgba(20,8,10,0.86)_0%,rgba(28,10,12,0.66)_42%,rgba(28,10,12,0.28)_100%),linear-gradient(0deg,rgba(20,8,10,0.7)_0%,transparent_38%)]" />
        <div className="relative max-w-[1200px] mx-auto px-[28px] py-[60px] w-full">
          <div
            className="text-sm font-extrabold tracking-[0.16em] uppercase text-orange"
            style={{ color: "var(--orange)", marginBottom: 18 }}
          >
            Moscow · marketplace of real-life experiences
          </div>
          <h1 className="text-[clamp(38px,6vw,76px)] leading-[0.98] tracking-[-0.02em] text-white max-w-[15ch]">
            Your week, <span className="text-orange">mapped to your mood.</span>
          </h1>
          <p className="text-[clamp(16px,1.7vw,20px)] leading-[1.55] text-white/[0.86] max-w-[46ch] mt-[22px]">
            From sunrise rooftop yoga to neon karting, Joymap&apos;s AI reads
            how you want to feel and books the experiences that get you there.
            One subscription, infinite joy.
          </p>
          <div className="flex gap-3 flex-wrap mt-[34px]">
            <Link className={btnCls("lp", "primary")} href="/auth">
              Start exploring →
            </Link>
            <Link className={btnCls("lp", "glass")} href="#experiences">
              See how it works
            </Link>
          </div>
          <div className="flex gap-[40px] mt-[48px] flex-wrap">
            <div>
              <div className="font-display font-extrabold text-[32px] text-white leading-none">240+</div>
              <div className="text-sm text-white/70 font-semibold mt-[6px]">experiences in the city</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-[32px] text-white leading-none">6</div>
              <div className="text-sm text-white/70 font-semibold mt-[6px]">moods, one Joy Map</div>
            </div>
            <div>
              <div className="font-display font-extrabold text-[32px] text-white leading-none">499 ₽</div>
              <div className="text-sm text-white/70 font-semibold mt-[6px]">/ month, cancel anytime</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-[96px]" id="experiences">
        <div className="max-w-[1200px] mx-auto px-[28px]">
          <Reveal className="max-w-[680px] mx-auto mb-[52px] text-center">
            <div className="text-[12.5px] font-extrabold tracking-[0.16em] uppercase text-orange">Discover by feeling</div>
            <h2 className="text-[clamp(28px,3.6vw,46px)] leading-[1.04] mt-[14px]">Pick a mood. We&apos;ll map the week.</h2>
            <p className="text-[17px] text-ink-2 leading-[1.6] mt-[16px]">
              Tell our AI how you want to feel and it composes a personal weekly
              plan — balanced, surprising, and entirely yours.
            </p>
          </Reveal>
          <Reveal className="grid grid-cols-6 gap-[14px] max-[880px]:grid-cols-3 max-[480px]:grid-cols-2">
            {[
              [
                "linear-gradient(150deg,#6FD4C4,#2E8C80)",
                "Calm",
                "Slow down & restore",
              ],
              [
                "linear-gradient(150deg,#FBC15B,#E08B12)",
                "Joy",
                "Light, playful fun",
              ],
              [
                "linear-gradient(150deg,#FF6F8E,#D81E52)",
                "Energy",
                "Move & feel alive",
              ],
              [
                "linear-gradient(150deg,#7E8BE6,#3F49B0)",
                "Focus",
                "Learn & sharpen",
              ],
              [
                "linear-gradient(150deg,#9E7BF6,#5B33C9)",
                "Adventure",
                "Thrill & the new",
              ],
              [
                "linear-gradient(150deg,#FF9A57,#E36A1E)",
                "Connection",
                "Together with others",
              ],
            ].map(([bg, title, sub]) => (
              <div className="rounded-lg px-[18px] py-[22px] text-white min-h-[150px] flex flex-col justify-end relative overflow-hidden [transition:0.2s] cursor-default hover:[transform:translateY(-5px)] hover:shadow-lg" key={title} style={{ background: bg }}>
                <span className="w-[12px] h-[12px] rounded-pill bg-white/90 absolute top-[18px] left-[18px]" />
                <h4 className="text-[18px] text-white">{title}</h4>
                <span className="text-[12.5px] text-white/85 font-semibold mt-[3px]">{sub}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CUSTOMER SPLIT */}
      <section className="py-[96px]" style={{ paddingTop: 0 }}>
        <div className="max-w-[1200px] mx-auto px-[28px]">
          <Reveal className="grid grid-cols-2 gap-[56px] items-center max-[880px]:grid-cols-1 max-[880px]:gap-[32px]">
            <div className="rounded-xl overflow-hidden aspect-[4/3] shadow-lg relative">
              <img
                className="w-full h-full object-cover"
                src="/images/hero-bg.jpg"
                alt="Experiences across the city"
              />
            </div>
            <div>
              <div className="text-[12.5px] font-extrabold tracking-[0.16em] uppercase text-orange">For explorers</div>
              <h2 className="text-[clamp(26px,3.2vw,40px)] leading-[1.05] mt-[14px] mb-[16px]">A new thing to love, every week.</h2>
              <p className="text-[16.5px] text-ink-2 leading-[1.62] mb-[18px]">
                Joymap turns &quot;what should we do?&quot; into a beautiful
                weekly Joy Map — booked, balanced and ready. Swap anything in a
                tap; we keep the rhythm.
              </p>
              <ul className="flex flex-col gap-[14px] mt-[22px] mb-[28px] p-0">
                <li className="flex gap-4 items-start list-none text-[15.5px] font-semibold text-ink">
                  <span className="w-[30px] h-[30px] rounded-[9px] flex-none grid place-items-center bg-coral-soft text-coral-deep">✦</span>AI Joy Map tuned to your
                  moods
                </li>
                <li className="flex gap-4 items-start list-none text-[15.5px] font-semibold text-ink">
                  <span className="w-[30px] h-[30px] rounded-[9px] flex-none grid place-items-center bg-coral-soft text-coral-deep">✓</span>Instant booking with QR
                  tickets
                </li>
                <li className="flex gap-4 items-start list-none text-[15.5px] font-semibold text-ink">
                  <span className="w-[30px] h-[30px] rounded-[9px] flex-none grid place-items-center bg-coral-soft text-coral-deep">♥</span>Free cancellation up to 12h
                  before
                </li>
              </ul>
              <Link className={btnCls("lp", "primary")} href="/auth">
                Build my Joy Map →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PARTNER BAND */}
      <section className="py-[96px]" id="partners" style={{ paddingTop: 0 }}>
        <div className="max-w-[1200px] mx-auto px-[28px]">
          <Reveal className="relative overflow-hidden rounded-xl min-h-[420px] flex items-center text-white">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/images/corporate-team-strategy.jpg')",
                backgroundPosition: "center 35%",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(20,8,10,.9) 0%, rgba(28,10,12,.7) 50%, rgba(28,10,12,.2) 100%)",
              }}
            />
            <div className="relative p-[56px] max-w-[600px]">
              <div className="text-[12.5px] font-extrabold tracking-[0.16em] uppercase text-orange">For service providers</div>
              <h2 className="text-[clamp(28px,3.4vw,44px)] leading-[1.04] text-white">Fill every session. Grow your studio.</h2>
              <p className="text-[17px] text-white/[0.86] leading-[1.6] mt-[18px] mb-[28px]">
                List your experiences, manage your calendar with drag-and-drop
                scheduling, and get matched to customers by mood. Real-time
                bookings, analytics and fast payouts — all in one partner
                dashboard.
              </p>
              <div className="flex gap-[12px] flex-wrap">
                <Link className={btnCls("lp", "light")} href="/auth">
                  Become a partner
                </Link>
                <Link className={btnCls("lp", "glass")} href="/provider">
                  Preview the dashboard
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CORPORATE BAND */}
      <section className="py-[96px]" id="corporate" style={{ paddingTop: 0 }}>
        <div className="max-w-[1200px] mx-auto px-[28px]">
          <Reveal className="relative overflow-hidden rounded-xl min-h-[420px] flex items-center text-white">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('/images/corporate-hero.jpg')",
                backgroundPosition: "center 25%",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, rgba(40,9,12,.55) 0%, rgba(40,9,12,.7) 55%, rgba(28,6,8,.94) 100%)",
              }}
            />
            <div
              className="relative p-[56px] max-w-[600px]"
              style={{ marginInlineStart: "auto", textAlign: "right" }}
            >
              <div className="text-[12.5px] font-extrabold tracking-[0.16em] uppercase text-orange">For teams</div>
              <h2 className="text-[clamp(28px,3.4vw,44px)] leading-[1.04] text-white">Wellbeing your team will actually use.</h2>
              <p className="text-[17px] text-white/[0.86] leading-[1.6] mt-[18px] mb-[28px]">
                Sponsor monthly experience credits, run team-building events,
                and gift the joy — with seats, budgets and invoices handled in
                one place. Happier teams, zero admin.
              </p>
              <Link
                className={btnCls("lp", "light")}
                href="/auth"
                style={{ background: "var(--orange)", color: "#3a0a0d" }}
              >
                Explore Joymap for Teams
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="text-center py-[100px]">
        <div className="max-w-[1200px] mx-auto px-[28px]">
          <Reveal>
            <div className="text-[12.5px] font-extrabold tracking-[0.16em] uppercase text-orange" style={{ marginBottom: 14 }}>
              Live now in Moscow
            </div>
            <h2 className="text-[clamp(30px,4vw,52px)] leading-[1.02] max-w-[18ch] mx-auto mb-[20px]">Turn this week into a week worth remembering.</h2>
            <p className="text-[18px] text-ink-2 max-w-[52ch] mx-auto mb-[32px]">
              Join thousands discovering real-life joy, one perfectly-timed
              experience at a time.
            </p>
            <div className="flex gap-[13px] justify-center flex-wrap">
              <Link className={btnCls("lp", "primary")} href="/auth">
                Get started — 499 ₽/mo
              </Link>
              <Link className={btnCls("lp", "ghost")} href="#partners">
                I&apos;m a provider
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="border-t border-line py-[40px] flex items-center justify-between gap-[20px] flex-wrap text-ink-3 text-[13.5px] font-semibold max-w-[1200px] mx-auto px-[28px]">
        <div className="flex items-center gap-[9px]">
          <b className="font-display font-extrabold text-[18px]">joymap</b>
          <span className="live">
            <i />
            Live now!
          </span>
        </div>
        <div>© 2026 Joymap · Moscow · Made for real-life joy</div>
      </footer>
    </div>
  );
}
