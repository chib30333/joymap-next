import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LangProvider } from "@/components/Language";

const display = localFont({
  src: "./fonts/Baloo2-Variable.ttf",
  weight: "500 800",
  display: "swap",
  variable: "--font-display",
  adjustFontFallback: false,
});
const body = localFont({
  src: "./fonts/HankenGrotesk-Variable.ttf",
  weight: "400 700",
  display: "swap",
  variable: "--font-body",
  adjustFontFallback: false,
});

const displayCyrillic = localFont({
  src: "./fonts/Nunito-Variable.ttf",
  weight: "500 800",
  display: "swap",
  variable: "--font-display-cyrillic",
  adjustFontFallback: false,
  preload: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0301, U+0400-045F, U+0460-052F, U+0490-0491, U+04B0-04B1, U+1C80-1C88, U+20B4, U+2116, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
    },
  ],
});
const bodyCyrillic = localFont({
  src: "./fonts/Manrope-Variable.ttf",
  weight: "400 700",
  display: "swap",
  variable: "--font-body-cyrillic",
  adjustFontFallback: false,
  preload: false,
  declarations: [
    {
      prop: "unicode-range",
      value:
        "U+0301, U+0400-045F, U+0460-052F, U+0490-0491, U+04B0-04B1, U+1C80-1C88, U+20B4, U+2116, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F",
    },
  ],
});

export const metadata: Metadata = {
  title: "Joymap",
  description:
    "Mood-based experiences marketplace: customers, providers, and platform admin.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${displayCyrillic.variable} ${bodyCyrillic.variable}`}
    >
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
