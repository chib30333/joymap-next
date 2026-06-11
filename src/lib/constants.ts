// Shared domain constants — the mood vocabulary, demo calendar, fixed "today".
// Mirrors data.jsx (MOODS, MOOD_ORDER) and backend.js (TODAY, WD, dow).

export const MOODS: Record<
  string,
  { key: string; label: string; hex: string; deep: string; blurb: string }
> = {
  calm: { key: "calm", label: "Calm", hex: "#3FA89B", deep: "#2E8C80", blurb: "Slow down & restore" },
  joy: { key: "joy", label: "Joy", hex: "#F4A52B", deep: "#E08B12", blurb: "Light, playful fun" },
  energy: { key: "energy", label: "Energy", hex: "#FF4D74", deep: "#D81E52", blurb: "Move & feel alive" },
  focus: { key: "focus", label: "Focus", hex: "#5563D6", deep: "#3F49B0", blurb: "Learn & sharpen" },
  adventure: { key: "adventure", label: "Adventure", hex: "#7B53F0", deep: "#5B33C9", blurb: "Thrill & the new" },
  connect: { key: "connect", label: "Connection", hex: "#FF8A4C", deep: "#E36A1E", blurb: "Together with others" },
};
export const MOOD_ORDER = ["calm", "joy", "energy", "focus", "adventure", "connect"] as const;

export const CITIES = ["Moscow", "Saint Petersburg", "Kazan"];
export const CATS = ["Wellness", "Movement", "Creative", "Thrill", "Mind", "Adventure"];

// The prototype pins "today" to Wed 10 June 2026 so the demo data lines up.
export const TODAY = 10;
export const MONTH_DAYS = 30;
export const WD = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]; // 1 Jun 2026 is a Monday
export const COMMISSION = 15;

export const REJECT_REASONS = [
  "Incomplete documents",
  "Unverified business license",
  "Low-quality photos",
  "Pricing policy violation",
  "Duplicate listing",
  "Other",
];

export function dow(day: number) {
  return (day - 1) % 7;
}
export function dateLabel(day: number) {
  const d = Math.max(Math.min(day, MONTH_DAYS), 1);
  return `${WD[dow(d)]} ${day} Jun`;
}
export function moodGradient(mood: string) {
  const m = MOODS[mood];
  return m ? `linear-gradient(145deg, ${m.hex}, ${m.deep})` : "#999";
}
