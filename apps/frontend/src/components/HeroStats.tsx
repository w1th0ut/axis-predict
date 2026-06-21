"use client";

import React from "react";

interface HeroStatsProps {
  totalHarvested: number;
  tvl: number;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function HeroStats({ totalHarvested, tvl }: HeroStatsProps) {
  const items = [
    {
      label: "Vault TVL",
      value: CURRENCY_FORMATTER.format(tvl),
      note: "Active liquidity",
    },
    {
      label: "Premium",
      value: CURRENCY_FORMATTER.format(totalHarvested),
      note: "Harvested yield",
    },
    {
      label: "Guardrail",
      value: "20.00%",
      note: "Max allocation",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-3 sm:gap-8">
      {items.map((item, index) => (
        <div
          key={item.label}
          className="axis-stat-reveal grid gap-1"
          style={{ "--axis-index": index } as React.CSSProperties}
        >
          <span className="font-display text-[2.2rem] leading-none tracking-[-0.04em] text-[var(--axis-text-primary)] tabular-nums sm:text-[2.6rem]">
            {item.value}
          </span>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--axis-text-secondary)]">
            {item.label}
          </span>
          <span className="text-sm text-[var(--axis-text-muted)]">{item.note}</span>
        </div>
      ))}
    </div>
  );
}
