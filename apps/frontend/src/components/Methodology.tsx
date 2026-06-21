"use client";

import Image from "next/image";
import React from "react";
import BorderGlowCard from "./BorderGlowCard";
import FerrofluidField from "./FerrofluidField";
import ScrollReveal from "./ScrollReveal";

const FEATURE_CARDS = [
  {
    index: "02",
    title: "Live AI Reasoning",
    body: "Every execution path is surfaced as readable reasoning, not hidden behind a black box.",
    metric: "24/7",
    footnote: "agent cadence",
  },
  {
    index: "03",
    title: "Tokenized Vault Shares",
    body: "Deposits become liquid vault shares so capital stays legible and composable.",
    metric: "pUSDC",
    footnote: "share token",
  },
  {
    index: "04",
    title: "DeepBook Predict Sync",
    body: "Strategy tracks rolling market conditions so the vault reacts with discipline, not impulse.",
    metric: "SVI",
    footnote: "pricing surface",
  },
];

export default function Methodology() {
  return (
    <section
      id="strategy"
      className="bg-[var(--axis-background)]"
    >
      <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-6 lg:px-10 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-start">
          <ScrollReveal className="max-w-[42rem]" variant="left">
            <span className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
              Strategy
            </span>
            <h2 className="font-display mt-5 text-[3.35rem] leading-[0.92] tracking-[-0.06em] text-[var(--axis-text-primary)] sm:text-[4.3rem] lg:text-[5.4rem]">
              <span className="block whitespace-nowrap">Model-led,</span>
              <span className="block whitespace-nowrap">contract-bound</span>
            </h2>
          </ScrollReveal>
        </div>

        <div className="mt-14 grid gap-6">
          <ScrollReveal variant="glow">
            <article className="overflow-hidden rounded-[1.6rem] border border-[rgba(255,255,255,0.07)] bg-[rgba(10,12,15,0.92)]">
              <div className="relative grid min-h-[31rem] gap-0 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <div className="relative z-10 flex flex-col justify-between overflow-hidden rounded-l-[1.6rem] p-8 md:p-10">
                  <FerrofluidField />
                  <div>
                    <span className="font-mono text-[0.78rem] uppercase tracking-[0.16em] text-[var(--axis-text-muted)]">
                      01
                    </span>
                    <h3 className="relative mt-8 text-[2.35rem] leading-tight tracking-[-0.04em] text-[var(--axis-text-primary)] sm:text-[3rem]">
                      Sui Move Guardrails
                    </h3>
                    <p className="relative mt-6 max-w-[28rem] text-[1.02rem] leading-9 text-[var(--axis-text-secondary)]">
                      The agent can optimize ranges, but it cannot outrun the
                      vault. Allocation ceilings stay enforced on-chain.
                    </p>
                  </div>

                  <div className="relative mt-12">
                    <div className="font-display text-[3.4rem] leading-none tracking-[-0.06em] text-[var(--axis-text-primary)] sm:text-[4.6rem]">
                      20%
                    </div>
                    <div className="mt-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
                      max allocation per execution
                    </div>
                  </div>
                </div>

                <div className="relative z-10 min-h-[22rem] lg:min-h-full">
                  <Image
                    src="/graph.png"
                    alt="Axis Predict strategy graph"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                    className="object-cover object-center opacity-88"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,10,0.1)_0%,rgba(8,9,10,0)_28%,rgba(8,9,10,0.22)_68%,rgba(8,9,10,0.74)_100%)]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_46%,rgba(46,124,246,0.12),transparent_26%)] mix-blend-screen" />
                </div>
              </div>
            </article>
          </ScrollReveal>

          <div className="grid gap-6 lg:grid-cols-3">
            {FEATURE_CARDS.map((card, index) => (
              <ScrollReveal
                key={card.title}
                delay={index * 90}
                variant={index === 1 ? "rise" : index === 2 ? "right" : "left"}
              >
                <BorderGlowCard>
                  <span className="font-mono text-[0.78rem] uppercase tracking-[0.16em] text-[var(--axis-text-muted)]">
                    {card.index}
                  </span>
                  <h3 className="mt-8 text-[2rem] leading-tight tracking-[-0.04em] text-[var(--axis-text-primary)]">
                    {card.title}
                  </h3>
                  <p className="mt-5 text-[1rem] leading-8 text-[var(--axis-text-secondary)]">
                    {card.body}
                  </p>

                  <div className="mt-12">
                    <div className="font-display text-[2.8rem] leading-none tracking-[-0.05em] text-[var(--axis-text-primary)] transition-colors duration-300 group-hover:text-[var(--axis-primary)]">
                      {card.metric}
                    </div>
                    <div className="mt-3 font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
                      {card.footnote}
                    </div>
                  </div>
                </BorderGlowCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
