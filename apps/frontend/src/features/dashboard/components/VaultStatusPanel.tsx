"use client";

import React from "react";
import DashboardPanel from "./DashboardPanel";
import { VaultStatusData } from "../types";

export default function VaultStatusPanel({
  data,
}: {
  data: VaultStatusData;
}) {
  const metrics = [
    { label: "Vault TVL", value: data.tvlUsd },
    { label: "Premium Harvested", value: data.premiumHarvestedUsd },
    { label: "Share Price", value: data.sharePrice },
    { label: "Utilization", value: `${data.utilizationPct}%` },
  ];

  return (
    <DashboardPanel className="h-full min-h-[21rem] p-7 sm:p-8">
      <div className="flex h-full flex-col">
        <div>
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
            Vault Status
          </div>
          <div className="mt-3 text-lg font-medium text-[var(--axis-text-primary)]">
            {data.modeLabel}
          </div>
        </div>

        <div className="mt-8 grid flex-1 gap-4 sm:grid-cols-2">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-[1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4"
            >
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[var(--axis-text-muted)]">
                {metric.label}
              </div>
              <div className="mt-4 text-[1.35rem] font-medium text-[var(--axis-text-primary)]">
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}
