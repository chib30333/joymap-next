import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { LangProvider } from "@/components/Language";

// Self-hosted (variable) fonts. Loading them from disk instead of
// next/font/google removes the build-time network fetch to Google Fonts,
// which intermittently times out ("Failed to download `Baloo 2`").
const display = localFont({
  src: "./fonts/Baloo2-Variable.ttf",
  weight: "500 800",
  display: "swap",
  variable: "--font-display",
});
const body = localFont({
  src: "./fonts/HankenGrotesk-Variable.ttf",
  weight: "400 700",
  display: "swap",
  variable: "--font-body",
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
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
