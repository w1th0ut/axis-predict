# DeepBook Predict Workshop FAQ

**Recording:** [to be updated once uploaded on youtube]

**Scripts used during the workshop:**

[https://github.com/MystenLabs/deepbookv3/tree/tlee/predict-workshop/scripts/transactions/predict_workshop](https://github.com/MystenLabs/deepbookv3/tree/tlee/predict-workshop/scripts/transactions/predict_workshop)

---

#### What is DeepBook Predict?

DeepBook Predict is a prediction market protocol built on Sui that allows traders to take directional positions on assets such as Bitcoin. The protocol uses a shared liquidity vault and oracle-driven pricing instead of traditional order books.

---

#### How is DeepBook Predict different from PolyMarket?

Unlike PolyMarket, DeepBook Predict uses a single shared vault as the counterparty to all trades. This avoids fragmented liquidity across individual strike prices and provides instant two-sided liquidity across continuous strikes.

---

#### Is there already a frontend UI available?

A full frontend UI is still in development. The current testnet uses a portfolio/demo interface, with a more complete frontend expected closer to the mainnet launch.

---

#### What market intervals are currently supported?

Current testnet expirations include:

- 1 day
- 2 days
- 7 days
- 14 days
- 21 days
The protocol architecture can support shorter expirations such as 15-minute markets in the future. The expirations for mainnet launch is still TBD.

---

#### Who can create oracles?

At the moment, oracle creation is permissioned and managed internally by the protocol team and oracle provider.

---

#### Can the protocol support real-world event predictions (sports, politics, etc.)?

Currently, the protocol architecture is optimized for asset-price-based markets rather than real-world event outcomes. Real-world event pricing introduces additional complexity for passive liquidity modeling.

---

#### Where does liquidity come from?

Liquidity is provided by LPs (Liquidity Providers) who deposit assets into a shared vault. LPs earn fees generated from trading spreads.

---

#### Will one LP vault support all assets?

At launch, the LP vault will primarily support USDSUI on Sui. Additional LP assets may be supported in the future to avoid liquidity fragmentation.

---

#### Does DeepBook Predict support vanilla options?

No. The current implementation only supports binary options.

---

#### How can builders integrate with DeepBook Predict?

Builders can build on top of the Predict Manager object, which has recently become more modular and composable for strategy integrations and custom workflows.

---

#### Can builders charge their own fees?

Yes. Builders can utilize builder codes to charge their own fees on top of protocol fees.

---

#### How do users fetch open positions?

Open positions can be fetched directly on chain through public functions in predict.

---

#### How are market odds calculated?

The protocol exposes built-in pricing functions that return contract pricing before trade execution.

---

#### How are fees charged?

Fees/spreads are charged to the Predict Manager at mint/redeem time. These fees are dynamic depending on market conditions and position sizing.

---

#### Are LPs the counterparties to traders?

Yes. LPs act as passive counterparties to traders through the shared vault.

---

#### When is mainnet launch expected?

The current target is Q3.

---

#### What oracle provider is being used?

The team has not publicly disclosed the oracle vendor yet. The oracle vendor creates their own pricing model using multiple external sources.

---

#### What is the utility of the DEEP token within DeepBook Predict?

Potential utilities for DEEP staking currently being explored include:

- Fee rebates through staking
- Lower trading fees
These are still under discussion and are not finalized.

---

#### Will leverage be supported?

Yes. Built-in leverage will be provided at launch.


