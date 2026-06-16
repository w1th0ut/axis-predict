"use client";

import React from "react";
import ScrollReveal from "./ScrollReveal";

export default function Integrations() {
  return (
    <section id="integrations" className="mx-auto max-w-7xl px-6 py-20 border-t border-[#1e2227]">
      <ScrollReveal>
        <div className="flex flex-col items-center text-center gap-2 max-w-md mx-auto mb-14">
          <span className="text-xs uppercase font-semibold text-[#2e7cf6] tracking-wider">Integrations</span>
          <h2 className="text-2xl font-bold text-white tracking-tight">Powered by</h2>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Sui Network */}
        <ScrollReveal delay={0}>
          <div className="group rounded-md border border-[#1e2227] bg-[#121417] p-5 flex flex-col gap-2.5 items-center text-center hover:border-[#2e7cf6]/50 transition-all duration-300">
            <svg className="w-8 h-8 text-[#38b6ff] transition-transform duration-300 group-hover:scale-105" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5zm0-4c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5 1.5.67 1.5 1.5z" />
            </svg>
            <h4 className="text-sm font-semibold text-white">Sui Blockchain</h4>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Enables instant multi-range execution via Programmable Transaction Blocks.
            </p>
          </div>
        </ScrollReveal>

        {/* DeepBook */}
        <ScrollReveal delay={100}>
          <div className="group rounded-md border border-[#1e2227] bg-[#121417] p-5 flex flex-col gap-2.5 items-center text-center hover:border-[#10b981]/50 transition-all duration-300">
            <svg className="w-8 h-8 text-[#10b981] transition-transform duration-300 group-hover:scale-105" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H8V4h12v12z" />
            </svg>
            <h4 className="text-sm font-semibold text-white">DeepBook Predict</h4>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Underlying prediction protocol for cycle settlements and volatility publishing.
            </p>
          </div>
        </ScrollReveal>

        {/* OpenRouter */}
        <ScrollReveal delay={200}>
          <div className="group rounded-md border border-[#1e2227] bg-[#121417] p-5 flex flex-col gap-2.5 items-center text-center hover:border-[#06b6d4]/50 transition-all duration-300">
            <svg className="w-8 h-8 text-[#06b6d4] transition-transform duration-300 group-hover:scale-105" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 2 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 14L12 10L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h4 className="text-sm font-semibold text-white">OpenRouter API</h4>
            <p className="text-xs text-[#9ca3af] leading-relaxed">
              Facilitates off-chain quantitative AI analysis and volatility mapping.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
