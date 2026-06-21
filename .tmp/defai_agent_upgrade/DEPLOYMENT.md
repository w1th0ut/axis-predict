# Axis Predict Move Deployment

Status on Sui testnet:

- `Package ID`: `0x1e187d75eb1a901a8fa171c3a518caa4506faa0bc5ac29c8c224e002ad67b467`
- `AdminCap`: `0x0863f7f339e0969de3e58f26e0d38afad93aa3ff0908a9d000902760dd7789a8`
- `Vault<dUSDC>`: `0x4a6aaa5b41421f6368745bfa4f8019b157673b9d0c83c530d36177b7266852da`
- `AgentCap`: `0xa0c596dc19015d7f2e28c883109a92bb992bf8ea8565558f186bdb4811c351d8`
- `PredictManager`: `0x26c750b04958aa180459715624c50683923e1e7aee26e579b2c3aeded6843d18`

This package is no longer wired to a local mock Predict module. The intended runtime flow is:

1. User deposits `dUSDC` into `axis_vault::Vault`.
2. Backend agent previews a Predict range price with `predict::get_range_trade_amounts`.
3. Backend agent allocates exact vault capital through `axis_vault::allocate_range_position`.
4. In the same PTB, backend deposits that capital into its `PredictManager` and calls `predict::mint_range`.
5. On unwind/expiry, backend calls `predict::redeem_range` and settles the returned capital back into the vault with `axis_vault::settle_range_position` or `settle_range_position_empty`.

## Local commands

Build:

```bash
cd sc/defai_agent
sui move build
```

Backend TypeScript build:

```bash
cd apps/backend
npm run build
```

Optional scripted publish for a fresh deployment:

```bash
cd apps/backend
npm run deploy:vault
```

That script expects `DEPLOYER_PRIVATE_KEY` in `apps/backend/.env`.
