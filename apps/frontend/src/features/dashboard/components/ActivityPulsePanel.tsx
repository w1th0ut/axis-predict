"use client";

import React from "react";
import DashboardPanel from "./DashboardPanel";
import { ActivityLogData, OracleTimelineData } from "../types";

export default function ActivityPulsePanel({
  activity,
  oracle,
}: {
  activity: ActivityLogData;
  oracle: OracleTimelineData;
}) {
  const latest = activity.rows[0];
  const pendingCount = activity.rows.filter((row) => row.status === "pending").length;

  return (
    <DashboardPanel className="h-full min-h-[18rem] p-7 sm:p-8">
      <div className="flex h-full flex-col">
        <div>
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
            Activity Pulse
          </div>
          <div className="mt-3 text-lg font-medium text-[var(--axis-text-primary)]">
            Live cycle snapshot
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          <PulseItem
            label="Latest Event"
            value={latest?.actionLabel ?? "No recent activity"}
            detail={latest ? `${latest.timeLabel} · ${latest.resultLabel}` : "Awaiting next action"}
          />
          <PulseItem
            label="Pending Actions"
            value={`${pendingCount}`}
            detail="Queued events waiting for execution or settlement"
          />
          <PulseItem
            label="Next Oracle Milestone"
            value={oracle.expiryLabel}
            detail={oracle.marketLabel}
          />
        </div>
      </div>
    </DashboardPanel>
  );
}

function PulseItem({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
      <div className="font-mono text-[0.66rem] uppercase tracking-[0.15em] text-[var(--axis-text-muted)]">
        {label}
      </div>
      <div className="mt-3 text-[1.05rem] font-medium text-[var(--axis-text-primary)]">
        {value}
      </div>
      <div className="mt-1 text-sm leading-6 text-[var(--axis-text-muted)]">
        {detail}
      </div>
    </div>
  );
}
