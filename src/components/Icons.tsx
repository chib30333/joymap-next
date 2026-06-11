import type { CSSProperties, ReactNode } from "react";

type IcProps = {
  size?: number;
  sw?: number;
  fill?: boolean;
  vb?: number;
  style?: CSSProperties;
};

function Ic({
  size = 20,
  sw = 1.8,
  fill = false,
  vb = 24,
  style,
  children,
}: IcProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${vb} ${vb}`}
      fill={fill ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {children}
    </svg>
  );
}

export const Icons: Record<string, (p?: IcProps) => JSX.Element> = {
  map: (p) => (
    <Ic {...p}>
      <path d="M9 4 3.5 6.2v13.3L9 17.3l6 2.4 5.5-2.2V4L15 6.4 9 4Z" />
      <path d="M9 4v13.3M15 6.4v13.3" />
    </Ic>
  ),
  compass: (p) => (
    <Ic {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15.2 8.8-1.9 4.5-4.5 1.9 1.9-4.5 4.5-1.9Z" />
    </Ic>
  ),
  calendar: (p) => (
    <Ic {...p}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
    </Ic>
  ),
  wallet: (p) => (
    <Ic {...p}>
      <rect x="3" y="6" width="18" height="13" rx="3.2" />
      <path d="M3 10h18M16.5 14.5h.01" />
    </Ic>
  ),
  heart: (p) => (
    <Ic {...p}>
      <path d="M12 20.3 4.7 13a4.6 4.6 0 0 1 6.5-6.5l.8.8.8-.8A4.6 4.6 0 0 1 19.3 13L12 20.3Z" />
    </Ic>
  ),
  sparkle: (p) => (
    <Ic {...p}>
      <path d="M12 3.5 13.6 9 19 10.5 13.6 12 12 17.5 10.4 12 5 10.5 10.4 9 12 3.5ZM18.5 4.5l.7 2 .8.7-.8.6-.7 2-.6-2-.8-.6.8-.7.6-2Z" />
    </Ic>
  ),
  search: (p) => (
    <Ic {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.6-3.6" />
    </Ic>
  ),
  bell: (p) => (
    <Ic {...p}>
      <path d="M6 9a6 6 0 0 1 12 0c0 5 1.5 6 1.5 6H4.5S6 14 6 9Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </Ic>
  ),
  star: (p) => (
    <Ic {...p} fill sw={0}>
      <path d="M12 3.2l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.5 6.8 19.2l1-5.8L3.6 9.3l5.8-.8L12 3.2Z" />
    </Ic>
  ),
  pin: (p) => (
    <Ic {...p}>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </Ic>
  ),
  clock: (p) => (
    <Ic {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 1.8" />
    </Ic>
  ),
  arrowR: (p) => (
    <Ic {...p}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Ic>
  ),
  arrowL: (p) => (
    <Ic {...p}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </Ic>
  ),
  chevR: (p) => (
    <Ic {...p}>
      <path d="m9 6 6 6-6 6" />
    </Ic>
  ),
  check: (p) => (
    <Ic {...p}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Ic>
  ),
  checkCirc: (p) => (
    <Ic {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </Ic>
  ),
  close: (p) => (
    <Ic {...p}>
      <path d="M6 6l12 12M18 6 6 18" />
    </Ic>
  ),
  plus: (p) => (
    <Ic {...p}>
      <path d="M12 5v14M5 12h14" />
    </Ic>
  ),
  minus: (p) => (
    <Ic {...p}>
      <path d="M5 12h14" />
    </Ic>
  ),
  send: (p) => (
    <Ic {...p}>
      <path d="M4.5 12 20 4.5 16.5 20l-4.2-5.2L4.5 12Zm7.8 2.8L20 4.5" />
    </Ic>
  ),
  user: (p) => (
    <Ic {...p}>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
    </Ic>
  ),
  settings: (p) => (
    <Ic {...p}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.5v2M12 19.5v2M21.5 12h-2M4.5 12h-2M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4M18.7 18.7l-1.4-1.4M6.7 6.7 5.3 5.3" />
    </Ic>
  ),
  filter: (p) => (
    <Ic {...p}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </Ic>
  ),
  qr: (p) => (
    <Ic {...p}>
      <rect x="4" y="4" width="6" height="6" rx="1.2" />
      <rect x="14" y="4" width="6" height="6" rx="1.2" />
      <rect x="4" y="14" width="6" height="6" rx="1.2" />
      <path d="M14 14h2v2M20 14v.01M14 20h.01M18 18h2v2M20 16v.01M16 20v.01" />
    </Ic>
  ),
  logout: (p) => (
    <Ic {...p}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 12h9M16 8l3 4-3 4" />
    </Ic>
  ),
  mail: (p) => (
    <Ic {...p}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 7 8 6 8-6" />
    </Ic>
  ),
  chat: (p) => (
    <Ic {...p}>
      <path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 3.5V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8Z" />
      <path d="M8.5 10.5h7M8.5 13.5h4" />
    </Ic>
  ),
  image: (p) => (
    <Ic {...p}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <circle cx="9" cy="10" r="1.8" />
      <path d="m4.5 17 4.5-4 3 2.5 3.5-3.5 4 3.5" />
    </Ic>
  ),
  percent: (p) => (
    <Ic {...p}>
      <path d="M6 18 18 6" />
      <circle cx="7.5" cy="7.5" r="2.2" />
      <circle cx="16.5" cy="16.5" r="2.2" />
    </Ic>
  ),
  download: (p) => (
    <Ic {...p}>
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14" />
    </Ic>
  ),
  edit: (p) => (
    <Ic {...p}>
      <path d="M4 20h4L18.5 9.5a2 2 0 0 0-2.8-2.8L5 17.5 4 20Z" />
      <path d="M14.5 8.5 16 10" />
    </Ic>
  ),
  phone: (p) => (
    <Ic {...p}>
      <path d="M6.5 4.5h3l1.5 4-2 1.4a11 11 0 0 0 5.1 5.1l1.4-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.7 2 2 0 0 1 6.5 4.5Z" />
    </Ic>
  ),
  trash: (p) => (
    <Ic {...p}>
      <path d="M5 7h14M10 7V5h4v2M6.5 7l.7 12a2 2 0 0 0 2 1.9h5.6a2 2 0 0 0 2-1.9l.7-12" />
    </Ic>
  ),
  camera: (p) => (
    <Ic {...p}>
      <path d="M4.5 8.5h3L9 6.5h6L16.5 8.5h3a1.5 1.5 0 0 1 1.5 1.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18v-8a1.5 1.5 0 0 1 1.5-1.5Z" />
      <circle cx="12" cy="13.5" r="3.2" />
    </Ic>
  ),
  list: (p) => (
    <Ic {...p}>
      <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />
    </Ic>
  ),
  shield: (p) => (
    <Ic {...p}>
      <path d="M12 3 5 5.5v5c0 4.5 3 7.8 7 9.5 4-1.7 7-5 7-9.5v-5L12 3Z" />
      <path d="m9 11.5 2 2 4-4" />
    </Ic>
  ),
  schedule: (p) => (
    <Ic {...p}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" />
      <circle cx="8" cy="13.5" r="1" fill="currentColor" />
      <circle cx="12" cy="13.5" r="1" fill="currentColor" />
      <circle cx="16" cy="13.5" r="1" fill="currentColor" />
      <circle cx="8" cy="17" r="1" fill="currentColor" />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </Ic>
  ),
  briefcase: (p) => (
    <Ic {...p}>
      <rect x="3" y="7.5" width="18" height="12.5" rx="2.5" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3 13h18" />
    </Ic>
  ),
  gift: (p) => (
    <Ic {...p}>
      <rect x="4" y="9" width="16" height="11.5" rx="1.6" />
      <path d="M3 9h18M12 9v11.5M12 9S10.5 5 8.5 5a2 2 0 0 0 0 4M12 9s1.5-4 3.5-4a2 2 0 0 1 0 4" />
    </Ic>
  ),
  building: (p) => (
    <Ic {...p}>
      <rect x="5" y="3.5" width="14" height="17" rx="1.6" />
      <path d="M9 7.5h.01M14.5 7.5h.01M9 11h.01M14.5 11h.01M9 14.5h.01M14.5 14.5h.01M10.5 20.5v-3h3v3" />
    </Ic>
  ),
  sun: (p) => (
    <Ic {...p}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4" />
    </Ic>
  ),
  moon: (p) => (
    <Ic {...p}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5Z" />
    </Ic>
  ),
  sunset: (p) => (
    <Ic {...p}>
      <path d="M12 4v5M8.5 7.5 12 11l3.5-3.5M3 15h2M19 15h2M5.6 11.6 7 13M17 13l1.4-1.4M3.5 19h17M8 19a4 4 0 0 1 8 0" />
    </Ic>
  ),
  globe: (p) => (
    <Ic {...p}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.5 2.5 2.5 14.5 0 17M12 3.5c-2.5 2.5-2.5 14.5 0 17" />
    </Ic>
  ),
  lock: (p) => (
    <Ic {...p}>
      <rect x="4.5" y="10" width="15" height="10.5" rx="2.5" />
      <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    </Ic>
  ),
  flame: (p) => (
    <Ic {...p}>
      <path d="M12 3s4.5 3.5 4.5 8.5a4.5 4.5 0 1 1-9 0c0-1.6.6-2.8 1.2-3.6.4 1.2 1.3 1.8 2 1.8.9 0 .8-1.2.3-2.6C11.5 5.3 12 3 12 3Z" />
    </Ic>
  ),
  grid: (p) => (
    <Ic {...p}>
      <rect x="4" y="4" width="7" height="7" rx="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" />
    </Ic>
  ),
  refresh: (p) => (
    <Ic {...p}>
      <path d="M3.5 12a8.5 8.5 0 0 1 14.5-6M20.5 12A8.5 8.5 0 0 1 6 18M17 4.5V8h-3.5M7 19.5V16h3.5" />
    </Ic>
  ),
};

export function Logo({
  size = 26,
  mono = false,
}: {
  size?: number;
  mono?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-[10px]">
      <span className="relative inline-flex">
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
          <path
            d="M16 30s10-7.2 10-16A10 10 0 1 0 6 14c0 8.8 10 16 10 16Z"
            fill={mono ? "currentColor" : "var(--coral)"}
          />
          <circle
            cx="16"
            cy="13.5"
            r="5.6"
            fill="#fff"
            fillOpacity={mono ? 0.2 : 0.95}
          />
          <path
            d="M13 13.3c.5 1.4 1.7 2.2 3 2.2s2.5-.8 3-2.2"
            stroke="var(--coral-deep)"
            strokeWidth="1.7"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="13.8" cy="11.4" r="1" fill="var(--coral-deep)" />
          <circle cx="18.2" cy="11.4" r="1" fill="var(--coral-deep)" />
        </svg>
      </span>
      <span
        className="font-display font-extrabold tracking-[-.03em]"
        style={{
          fontSize: size * 0.78,
          color: mono ? "currentColor" : "var(--ink)",
        }}
      >
        joymap
      </span>
    </span>
  );
}
