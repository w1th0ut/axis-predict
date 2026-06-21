"use client";

import Image from "next/image";
import React from "react";
import ScrollReveal from "./ScrollReveal";

export default function PreFooterCta() {
  return (
    <section className="bg-[var(--axis-background)] px-5 py-16 sm:px-6 lg:px-10 lg:py-20">
      <div className="mx-auto max-w-[90rem]">
        <ScrollReveal variant="glow">
          <div className="relative overflow-hidden border border-[rgba(255,255,255,0.78)] bg-[rgba(8,9,10,0.9)]">
            <div className="axis-grid absolute inset-0 opacity-35" />

            <div className="relative grid min-h-[48rem] gap-12 px-8 py-10 md:px-12 md:py-14 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:px-14 lg:py-16">
              <ScrollReveal className="flex flex-col justify-center" variant="left">
                <span className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
                  Get started
                </span>
                <h2 className="font-display mt-8 max-w-[9ch] text-[3.25rem] leading-[0.92] tracking-[-0.06em] text-[var(--axis-text-primary)] sm:text-[4.4rem] lg:text-[5.8rem]">
                  Your vault starts with one deposit
                </h2>
                <p className="mt-8 max-w-[34rem] text-[1.08rem] leading-9 text-[var(--axis-text-secondary)]">
                  Deposit dUSDC, receive liquid shares, and let Axis Predict
                  harvest rolling premium with hard on-chain guardrails.
                </p>

                <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="#launch"
                    className="inline-flex min-h-14 items-center justify-center bg-[var(--axis-text-primary)] px-7 text-[1.02rem] font-medium text-[var(--axis-background)] transition-[transform,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_16px_36px_rgba(255,255,255,0.12)]"
                  >
                    Launch app
                    <span className="ml-3 text-[1.2rem]">&rarr;</span>
                  </a>
                </div>

              </ScrollReveal>

              <ScrollReveal
                className="relative min-h-[20rem] lg:min-h-full"
                delay={120}
                variant="right"
              >
                <Image
                  src="/coin.png"
                  alt="Axis Predict coin visual"
                  fill
                  className="object-contain object-center p-8 opacity-95 lg:p-10"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_66%_58%,rgba(46,124,246,0.16),transparent_24%),linear-gradient(180deg,rgba(8,9,10,0.04),rgba(8,9,10,0.66))]" />
              </ScrollReveal>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
