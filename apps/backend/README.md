# 🤖 Backend AI Agent & API Service

This package contains the Express API server and the autonomous trading agent scheduling loop.

---

## 🛠️ Key Features

1. **REST API endpoints**: Exposes configuration settings, vault balances, and prediction manager statuses to the Next.js frontend.
2. **Autonomous Strategy Loop (`StrategyScheduler`)**: A background state machine checking Vault posture on a configured interval (default: 60s). It operates on an **Expiry-Driven** architecture:
   * **Read-only state checks**: Evaluates active contracts and balances on-chain for free (zero gas).
   * **Standby mode**: If a position is active, it goes to sleep until the exact UNIX expiry timestamp.
   * **Automated Settlement**: Triggers transaction execution only when contracts reach expiry to harvest premium.
   * **AI Reasoning Trigger**: Queries OpenRouter LLMs for decision boundaries only when idle with liquid cash.
3. **Dynamic Trade Scaling**: Automatically calls `preview` transactions to scale option quantities according to the available cash in the Vault, preventing out-of-funds transaction reverts.

---

## 🧭 REST API Reference

* **`GET /health`**: Health status, node configurations, network name, and agent wallet address.
* **`GET /vault/summary`**: Available cash liquidity, deployed capital, cumulative profit/loss, and share price (NAV).
* **`GET /agent/status`**: On-chain manager balances, active positions, and recent scheduler event logs.
* **`GET /predict/oracles`**: List of active and settled oracles on DeepBook Predict.
* **`POST /strategy/range/preview`**: Simulates option costs and payouts.
* **`POST /strategy/range/open`**: Manually opens a range option position.
* **`POST /strategy/range/settle`**: Manually settles/redeems a range option position.

---

## ⚙️ Configuration (`.env`)

Create a `.env` file using the following settings:
```bash
PORT=3001
SUI_NETWORK=testnet
SUI_RPC_URL=https://fullnode.testnet.sui.io:443
SUI_CLOCK_OBJECT_ID=0x6

# Agent Wallet Key
AGENT_PRIVATE_KEY=your_sui_private_key_here

# OpenRouter LLM Settings
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-4o-mini

# Automated Scheduler Settings (Approach B)
AUTO_STRATEGY_ENABLED=true
AUTO_STRATEGY_INTERVAL_MS=60000 # Checked every 60s
STRATEGY_MAX_TRADE_DUSDC=10     # Max USDC cap per strategy trade

# Object Contracts Configuration
PREDICT_SERVER_URL=https://predict-server.testnet.mystenlabs.com
DEEPBOOK_PREDICT_PACKAGE_ID=0xf5ea2...
DEEPBOOK_PREDICT_OBJECT_ID=0xc8736...
SUI_DUSDC_COIN_TYPE=0xe9504...::dusdc::DUSDC
DEEPBOOK_MANAGER_ID=0x...
SUI_PACKAGE_ID=0x...
SUI_VAULT_ID=0x...
SUI_AGENT_CAP_ID=0x...
```

---

## 🚀 Getting Started

### Development
Start the Express server with file watch reloading:
```bash
pnpm dev
```

### Production Build
Compile TypeScript to JS modules:
```bash
pnpm build
pnpm start
```
