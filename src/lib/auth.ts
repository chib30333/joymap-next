// Shared styling tokens + helpers for the auth screens.

export const SPIN =
    "inline-block w-5 h-5 rounded-full border-2 border-white/40 border-t-white animate-jm-spin";
export const BODY = "flex flex-col gap-4 mt-5";
export const FOOT = "text-center mt-5 text-sm text-ink-2 font-semibold";
export const LINK =
    "text-ink-2 text-sm font-bold cursor-pointer no-underline hover:text-coral-deep";
export const LINK_STRONG =
    "text-coral-deep text-sm font-bold cursor-pointer no-underline hover:text-coral-deep";

export function pwScore(v: string) {
    let s = 0;
    if (v.length >= 8) s++;
    if (/[A-Z]/.test(v)) s++;
    if (/[0-9]/.test(v)) s++;
    if (/[^A-Za-z0-9]/.test(v)) s++;
    if (v.length < 1) return { pct: 0, label: "", color: "transparent" };
    if (s <= 1) return { pct: 30, label: "Weak", color: "#FF4D74" };
    if (s === 2) return { pct: 60, label: "Okay", color: "#E89015" };
    if (s === 3) return { pct: 80, label: "Good", color: "#3FA89B" };
    return { pct: 100, label: "Strong", color: "#1FA46E" };
}
