import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://axis-predict.vercel.app"),
  title: "Axis Predict - DeFAI Range Harvester",
  description: "DeFAI Range Harvester for DeepBook Predict Ecosystem. Optimize rolling expiry yields on Sui with mathematically enforced risk limits.",
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Axis Predict - DeFAI Range Harvester",
    description: "DeFAI Range Harvester for DeepBook Predict Ecosystem. Optimize rolling expiry yields on Sui with mathematically enforced risk limits.",
    url: "https://axis-predict.vercel.app",
    siteName: "Axis Predict",
    images: [
      {
        url: "/og-banner.png",
        width: 1200,
        height: 630,
        alt: "Axis Predict DeFAI Option Vault",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axis Predict - DeFAI Range Harvester",
    description: "DeFAI Range Harvester for DeepBook Predict Ecosystem. Optimize rolling expiry yields on Sui with mathematically enforced risk limits.",
    images: ["/og-banner.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSans.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[var(--axis-background)] text-[var(--axis-text-primary)] font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
