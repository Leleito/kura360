import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "KURA360 — Campaign Compliance & Operations",
    template: "%s | KURA360",
  },
  description:
    "Campaign compliance and operations platform for Kenyan elections. Track finances, manage agents, document evidence, and ensure regulatory compliance.",
  keywords: [
    "campaign finance",
    "election compliance",
    "Kenya elections",
    "IEBC",
    "campaign management",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0F2A44",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" className={inter.variable}>
      <body className="min-h-screen bg-surface-bg text-text-primary antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
