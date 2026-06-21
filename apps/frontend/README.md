# 🖥️ Next.js Web App: Dapp Dashboard

This package contains the Next.js application that provides the visual interface for the Axis Predict Vault.

---

## 🎨 Key Features

1. **Sui dApp-Kit Integration**: Uses `@mysten/dapp-kit` to manage wallet connections, request signatures, and query user coin balances (`dUSDC` and `pUSDC`) on Sui Testnet.
2. **Dynamic Range Option Chart**: Shows the current spot price of the asset relative to the boundaries (strikes) of the active option position, adjusting sumbu-X limits automatically.
3. **Live AI Reasoning Feed**: Renders real-time execution and decision logs from the backend `StrategyScheduler` loop.
4. **Active Option Expiry Timeline**: Visualizes the option lifecycle (Active, Pending Settlement, Settled) synced to the active position.
5. **Deposit & Withdraw Controls**: Simple inputs for users to deposit `dUSDC` (minting `pUSDC` shares) or withdraw `pUSDC` (burning shares and receiving `dUSDC`).

---

## 📅 Timezone Conventions

All dates and expiration timestamps rendered on the dashboard (such as the Next Oracle Milestone and Next Expiry labels) are formatted explicitly in:
* **Timezone**: `Asia/Jakarta` (WIB, Western Indonesian Time).
* **Suffix**: Appends `UTC+7` to all displayed times (e.g. `6/21/2026, 4:45:00 PM UTC+7`) to prevent timezone confusion.

---

## ⚙️ Configuration (`.env`)

Create a `.env` file inside `apps/frontend/`:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

---

## ☁️ Deploying to Vercel (Monorepo)

When deploying this frontend app within the pnpm monorepo structure to Vercel, ensure you configure the project settings as follows:

### 1. Root Directory Setting
* Go to Vercel Project **Settings > General**.
* Set **Root Directory** to: **`apps/frontend`**
* Click **Save**.

### 2. Framework Preset
* Under **Build & Development Settings**, ensure the **Framework Preset** dropdown is set exactly to **`Next.js`**.

### 3. package-lock.json Warning
* Ensure there is no `package-lock.json` file inside the `apps/frontend/` directory (only `pnpm-lock.yaml` should exist in the root folder). A local npm lockfile will cause Vercel's package manager detector to bypass the monorepo workspace configuration.

---

## 🚀 Running the App

### Development
Start the Next.js development server:
```bash
pnpm dev
```

### Production Build
Create an optimized production bundle:
```bash
pnpm build
pnpm start
```
