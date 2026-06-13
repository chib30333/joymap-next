export function Footer() {
  return (
    <footer className="border-t border-line py-[40px] flex items-center justify-between gap-[20px] flex-wrap text-ink-3 text-[13.5px] font-semibold max-w-7xl mx-auto px-6">
      <div className="flex items-center gap-[9px]">
        <b className="font-display font-extrabold text-[18px]">joymap</b>
        <span className="inline-flex items-center gap-[5px] bg-[color-mix(in_srgb,var(--orange)_16%,transparent)] text-[var(--orange-deep)] px-[9px] py-[3px] rounded-[99px] text-[10px] font-extrabold font-display">
          <i className="w-[6px] h-[6px] rounded-[99px] bg-[var(--orange)] inline-block animate-[pulse_1.8s_infinite]" />
          Live now!
        </span>
      </div>
      <div>© 2026 Joymap · Moscow · Made for real-life joy</div>
    </footer>
  );
}
