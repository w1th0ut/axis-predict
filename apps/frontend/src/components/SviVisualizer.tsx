"use client";

import React from "react";

interface SviVisualizerProps {
  marketRegime: "low" | "high" | "outlier";
  onRegimeChange: (regime: "low" | "high" | "outlier") => void;
  waveOffset: number;
  currentSuiPrice: number;
  systemCycle: number;
}

export default function SviVisualizer({
  marketRegime,
  onRegimeChange,
  waveOffset,
  currentSuiPrice,
  systemCycle,
}: SviVisualizerProps) {
  // SVG Paths and configurations for different Volatility Regimes
  const getCurvePath = () => {
    const factor = waveOffset * 6;
    switch (marketRegime) {
      case "low":
        return `M 20 ${140 + factor} Q 120 ${105 - factor} 200 ${115 + factor} T 380 ${130 - factor}`;
      case "high":
        return `M 20 ${175 + factor * 2} Q 110 ${40 - factor * 3} 200 ${140 + factor * 2} T 380 ${65 - factor * 2}`;
      case "outlier":
        return `M 20 ${190 + factor} Q 110 5 200 ${180 - factor} T 380 ${30 + factor}`;
      default:
        return "";
    }
  };

  return (
    <div className="w-full max-w-[420px] rounded-md border border-[#1e2227] bg-[#121417] p-5 relative overflow-hidden flex flex-col gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
      {/* Volatility Regime Selector */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[9px] text-[#9ca3af] uppercase tracking-wider font-semibold">Active Strategy Selector</span>
        <div className="grid grid-cols-3 gap-1 rounded bg-[#08090a] p-1 border border-[#1e2227]">
          <button
            onClick={() => onRegimeChange("low")}
            className={`rounded py-1 text-[9px] font-bold uppercase tracking-wider transition-all duration-200 ${
              marketRegime === "low" ? "bg-[#2e7cf6] text-white" : "text-[#9ca3af] hover:text-white"
            }`}
          >
            Steady Vol
          </button>
          <button
            onClick={() => onRegimeChange("high")}
            className={`rounded py-1 text-[9px] font-bold uppercase tracking-wider transition-all duration-200 ${
              marketRegime === "high" ? "bg-[#10b981] text-white" : "text-[#9ca3af] hover:text-white"
            }`}
          >
            High Vol
          </button>
          <button
            onClick={() => onRegimeChange("outlier")}
            className={`rounded py-1 text-[9px] font-bold uppercase tracking-wider transition-all duration-200 ${
              marketRegime === "outlier" ? "bg-[#ef4444] text-white" : "text-[#9ca3af] hover:text-white"
            }`}
          >
            Outlier
          </button>
        </div>
      </div>

      {/* Dynamic Graph Screen */}
      <div className="h-48 bg-[#08090a] rounded border border-[#1e2227] relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          {/* Grid Lines */}
          <line x1="0" y1="50" x2="400" y2="50" stroke="#111317" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="100" x2="400" y2="100" stroke="#111317" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="0" y1="150" x2="400" y2="150" stroke="#111317" strokeWidth="1" strokeDasharray="4 4" />
          
          {/* Volatility SVI Curve */}
          <path
            d={getCurvePath()}
            fill="none"
            stroke={marketRegime === "low" ? "#2e7cf6" : marketRegime === "high" ? "#10b981" : "#ef4444"}
            strokeWidth="2"
            className="transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
          />

          {/* Historical volatility representation */}
          <path
            d="M 20 155 Q 115 80 200 135 T 380 95"
            fill="none"
            stroke="#16181f"
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Strategy Ranges */}
          {marketRegime !== "outlier" && (
            <g className="transition-all duration-500">
              {marketRegime === "low" ? (
                <>
                  <rect x="120" y="80" width="60" height="40" fill="#2e7cf6" fillOpacity="0.08" stroke="#2e7cf6" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="120" y1="80" x2="180" y2="80" stroke="#2e7cf6" strokeWidth="1.5" />
                  <line x1="120" y1="120" x2="180" y2="120" stroke="#2e7cf6" strokeWidth="1.5" />

                  <rect x="220" y="85" width="60" height="35" fill="#2e7cf6" fillOpacity="0.08" stroke="#2e7cf6" strokeWidth="1" strokeDasharray="2 2" />
                  <line x1="220" y1="85" x2="280" y2="85" stroke="#2e7cf6" strokeWidth="1.5" />
                  <line x1="220" y1="120" x2="280" y2="120" stroke="#2e7cf6" strokeWidth="1.5" />
                </>
              ) : (
                <>
                  <rect x="60" y="50" width="100" height="90" fill="#10b981" fillOpacity="0.06" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="60" y1="50" x2="160" y2="50" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="60" y1="140" x2="160" y2="140" stroke="#10b981" strokeWidth="1.5" />

                  <rect x="240" y="30" width="100" height="85" fill="#10b981" fillOpacity="0.06" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="240" y1="30" x2="340" y2="30" stroke="#10b981" strokeWidth="1.5" />
                  <line x1="240" y1="115" x2="340" y2="115" stroke="#10b981" strokeWidth="1.5" />
                </>
              )}
            </g>
          )}

          {/* Outlier Alert */}
          {marketRegime === "outlier" && (
            <g className="animate-pulse">
              <rect x="100" y="30" width="200" height="130" fill="#ef4444" fillOpacity="0.04" stroke="#ef4444" strokeWidth="1" strokeDasharray="5 5" />
              <line x1="100" y1="30" x2="300" y2="30" stroke="#ef4444" strokeWidth="2" />
              <line x1="100" y1="160" x2="300" y2="160" stroke="#ef4444" strokeWidth="2" />
              <text x="142" y="90" fill="#ef4444" fontSize="10" fontWeight="bold">SECURITY BOUND BREACHED</text>
              <text x="154" y="108" fill="#ef4444" fontSize="8">Move Guardrail Halts Trade</text>
            </g>
          )}

          {/* Price Dot */}
          <circle cx="200" cy={marketRegime === "low" ? 115 + waveOffset * 6 : marketRegime === "high" ? 140 + waveOffset * 12 : 180 - waveOffset * 6} r="5" fill="#f3f4f6" stroke={marketRegime === "low" ? "#2e7cf6" : marketRegime === "high" ? "#10b981" : "#ef4444"} strokeWidth="2" />
          <text x="205" y="125" fill="#f3f4f6" fontSize="9" className="tabular-nums font-semibold">SUI: ${currentSuiPrice.toFixed(4)}</text>
        </svg>
        
        {/* Bottom stats overlay */}
        <div className="absolute bottom-2 left-3 right-3 flex justify-between text-[8px] text-[#9ca3af] font-semibold tracking-wider font-mono uppercase">
          <span>VOL: 1.28M SUI</span>
          <span>IV: {marketRegime === "low" ? "24.8%" : marketRegime === "high" ? "72.4%" : "184.2%"}</span>
        </div>
      </div>

      {/* AI Reasoning Log */}
      <div className="bg-[#08090a] rounded border border-[#1e2227] p-3 text-[10px] text-[#9ca3af] flex flex-col gap-2 h-20 justify-between">
        <div className="flex items-center gap-1.5 border-b border-[#1e2227] pb-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${marketRegime === "low" ? "bg-[#2e7cf6]" : marketRegime === "high" ? "bg-[#10b981]" : "bg-[#ef4444]"}`} />
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${marketRegime === "low" ? "bg-[#2e7cf6]" : marketRegime === "high" ? "bg-[#10b981]" : "bg-[#ef4444]"}`} />
          </span>
          <span className="font-semibold text-white uppercase tracking-wider text-[8px]">AI Decision Rationale</span>
        </div>
        <div className="flex-1 flex items-center leading-normal font-mono text-[9px]">
          {marketRegime === "low" && (
            <p className="text-[#2e7cf6]">
              &gt; Volatility steady. Deploying narrow-band Range-Ladder to capture maximum yield premium.
            </p>
          )}
          {marketRegime === "high" && (
            <p className="text-[#10b981]">
              &gt; Volatility spike. Deploying wide delta bounds to prevent prediction expiry breaches.
            </p>
          )}
          {marketRegime === "outlier" && (
            <p className="text-[#ef4444] font-semibold">
              &gt; Volatility outlier. Allocation parameters breached. Initiating move guardrail abort check.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
