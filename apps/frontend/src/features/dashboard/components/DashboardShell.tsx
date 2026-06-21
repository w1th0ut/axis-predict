"use client";

import React, { useState } from "react";
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

export default function DashboardShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>("overview");
  const data = dashboardMock;
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
    ...data.topbar,
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
        navItems={data.nav}
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
                  <PortfolioHeroPanel data={data.portfolio} />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-12" delay={90} variant="rise">
                  <VaultActionPanel data={data.actions} />
                </ScrollReveal>
              </div>
            ) : null}

            {activeView === "vault" ? (
              <div className="mt-8 grid gap-5 xl:grid-cols-12">
                <ScrollReveal className="xl:col-span-4" variant="left">
                  <VaultStatusPanel data={data.vault} />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-8" delay={70} variant="left">
                  <RiskGuardrailsPanel data={data.risk} />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-12" delay={100} variant="glow">
                  <RangeDeploymentPanel data={data.rangeChart} />
                </ScrollReveal>
              </div>
            ) : null}

            {activeView === "activity" ? (
              <div className="mt-8 grid gap-5 xl:grid-cols-12">
                <ScrollReveal className="xl:col-span-4" variant="left">
                  <ActivityPulsePanel
                    activity={data.activity}
                    oracle={data.oracle}
                  />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-8" delay={70} variant="right">
                  <AgentReasoningPanel data={data.reasoning} />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-4" delay={100} variant="rise">
                  <OracleTimelinePanel data={data.oracle} />
                </ScrollReveal>

                <ScrollReveal className="xl:col-span-8" delay={120} variant="scale">
                  <ActivityLogPanel data={data.activity} />
                </ScrollReveal>
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
