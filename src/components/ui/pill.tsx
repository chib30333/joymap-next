// Pill — status chip (Tailwind-flavored) + the canonical STATUS color map.
// STATUS is *data* (status → [text color, background]) and is the single source of
// truth shared with the dashboard's CSS-class Pill (see guideline 02 / 07). Import
// the map; never re-type the rgba() values.
const STATUS: Record<string, [string, string]> = {
  confirmed: ["#1FA46E", "rgba(31,164,110,.13)"],
  pending: ["#E89015", "rgba(232,144,21,.14)"],
  cancelled: ["#E0212F", "rgba(224,33,47,.12)"],
  completed: ["#5563D6", "rgba(85,99,214,.13)"],
  active: ["#1FA46E", "rgba(31,164,110,.13)"],
  review: ["#E89015", "rgba(232,144,21,.14)"],
  rejected: ["#E0212F", "rgba(224,33,47,.12)"],
  paid: ["#1FA46E", "rgba(31,164,110,.13)"],
  vip: ["#7B53F0", "rgba(123,83,240,.14)"],
};
export { STATUS };
export const statusColor = (status: string): [string, string] => STATUS[status] ?? ["#6F5157", "rgba(120,80,90,.12)"];

export function Pill({ status, label }: { status: string; label?: string }) {
  const [c, bg] = statusColor(status);
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-bold" style={{ color: c, background: bg }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: c }} />
      {label ?? status}
    </span>
  );
}
