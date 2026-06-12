import React from "react";

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
      <path
        d="M16 30s10-7.2 10-16A10 10 0 1 0 6 14c0 8.8 10 16 10 16Z"
        fill="var(--coral)"
      />
      <circle cx="16" cy="13.5" r="5.6" fill="#fff" />
      <path
        d="M13 13.3c.5 1.4 1.7 2.2 3 2.2s2.5-.8 3-2.2"
        stroke="var(--coral-deep)"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="13.8" cy="11.4" r="1" fill="var(--coral-deep)" />
      <circle cx="18.2" cy="11.4" r="1" fill="var(--coral-deep)" />
    </svg>
  );
}

export default Logo;
