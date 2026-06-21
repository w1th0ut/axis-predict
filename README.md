# 🌌 Axis Predict: Autonomous DeFAI Option Vault on Sui

![Axis Banner](./apps/frontend/public/og-banner.png)

[![License: ISC](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Sui Testnet](https://img.shields.io/badge/Network-Sui%20Testnet-blueviolet.svg)](https://sui.io/)
[![Sui Move 2024](https://img.shields.io/badge/Contracts-Sui%20Move%202024-teal.svg)](https://move-book.com/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue.svg)](https://www.typescriptlang.org/)

Axis Predict is a decentralized, autonomous Delta-Neutral yield vault built on **Sui Testnet** that utilizes **DeepBook Predict** (a volatility-priced prediction/option market protocol) and an **AI Trading Agent** to capture yield from volatility.

---

## 🗺️ System Overview

The system consists of three main components:
1. **Move Smart Contracts (`sc/`)**: An on-chain shared vault (`AxisVault`) that pools user assets (`dUSDC`), issues liquidity share tokens (`pUSDC`), and grants authorization to an AI Agent to deploy range option strategies.
2. **Backend Agent Service (`apps/backend/`)**: An Express server and background scheduler that autonomously checks vault balances, analyzes spot volatility, consults an LLM (via OpenRouter) to determine optimal strike bounds, and executes range options on-chain.
3. **Frontend Dashboard (`apps/frontend/`)**: A Next.js Web App featuring a high-fidelity dashboard for wallet connection, deposits, withdrawals, live SVI/oracle range visualizations, and real-time AI reasoning stream.

---

## 🔄 User Flow Diagram

The following diagram illustrates how users, the AI agent, the vault contract, and the DeepBook Predict protocol interact:

```mermaid
graph TD
    User[User Wallet] -->|1. Connect Wallet| Dapp(Next.js Dapp Dashboard)
    User -->|2. Deposit dUSDC| Vault(Axis Vault Contract)
    Vault -->|Mint Shares| UserShares[User receives pUSDC]
    
    Blockchain[Sui Blockchain] -->|Price/SVI Feed| Agent(Autonomous AI Agent)
    Agent -->|Read Balance| IdleCheck{Has Liquidity & Idle?}
    
    IdleCheck -->|Yes| LLM[Call OpenRouter LLM]
    LLM -->|Choose Strike Bounds| OpenTx[Sui Tx: mint_range Option]
    OpenTx -->|Deploy Capital| DeepBook[DeepBook Predict Manager]
    
    DeepBook -->|Option running...| ExpiryCheck{Option Expired?}
    ExpiryCheck -->|Yes| SettleTx[Sui Tx: settle Option]
    SettleTx -->|Return Payout| Vault
    Vault -->|Update Net Asset Value| NAV[Share Price grows/shrinks]
    
    User -->|3. Withdraw pUSDC| Vault
    Vault -->|Burn pUSDC & Send dUSDC| User
```

---

## ⏱️ Sequence Diagram

Below is the step-by-step transaction flow, showing the user lifecycle alongside the agent's autonomous cycle:

```mermaid
sequenceDiagram
    actor User
    participant Frontend as Next.js Dashboard
    participant Agent as Node.js AI Agent
    participant Contract as Axis Vault (Move)
    participant DeepBook as DeepBook Predict (Move)
    participant LLM as OpenRouter (GPT-4o-mini)

    %% Deposit Flow
    Note over User, Contract: --- User Deposit ---
    User->>Frontend: Connect Wallet & Click Deposit
    Frontend->>Contract: Call axis_vault::deposit(dUSDC)
    Contract->>User: Transfer pUSDC shares
    
    %% Agent Loop (Idle to Open)
    Note over Agent, DeepBook: --- Autonomous Strategy Open Loop (Checked periodically) ---
    loop Periodic Expiry-Driven Check
        Agent->>Contract: Check Vault Liquidity (Read-only, Free)
        alt No active position & has liquidity
            Agent->>DeepBook: Query spot price & SVI curve
            Agent->>LLM: Send market volatility data & ask for strike range
            LLM-->>Agent: Respond with lowerStrike, higherStrike (USD)
            Agent->>Contract: Call axis_vault::allocate_range_position(quantity)
            Contract->>DeepBook: Call predict::mint_range(option)
            Contract-->>Agent: Transfer StrategyTicket (Object)
            Note over Agent: Standby until option expiry...
        end
    end

    %% Agent Loop (Settle)
    Note over Agent, DeepBook: --- Autonomous Strategy Settlement Loop (Checked periodically) ---
    loop Periodic Expiry-Driven Check
        Agent->>Contract: Check Ticket Expiry (Read-only, Free)
        alt currentTime >= expiry
            Agent->>Contract: Call axis_vault::settle_range_position(ticket)
            Contract->>DeepBook: Call predict::redeem_range(option)
            DeepBook-->>Contract: Return dUSDC payout (with profit/loss)
            Contract->>Contract: Update Cash Balance & NAV Share Price
            Note over Contract: Position settled!
        end
    end
    
    %% Withdraw Flow
    Note over User, Contract: --- User Withdrawal ---
    User->>Frontend: Click Withdraw
    Frontend->>Contract: Call axis_vault::withdraw(pUSDC)
    Contract->>User: Burn pUSDC & Transfer dUSDC
```

---

## 📂 Project Structure

This monorepo is managed using `pnpm` workspaces:

```bash
sui-defai-project/
├── apps/
│   ├── backend/           # Express server & Autonomous Agent scheduler
│   └── frontend/          # Next.js web application (Dashboard UI)
├── sc/
│   └── defai_agent/       # Move Smart Contracts (Axis Vault & pUSDC Token)
├── docs/                  # Project specifications and guides
├── package.json           # Monorepo workspaces definition
├── pnpm-workspace.yaml    # pnpm workspace configuration
└── pnpm-lock.yaml         # Monorepo lockfile
```

---

## ⚙️ Prerequisites & Installation

### Prerequisites
* **Node.js** (v18.x or newer, v22 recommended)
* **pnpm** (v11.x or newer)
* **Sui CLI** (For compiled Move contracts and gas keys management)

### Installation
Clone the repository and install all workspace dependencies from the root directory:

```bash
pnpm install
```

---

## 🚀 Running the Project

### 1. Smart Contracts
Compile and publish the Move smart contracts to Sui Testnet:
```bash
cd sc/defai_agent
# Compile Move modules
sui move build
# Publish package
sui client publish --gas-budget 200000000
```

### 2. Backend Agent
1. Setup your `.env` file inside `apps/backend/` using the `.env.example` template.
2. Build and start the Express server and autonomous scheduler:
```bash
pnpm --filter backend build
pnpm --filter backend dev
```

### 3. Frontend Web App
1. Setup your `.env` file inside `apps/frontend/` using the `.env.example` template.
2. Build and start the Next.js dev server:
```bash
pnpm --filter frontend dev
```
Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

---

## 🔗 On-Chain Addresses (Sui Testnet)

* **Package ID (Program ID)**: `0x648d599af57d2f19dd42ffbd2a9a9baf72ab590db9aac0af09a00c1a7236baf9`
* **AxisVault (Shared Object)**: `0x4a6aaa5b41421f6368745bfa4f8019b157673b9d0c83c530d36177b7266852da`
* **Agent Strategy Capability (`StrategyCap`)**: `0xa0c596dc19015d7f2e28c883109a92bb992bf8ea8565558f186bdb4811c351d8`
* **DeepBook Predict Manager**: `0x26c750b04958aa180459715624c50683923e1e7aee26e579b2c3aeded6843d18`

---

## 📄 License
This project is licensed under the ISC License. See `LICENSE` for details.
