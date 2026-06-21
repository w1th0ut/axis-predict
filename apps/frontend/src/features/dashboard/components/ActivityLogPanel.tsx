"use client";

import React from "react";
import DashboardPanel from "./DashboardPanel";
import { ActivityLogData, ActivityStatus } from "../types";

const STATUS_STYLES: Record<ActivityStatus, string> = {
  success:
    "bg-[rgba(16,185,129,0.14)] text-[#7ce0b7] border-[rgba(16,185,129,0.18)]",
  pending:
    "bg-[rgba(245,158,11,0.12)] text-[#f5c36d] border-[rgba(245,158,11,0.18)]",
  failed:
    "bg-[rgba(239,68,68,0.12)] text-[#ff9a9a] border-[rgba(239,68,68,0.18)]",
};

export default function ActivityLogPanel({
  data,
}: {
  data: ActivityLogData;
}) {
  return (
    <DashboardPanel className="min-h-[18rem] p-7 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
            Activity
          </div>
          <div className="mt-3 text-lg font-medium text-[var(--axis-text-primary)]">
            Recent vault actions and strategy events
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-[1rem] border border-[rgba(255,255,255,0.06)]">
        <div className="grid grid-cols-[0.8fr_1.4fr_0.8fr_1fr_0.8fr] gap-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3 text-[0.72rem] font-mono uppercase tracking-[0.15em] text-[var(--axis-text-muted)]">
          <span>Time</span>
          <span>Action</span>
          <span>Amount</span>
          <span>Result</span>
          <span>Status</span>
        </div>

        <div className="divide-y divide-[rgba(255,255,255,0.05)]">
          {data.rows.map((row) => (
            <div
              key={row.id}
              className="grid grid-cols-[0.8fr_1.4fr_0.8fr_1fr_0.8fr] gap-4 px-4 py-4 text-sm text-[var(--axis-text-secondary)]"
            >
              <span className="text-[var(--axis-text-primary)]">
                {row.timeLabel}
              </span>
              <span>{row.actionLabel}</span>
              <span>{row.amountLabel}</span>
              <span>{row.resultLabel}</span>
              <span>
                <span
                  className={`inline-flex rounded-full border px-2.5 py-1 text-[0.72rem] font-medium ${STATUS_STYLES[row.status]}`}
                >
                  {row.status}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardPanel>
  );
}
