"use client";

import React from "react";
import DashboardPanel from "./DashboardPanel";
import { RangeDeploymentData } from "../types";

export default function RangeDeploymentPanel({
  data,
}: {
  data: RangeDeploymentData;
}) {
  const domainMin = Math.min(...data.bands.map((band) => band.start));
  const domainMax = Math.max(...data.bands.map((band) => band.end));
  const domainRange = domainMax - domainMin;
  const spotPct = ((data.spotPrice - domainMin) / domainRange) * 100;

  return (
    <DashboardPanel className="min-h-[24rem] p-7 sm:p-8">
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
              Range Deployment
            </div>
            <div className="mt-3 text-lg font-medium text-[var(--axis-text-primary)]">
              {data.deploymentModeLabel}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-[var(--axis-text-muted)]">
              Current Spot
            </div>
            <div className="mt-1 text-[1.12rem] font-medium text-[var(--axis-text-primary)]">
              ${data.spotPrice.toLocaleString("en-US")}
            </div>
          </div>
        </div>

        <div className="relative mt-8 flex-1 overflow-hidden rounded-[1.2rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(7,8,10,0.66)] px-5 py-6">
          <div className="axis-grid absolute inset-0 opacity-25" />

          <div className="relative h-full min-h-[13rem]">
            <div className="absolute left-0 right-0 top-1/2 h-px bg-[rgba(255,255,255,0.08)]" />

            {data.bands.map((band, index) => {
              const left = ((band.start - domainMin) / domainRange) * 100;
              const width = ((band.end - band.start) / domainRange) * 100;
              const top =
                band.label === "previous"
                  ? "58%"
                  : band.label === "active"
                    ? "36%"
                    : "18%";
              const height =
                band.emphasis === "high"
                  ? "3.8rem"
                  : band.emphasis === "medium"
                    ? "2.9rem"
                    : "2.2rem";
              const opacity =
                band.emphasis === "high"
                  ? "0.95"
                  : band.emphasis === "medium"
                    ? "0.65"
                    : "0.28";

              return (
                <div
                  key={`${band.label}-${index}`}
                  className="absolute rounded-[0.95rem] border border-[rgba(113,171,255,0.22)] bg-[linear-gradient(90deg,rgba(46,124,246,0.16),rgba(88,154,255,0.4))] shadow-[0_0_22px_rgba(46,124,246,0.12)]"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                    top,
                    height,
                    opacity,
                  }}
                >
                  <div className="absolute inset-y-0 left-3 flex items-center">
                    <span className="font-mono text-[0.66rem] uppercase tracking-[0.16em] text-[var(--axis-text-primary)]">
                      {band.label}
                    </span>
                  </div>
                </div>
              );
            })}

            <div
              className="absolute bottom-[13%] top-[10%] w-px bg-[rgba(162,209,255,0.78)] shadow-[0_0_18px_rgba(46,124,246,0.38)]"
              style={{ left: `${spotPct}%` }}
            >
              <div className="absolute -left-2 top-0 h-4 w-4 rounded-full border border-[rgba(162,209,255,0.75)] bg-[var(--axis-background)] shadow-[0_0_18px_rgba(46,124,246,0.42)]" />
              <div className="absolute left-3 top-0 rounded-full bg-[rgba(46,124,246,0.18)] px-2.5 py-1 text-[0.72rem] font-medium text-[var(--axis-text-primary)]">
                Spot
              </div>
            </div>
          </div>

          <div className="relative mt-8 grid gap-4 text-sm text-[var(--axis-text-secondary)] sm:grid-cols-4">
            <RangeMeta label="Center Strike" value={`$${data.centerStrike.toLocaleString("en-US")}`} />
            <RangeMeta label="Range Width" value={`±${data.widthPct}%`} />
            <RangeMeta label="Next Expiry" value={data.nextExpiryLabel} />
            <RangeMeta label="Axis" value={`${data.minAxisLabel} - ${data.maxAxisLabel}`} />
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}

function RangeMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[0.66rem] uppercase tracking-[0.15em] text-[var(--axis-text-muted)]">
        {label}
      </div>
      <div className="mt-2 text-[0.98rem] text-[var(--axis-text-primary)]">
        {value}
      </div>
    </div>
  );
}
