import { Transaction } from '@mysten/sui/transactions';
import type { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';

import {
  assertAgentKey,
  assertAxisRuntimeConfig,
  assertPredictManagerConfig,
  type AppConfig,
} from './config.js';
import { PredictApiClient } from './predict-api.js';
import {
  assertTransactionSuccess,
  decodeU64,
  extractReturnBytes,
  findObjectChangeId,
  getMoveObjectFields,
  loadSigner,
  readNestedBigInt,
  readNestedId,
  unwrapTransactionResult,
} from './sui.js';

interface RangeTradeInput {
  oracleId: string;
  expiry: string | number | bigint;
  lowerStrike: string | number | bigint;
  higherStrike: string | number | bigint;
  quantity: string | number | bigint;
}

interface StrategyTicketSnapshot {
  id: string;
  sequence: bigint;
  allocatedAmount: bigint;
  quantity: bigint;
  predictId: string;
  managerId: string;
  oracleId: string;
  expiry: bigint;
  lowerStrike: bigint;
  higherStrike: bigint;
}

interface PreparedOpenRangeStrategy {
  tx: Transaction;
  preview: Awaited<ReturnType<AxisAgentService['previewRangeTrade']>>;
  strategyBudget: bigint;
}

function toBigIntInput(value: string | number | bigint, label: string) {
  try {
    return typeof value === 'bigint' ? value : BigInt(value);
  } catch {
    throw new Error(`Invalid ${label}: ${String(value)}`);
  }
}

function stringifyBigints<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, current) => (typeof current === 'bigint' ? current.toString() : current)),
  ) as T;
}

function scalePredictPrice(value: bigint) {
  return Number(value) / 1_000_000_000;
}

function isOracleNotQuoteableError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('assert_quoteable_oracle') || message.includes('oracle_config');
}

export class AxisAgentService {
  private readonly signer;

  constructor(
    private readonly config: AppConfig,
    private readonly client: SuiJsonRpcClient,
    private readonly predictApi: PredictApiClient,
  ) {
    this.signer = this.config.agentPrivateKey ? loadSigner(this.config.agentPrivateKey) : null;
  }

  getAgentAddress() {
    return this.signer?.toSuiAddress() ?? null;
  }

  async getVaultSummary() {
    assertAxisRuntimeConfig(this.config);
    const fields = await getMoveObjectFields(this.client, this.config.axisVaultId);

    const summary = {
      vaultId: this.config.axisVaultId,
      packageId: this.config.axisPackageId,
      availableLiquidity: readNestedBigInt(fields.cash_balance),
      deployedCapital: readNestedBigInt(fields.deployed_balance),
      totalShares: readNestedBigInt(fields.total_shares),
      maxAllocationBps: readNestedBigInt(fields.max_allocation_bps),
      cumulativeProfit: readNestedBigInt(fields.cumulative_profit),
      cumulativeLoss: readNestedBigInt(fields.cumulative_loss),
    };

    return stringifyBigints({
      ...summary,
      totalAccountedValue: summary.availableLiquidity + summary.deployedCapital,
    });
  }

  async getManagerStatus() {
    assertPredictManagerConfig(this.config);
    const onchainBalance = await this.inspectManagerQuoteBalance();
    const activeStrategy = await this.getActiveStrategySnapshot();

    let summary: any = null;
    let summaryError: string | null = null;
    try {
      summary = await this.predictApi.getManagerSummary(this.config.predictManagerId);
    } catch (error) {
      summaryError = error instanceof Error ? error.message : String(error);
    }

    let positions: any[] = [];
    let positionsError: string | null = null;
    try {
      const response = await this.predictApi.getManagerPositionsSummary(this.config.predictManagerId);
      positions = Array.isArray(response) ? response : [];
    } catch (error) {
      positionsError = error instanceof Error ? error.message : String(error);
    }

    const usedOnchainFallbackPositions = positions.length === 0 && activeStrategy !== null;

    if (usedOnchainFallbackPositions) {
      positions = [
        {
          source: 'onchain_ticket',
          status: 'active',
          ticket_id: activeStrategy.id,
          oracle_id: activeStrategy.oracleId,
          lower_strike: activeStrategy.lowerStrike.toString(),
          higher_strike: activeStrategy.higherStrike.toString(),
          lower_strike_usd: scalePredictPrice(activeStrategy.lowerStrike),
          higher_strike_usd: scalePredictPrice(activeStrategy.higherStrike),
          expiry: activeStrategy.expiry.toString(),
          quantity: activeStrategy.quantity.toString(),
          allocated_amount: activeStrategy.allocatedAmount.toString(),
        },
      ];
    }

    const derivedSummary =
      activeStrategy && summary
        ? {
            ...summary,
            open_exposure:
              Number(summary.open_exposure ?? 0) > 0
                ? summary.open_exposure
                : activeStrategy.allocatedAmount.toString(),
            open_positions:
              Number(summary.open_positions ?? 0) > 0 ? summary.open_positions : 1,
            account_value:
              Number(summary.account_value ?? 0) > 0
                ? summary.account_value
                : activeStrategy.allocatedAmount.toString(),
          }
        : summary;

    return {
      managerId: this.config.predictManagerId,
      owner: this.getAgentAddress(),
      quoteAssetType: this.config.quoteAssetType,
      onchainQuoteBalance: onchainBalance.toString(),
      summary: derivedSummary,
      positions,
      activeStrategy: activeStrategy ? stringifyBigints(activeStrategy) : null,
      indexerStatus: {
        summaryAvailable: Boolean(summary),
        positionsAvailable: positionsError === null,
        usedOnchainFallbackPositions,
        summaryError,
        positionsError,
      },
    };
  }

