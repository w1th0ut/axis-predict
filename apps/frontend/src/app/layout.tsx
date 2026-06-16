import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Axis Predict - DeFAI Range Harvester",
  description: "DeFAI Range Harvester for DeepBook Predict Ecosystem. Optimize rolling expiry yields on Sui with mathematically enforced risk limits.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-[#08090a] text-[#f3f4f6] font-sans">
        {children}
      </body>
    </html>
  );
}
