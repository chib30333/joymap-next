import Link from "next/link";
import { Reveal } from "@/components/landing/Reveal";
import Logo from "@/components/landing/Logo";

export default function Landing() {
  return (
    <div className="lp">
      <header className="nav">
        <div className="wrap nav-in">
          <Link className="brand" href="/">
            <Logo />
            <b>joymap</b>
            <span className="live">
              <i />
              Live now!
            </span>
          </Link>
          <nav className="nav-links">
            <a href="#experiences">Experiences</a>
            <a href="#partners">For partners</a>
            <a href="#corporate">Corporate</a>
          </nav>
          <div className="flex-1" />
          <Link
            className="btn btn-ghost"
            href="/auth"
            style={{ padding: "11px 20px", fontSize: 14 }}
          >
            Sign in
          </Link>
          <Link
            className="btn btn-primary"
            href="/auth"
            style={{ padding: "12px 22px", fontSize: 14 }}
          >
            Get started
          </Link>
        </div>
      </header>

      <section className="hero">
        <div className="hero-img" />
        <div className="hero-scrim" />
        <div className="wrap hero-in">
          <div
            className="eyebrow"
            style={{ color: "var(--orange)", marginBottom: 18 }}
          >
            Moscow · marketplace of real-life experiences
          </div>
          <h1>
            Your week, <span className="hl">mapped to your mood.</span>
          </h1>
          <p>
            From sunrise rooftop yoga to neon karting, Joymap&apos;s AI reads
            how you want to feel and books the experiences that get you there.
            One subscription, infinite joy.
          </p>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/auth">
              Start exploring →
            </Link>
            <a className="btn btn-glass" href="#experiences">
              See how it works
            </a>
          </div>
          <div className="hero-stats">
            <div>
              <div className="n">240+</div>
              <div className="l">experiences in the city</div>
            </div>
            <div>
              <div className="n">6</div>
              <div className="l">moods, one Joy Map</div>
            </div>
            <div>
              <div className="n">499 ₽</div>
              <div className="l">/ month, cancel anytime</div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" id="experiences">
        <div className="wrap">
          <Reveal className="sec-head">
            <div className="eyebrow">Discover by feeling</div>
            <h2>Pick a mood. We&apos;ll map the week.</h2>
            <p>
              Tell our AI how you want to feel and it composes a personal weekly
              plan — balanced, surprising, and entirely yours.
            </p>
          </Reveal>
          <Reveal className="moods">
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
              <div className="mood" key={title} style={{ background: bg }}>
                <span className="dot" />
                <h4>{title}</h4>
                <span>{sub}</span>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* CUSTOMER SPLIT */}
      <section className="sec" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal className="split">
            <div className="split-img">
              <img
                src="/images/hero-bg.jpg"
                alt="Experiences across the city"
              />
            </div>
            <div className="split-txt">
              <div className="eyebrow">For explorers</div>
              <h2>A new thing to love, every week.</h2>
              <p>
                Joymap turns &quot;what should we do?&quot; into a beautiful
                weekly Joy Map — booked, balanced and ready. Swap anything in a
                tap; we keep the rhythm.
              </p>
              <ul className="feat-list">
                <li>
                  <span className="feat-ic">✦</span>AI Joy Map tuned to your
                  moods
                </li>
                <li>
                  <span className="feat-ic">✓</span>Instant booking with QR
                  tickets
                </li>
                <li>
                  <span className="feat-ic">♥</span>Free cancellation up to 12h
                  before
                </li>
              </ul>
              <Link className="btn btn-primary" href="/auth">
                Build my Joy Map →
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* PARTNER BAND */}
      <section className="sec" id="partners" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal className="band">
            <div
              className="band-img"
              style={{
                backgroundImage: "url('/images/corporate-team-strategy.jpg')",
                backgroundPosition: "center 35%",
              }}
            />
            <div
              className="band-scrim"
              style={{
                background:
                  "linear-gradient(90deg, rgba(20,8,10,.9) 0%, rgba(28,10,12,.7) 50%, rgba(28,10,12,.2) 100%)",
              }}
            />
            <div className="band-in">
              <div className="eyebrow">For service providers</div>
              <h2>Fill every session. Grow your studio.</h2>
              <p>
                List your experiences, manage your calendar with drag-and-drop
                scheduling, and get matched to customers by mood. Real-time
                bookings, analytics and fast payouts — all in one partner
                dashboard.
              </p>
              <div className="flex gap-[12px] flex-wrap">
                <Link className="btn btn-light" href="/auth">
                  Become a partner
                </Link>
                <Link className="btn btn-glass" href="/provider">
                  Preview the dashboard
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CORPORATE BAND */}
      <section className="sec" id="corporate" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <Reveal className="band">
            <div
              className="band-img"
              style={{
                backgroundImage: "url('/images/corporate-hero.jpg')",
                backgroundPosition: "center 25%",
              }}
            />
            <div
              className="band-scrim"
              style={{
                background:
                  "linear-gradient(90deg, rgba(40,9,12,.55) 0%, rgba(40,9,12,.7) 55%, rgba(28,6,8,.94) 100%)",
              }}
            />
            <div
              className="band-in"
              style={{ marginInlineStart: "auto", textAlign: "right" }}
            >
              <div className="eyebrow">For teams</div>
              <h2>Wellbeing your team will actually use.</h2>
              <p>
                Sponsor monthly experience credits, run team-building events,
                and gift the joy — with seats, budgets and invoices handled in
                one place. Happier teams, zero admin.
              </p>
              <Link
                className="btn btn-light"
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
      <section className="cta">
        <div className="wrap">
          <Reveal>
            <div className="eyebrow" style={{ marginBottom: 14 }}>
              Live now in Moscow
            </div>
            <h2>Turn this week into a week worth remembering.</h2>
            <p>
              Join thousands discovering real-life joy, one perfectly-timed
              experience at a time.
            </p>
            <div className="flex gap-[13px] justify-center flex-wrap">
              <Link className="btn btn-primary" href="/auth">
                Get started — 499 ₽/mo
              </Link>
              <a className="btn btn-ghost" href="#partners">
                I&apos;m a provider
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <footer className="foot wrap">
        <div className="brand">
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
