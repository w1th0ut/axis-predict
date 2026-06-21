"use client";

import React, { useState, useEffect } from "react";
import { useCurrentAccount, useCurrentClient } from "@mysten/dapp-kit-react";
import LiquidChrome from "../../../components/LiquidChrome";
import ScrollReveal from "../../../components/ScrollReveal";
import { dashboardMock } from "../mock";
import { DashboardView } from "../types";
import ActivityLogPanel from "./ActivityLogPanel";
import ActivityPulsePanel from "./ActivityPulsePanel";
import AgentReasoningPanel from "./AgentReasoningPanel";
import DashboardSideNav from "./DashboardSideNav";
import DashboardTopbar from "./DashboardTopbar";
import OracleTimelinePanel from "./OracleTimelinePanel";
import PortfolioHeroPanel from "./PortfolioHeroPanel";
import RangeDeploymentPanel from "./RangeDeploymentPanel";
import RiskGuardrailsPanel from "./RiskGuardrailsPanel";
import VaultActionPanel from "./VaultActionPanel";
import VaultStatusPanel from "./VaultStatusPanel";

function formatToWIB(timestamp: number | string | Date): string {
  const date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return String(timestamp);
  
  const formatted = date.toLocaleString("en-US", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  
  return `${formatted} UTC+7`;
}

function formatToWIBTimeOnly(timestamp: number | string | Date): string {
  const date = new Date(Number(timestamp));
  if (isNaN(date.getTime())) return "";
  
  const formatted = date.toLocaleTimeString("en-US", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });
  
  return `${formatted} UTC+7`;
}

