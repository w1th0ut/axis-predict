"use client";

import React, { useEffect, useState } from "react";

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
  const [displayTvl, setDisplayTvl] = useState<string>(() =>
    CURRENCY_FORMATTER.format(tvl),
  );
  const [displayHarvested, setDisplayHarvested] = useState<string>(() =>
    CURRENCY_FORMATTER.format(totalHarvested),
  );

  // Run the randomizer decrypt animation on mount
  useEffect(() => {
    const runRandomizer = (
      targetVal: number,
      setValue: (val: string) => void
    ) => {
      const targetStr = CURRENCY_FORMATTER.format(targetVal);
      const chars = targetStr.split("");
      const duration = 1200; // 1.2 seconds animation
      const fps = 30; // 30 updates per second
      const intervalMs = 1000 / fps;
      const totalFrames = duration / intervalMs;
      let frame = 0;

      const timer = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;

        if (progress >= 1) {
          setValue(targetStr);
          clearInterval(timer);
          return;
        }

        const animatedStr = chars
          .map((char, index) => {
            // Keep formatting characters unchanged
            if (char === "$" || char === "," || char === "." || char === "-") {
              return char;
            }
            // Lock characters from left to right as time progresses
            const lockThreshold = progress * chars.length;
            if (index < lockThreshold) {
              return char;
            }
            // Generate random numeric digits (0-9)
            return Math.floor(Math.random() * 10).toString();
          })
          .join("");

        setValue(animatedStr);
      }, intervalMs);

      return () => clearInterval(timer);
    };

    const cleanupTvl = runRandomizer(tvl, setDisplayTvl);
    const cleanupHarvested = runRandomizer(totalHarvested, setDisplayHarvested);

    return () => {
      cleanupTvl();
      cleanupHarvested();
    };
  }, [tvl, totalHarvested]);

  const items = [
    {
      label: "Vault TVL",
      value: displayTvl,
      note: "Active liquidity",
    },
    {
      label: "Premium",
      value: displayHarvested,
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
