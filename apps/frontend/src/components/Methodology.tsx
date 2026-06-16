"use client";

import React from "react";
import ScrollReveal from "./ScrollReveal";

export default function Methodology() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-20 flex flex-col gap-10">
      <ScrollReveal>
        <div className="flex flex-col items-start gap-2 max-w-xl">
          <span className="text-xs uppercase font-semibold text-[#2e7cf6] tracking-wider">Methodology</span>
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">System Architecture</h2>
        </div>
      </ScrollReveal>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScrollReveal delay={0}>
          <div className="group rounded-md border border-[#1e2227] bg-[#121417] p-5 flex flex-col gap-3 hover:border-[#2e7cf6]/40 transition-all duration-300 hover:bg-[#121417]/80">
            <div className="w-8 h-8 rounded-sm bg-[#2e7cf6]/10 border border-[#2e7cf6]/30 flex items-center justify-center text-[#2e7cf6] transition-transform duration-300 group-hover:scale-105">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m10 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">1. Deposit & Liquid Shares</h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Deposit dUSDC to instantly mint liquid $pUSDC shares representing your active vault position.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="group rounded-md border border-[#1e2227] bg-[#121417] p-5 flex flex-col gap-3 hover:border-[#10b981]/40 transition-all duration-300 hover:bg-[#121417]/80">
            <div className="w-8 h-8 rounded-sm bg-[#10b981]/10 border border-[#10b981]/30 flex items-center justify-center text-[#10b981] transition-transform duration-300 group-hover:scale-105">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">2. SVI Volatility Harvester</h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Off-chain AI Agent calculates SVI volatility curves to automate optimal Range-Ladder positions.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="group rounded-md border border-[#1e2227] bg-[#121417] p-5 flex flex-col gap-3 hover:border-[#ef4444]/40 transition-all duration-300 hover:bg-[#121417]/80">
            <div className="w-8 h-8 rounded-sm bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444] transition-transform duration-300 group-hover:scale-105">
              <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-white">3. Immutable Guardrails</h3>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Sui Move smart contract limits allocation to max 20% TVL per transaction to secure capital.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
