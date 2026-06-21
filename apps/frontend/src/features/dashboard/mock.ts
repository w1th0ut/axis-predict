import { DashboardData } from "./types";

export const dashboardMock: DashboardData = {
  nav: [
    { id: "overview", label: "Overview" },
    { id: "vault", label: "Vault" },
    { id: "activity", label: "Activity" },
  ],
  topbar: {
    title: "Vault Overview",
    description: "Track vault posture, performance, and current deployment state.",
    wallet: {
      label: "Connect Wallet",
      connected: false,
    },
  },
  portfolio: {
    totalValueUsd: "$4,820.44",
    depositedDusdc: "1,200.00 dUSDC",
    pusdcBalance: "1,173.82 pUSDC",
    netPnl: { value: "+8.4%", positive: true },
    shareGrowth: { value: "+2.7%", positive: true },
    vaultMode: "active_roll",
    summary:
      "Axis Predict is actively allocating across DeepBook Predict ranges.",
  },
  actions: {
    activeTab: "deposit",
    availableDusdc: "2,450.00 dUSDC",
    availablePusdc: "1,173.82 pUSDC",
    inputAmount: "",
    estimatedOutputLabel: "Estimated pUSDC received",
    estimatedOutputValue: "243.18 pUSDC",
    sharePrice: "1.027",
    primaryActionLabel: "Confirm Deposit",
    secondaryActionLabel: "Withdraw",
  },
  vault: {
    tvlUsd: "$12.48M",
    premiumHarvestedUsd: "$341.9K",
    sharePrice: "1.027",
    utilizationPct: 61,
    modeLabel: "Receiving Deposits",
  },
  rangeChart: {
    spotPrice: 68420,
    centerStrike: 68000,
    widthPct: 3.5,
    nextExpiryLabel: "14h 22m",
    deploymentModeLabel: "ATM-centered roll",
    minAxisLabel: "62k",
    maxAxisLabel: "74k",
    bands: [
      { label: "previous", start: 64800, end: 67200, emphasis: "low" },
      { label: "active", start: 65600, end: 70400, emphasis: "high" },
      { label: "next", start: 66400, end: 71200, emphasis: "medium" },
    ],
  },
  risk: {
    state: "healthy",
    summary: "All execution remains bounded by on-chain guardrails.",
    metrics: [
      {
        label: "Max Allocation / Execution",
        valueLabel: "20%",
        progressPct: 20,
      },
      {
        label: "Current Exposure",
        valueLabel: "12.4%",
        progressPct: 62,
      },
      { label: "Utilization Cap", valueLabel: "65%", progressPct: 65 },
      { label: "Withdrawal Safety", valueLabel: "Healthy", progressPct: 78 },
    ],
  },
  oracle: {
    marketLabel: "BTC / DeepBook Predict",
    expiryLabel: "Jul 03, 14:00 UTC",
    lastPriceUpdateLabel: "8s ago",
    lastSviUpdateLabel: "14s ago",
    lifecycle: "active",
    steps: [
      { id: "active", label: "Active", active: true },
      {
        id: "pending_settlement",
        label: "Pending Settlement",
        active: false,
      },
      { id: "settled", label: "Settled", active: false },
      { id: "next_live", label: "Next Live", active: false },
    ],
  },
  reasoning: {
    entries: [
      {
        id: "1",
        timeLabel: "11:00:02",
        message: "Fetching SVI volatility curve... IV remains stable at 42.1%.",
        tone: "info",
      },
      {
        id: "2",
        timeLabel: "11:00:05",
        message:
          'AI Reasoning (Bing Mode): "25 minutes remain in the cycle with muted volatility. Narrowing the active band to $67,200 - $67,800 to maximize premium harvest without breaching the 20% TVL guardrail."',
        tone: "reasoning",
      },
      {
        id: "3",
        timeLabel: "11:00:08",
        message:
          "Assembling Sui PTB... calling axis_vault::execute_strategy.",
        tone: "info",
      },
      {
        id: "4",
        timeLabel: "11:00:10",
        message:
          "Tx settled successfully. Digest: 8fX2...9zPq  View on SuiVision",
        tone: "success",
      },
    ],
  },
  activity: {
    rows: [
      {
        id: "1",
        timeLabel: "11:42",
        actionLabel: "Deposit dUSDC",
        amountLabel: "250.00",
        resultLabel: "243.18 pUSDC",
        status: "success",
      },
      {
        id: "2",
        timeLabel: "11:58",
        actionLabel: "Range Rebalance",
        amountLabel: "Auto",
        resultLabel: "Shifted center",
        status: "success",
      },
      {
        id: "3",
        timeLabel: "12:10",
        actionLabel: "Settlement Roll",
        amountLabel: "Auto",
        resultLabel: "New expiry live",
        status: "pending",
      },
      {
        id: "4",
        timeLabel: "12:26",
        actionLabel: "Withdrawal Request",
        amountLabel: "100.00",
        resultLabel: "Queued for next window",
        status: "pending",
      },
    ],
  },
};
