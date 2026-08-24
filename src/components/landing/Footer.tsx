export function Footer() {
  return (
    <footer className="border-t border-line py-6 flex items-center justify-between gap-5 flex-wrap text-ink-3 text-sm font-semibold max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
      <div className="flex items-center gap-2">
        <b className="font-display font-extrabold text-lg">joymap</b>
        <span className="inline-flex items-center gap-1 bg-[color-mix(in_srgb,var(--orange)_16%,transparent)] text-[var(--orange-deep)] px-2 py-1 rounded-full text-2.5 font-extrabold font-display">
          <i className="w-1.5 h-1.5 rounded-full bg-[var(--orange)] inline-block animate-[pulse_1.8s_infinite]" />
          Live now!
        </span>
      </div>
      <div>© 2026 Joymap · Moscow · Made for real-life joy</div>
    </footer>
  );
}
