# 📜 Move Smart Contracts: Axis Vault & pUSDC Shares

This folder contains the **Sui Move** smart contracts that power the Axis Predict vault and user share issuance.

---

## 🔗 On-Chain Addresses (Sui Testnet)

* **Package ID (Program ID)**: `0x648d599af57d2f19dd42ffbd2a9a9baf72ab590db9aac0af09a00c1a7236baf9`
* **AxisVault (Shared Object)**: `0x4a6aaa5b41421f6368745bfa4f8019b157673b9d0c83c530d36177b7266852da`
* **Agent Strategy Capability (`StrategyCap`)**: `0xa0c596dc19015d7f2e28c883109a92bb992bf8ea8565558f186bdb4811c351d8`
* **DeepBook Predict Manager**: `0x26c750b04958aa180459715624c50683923e1e7aee26e579b2c3aeded6843d18`

---

## 🏛️ Architecture & Modules

The Move package consists of two primary modules inside `sc/defai_agent/sources/`:

### 1. `axis_vault.move`
The core vault module that holds deposited assets and tracks the execution states:
* **`AxisVault`**: The main shared object storing `cash_balance` (available `dUSDC` liquidity) and tracking `deployed_balance` (capital locked in active predictions).
* **`StrategyTicket`**: An on-chain token representing a deployed strategy allocation. It tracks parameters like `oracle_id`, `expiry`, `lower_strike`, `higher_strike`, and options `quantity`.
* **`StrategyCap`**: A capability object given to the AI Agent which authorizes the agent to execute options positions on behalf of the Vault.

### 2. `pusdc.move`
A custom coin representation that represents a user's share in the Vault:
* **`PUSDC`**: The token issued to depositors (1 pUSDC = 1 share of Vault NAV). 
* **`VaultTreasury`**: Manages the minting of pUSDC on deposit and burning on withdrawal.

---

## 🚀 Entry Points & Transactions

### User Entry Points
* **`deposit<T>(vault, coin, ctx)`**: Deposits `dUSDC`, calculates current Vault share price (NAV), mints and transfers the equivalent `pUSDC` shares to the depositor.
* **`withdraw<T>(vault, shares, ctx)`**: Burns `pUSDC` shares, calculates the cash payout from Vault NAV, and returns `dUSDC` to the user.

### Agent Entry Points (Requires `StrategyCap`)
* **`allocate_range_position<T>(cap, vault, amount, qty, predict_id, manager_id, oracle_id, expiry, lower, higher, ctx)`**: Reserves vault capital and mints a `StrategyTicket` containing the trade bounds.
* **`settle_range_position<T>(cap, vault, ticket, returned_coin, ctx)`**: Receives the settlement payout (with profits) from the prediction market, burns the `StrategyTicket`, and updates Vault metrics.
* **`settle_range_position_empty<T>(cap, vault, ticket, ctx)`**: Settles an out-of-the-money strategy (loss) where no payout was received, burning the `StrategyTicket` and reducing Vault NAV.

---

## ⚙️ Compilation & Deployment

### Dependencies
Ensure you have the [Sui CLI](https://docs.sui.io/guides/developer/getting-started/sui-install) installed.

### Compilation
Navigate to the contract directory and build:
```bash
cd sc/defai_agent
sui move build
```

### Publishing to Testnet
Deploy the contract to Sui Testnet:
```bash
sui client publish --gas-budget 250000000
```

On successful publish, note down the following Object IDs from the transaction effects:
* **`PackageId`**: The published package ID.
* **`AxisVault`**: The shared object ID of the Vault.
* **`StrategyCap`**: The capability object sent to the deployer (transfer this to your Agent address).
* **`UpgradeCap`**: The package upgrade capability.
