"use client";

import React from "react";
import DashboardPanel from "./DashboardPanel";
import WalletConnectControl from "./WalletConnectControl";

export default function DashboardConnectGate() {
  return (
    <div className="mt-8">
      <DashboardPanel className="min-h-[32rem] p-7 sm:p-10">
        <div className="flex min-h-[26rem] flex-col items-center justify-center text-center">
          <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
            Wallet Required
          </div>
          <h2 className="font-display mt-5 max-w-[28rem] text-[2.8rem] leading-[0.92] tracking-[-0.05em] text-[var(--axis-text-primary)] sm:text-[3.6rem]">
            Please connect wallet
          </h2>
          <p className="mt-5 max-w-[32rem] text-[1rem] leading-8 text-[var(--axis-text-secondary)]">
            Connect your Sui wallet to view portfolio overview, vault controls,
            and live activity from your Axis Predict position.
          </p>
        </div>
      </DashboardPanel>
    </div>
  );
}
