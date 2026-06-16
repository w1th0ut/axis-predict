"use client";

import React from "react";
import ScrollReveal from "./ScrollReveal";

export default function HeroCopy() {
  return (
    <div className="flex flex-col items-start text-left gap-5">
      <ScrollReveal delay={0}>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#1e2227] bg-[#121417] px-3.5 py-1 text-[10px] uppercase tracking-wider font-semibold">
          <span className="flex h-1.5 w-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[#9ca3af]">DeepBook Predict sponsored track</span>
        </div>
      </ScrollReveal>
      
      <ScrollReveal delay={100}>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1]">
          Harvest Yield. <br className="hidden sm:inline" />
          <span className="text-[#2e7cf6]">Otonomously.</span>
        </h1>
      </ScrollReveal>

      <ScrollReveal delay={200}>
        <p className="max-w-md text-sm md:text-base leading-relaxed text-[#9ca3af]">
          Autonomous volatility harvesting on Sui. Deploying curve-optimized Range-Ladder strategies on DeepBook Predict under on-chain risk guardrails.
        </p>
      </ScrollReveal>

      <ScrollReveal delay={300}>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-2">
          <button className="h-10 items-center justify-center rounded-sm bg-[#2e7cf6] hover:bg-[#1b62d1] px-6 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(46,124,246,0.3)] active:scale-[0.98] inline-flex">
            Launch App
          </button>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="h-10 items-center justify-center rounded-sm border border-[#1e2227] bg-[#121417] px-6 text-xs font-bold uppercase tracking-wider text-[#f3f4f6] transition-all duration-300 hover:bg-[#1e2227] hover:border-[#2d323b] active:scale-[0.98] inline-flex gap-2">
            Developer Spec
          </a>
        </div>
      </ScrollReveal>
    </div>
  );
}