export default function DashboardShell() {
  const account = useCurrentAccount();
  const client = useCurrentClient();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>("overview");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

  // Backend States
  const [vaultSummary, setVaultSummary] = useState<any>(null);
  const [agentStatus, setAgentStatus] = useState<any>(null);
  const [activeOracleState, setActiveOracleState] = useState<any>(null);

  // User Balances
  const [userDusdcBalance, setUserDusdcBalance] = useState<string>("0.00");
  const [userPusdcBalance, setUserPusdcBalance] = useState<string>("0.00");

  // Fetch backend status
  useEffect(() => {
    const fetchBackendData = async () => {
      try {
        const vaultRes = await fetch(`${backendUrl}/vault/summary`);
        if (vaultRes.ok) {
          const s = await vaultRes.json();
          setVaultSummary(s);
        }

        let currentAgentStatus = null;
        const agentRes = await fetch(`${backendUrl}/agent/status`);
        if (agentRes.ok) {
          const a = await agentRes.json();
          setAgentStatus(a);
          currentAgentStatus = a;
        }

        const oraclesRes = await fetch(`${backendUrl}/predict/oracles`);
        if (oraclesRes.ok) {
          const oracles = await oraclesRes.json();
          const active = oracles.filter((o: any) => o.status === "active");
          if (active.length > 0) {
            let targetOracleId = active[0].oracle_id;
            if (currentAgentStatus?.activeStrategy?.oracleId) {
              targetOracleId = currentAgentStatus.activeStrategy.oracleId;
            }
            const stateRes = await fetch(`${backendUrl}/predict/oracles/${targetOracleId}/state`);
            if (stateRes.ok) {
              const state = await stateRes.json();
              setActiveOracleState(state);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch backend data:", err);
      }
    };

    fetchBackendData();
    const interval = setInterval(fetchBackendData, 8000);
    return () => clearInterval(interval);
  }, [backendUrl]);

  // Fetch user balances from wallet
  useEffect(() => {
    if (!account || !client) {
      setUserDusdcBalance("0.00");
      setUserPusdcBalance("0.00");
      return;
    }

    const fetchUserBalances = async () => {
      try {
        const configRes = await fetch(`${backendUrl}/config/public`);
        if (!configRes.ok) return;
        const config = await configRes.json();

        // 1. Get user dUSDC balance
        const dusdcRes: any = await client.getBalance({
          owner: account.address,
          coinType: config.quoteAssetType,
        } as any);
        const totalDusdc = dusdcRes?.totalBalance && !isNaN(Number(dusdcRes.totalBalance))
          ? Number(dusdcRes.totalBalance)
          : 0;
        setUserDusdcBalance((totalDusdc / 1_000_000).toFixed(2));

        // 2. Get user pUSDC balance
        const pusdcType = `${config.axisPackageId}::pusdc::PUSDC`;
        const pusdcRes: any = await client.getBalance({
          owner: account.address,
          coinType: pusdcType,
        } as any);
        const totalPusdc = pusdcRes?.totalBalance && !isNaN(Number(pusdcRes.totalBalance))
          ? Number(pusdcRes.totalBalance)
          : 0;
        setUserPusdcBalance((totalPusdc / 1_000_000).toFixed(2));
      } catch (err) {
        console.error("Failed to fetch user balances:", err);
      }
    };

    fetchUserBalances();
    const interval = setInterval(fetchUserBalances, 6000);
    return () => clearInterval(interval);
  }, [account, client, backendUrl]);

  // Derived properties for views
  const totalAccounted = vaultSummary?.totalAccountedValue && !isNaN(Number(vaultSummary.totalAccountedValue))
    ? Number(vaultSummary.totalAccountedValue)
    : 0;
  const totalShares = vaultSummary?.totalShares && !isNaN(Number(vaultSummary.totalShares))
    ? Number(vaultSummary.totalShares)
    : 0;
  const sharePriceNum = totalShares > 0 ? (totalAccounted / totalShares) : 1.0;

  const rawPusdcNum = Number(userPusdcBalance);
  const userPusdcNum = isNaN(rawPusdcNum) ? 0 : rawPusdcNum;
  const userDepositedVal = userPusdcNum * sharePriceNum;

  const totalVaultValueUsd = vaultSummary 
    ? `$${(totalAccounted / 1_000_000).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "$0.00";

  const totalPortfolioValueUsd = `$${userDepositedVal.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // Construct dynamic data objects
  const portfolioData = {
    totalValueUsd: totalPortfolioValueUsd,
    depositedDusdc: `${userDepositedVal.toFixed(2)} dUSDC`,
    pusdcBalance: `${userPusdcNum.toFixed(2)} pUSDC`,
    netPnl: { 
      value: sharePriceNum > 1.0 ? `+${((sharePriceNum - 1) * 100).toFixed(2)}%` : "+0.00%", 
      positive: sharePriceNum >= 1.0 
    },
    shareGrowth: { 
      value: sharePriceNum > 1.0 ? `+${((sharePriceNum - 1) * 100).toFixed(2)}%` : "+0.00%", 
      positive: sharePriceNum >= 1.0 
    },
    vaultMode: (vaultSummary?.deployedCapital && Number(vaultSummary.deployedCapital) > 0 ? "active_roll" : "active_roll") as any,
    summary: vaultSummary && Number(vaultSummary.deployedCapital) > 0
      ? `Axis Predict is actively executing range options with $${(Number(vaultSummary.deployedCapital) / 1_000_000).toFixed(2)} dUSDC allocated.`
      : "Axis Predict is ready and awaiting deposits to allocate capital.",
  };

  const vaultData = {
    tvlUsd: totalVaultValueUsd,
    premiumHarvestedUsd: vaultSummary 
      ? `$${(Number(vaultSummary.cumulativeProfit) / 1_000_000).toLocaleString("en-US", { minimumFractionDigits: 2 })}` 
      : dashboardMock.vault.premiumHarvestedUsd,
    sharePrice: sharePriceNum.toFixed(3),
    utilizationPct: vaultSummary && Number(vaultSummary.totalAccountedValue) > 0
      ? Math.round((Number(vaultSummary.deployedCapital) / Number(vaultSummary.totalAccountedValue)) * 100)
      : 0,
    modeLabel: vaultSummary && Number(vaultSummary.deployedCapital) > 0 ? "Allocating Strategy" : "Receiving Deposits",
  };

  const spotPriceUSD = activeOracleState?.latest_price?.spot
    ? Number(activeOracleState.latest_price.spot) / 1_000_000_000
    : 68420;

  const centerStrikeUSD = activeOracleState?.oracle?.min_strike
    ? spotPriceUSD
    : 68000;

  const activeLowerUSD = agentStatus?.activeStrategy?.lowerStrike 
    ? Number(agentStatus.activeStrategy.lowerStrike) / 1_000_000_000 
    : null;
  const activeHigherUSD = agentStatus?.activeStrategy?.higherStrike 
    ? Number(agentStatus.activeStrategy.higherStrike) / 1_000_000_000 
    : null;

  const activeExpiry = agentStatus?.activeStrategy?.expiry 
    ? Number(agentStatus.activeStrategy.expiry)
    : (activeOracleState?.oracle?.expiry ? Number(activeOracleState.oracle.expiry) : null);

  const chartMin = activeLowerUSD ? Math.min(spotPriceUSD, activeLowerUSD) : spotPriceUSD;
  const chartMax = activeHigherUSD ? Math.max(spotPriceUSD, activeHigherUSD) : spotPriceUSD;

  const rangeChartData = activeOracleState ? {
    spotPrice: spotPriceUSD,
    centerStrike: activeLowerUSD && activeHigherUSD ? Math.round((activeLowerUSD + activeHigherUSD) / 2) : Math.round(spotPriceUSD),
    widthPct: activeLowerUSD && activeHigherUSD ? Number((((activeHigherUSD - activeLowerUSD) / 2) / ((activeLowerUSD + activeHigherUSD) / 2) * 100).toFixed(2)) : 1.5,
    nextExpiryLabel: activeExpiry ? formatToWIBTimeOnly(activeExpiry) : "",
    deploymentModeLabel: activeLowerUSD && activeHigherUSD 
      ? `Active Range: $${activeLowerUSD.toLocaleString()} - $${activeHigherUSD.toLocaleString()}` 
      : `${activeOracleState.oracle.underlying_asset}-centered range`,
    minAxisLabel: `${Math.floor(chartMin * 0.95 / 1000)}k`,
    maxAxisLabel: `${Math.ceil(chartMax * 1.05 / 1000)}k`,
    bands: activeLowerUSD && activeHigherUSD
      ? [
          {
            label: "active" as const,
            start: activeLowerUSD,
            end: activeHigherUSD,
            emphasis: "high" as const
          }
        ]
      : [
          {
            label: "active" as const,
            start: Math.round(spotPriceUSD * 0.99),
            end: Math.round(spotPriceUSD * 1.01),
            emphasis: "high" as const
          }
        ]
  } : dashboardMock.rangeChart;

  const oracleData = activeOracleState ? {
    marketLabel: agentStatus?.activeStrategy
      ? `Active Option Expiry (Axis Vault)`
      : `${activeOracleState.oracle.underlying_asset} / DeepBook Predict`,
    expiryLabel: activeExpiry ? formatToWIB(activeExpiry) : "",
    lastPriceUpdateLabel: "Just now",
    lastSviUpdateLabel: "Just now",
    lifecycle: activeOracleState.oracle.status as any,
    steps: [
      { id: "active" as const, label: "Active", active: activeOracleState.oracle.status === "active", completed: true },
      { id: "pending_settlement" as const, label: "Pending", active: activeOracleState.oracle.status === "pending_settlement" },
      { id: "settled" as const, label: "Settled", active: activeOracleState.oracle.status === "settled" },
      { id: "next_live" as const, label: "Next Live", active: false }
    ]
  } : dashboardMock.oracle;

  const reasoningData = agentStatus?.logs && agentStatus.logs.length > 0
    ? {
        entries: agentStatus.logs.map((log: any, idx: number) => ({
          id: String(idx),
          timeLabel: log.timeLabel,
          message: log.message,
          tone: log.tone as any
        }))
      }
    : {
        entries: [
          {
            id: "1",
            timeLabel: "SYSTEM",
            message: "Connected to Sui Testnet.",
            tone: "info" as const
          },
          {
            id: "2",
            timeLabel: "VAULT",
            message: `Total Accounted Value: ${totalVaultValueUsd} dUSDC. Available Liquidity: $${vaultSummary ? (Number(vaultSummary.availableLiquidity) / 1_000_000).toFixed(2) : "0.00"} dUSDC.`,
            tone: "info" as const
          },
          ...(vaultSummary && Number(vaultSummary.deployedCapital) > 0 ? [
            {
              id: "3",
              timeLabel: "AGENT",
              message: `Active range strategy found. Capital allocated: $${(Number(vaultSummary.deployedCapital) / 1_000_000).toFixed(2)} dUSDC. Monitoring DeepBook Predict pricing...`,
              tone: "reasoning" as const
            }
          ] : [
            {
              id: "3",
              timeLabel: "AGENT",
              message: "No active range position. Standing by for next trigger or rebalance event.",
              tone: "info" as const
            }
          ])
        ]
      };

  const activityData = {
    rows: [
      ...(vaultSummary && Number(vaultSummary.deployedCapital) > 0 ? [
        {
          id: "active-pos",
          timeLabel: "Active",
          actionLabel: "Range Option Allocation",
          amountLabel: `${(Number(vaultSummary.deployedCapital) / 1_000_000).toFixed(2)} dUSDC`,
          resultLabel: "Earning Premium",
          status: "pending" as const
        }
      ] : []),
      {
        id: "vault-sync",
        timeLabel: "Recent",
        actionLabel: "Vault State Sync",
        amountLabel: "Sync",
        resultLabel: `Share price: ${sharePriceNum.toFixed(3)} dUSDC`,
        status: "success" as const
      },
      ...dashboardMock.activity.rows.slice(0, 2)
    ]
  };

  const topbarTitle =
    activeView === "overview"
      ? "Portfolio Overview"
      : activeView === "vault"
        ? "Vault Controls"
        : "Vault Activity";
  const topbarDescription =
    activeView === "overview"
      ? "A personal snapshot of your position before moving into vault controls or live activity."
      : activeView === "vault"
        ? "Manage deposits and withdrawals while monitoring active guardrails."
        : "Follow live reasoning, executions, and settlement flow as the agent acts.";
  const topbarData = {
    ...dashboardMock.topbar,
    title: topbarTitle,
    description: topbarDescription,
  };

  return (
    <div className="relative min-h-screen bg-[var(--axis-background)] text-[var(--axis-text-primary)]">
      <div className="pointer-events-none fixed inset-0">
        <LiquidChrome
          className="h-full w-full opacity-80"
          baseColor={[0.2, 0.34, 0.62]}
          speed={0.3}
          amplitude={0.28}
          interactive={false}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(92,162,255,0.24),transparent_38%),linear-gradient(180deg,rgba(6,10,20,0.08),rgba(6,10,20,0.4)_72%,rgba(6,10,20,0.58))]" />
      </div>

      <DashboardSideNav
        navItems={dashboardMock.nav}
        activeView={activeView}
        onSelect={setActiveView}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <main className="relative z-10 min-h-screen md:pl-[16rem]">
        <div className="mx-auto max-w-[112rem] px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="rounded-[1.8rem] border border-[rgba(255,255,255,0.06)] bg-[linear-gradient(180deg,rgba(12,14,17,0.88),rgba(8,9,10,0.96))] p-5 shadow-[0_24px_60px_rgba(0,0,0,0.26)] sm:p-6 lg:p-8">
            <DashboardTopbar
              data={topbarData}
              onOpenNav={() => setMobileOpen(true)}
            />

            {activeView === "overview" ? (
              <div className="mt-8 grid gap-5 xl:grid-cols-12">
                <ScrollReveal className="xl:col-span-12" variant="left">
                  <PortfolioHeroPanel data={portfolioData} />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-12" delay={90} variant="rise">
                  <VaultActionPanel data={dashboardMock.actions} />
                </ScrollReveal>
              </div>
            ) : null}

            {activeView === "vault" ? (
              <div className="mt-8 grid gap-5 xl:grid-cols-12">
                <ScrollReveal className="xl:col-span-4" variant="left">
                  <VaultStatusPanel data={vaultData} />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-8" delay={70} variant="left">
                  <RiskGuardrailsPanel data={dashboardMock.risk} />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-12" delay={100} variant="glow">
                  <RangeDeploymentPanel data={rangeChartData} />
                </ScrollReveal>
              </div>
            ) : null}

            {activeView === "activity" ? (
              <div className="mt-8 grid gap-5 xl:grid-cols-12">
                <ScrollReveal className="xl:col-span-4" variant="left">
                  <ActivityPulsePanel
                    activity={activityData}
                    oracle={oracleData}
                  />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-8" delay={70} variant="right">
                  <AgentReasoningPanel data={reasoningData} />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-4" delay={100} variant="rise">
                  <OracleTimelinePanel data={oracleData} />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-8" delay={120} variant="scale">
                  <ActivityLogPanel data={activityData} />
                </ScrollReveal>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
