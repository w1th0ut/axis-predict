export type HealthState = "healthy" | "warning" | "paused";
export type OracleLifecycle =
  | "active"
  | "pending_settlement"
  | "settled"
  | "next_live";
export type VaultMode =
  | "active_roll"
  | "rebalancing"
  | "settlement_window"
  | "paused";
export type ActivityStatus = "success" | "pending" | "failed";
export type DashboardView = "overview" | "vault" | "activity";
export type ReasoningTone = "info" | "reasoning" | "success";

export interface DashboardNavItem {
  id: DashboardView;
  label: string;
}

export interface TopbarData {
  title: string;
  description: string;
}

export interface PortfolioHeroData {
  totalValueUsd: string;
  depositedDusdc: string;
  pusdcBalance: string;
  netPnl: { value: string; tone: "positive" | "negative" | "neutral" };
  shareGrowth: { value: string; tone: "positive" | "negative" | "neutral" };
  vaultMode: VaultMode;
  summary: string;
}

export interface VaultActionPanelData {
  activeTab: "deposit" | "withdraw";
  availableDusdc: string;
  availablePusdc: string;
  inputAmount: string;
  estimatedOutputLabel: string;
  estimatedOutputValue: string;
  sharePrice: string;
  primaryActionLabel: string;
  secondaryActionLabel?: string;
}

export interface VaultStatusData {
  tvlUsd: string;
  premiumHarvestedUsd: string;
  sharePrice: string;
  utilizationPct: number;
  modeLabel: string;
}

export interface RangeBand {
  label: "previous" | "active" | "next";
  start: number;
  end: number;
  emphasis: "low" | "medium" | "high";
}

export interface RangeDeploymentData {
  spotPrice: number;
  centerStrike: number;
  widthPct: number;
  nextExpiryLabel: string;
  deploymentModeLabel: string;
  minAxisLabel: string;
  maxAxisLabel: string;
  bands: RangeBand[];
}

export interface RiskMetric {
  label: string;
  valueLabel: string;
  progressPct: number;
}

export interface RiskGuardrailsData {
  state: HealthState;
  summary: string;
  metrics: RiskMetric[];
}

export interface OracleTimelineStep {
  id: OracleLifecycle;
  label: string;
  active: boolean;
  completed?: boolean;
}

export interface OracleTimelineData {
  marketLabel: string;
  expiryLabel: string;
  lastPriceUpdateLabel: string;
  lastSviUpdateLabel: string;
  lifecycle: OracleLifecycle;
  steps: OracleTimelineStep[];
}

export interface ActivityRow {
  id: string;
  timeLabel: string;
  actionLabel: string;
  amountLabel: string;
  resultLabel: string;
  status: ActivityStatus;
}

export interface ActivityLogData {
  rows: ActivityRow[];
}

export interface AgentReasoningEntry {
  id: string;
  timeLabel: string;
  message: string;
  tone: ReasoningTone;
}

export interface AgentReasoningData {
  entries: AgentReasoningEntry[];
}

export interface DashboardData {
  nav: DashboardNavItem[];
  topbar: TopbarData;
  portfolio: PortfolioHeroData;
  actions: VaultActionPanelData;
  vault: VaultStatusData;
  rangeChart: RangeDeploymentData;
  risk: RiskGuardrailsData;
  oracle: OracleTimelineData;
  reasoning: AgentReasoningData;
  activity: ActivityLogData;
}
