import type { Metadata } from "next";
import { Baloo_2, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/components/i18n";

const display = Baloo_2({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-display" });
const body = Hanken_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Joymap — your week of joy",
  description: "Mood-based experiences marketplace: customers, providers, and platform admin.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
