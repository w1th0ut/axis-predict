"use client";

import Image from "next/image";
import React from "react";
import ScrollReveal from "./ScrollReveal";

const FOOTER_COLUMNS = [
  {
    title: "Protocol",
    links: [
      { label: "Strategy" },
      { label: "Integrations" },
      { label: "Guardrails" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation" },
      { label: "Sui Move Vault" },
      { label: "GitHub", href: "https://github.com/w1th0ut/axis-predict" },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Twitter" },
      { label: "Discord" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy" },
      { label: "Terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[var(--axis-background)] pb-10 pt-8 lg:pb-12 lg:pt-10">
      <ScrollReveal variant="glow">
        <div className="relative h-[15rem] w-full overflow-hidden sm:h-[19rem] lg:h-[23rem]">
          <Image
            src="/footer-image.png"
            alt="Axis Predict footer landscape"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,10,0)_0%,rgba(8,9,10,0.08)_34%,rgba(8,9,10,0.86)_100%)]" />
        </div>
      </ScrollReveal>

      <div className="mx-auto max-w-[90rem] px-5 sm:px-6 lg:px-10">
        <div className="grid gap-12 pt-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,3fr)] lg:gap-16">
          <ScrollReveal className="max-w-[24rem]" variant="left">
            <div className="text-[2rem] font-medium tracking-[-0.04em] text-[var(--axis-text-primary)]">
              Axis <span className="text-[var(--axis-primary)]">Predict</span>
            </div>
            <p className="mt-6 text-[1.02rem] leading-8 text-[var(--axis-text-secondary)]">
              AI-powered premium harvesting for DeepBook Predict on Sui.
              Deposit dUSDC, receive liquid vault shares, and keep risk
              enforcement on-chain.
            </p>

            <div className="mt-10 flex flex-wrap gap-8 text-sm text-[var(--axis-text-secondary)]">
              <span>Twitter</span>
              <a
                href="https://github.com/w1th0ut/axis-predict"
                target="_blank"
                rel="noreferrer"
                className="transition-colors duration-150 hover:text-white"
              >
                GitHub
              </a>
            </div>
          </ScrollReveal>

          <div className="grid gap-10 sm:grid-cols-2 xl:grid-cols-4">
            {FOOTER_COLUMNS.map((column, index) => (
              <ScrollReveal
                key={column.title}
                delay={index * 80}
                variant={index % 2 === 0 ? "rise" : "right"}
              >
                <div>
                  <div className="text-[1.02rem] font-medium text-[var(--axis-text-primary)]">
                    {column.title}
                  </div>
                  <div className="mt-6 grid gap-4 text-[1rem] text-[var(--axis-text-muted)]">
                    {column.links.map((link) =>
                      link.href ? (
                        <a
                          key={link.label}
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors duration-150 hover:text-[var(--axis-text-primary)]"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <span key={link.label}>{link.label}</span>
                      ),
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        <div className="mt-14 border-t border-[rgba(255,255,255,0.08)] pt-8">
          <div className="text-center text-[0.98rem] text-[var(--axis-text-muted)]">
            &copy; 2026{" "}
            <span className="text-[var(--axis-text-primary)]">Axis </span>
            <span className="text-[var(--axis-primary)]">Predict</span>.
            {" "}Open source infrastructure for explainable vault automation.
          </div>
        </div>
      </div>
    </footer>
  );
}
