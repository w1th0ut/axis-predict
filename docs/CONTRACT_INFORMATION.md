# 📑 DeepBook Predict: Contract & Integration Reference

This document compiles the current integration endpoints, contract details, event streams, and codebase references for DeepBook Predict on **Sui Testnet**. These parameters are based on the `predict-testnet-4-16` branch of the `DeepBookV3` repository.

> [!WARNING]
> DeepBook Predict is currently deployed as a Testnet integration target. Package IDs, entry points, and object structs may undergo revision prior to the Mainnet release.

---

## 🌐 Testnet Deployment Parameters

| Parameter | Value / Address | Description |
| :--- | :--- | :--- |
| **Network** | `Testnet` | Target Sui network |
| **Package ID** | `0xf5ea2b3749c65d6e56507cc35388719aadb28f9cab873696a2f8687f5c785138` | The deployed package ID |
| **Registry ID** | `0x43af14fed5480c20ff77e2263d5f794c35b9fab7e2212903127062f4fe2a6e64` | Registri for assets and configurations |
| **Predict ID** | `0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a` | Top-level shared object for trades |
| **Quote Asset** | `0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC` | Official test collateral (DUSDC) |
| **PLP Coin Type** | `0xf5ea2b3749c65d6e56507cc35388719aadb28f9cab873696a2f8687f5c785138::plp::PLP` | LP share token coin type |
| **Target Branch** | [`predict-testnet-4-16`](https://github.com/MystenLabs/deepbookv3/tree/predict-testnet-4-16/packages/predict) | Main developer branch for Predict |
| **Public Server** | `https://predict-server.testnet.mystenlabs.com` | Base URL for REST API indexer |

### Quote Asset Specifications (DUSDC)
*   **Type**: `0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC`
*   **Currency ID**: `0xf3000dff421833d4bb8ed58fac146d691a3aaba2785aa1989af65a7089ca3e9c`
*   **Decimals**: 6
*   **Note**: Request test DUSDC using the official testnet token faucet request form provided during workshops.

---

## 📡 Public Server API Endpoints

The indexer server is located at `https://predict-server.testnet.mystenlabs.com`. It provides pre-computed historical and state data.

### 1. Protocol & Market State
*   `GET /status`: Indexer health check.
*   `GET /predicts/:predict_id/state`: Fetch general configuration of the Predict object.
*   `GET /predicts/:predict_id/oracles`: List all oracle IDs registered under the Predict instance.
*   `GET /oracles/:oracle_id/state`: Retrieve current lifecycle state, spot/forward prices, and SVI values of a specific oracle.
*   `GET /predicts/:predict_id/quote-assets`: List allowed quote asset coin types.
*   `GET /oracles/:oracle_id/ask-bounds`: Get the active ask price limits for the oracle.

### 2. Vault & LP Data
*   `GET /predicts/:predict_id/vault/summary`: Read vault assets, total liability, and max payout constraints.
*   `GET /predicts/:predict_id/vault/performance?range=ALL`: Get historical yields of the LP vault.
*   `GET /lp/supplies`: History of LP deposits.
*   `GET /lp/withdrawals`: History of LP penarikan.

### 3. User Portfolio & Positions
*   `GET /managers`: List of all active PredictManager IDs.
*   `GET /managers/:manager_id/summary`: Read account balance summaries.
*   `GET /managers/:manager_id/positions/summary`: Returns the user's active binary options and vertical range positions.
*   `GET /managers/:manager_id/pnl?range=ALL`: Returns user PnL history.

### 4. Trade & Event History
*   `GET /oracles/:oracle_id/prices`: Price update history.
*   `GET /oracles/:oracle_id/prices/latest`: Most recent price push.
*   `GET /oracles/:oracle_id/svi`: SVI curve history.
*   `GET /oracles/:oracle_id/svi/latest`: Most recent volatility push.
*   `GET /positions/minted`: History of binary option mints.
*   `GET /positions/redeemed`: History of binary option settlements.
*   `GET /ranges/minted`: History of vertical range mints.
*   `GET /ranges/redeemed`: History of vertical range settlements.
*   `GET /trades/:oracle_id`: Full trade transcript for the given oracle.

---

## 🔔 Live Sui Event Subscriptions

For sub-second state tracking, client apps should stream Sui events from the Predict package. Subscribe to the following event types:

1.  `oracle::OraclePricesUpdated`
    *   **Emitted when**: Spot or forward price updates are pushed on-chain.
    *   **Use Case**: Live price chart updates.
2.  `oracle::OracleSVIUpdated`
    *   **Emitted when**: Volatility curve parameters change.
    *   **Use Case**: Real-time option fair-price updates.
3.  `oracle::OracleSettled`
    *   **Emitted when**: Expiration occurs and the final settlement price is locked.
    *   **Use Case**: Triggers redeem availability alerts.
4.  `oracle::OracleActivated`
    *   **Emitted when**: A new market is activated.
    *   **Use Case**: Automatically populate new tickers in the frontend.

---

## 🛠️ Codebase Source Files

To inspect contract layouts, types, or write custom integrations, reference these key files on the `predict-testnet-4-16` branch of the DeepBook V3 codebase:

1.  **Core Object & Logic (`predict.move`)**
    *   [predict.move](https://github.com/MystenLabs/deepbookv3/blob/predict-testnet-4-16/packages/predict/sources/predict.move)
    *   Contains entry points: `mint`, `redeem`, `mint_range`, `redeem_range`, `supply`, `withdraw`.
2.  **Account Management (`predict_manager.move`)**
    *   [predict_manager.move](https://github.com/MystenLabs/deepbookv3/blob/predict-testnet-4-16/packages/predict/sources/predict_manager.move)
    *   Details how user balances are wrapped and how positions are catalogued inside dynamic tables.
3.  **Registry / Deployment Admin (`registry.move`)**
    *   [registry.move](https://github.com/MystenLabs/deepbookv3/blob/predict-testnet-4-16/packages/predict/sources/registry.move)
    *   Manages asset permissions, oracle registrations, and protocol-level configuration variables.
4.  **Oracle Feed Structures (`oracle.move`)**
    *   [oracle.move](https://github.com/MystenLabs/deepbookv3/blob/predict-testnet-4-16/packages/predict/sources/oracle.move)
    *   Houses lifecycle transition functions (`active`, `pending_settlement`, `settled`) and validation rules.
5.  **Vault Accounting (`vault.move`)**
    *   [vault.move](https://github.com/MystenLabs/deepbookv3/blob/predict-testnet-4-16/packages/predict/sources/vault/vault.move)
    *   Handles mark-to-market calculations, LP coin treasury controls, and maximum payout coverages.
