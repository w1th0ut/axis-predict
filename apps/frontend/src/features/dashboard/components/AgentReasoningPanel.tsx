"use client";

import React from "react";
import DashboardPanel from "./DashboardPanel";
import { AgentReasoningData, ReasoningTone } from "../types";

const TONE_STYLES: Record<ReasoningTone, string> = {
  info: "text-[var(--axis-text-secondary)]",
  reasoning: "text-[var(--axis-text-primary)]",
  success: "text-[#7ce0b7]",
};

export default function AgentReasoningPanel({
  data,
}: {
  data: AgentReasoningData;
}) {
  return (
    <DashboardPanel className="h-full min-h-[20rem] p-7 sm:p-8">
      <div className="flex h-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
              Live AI Reasoning
            </div>
            <div className="mt-3 text-lg font-medium text-[var(--axis-text-primary)]">
              Agent execution stream
            </div>
          </div>

          <span className="inline-flex items-center gap-2 py-1 text-[0.72rem] font-medium text-[var(--axis-text-primary)]">
            <span className="h-2 w-2 rounded-full bg-[var(--axis-primary)] animate-pulse" />
            Live
          </span>
        </div>

        <div className="mt-8 flex-1 overflow-hidden rounded-[1.1rem] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(5,7,9,0.94),rgba(8,10,13,0.98))]">
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.05)] px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,95,86,0.9)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(255,189,46,0.9)]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[rgba(39,201,63,0.9)]" />
          </div>

          <div className="space-y-3 px-4 py-4 font-mono text-[0.83rem] leading-7 sm:px-5">
            {data.entries.map((entry) => (
              <div key={entry.id}>
                <span className="text-[var(--axis-primary)]">
                  [{entry.timeLabel}]
                </span>{" "}
                <span className={TONE_STYLES[entry.tone]}>{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardPanel>
  );
}