  async createPredictManager() {
    assertAgentKey(this.config);
    const signer = this.signer;
    if (!signer) {
      throw new Error('Agent signer is not available.');
    }

    const tx = new Transaction();
    tx.setGasBudget(30_000_000);
    tx.moveCall({
      target: `${this.config.predictPackageId}::predict::create_manager`,
      arguments: [],
    });

    const result = unwrapTransactionResult(
      await this.client.signAndExecuteTransaction({
        signer,
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
        },
      } as never),
    );
    assertTransactionSuccess(result, 'PredictManager creation');

    return {
      digest: result.digest,
      managerId: findObjectChangeId(result, '::predict_manager::PredictManager'),
    };
  }

  async previewRangeTrade(input: RangeTradeInput) {
    const quantity = toBigIntInput(input.quantity, 'quantity');
    const expiry = toBigIntInput(input.expiry, 'expiry');
    const lowerStrike = toBigIntInput(input.lowerStrike, 'lowerStrike');
    const higherStrike = toBigIntInput(input.higherStrike, 'higherStrike');

    const tx = new Transaction();
    const rangeKey = tx.moveCall({
      target: `${this.config.predictPackageId}::range_key::new`,
      arguments: [
        tx.pure.id(input.oracleId),
        tx.pure.u64(expiry),
        tx.pure.u64(lowerStrike),
        tx.pure.u64(higherStrike),
      ],
    });

    tx.moveCall({
      target: `${this.config.predictPackageId}::predict::get_range_trade_amounts`,
      arguments: [
        tx.object(this.config.predictObjectId),
        tx.object(input.oracleId),
        rangeKey,
        tx.pure.u64(quantity),
        tx.object(this.config.clockObjectId),
      ],
    });

    const sender = this.getAgentAddress() ?? '0x0000000000000000000000000000000000000000000000000000000000000000';
    const inspect = await this.client.devInspectTransactionBlock({
      sender,
      transactionBlock: tx,
    } as never);

    const [mintCostBytes, redeemPayoutBytes] = extractReturnBytes(inspect);
    return stringifyBigints({
      oracleId: input.oracleId,
      expiry,
      lowerStrike,
      higherStrike,
      quantity,
      mintCost: decodeU64(mintCostBytes),
      redeemPayout: decodeU64(redeemPayoutBytes),
    });
  }

  async openRangeStrategy(input: RangeTradeInput) {
    assertAgentKey(this.config);
    assertAxisRuntimeConfig(this.config);
    assertPredictManagerConfig(this.config);

    const signer = this.signer;
    if (!signer) {
      throw new Error('Agent signer is not available.');
    }

    const managerBalance = await this.inspectManagerQuoteBalance();
    if (managerBalance !== 0n) {
      throw new Error(
        `PredictManager still holds ${managerBalance.toString()} quote units. Sweep/settle it before opening a new vault position.`,
      );
    }

    const { tx, preview } = await this.prepareOpenRangeStrategy(input);
    const allocation = null;
    void allocation;
    const signerAddress = signer.toSuiAddress();

    const inspect = await this.client.devInspectTransactionBlock({
      sender: signerAddress,
      transactionBlock: tx,
    } as never);
    const inspectStatus =
      typeof inspect?.effects?.status === 'string'
        ? inspect.effects.status
        : inspect?.effects?.status?.status;
    if (inspectStatus && inspectStatus !== 'success') {
      const inspectError =
        inspect?.effects?.status?.error ??
        inspect?.error ??
        JSON.stringify(inspect?.effects?.status ?? inspect);
      throw new Error(`Open strategy simulation failed. ${inspectError}`);
    }

    const result = unwrapTransactionResult(
      await this.client.signAndExecuteTransaction({
        signer,
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
          showBalanceChanges: true,
        },
      } as never),
    );
    assertTransactionSuccess(result, 'Range strategy open');

    let finalAllocationAmount = preview.mintCost;
    let ticketId =
      findObjectChangeId(result, '::axis_vault::StrategyTicket') ??
      result.objectChanges?.find(
        (change: any) =>
          typeof change?.objectType === 'string' &&
          change.objectType.includes('::axis_vault::StrategyTicket') &&
          (change?.owner?.AddressOwner === signerAddress ||
            change?.owner?.ObjectOwner === signerAddress),
      )?.objectId;
    const allocatedEvent = result.events?.find(
      (ev: any) => ev.type.includes('::axis_vault::StrategyAllocated'),
    );
    if (allocatedEvent && allocatedEvent.parsedJson) {
      finalAllocationAmount = allocatedEvent.parsedJson.allocated_amount;
    }
    const reconciledEvent = result.events?.find(
      (ev: any) => ev.type.includes('::axis_vault::StrategyBudgetReconciled'),
    );
    if (reconciledEvent && reconciledEvent.parsedJson?.final_allocated_amount) {
      finalAllocationAmount = reconciledEvent.parsedJson.final_allocated_amount;
    }
    if (!ticketId) {
      ticketId = await this.getActiveTicketId();
    }

    return stringifyBigints({
      digest: result.digest,
      ticketId,
      allocationAmount: finalAllocationAmount,
      preview,
    });
  }

  async canOpenRangeStrategy(input: RangeTradeInput) {
    assertAgentKey(this.config);
    const signer = this.signer;
    if (!signer) {
      throw new Error('Agent signer is not available.');
    }

    try {
      const { tx, preview } = await this.prepareOpenRangeStrategy(input);
      const inspect = await this.client.devInspectTransactionBlock({
        sender: signer.toSuiAddress(),
        transactionBlock: tx,
      } as never);
      const inspectStatus =
        typeof inspect?.effects?.status === 'string'
          ? inspect.effects.status
          : inspect?.effects?.status?.status;
      if (inspectStatus && inspectStatus !== 'success') {
        return {
          ok: false,
          preview,
          error:
            inspect?.effects?.status?.error ??
            inspect?.error ??
            JSON.stringify(inspect?.effects?.status ?? inspect),
        };
      }

      return {
        ok: true,
        preview,
      };
    } catch (error) {
      return {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private async prepareOpenRangeStrategy(input: RangeTradeInput): Promise<PreparedOpenRangeStrategy> {
    assertAxisRuntimeConfig(this.config);
    assertPredictManagerConfig(this.config);

    const quantity = toBigIntInput(input.quantity, 'quantity');
    const expiry = toBigIntInput(input.expiry, 'expiry');
    const lowerStrike = toBigIntInput(input.lowerStrike, 'lowerStrike');
    const higherStrike = toBigIntInput(input.higherStrike, 'higherStrike');
    const vaultSummary = await this.getVaultSummary();

    const preview = await this.previewRangeTrade(input);
    const availableLiquidity = BigInt(vaultSummary.availableLiquidity);
    const totalAccountedValue = BigInt(vaultSummary.totalAccountedValue);
    const maxAllocationBps = BigInt(vaultSummary.maxAllocationBps);
    const maxAllocatableCapital = (totalAccountedValue * maxAllocationBps) / 10_000n;
    const strategyBudget =
      maxAllocatableCapital < availableLiquidity ? maxAllocatableCapital : availableLiquidity;

    if (strategyBudget <= 0n) {
      throw new Error('Vault strategy budget is zero.');
    }

    const tx = new Transaction();
    tx.setGasBudget(80_000_000);

    const allocation = tx.moveCall({
      target: `${this.config.axisPackageId}::axis_vault::allocate_range_position`,
      typeArguments: [this.config.quoteAssetType],
      arguments: [
        tx.object(this.config.axisAgentCapId),
        tx.object(this.config.axisVaultId),
        tx.pure.u64(strategyBudget),
        tx.pure.u64(quantity),
        tx.pure.id(this.config.predictObjectId),
        tx.pure.id(this.config.predictManagerId),
        tx.pure.id(input.oracleId),
        tx.pure.u64(expiry),
        tx.pure.u64(lowerStrike),
        tx.pure.u64(higherStrike),
      ],
    }) as any;
    const capital = allocation[0] as any;
    const ticket = allocation[1] as any;

    tx.moveCall({
      target: `${this.config.predictPackageId}::predict_manager::deposit`,
      typeArguments: [this.config.quoteAssetType],
      arguments: [tx.object(this.config.predictManagerId), capital],
    });

    const rangeKeyForMint = tx.moveCall({
      target: `${this.config.predictPackageId}::range_key::new`,
      arguments: [
        tx.pure.id(input.oracleId),
        tx.pure.u64(expiry),
        tx.pure.u64(lowerStrike),
        tx.pure.u64(higherStrike),
      ],
    });

    tx.moveCall({
      target: `${this.config.predictPackageId}::predict::mint_range`,
      typeArguments: [this.config.quoteAssetType],
      arguments: [
        tx.object(this.config.predictObjectId),
        tx.object(this.config.predictManagerId),
        tx.object(input.oracleId),
        rangeKeyForMint,
        tx.pure.u64(quantity),
        tx.object(this.config.clockObjectId),
      ],
    });

    const remainingManagerBalance = tx.moveCall({
      target: `${this.config.predictPackageId}::predict_manager::balance`,
      typeArguments: [this.config.quoteAssetType],
      arguments: [tx.object(this.config.predictManagerId)],
    });

    const leftoverCapital = tx.moveCall({
      target: `${this.config.predictPackageId}::predict_manager::withdraw`,
      typeArguments: [this.config.quoteAssetType],
      arguments: [tx.object(this.config.predictManagerId), remainingManagerBalance],
    }) as any;

    const reconciledTicket = tx.moveCall({
      target: `${this.config.axisPackageId}::axis_vault::reconcile_range_position_budget`,
      typeArguments: [this.config.quoteAssetType],
      arguments: [
        tx.object(this.config.axisAgentCapId),
        tx.object(this.config.axisVaultId),
        ticket,
        leftoverCapital,
      ],
    }) as any;

    const signer = this.signer;
    if (!signer) {
      throw new Error('Agent signer is not available.');
    }
    tx.transferObjects([reconciledTicket], tx.pure.address(signer.toSuiAddress()));

    return {
      tx,
      preview,
      strategyBudget,
    };
  }

  async settleRangeStrategy(ticketId: string) {
    assertAgentKey(this.config);
    assertAxisRuntimeConfig(this.config);
    assertPredictManagerConfig(this.config);

    const signer = this.signer;
    if (!signer) {
      throw new Error('Agent signer is not available.');
    }

    const ticket = await this.getStrategyTicket(ticketId);
    if (ticket.managerId.toLowerCase() !== this.config.predictManagerId.toLowerCase()) {
      throw new Error('Ticket manager does not match configured DEEPBOOK_MANAGER_ID.');
    }
    if (ticket.predictId.toLowerCase() !== this.config.predictObjectId.toLowerCase()) {
      throw new Error('Ticket predict object does not match configured DEEPBOOK_PREDICT_OBJECT_ID.');
    }

    const managerBalance = await this.inspectManagerQuoteBalance();
    if (managerBalance !== 0n) {
      throw new Error(
        `PredictManager still holds ${managerBalance.toString()} quote units. Settle or sweep the existing balance before redeeming another range.`,
      );
    }

    let expectedPayout = 0n;
    try {
      const preview = await this.previewRangeTrade({
        oracleId: ticket.oracleId,
        expiry: ticket.expiry,
        lowerStrike: ticket.lowerStrike,
        higherStrike: ticket.higherStrike,
        quantity: ticket.quantity,
      });
      expectedPayout = BigInt(preview.redeemPayout);
    } catch (error) {
      if (isOracleNotQuoteableError(error)) {
        throw new Error('SETTLEMENT_NOT_READY: oracle is not quoteable yet for redeem preview.');
      }
      throw error;
    }

    const tx = new Transaction();
    tx.setGasBudget(80_000_000);

    const rangeKey = tx.moveCall({
      target: `${this.config.predictPackageId}::range_key::new`,
      arguments: [
        tx.pure.id(ticket.oracleId),
        tx.pure.u64(ticket.expiry),
        tx.pure.u64(ticket.lowerStrike),
        tx.pure.u64(ticket.higherStrike),
      ],
    });

    tx.moveCall({
      target: `${this.config.predictPackageId}::predict::redeem_range`,
      typeArguments: [this.config.quoteAssetType],
      arguments: [
        tx.object(this.config.predictObjectId),
        tx.object(this.config.predictManagerId),
        tx.object(ticket.oracleId),
        rangeKey,
        tx.pure.u64(ticket.quantity),
        tx.object(this.config.clockObjectId),
      ],
    });

    if (expectedPayout === 0n) {
      tx.moveCall({
        target: `${this.config.axisPackageId}::axis_vault::settle_range_position_empty`,
        typeArguments: [this.config.quoteAssetType],
        arguments: [
          tx.object(this.config.axisAgentCapId),
          tx.object(this.config.axisVaultId),
          tx.object(ticketId),
        ],
      });
    } else {
      const balanceAfterRedeem = tx.moveCall({
        target: `${this.config.predictPackageId}::predict_manager::balance`,
        typeArguments: [this.config.quoteAssetType],
        arguments: [tx.object(this.config.predictManagerId)],
      });

      const returnedCoin = tx.moveCall({
        target: `${this.config.predictPackageId}::predict_manager::withdraw`,
        typeArguments: [this.config.quoteAssetType],
        arguments: [tx.object(this.config.predictManagerId), balanceAfterRedeem],
      }) as any;

      tx.moveCall({
        target: `${this.config.axisPackageId}::axis_vault::settle_range_position`,
        typeArguments: [this.config.quoteAssetType],
        arguments: [
          tx.object(this.config.axisAgentCapId),
          tx.object(this.config.axisVaultId),
          tx.object(ticketId),
          returnedCoin,
        ],
      });
    }

    const result = unwrapTransactionResult(
      await this.client.signAndExecuteTransaction({
        signer,
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
          showEvents: true,
          showBalanceChanges: true,
        },
      } as never),
    );
    assertTransactionSuccess(result, 'Range strategy settle');

    return {
      digest: result.digest,
      ticketId,
      settledQuantity: ticket.quantity.toString(),
      expectedPayout: expectedPayout.toString(),
    };
  }

  private async inspectManagerQuoteBalance() {
    assertPredictManagerConfig(this.config);

    const tx = new Transaction();
    tx.moveCall({
      target: `${this.config.predictPackageId}::predict_manager::balance`,
      typeArguments: [this.config.quoteAssetType],
      arguments: [tx.object(this.config.predictManagerId)],
    });

    const sender = this.getAgentAddress() ?? '0x0000000000000000000000000000000000000000000000000000000000000000';
    const inspect = await this.client.devInspectTransactionBlock({
      sender,
      transactionBlock: tx,
    } as never);

    const [balanceBytes] = extractReturnBytes(inspect);
    return decodeU64(balanceBytes);
  }

  async getStrategyTicketPublic(ticketId: string): Promise<StrategyTicketSnapshot> {
    return this.getStrategyTicket(ticketId);
  }

  async getActiveStrategySnapshot(): Promise<StrategyTicketSnapshot | null> {
    const ticketId = await this.getActiveTicketId();
    if (!ticketId) return null;
    return this.getStrategyTicket(ticketId);
  }

  async getActiveTicketId(): Promise<string | null> {
    assertAxisRuntimeConfig(this.config);
    const address = this.getAgentAddress();
    if (!address) return null;

    const response = (await this.client.getOwnedObjects({
      owner: address,
      options: {
        showType: true,
        showOwner: true,
      },
    } as any)) as any;

    if (response?.data && response.data.length > 0) {
      const ticket = response.data.find((item: any) => {
        const objectType = item?.data?.type ?? item?.data?.content?.type ?? item?.type;
        return typeof objectType === 'string' && objectType.endsWith('::axis_vault::StrategyTicket');
      });
      if (ticket) {
        return ticket.data?.objectId ?? ticket.objectId ?? null;
      }
    }
    return null;
  }

  private async getStrategyTicket(ticketId: string): Promise<StrategyTicketSnapshot> {
    const fields = await getMoveObjectFields(this.client, ticketId);

    return {
      id: ticketId,
      sequence: readNestedBigInt(fields.sequence),
      allocatedAmount: readNestedBigInt(fields.allocated_amount),
      quantity: readNestedBigInt(fields.quantity),
      predictId: readNestedId(fields.predict_id),
      managerId: readNestedId(fields.manager_id),
      oracleId: readNestedId(fields.oracle_id),
      expiry: readNestedBigInt(fields.expiry),
      lowerStrike: readNestedBigInt(fields.lower_strike),
      higherStrike: readNestedBigInt(fields.higher_strike),
    };
  }
}
