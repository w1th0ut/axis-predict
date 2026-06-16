"use client";

import React from "react";

interface MetricsProps {
  tvl: number;
  totalHarvested: number;
}

export default function Metrics({ tvl, totalHarvested }: MetricsProps) {
  // Helper to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <section className="border-y border-[#1e2227] bg-[#121417]/20 relative z-10 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 items-center">
        <div className="flex flex-col border-r border-[#1e2227] last:border-0 lg:pr-4">
          <span className="text-[9px] uppercase tracking-wider text-[#9ca3af] font-bold">Total Value Locked</span>
          <span className="text-lg md:text-xl font-bold text-white mt-1 tabular-nums">
            {formatCurrency(tvl)}
          </span>
        </div>

        <div className="flex flex-col lg:border-r border-[#1e2227] last:border-0 lg:px-4">
          <span className="text-[9px] uppercase tracking-wider text-[#9ca3af] font-bold">Target APY</span>
          <span className="text-lg md:text-xl font-bold text-[#10b981] mt-1 tabular-nums">
            42.68%
          </span>
        </div>

        <div className="flex flex-col border-r border-[#1e2227] last:border-0 lg:px-4">
          <span className="text-[9px] uppercase tracking-wider text-[#9ca3af] font-bold">Premium Harvested</span>
          <span className="text-lg md:text-xl font-bold text-white mt-1 tabular-nums">
            {formatCurrency(totalHarvested)}
          </span>
        </div>

        <div className="flex flex-col last:border-0 lg:pl-4">
          <span className="text-[9px] uppercase tracking-wider text-[#9ca3af] font-bold">Move Safety Limit</span>
          <span className="text-lg md:text-xl font-bold text-[#2e7cf6] mt-1 tabular-nums">
            20.00% TVL
          </span>
        </div>
      </div>
    </section>
  );
}
