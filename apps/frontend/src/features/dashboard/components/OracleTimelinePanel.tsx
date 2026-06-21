"use client";

import React from "react";
import DashboardPanel from "./DashboardPanel";
import { OracleTimelineData } from "../types";

export default function OracleTimelinePanel({
  data,
}: {
  data: OracleTimelineData;
}) {
  const displaySteps = [
    {
      label: "Trading Open",
      active:
        data.lifecycle === "active" ||
        data.lifecycle === "pending_settlement" ||
        data.lifecycle === "settled",
      current: data.lifecycle === "active",
    },
    {
      label: "Awaiting Settlement",
      active:
        data.lifecycle === "pending_settlement" || data.lifecycle === "settled",
      current: data.lifecycle === "pending_settlement",
    },
    {
      label: "Redeem Ready",
      active: data.lifecycle === "settled",
      current: data.lifecycle === "settled",
    },
  ];

  return (
    <DashboardPanel className="h-full min-h-[16rem] p-7 sm:p-8">
      <div className="flex h-full flex-col">
        <div>
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
            Market Cycle
          </div>
          <div className="mt-3 text-lg font-medium text-[var(--axis-text-primary)]">
            {data.marketLabel}
          </div>
        </div>

        <div className="mt-7 grid gap-4 sm:grid-cols-3">
          {displaySteps.map((step, index) => (
            <div key={step.label} className="relative">
              {index < displaySteps.length - 1 ? (
                <div className="absolute left-[1.1rem] top-[0.6rem] hidden h-px w-[calc(100%-0.5rem)] bg-[rgba(255,255,255,0.08)] sm:block" />
              ) : null}

              <div className="relative flex items-center gap-3">
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full border text-[0.72rem] font-medium ${
                    step.current
                      ? "border-[rgba(46,124,246,0.5)] bg-[rgba(46,124,246,0.16)] text-[var(--axis-text-primary)] shadow-[0_0_22px_rgba(46,124,246,0.2)]"
                      : step.active
                        ? "border-[rgba(46,124,246,0.22)] bg-[rgba(46,124,246,0.06)] text-[var(--axis-text-primary)]"
                      : "border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[var(--axis-text-muted)]"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-sm ${
                    step.current || step.active
                      ? "text-[var(--axis-text-primary)]"
                      : "text-[var(--axis-text-muted)]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 text-sm text-[var(--axis-text-secondary)] sm:grid-cols-2">
          <OracleMeta label="Expiry" value={data.expiryLabel} />
          <OracleMeta
            label="Last Price Update"
            value={data.lastPriceUpdateLabel}
          />
          <OracleMeta label="Last Volatility Update" value={data.lastSviUpdateLabel} />
          <OracleMeta label="Current Phase" value={displaySteps.find((step) => step.current)?.label ?? "Trading Open"} />
        </div>
      </div>
    </DashboardPanel>
  );
}

function OracleMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
      <div className="font-mono text-[0.66rem] uppercase tracking-[0.15em] text-[var(--axis-text-muted)]">
        {label}
      </div>
      <div className="mt-2 text-[0.98rem] capitalize text-[var(--axis-text-primary)]">
        {value.replaceAll("_", " ")}
      </div>
    </div>
  );
}
