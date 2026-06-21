"use client";

import React, { useState } from "react";
import DashboardPanel from "./DashboardPanel";
import { VaultActionPanelData } from "../types";

export default function VaultActionPanel({
  data,
}: {
  data: VaultActionPanelData;
}) {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">(
    data.activeTab,
  );
  const [amount, setAmount] = useState("");

  return (
    <DashboardPanel className="h-full min-h-[18rem] p-7 sm:p-8">
      <div className="flex h-full flex-col gap-6">
        <div className="flex gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-1">
          {(["deposit", "withdraw"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setAmount("");
              }}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab
                  ? "bg-[var(--axis-text-primary)] text-[var(--axis-background)]"
                  : "text-[var(--axis-text-secondary)] hover:text-[var(--axis-text-primary)]"
              }`}
            >
              {tab === "deposit" ? "Deposit" : "Withdraw"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 text-sm text-[var(--axis-text-muted)]">
            <span>
              {activeTab === "deposit"
                ? `Available: ${data.availableDusdc}`
                : `Available: ${data.availablePusdc}`}
            </span>
            <button
              type="button"
              onClick={() =>
                setAmount(
                  activeTab === "deposit" ? "2450.00" : data.availablePusdc,
                )
              }
              className="text-[var(--axis-primary)] transition-colors hover:text-[#5b9cff]"
            >
              Max
            </button>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-[var(--axis-text-secondary)]">
              Amount
            </span>
            <div className="rounded-[1.05rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                className="w-full bg-transparent text-[1.4rem] font-medium text-[var(--axis-text-primary)] outline-none placeholder:text-[var(--axis-text-muted)]"
                placeholder={
                  activeTab === "deposit"
                    ? "Enter dUSDC amount"
                    : "Enter pUSDC amount"
                }
              />
            </div>
          </label>
        </div>

        <div className="rounded-[1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
          <div className="flex items-center justify-between gap-4 text-sm text-[var(--axis-text-secondary)]">
            <span>{data.estimatedOutputLabel}</span>
            <span className="font-medium text-[var(--axis-text-primary)]">
              {activeTab === "deposit"
                ? data.estimatedOutputValue
                : data.availableDusdc}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm text-[var(--axis-text-muted)]">
            <span>Share price</span>
            <span>{data.sharePrice}</span>
          </div>
        </div>

        <button
          type="button"
          className="mt-auto inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--axis-primary)] px-5 text-sm font-medium text-white transition-[transform,box-shadow,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#4c93ff] hover:shadow-[0_18px_32px_rgba(46,124,246,0.28)]"
        >
          {activeTab === "deposit"
            ? data.primaryActionLabel
            : data.secondaryActionLabel}
        </button>
      </div>
    </DashboardPanel>
  );
}
