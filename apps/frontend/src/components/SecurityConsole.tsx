"use client";

import React from "react";
import ScrollReveal from "./ScrollReveal";

interface SecurityConsoleProps {
  marketRegime: "low" | "high" | "outlier";
  onRegimeChange: (regime: "low" | "high" | "outlier") => void;
  simulationActive: boolean;
  simulationError: boolean;
  tvl: number;
}

export default function SecurityConsole({
  marketRegime,
  onRegimeChange,
  simulationActive,
  simulationError,
  tvl,
}: SecurityConsoleProps) {
  const formattedTvl = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(tvl);

  return (
    <section id="security" className="border-t border-[#1e2227] bg-[#121417]/10 py-20 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-6 flex flex-col items-start gap-4">
          <ScrollReveal>
            <span className="text-xs uppercase font-semibold text-[#ef4444] tracking-wider">On-Chain Protection</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">On-Chain Safety Proof</h2>
            <p className="text-xs md:text-sm leading-relaxed text-[#9ca3af]">
              Simulate a high-exposure trade request to verify how the Sui Move smart contract programmatically halts execution on-chain.
            </p>
            
            <div className="flex gap-4 mt-2">
              <button 
                onClick={() => onRegimeChange("outlier")}
                disabled={simulationActive && simulationError}
                className="h-9 items-center justify-center rounded-sm bg-[#ef4444] hover:bg-[#d83535] px-4 text-xs font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] active:scale-[0.98] disabled:opacity-50 inline-flex"
              >
                Test Guardrail Abort
              </button>
              {(simulationActive || marketRegime === "outlier") && (
                <button 
                  onClick={() => onRegimeChange("low")}
                  className="h-9 items-center justify-center rounded-sm border border-[#1e2227] bg-[#121417] px-4 text-xs font-semibold text-[#f3f4f6] hover:bg-[#1e2227] transition-all duration-300 inline-flex"
                >
                  Reset Console
                </button>
              )}
            </div>
          </ScrollReveal>
        </div>

        <div className="lg:col-span-6 w-full">
          <ScrollReveal delay={100}>
            <div className="rounded-md border border-[#1e2227] bg-[#121417] overflow-hidden shadow-[0_15px_30px_rgba(0,0,0,0.4)]">
              {/* Header */}
              <div className="border-b border-[#1e2227] bg-[#0c0d0f] px-4 py-3 flex items-center justify-between">
                <span className="text-xs font-mono text-[#9ca3af]">axis_vault::execute_strategy simulator</span>
                <span className={`flex h-2 w-2 rounded-full ${simulationError ? "bg-[#ef4444]" : "bg-[#10b981] animate-pulse"}`} />
              </div>

              {/* Console Body */}
              <div className="p-5 font-mono text-[10px] md:text-xs flex flex-col gap-2.5 min-h-[190px] bg-[#08090a] leading-relaxed">
                <div className="text-[#9ca3af]">
                  &gt; SUI MOVE VM ACTIVE (max_allocation_bps = 2000)<br />
                  &gt; TVL VAULT AUDITED: {formattedTvl} dUSDC
                </div>

                {simulationActive && (
                  <div className="text-[#2e7cf6] animate-pulse">
                    &gt; execute_strategy() signed by AgentCap<br />
                    &gt; requested_amount = $9,986,323 (80% of TVL)
                  </div>
                )}

                {simulationError && (
                  <div className="rounded border border-[#ef4444]/30 bg-[#ef4444]/10 p-3 mt-1 flex flex-col gap-1.5 text-[#ef4444] animate-fadeIn">
                    <div className="flex items-center gap-2 font-semibold">
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      TRANSACTION ABORTED BY SUI MOVE VM
                    </div>
                    <p className="text-[9px] md:text-[10px] leading-normal opacity-90">
                      Error Code: 4001 (EAllocationLimitExceeded)<br />
                      requested_amount ($9,986,323) exceeds 20% TVL limit ($2,496,580). Transaction reverted.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
