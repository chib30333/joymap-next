import type { Config } from "tailwindcss";

// Joymap design tokens, ported from theme.css. The coral accent is overridable
// at runtime via CSS variables (the prototype's "Tweaks" palette swap).
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        "ink-3": "var(--ink-3)",
        line: "var(--line)",
        "line-2": "var(--line-2)",
        coral: "var(--coral)",
        "coral-deep": "var(--coral-deep)",
        "coral-soft": "var(--coral-soft)",
        orange: "var(--orange)",
        "orange-deep": "var(--orange-deep)",
        maroon: "var(--maroon)",
        // mood palette
        "m-calm": "#3FA89B",
        "m-joy": "#F4A52B",
        "m-energy": "#FF4D74",
        "m-focus": "#5563D6",
        "m-adventure": "#7B53F0",
        "m-connect": "#FF8A4C",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xs: "8px",
        sm: "12px",
        DEFAULT: "18px",
        lg: "26px",
        xl: "34px",
        pill: "999px",
      },
      boxShadow: {
        sm: "0 1px 2px rgba(120,30,45,.06), 0 2px 6px rgba(120,30,45,.05)",
        DEFAULT: "0 4px 12px rgba(120,30,45,.08), 0 12px 28px rgba(120,30,45,.07)",
        lg: "0 12px 30px rgba(120,30,45,.12), 0 30px 60px rgba(120,30,45,.1)",
        coral: "0 10px 26px rgba(224,33,47,.34)",
      },
      keyframes: {
        sweep: { to: { transform: "translateX(100%)" } },
        rise: { from: { transform: "translateY(8px)", opacity: "0" }, to: { transform: "none", opacity: "1" } },
        pop: { from: { transform: "translateY(10px) scale(.98)", opacity: "0" }, to: { transform: "none", opacity: "1" } },
        spin: { to: { transform: "rotate(360deg)" } },
        jmpop: { from: { transform: "translateY(10px) scale(.98)" }, to: { transform: "none" } },
        jmrise: { from: { transform: "translateY(8px)" }, to: { transform: "none" } },
        jmcardin: { from: { transform: "translateY(16px)" }, to: { transform: "none" } },
      },
      animation: {
        sweep: "sweep 1.4s ease-in-out infinite",
        rise: "rise .4s ease both",
        pop: "pop .5s cubic-bezier(.22,1,.36,1) both",
        "jm-spin": "spin 0.7s linear infinite",
        // customer (.app-top) enter animations — transform only
        "anim-pop-app": "jmpop .5s cubic-bezier(.22,1,.36,1)",
        "anim-fade-app": "jmrise .4s ease",
        // provider/admin (.jmdash) enter animations — transform + opacity
        "anim-pop-dash": "pop .5s cubic-bezier(.22,1,.36,1)",
        "anim-fade-dash": "rise .4s ease",
        // auth card / reset-icon entrance (.auth-wrap.fx) — transform only
        "anim-cardin": "jmcardin .5s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
