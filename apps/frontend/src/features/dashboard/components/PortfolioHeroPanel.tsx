"use client";

import React from "react";
import DashboardPanel from "./DashboardPanel";
import { PortfolioHeroData } from "../types";

export default function PortfolioHeroPanel({
  data,
}: {
  data: PortfolioHeroData;
}) {
  return (
    <DashboardPanel className="h-full min-h-[18rem] p-7 sm:p-8">
      <div className="flex h-full flex-col justify-between gap-8">
        <div>
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
            Total Portfolio Value
          </div>
          <div className="font-display mt-4 text-[3.3rem] leading-[0.92] tracking-[-0.06em] text-[var(--axis-text-primary)] sm:text-[4.4rem]">
            {data.totalValueUsd}
          </div>
        </div>

        <p className="max-w-[36rem] text-[1.02rem] leading-8 text-[var(--axis-text-secondary)]">
          {data.summary}
        </p>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Current Claim Value"
            value={data.depositedDusdc}
          />
          <MetricCard label="Vault Shares Held" value={data.pusdcBalance} />
          <MetricCard
            label="Your Net PnL"
            value={data.netPnl.value}
            tone={data.netPnl.tone}
          />
          <MetricCard
            label="Vault Share Growth"
            value={data.shareGrowth.value}
            tone={data.shareGrowth.tone}
          />
        </div>
      </div>
    </DashboardPanel>
  );
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative" | "neutral";
}) {
  const toneClass =
    tone === "positive"
      ? "text-[var(--axis-primary)]"
      : tone === "negative"
        ? "text-[#ef5f7a]"
        : "text-[var(--axis-text-primary)]";

  return (
    <div className="rounded-[1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
      <div className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--axis-text-muted)]">
        {label}
      </div>
      <div className={`mt-3 text-[1.15rem] font-medium ${toneClass}`}>
        {value}
      </div>
    </div>
  );
}
