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
            label="Your Deposited dUSDC"
            value={data.depositedDusdc}
          />
          <MetricCard label="Your pUSDC Shares" value={data.pusdcBalance} />
          <MetricCard
            label="Your Net PnL"
            value={data.netPnl.value}
            accent={data.netPnl.positive}
          />
          <MetricCard
            label="Vault Share Growth"
            value={data.shareGrowth.value}
            accent={data.shareGrowth.positive}
          />
        </div>
      </div>
    </DashboardPanel>
  );
}

function MetricCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
      <div className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--axis-text-muted)]">
        {label}
      </div>
      <div
        className={`mt-3 text-[1.15rem] font-medium ${
          accent ? "text-[var(--axis-primary)]" : "text-[var(--axis-text-primary)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
