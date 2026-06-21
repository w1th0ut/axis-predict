"use client";

import React from "react";
import DashboardPanel from "./DashboardPanel";
import { RiskGuardrailsData } from "../types";

export default function RiskGuardrailsPanel({
  data,
}: {
  data: RiskGuardrailsData;
}) {
  return (
    <DashboardPanel className="h-full min-h-[16rem] p-7 sm:p-8">
      <div className="flex h-full flex-col">
        <div>
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
            Risk Guardrails
          </div>
          <p className="mt-3 max-w-[28rem] text-sm leading-7 text-[var(--axis-text-secondary)]">
            {data.summary}
          </p>
        </div>

        <div className="mt-8 grid gap-5">
          {data.metrics.map((metric) => (
            <div key={metric.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="text-[var(--axis-text-secondary)]">
                  {metric.label}
                </span>
                <span className="font-medium text-[var(--axis-text-primary)]">
                  {metric.valueLabel}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[rgba(255,255,255,0.06)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#2e7cf6,#71abff)]"
                  style={{ width: `${metric.progressPct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}
