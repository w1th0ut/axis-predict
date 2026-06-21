"use client";

import React from "react";
import AnimatedHeroWord from "./AnimatedHeroWord";
import HeroStats from "./HeroStats";
import HeroVisual from "./HeroVisual";

interface HeroSectionProps {
  totalHarvested: number;
  tvl: number;
  waveOffset: number;
}

export default function HeroSection({
  totalHarvested,
  tvl,
  waveOffset,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden">
      <HeroVisual waveOffset={waveOffset} />
      <div className="relative mx-auto min-h-[calc(100svh-5.75rem)] max-w-[90rem] px-5 pb-8 pt-10 sm:px-6 md:pb-10 md:pt-14 lg:px-10 lg:pb-12 lg:pt-16">
        <div className="flex min-h-[calc(100svh-8.5rem)] flex-col justify-center">
          <div className="max-w-[32rem]">
            <span className="axis-intro axis-intro--eyebrow font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
              AI volatility harvesting on Sui
            </span>
            <h1 className="axis-intro axis-intro--headline font-display mt-5 text-[3.6rem] leading-[0.9] tracking-[-0.06em] text-[var(--axis-text-primary)] sm:text-[4.8rem] lg:text-[5.9rem]">
              <span className="block whitespace-nowrap">Range premium,</span>
              <span className="block whitespace-nowrap">
                forever <AnimatedHeroWord />
              </span>
            </h1>
            <p className="axis-intro axis-intro--copy mt-8 max-w-[28rem] text-[1.05rem] leading-8 text-[var(--axis-text-muted)] text-pretty">
              SVI-driven execution, liquid vault shares, and a hard 20%
              on-chain allocation cap.
            </p>
            <div aria-hidden="true" className="mt-8 h-12" />
          </div>

          <div className="axis-intro axis-intro--stats relative z-10 mt-10 max-w-[56rem] border-t border-[rgba(255,255,255,0.08)] pt-6">
            <HeroStats totalHarvested={totalHarvested} tvl={tvl} />
          </div>
        </div>
      </div>
      {/* Smooth blurry transition separator */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-28 pointer-events-none z-20 bg-gradient-to-t from-[var(--axis-background)] to-transparent backdrop-blur-[12px]"
        style={{ 
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)"
        }}
      />
    </section>
  );
}
