import type { AppConfig } from './config.js';
import type { AxisAgentService } from './axis-agent-service.js';
import type { PredictApiClient } from './predict-api.js';

interface AIDecision {
  shouldOpen: boolean;
  lowerStrikeUSD: number;
  higherStrikeUSD: number;
  reason: string;
}

interface OracleCandidate {
  oracleId: string;
  underlyingAsset: string;
  expiry: bigint;
  spotPriceUSD: number;
}

interface PreviewCandidate {
  lowerStrikeUSD: number;
  higherStrikeUSD: number;
  reason: string;
}

export class StrategyScheduler {
  private isProcessing = false;
  private intervalId: NodeJS.Timeout | null = null;
  private lastLoggedState: string = '';
  private lastLoggedRemainingMins: number = -1;
  private logs: Array<{ timeLabel: string; message: string; tone: 'info' | 'reasoning' | 'success' }> = [
    {
      timeLabel: 'SYSTEM',
      message: 'Strategy scheduler initialized.',
      tone: 'info'
    }
  ];

  constructor(
    private readonly config: AppConfig,
    private readonly axisAgent: AxisAgentService,
    private readonly predictApi: PredictApiClient
  ) {}

  public getLogs() {
    return this.logs;
  }

  private addLog(label: string, message: string, tone: 'info' | 'reasoning' | 'success' = 'info') {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.logs.push({
      timeLabel: `${label} @ ${timestamp}`,
      message,
      tone
    });
    // Keep last 12 logs for UI fitting
    if (this.logs.length > 12) {
      this.logs.shift();
    }
  }

  private normalizeStrikePair(lowerStrikeUSD: number, higherStrikeUSD: number) {
    const strikeInterval = 1000;
    let lower = Math.round(lowerStrikeUSD / strikeInterval) * strikeInterval;
    let higher = Math.round(higherStrikeUSD / strikeInterval) * strikeInterval;

    if (lower === higher) {
      higher = lower + strikeInterval;
    }
    if (lower > higher) {
      [lower, higher] = [higher, lower];
    }

    return { lowerStrikeUSD: lower, higherStrikeUSD: higher };
  }

  private buildPreviewCandidates(decision: AIDecision, spotPriceUSD: number): PreviewCandidate[] {
    const centerFloor = Math.floor(spotPriceUSD / 1000) * 1000;
    const baseCandidates = [
      {
        ...this.normalizeStrikePair(decision.lowerStrikeUSD, decision.higherStrikeUSD),
        reason: 'AI-selected range',
      },
      {
        lowerStrikeUSD: centerFloor,
        higherStrikeUSD: centerFloor + 1000,
        reason: 'Spot-centered fallback',
      },
      {
        lowerStrikeUSD: centerFloor - 1000,
        higherStrikeUSD: centerFloor,
        reason: 'Spot-lower fallback',
      },
      {
        lowerStrikeUSD: centerFloor + 1000,
        higherStrikeUSD: centerFloor + 2000,
        reason: 'Spot-upper fallback',
      },
      {
        lowerStrikeUSD: centerFloor - 1000,
        higherStrikeUSD: centerFloor + 1000,
        reason: 'Wider centered fallback',
      },
    ];

    const deduped = new Map<string, PreviewCandidate>();
    for (const candidate of baseCandidates) {
      if (candidate.lowerStrikeUSD < 0 || candidate.higherStrikeUSD < 0) continue;
      const key = `${candidate.lowerStrikeUSD}-${candidate.higherStrikeUSD}`;
      if (!deduped.has(key)) {
        deduped.set(key, candidate);
      }
    }
    return [...deduped.values()];
  }

  private async resolveTradableOracle(): Promise<OracleCandidate | null> {
    const oracles = await this.predictApi.getOracleIds(this.config.predictObjectId);
    const now = Date.now();
    const activeOracles = Array.isArray(oracles)
      ? oracles
          .filter((oracle: any) => oracle?.status === 'active' && Number(oracle?.expiry ?? 0) > now + 60_000)
          .sort((a: any, b: any) => Number(a.expiry) - Number(b.expiry))
      : [];

    for (const oracle of activeOracles) {
      try {
        const state = await this.predictApi.getOracleState(oracle.oracle_id);
        if (state?.oracle?.status !== 'active') {
          continue;
        }

        const spotPriceUSD = Number(state?.latest_price?.spot ?? 0) / 1_000_000_000;
        if (!Number.isFinite(spotPriceUSD) || spotPriceUSD <= 0) {
          continue;
        }

        return {
          oracleId: oracle.oracle_id,
          underlyingAsset: oracle.underlying_asset,
          expiry: BigInt(state.oracle.expiry),
          spotPriceUSD,
        };
      } catch (error) {
        console.warn(`[Scheduler] Failed to hydrate oracle ${oracle.oracle_id}:`, error);
      }
    }

    return null;
  }

  public start() {
    if (!this.config.autoStrategyEnabled) {
      console.log('[Scheduler] Auto strategy is disabled in config.');
      this.addLog('SYSTEM', 'Auto strategy is disabled in config.', 'info');
      return;
    }

    console.log(`[Scheduler] Starting auto strategy loop. Interval: ${this.config.autoStrategyIntervalMs}ms`);
    this.addLog('SYSTEM', `Auto strategy loop started on ${this.config.network}.`, 'info');
    
    // Run immediate check
    this.runIteration().catch((err) => console.error('[Scheduler] Error in immediate run:', err));

    // Schedule periodic checks
    this.intervalId = setInterval(() => {
      this.runIteration().catch((err) => console.error('[Scheduler] Error in interval run:', err));
    }, this.config.autoStrategyIntervalMs);
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Scheduler] Auto strategy loop stopped.');
      this.addLog('SYSTEM', 'Auto strategy loop stopped.', 'info');
    }
  }

  private async runIteration() {
    if (this.isProcessing) {
      console.log('[Scheduler] Iteration skipped - previous run still in progress.');
      return;
    }

    this.isProcessing = true;
    try {
      const vaultSummary = await this.axisAgent.getVaultSummary();
      const deployedCapital = BigInt(vaultSummary.deployedCapital);
      const availableLiquidity = BigInt(vaultSummary.availableLiquidity);
      const totalAccountedValue = BigInt(vaultSummary.totalAccountedValue);
      const maxAllocationBps = BigInt(vaultSummary.maxAllocationBps);

      // Log only on state transitions or action points to keep console clean
      const stateKey = `${deployedCapital.toString()}-${availableLiquidity.toString()}`;

      // 1. Check if there is active position deployed
      if (deployedCapital > 0n) {
        const ticketId = await this.axisAgent.getActiveTicketId();
        if (ticketId) {
          const ticket = await this.axisAgent.getStrategyTicketPublic(ticketId);
          const expiryMs = Number(ticket.expiry);
          const nowMs = Date.now();

          if (nowMs >= expiryMs) {
            console.log(`[Scheduler] [ACTION] Active position expired. Settling Ticket: ${ticketId}...`);
            this.addLog('VAULT', `Active position expired. Settling Ticket: ${ticketId.slice(0, 8)}...`, 'info');
            try {
              const result = await this.axisAgent.settleRangeStrategy(ticketId);
              console.log(`[Scheduler] [SUCCESS] Settle transaction complete. Digest: ${result.digest}`);
              this.addLog('SUCCESS', `Settle complete! Returned cash to Vault. Digest: ${result.digest.slice(0, 10)}...`, 'success');
              this.lastLoggedState = ''; // reset state logging
              this.lastLoggedRemainingMins = -1; // reset
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              if (message.startsWith('SETTLEMENT_NOT_READY:')) {
                console.log('[Scheduler] Settlement preview not ready yet. Retrying next cycle.');
                this.addLog('SYSTEM', 'Settlement oracle is not quoteable yet. Retrying next cycle.', 'info');
                return;
              }
              throw error;
            }
          } else {
            const timeRemainingMins = Math.round((expiryMs - nowMs) / 60000);
            const msg = `Position Active (Ticket: ${ticketId}). Expiry: ${new Date(expiryMs).toLocaleTimeString()}. Remaining: ${timeRemainingMins}m.`;
            if (this.lastLoggedState !== stateKey) {
              console.log(`[Scheduler] ${msg}`);
              this.lastLoggedState = stateKey;
            }

            const shouldLog = this.lastLoggedRemainingMins === -1 || Math.abs(this.lastLoggedRemainingMins - timeRemainingMins) >= 5;
            if (shouldLog) {
              const lowerStrikeUSD = Number(ticket.lowerStrike / 1_000_000_000n);
              const higherStrikeUSD = Number(ticket.higherStrike / 1_000_000_000n);
              const lowerStr = lowerStrikeUSD >= 1000 ? `${lowerStrikeUSD / 1000}k` : `${lowerStrikeUSD}`;
              const higherStr = higherStrikeUSD >= 1000 ? `${higherStrikeUSD / 1000}k` : `${higherStrikeUSD}`;
              
              this.addLog('MONITOR', `Position active: Safe range $${lowerStr} - $${higherStr}. Expiration in ${timeRemainingMins}m.`, 'info');
              this.lastLoggedRemainingMins = timeRemainingMins;
            }
          }
        } else {
          if (this.lastLoggedState !== stateKey) {
            console.warn(`[Scheduler] Vault has deployed capital (${deployedCapital.toString()}) but no StrategyTicket was found owned by the agent.`);
            this.addLog('SYSTEM', 'Vault has deployed capital but no StrategyTicket was found owned by the agent.', 'info');
            this.lastLoggedState = stateKey;
          }
        }
        return;
      }

      // 2. No active position (Idle). Check if there is cash to invest
      if (availableLiquidity > 100_000n) { // Minimum 0.1 USDC to trade
        if (this.lastLoggedState !== stateKey) {
          console.log(`[Scheduler] Vault is idle. Liquidity available: ${(Number(availableLiquidity) / 1_000_000).toFixed(2)} USDC. Running AI reasoning...`);
          this.addLog('AGENT', `Vault is idle. Cash: $${(Number(availableLiquidity) / 1_000_000).toFixed(2)} USDC. Running AI reasoning...`, 'info');
          this.lastLoggedState = stateKey;
        }

        const targetOracle = await this.resolveTradableOracle();
        if (!targetOracle) {
          console.warn('[Scheduler] No active oracles found on-chain. Cannot open strategy.');
          this.addLog('SYSTEM', 'No active oracles found on-chain. Cannot open strategy.', 'info');
          return;
        }
        const expiryDateStr = new Date(Number(targetOracle.expiry)).toLocaleString();

        // Call AI
        const decision = await this.askAIForStrategy(
          targetOracle.underlyingAsset,
          targetOracle.spotPriceUSD,
          expiryDateStr,
          Number(availableLiquidity) / 1_000_000
        );

        if (decision.shouldOpen) {
          console.log(`[Scheduler] [AI Decision] ${decision.reason}`);
          this.addLog(
            'AI',
            `Decision: Open position. Candidate strikes: $${decision.lowerStrikeUSD} - $${decision.higherStrikeUSD}. Reason: ${decision.reason}`,
            'reasoning',
          );

          const strikeMultiplier = 1_000_000_000n;
          const previewCandidates = this.buildPreviewCandidates(decision, targetOracle.spotPriceUSD);
          let chosenRange: PreviewCandidate | null = null;
          let chosenQuantity: bigint | null = null;
          let chosenFinalCost: bigint | null = null;
          let lastPreviewError: string | null = null;
          const maxAllocatableCapital = (totalAccountedValue * maxAllocationBps) / 10_000n;
          const guardrailBudget =
            maxAllocatableCapital < availableLiquidity ? maxAllocatableCapital : availableLiquidity;
          const configuredTradeBudget = BigInt(
            Math.max(1, Math.floor(this.config.strategyMaxTradeDusdc * 1_000_000)),
          );
          const strategyBudget =
            configuredTradeBudget < guardrailBudget ? configuredTradeBudget : guardrailBudget;

          for (const candidate of previewCandidates) {
            const lowerStrike = BigInt(candidate.lowerStrikeUSD) * strikeMultiplier;
            const higherStrike = BigInt(candidate.higherStrikeUSD) * strikeMultiplier;
            try {
              console.log(
                `[Scheduler] Previewing strategy bounds: $${candidate.lowerStrikeUSD} - $${candidate.higherStrikeUSD} (${candidate.reason})`,
              );
              const candidatePreview = await this.axisAgent.previewRangeTrade({
                oracleId: targetOracle.oracleId,
                expiry: targetOracle.expiry,
                lowerStrike,
                higherStrike,
                quantity: 1_000_000n,
              });
              if (BigInt(candidatePreview.mintCost) === 0n) {
                lastPreviewError = `Preview returned 0 cost for $${candidate.lowerStrikeUSD} - $${candidate.higherStrikeUSD}.`;
                continue;
              }

              const baseMintCost = BigInt(candidatePreview.mintCost);
              if (strategyBudget < baseMintCost) {
                lastPreviewError =
                  `Trade budget ${(Number(strategyBudget) / 1_000_000).toFixed(2)} USDC is below preview cost ` +
                  `${(Number(baseMintCost) / 1_000_000).toFixed(2)} USDC for $${candidate.lowerStrikeUSD} - $${candidate.higherStrikeUSD}.`;
                continue;
              }

              const maxQuantity = (strategyBudget * 1_000_000n) / baseMintCost;
              let targetQuantity = (maxQuantity * 98n) / 100n;
              if (targetQuantity < 1_000_000n) {
                targetQuantity = 1_000_000n;
              }

              const finalCost = (baseMintCost * targetQuantity) / 1_000_000n;
              if (finalCost > strategyBudget) {
                lastPreviewError =
                  `Scaled strategy exceeds budget for $${candidate.lowerStrikeUSD} - $${candidate.higherStrikeUSD}.`;
                continue;
              }

              const executionPreview = await this.axisAgent.canOpenRangeStrategy({
                oracleId: targetOracle.oracleId,
                expiry: targetOracle.expiry,
                lowerStrike,
                higherStrike,
                quantity: targetQuantity,
              });

              if (!executionPreview.ok) {
                lastPreviewError = executionPreview.error ?? 'Unknown PTB simulation failure.';
                console.warn(
                  `[Scheduler] Full PTB preview failed for $${candidate.lowerStrikeUSD} - $${candidate.higherStrikeUSD}: ${lastPreviewError}`,
                );
                continue;
              }

              chosenRange = candidate;
              chosenQuantity = targetQuantity;
              chosenFinalCost = finalCost;
              break;
            } catch (error) {
              lastPreviewError = error instanceof Error ? error.message : String(error);
              console.warn(
                `[Scheduler] Preview failed for $${candidate.lowerStrikeUSD} - $${candidate.higherStrikeUSD}: ${lastPreviewError}`,
              );
            }
          }

          if (!chosenRange || !chosenQuantity || !chosenFinalCost) {
            const message = lastPreviewError
              ? `No executable strike range passed preview. Last error: ${lastPreviewError}`
              : 'No tradable strike range passed preview.';
            console.error(`[Scheduler] ${message}`);
            this.addLog('SYSTEM', message, 'info');
            return;
          }

          const lowerStrikeUSD = chosenRange.lowerStrikeUSD;
          const higherStrikeUSD = chosenRange.higherStrikeUSD;
          const lowerStrike = BigInt(lowerStrikeUSD) * strikeMultiplier;
          const higherStrike = BigInt(higherStrikeUSD) * strikeMultiplier;
          const expiry = targetOracle.expiry;

          if (chosenRange.reason !== 'AI-selected range') {
            this.addLog(
              'SYSTEM',
              `Adjusted strikes to $${lowerStrikeUSD} - $${higherStrikeUSD} after preview fallback. Trade cap: $${this.config.strategyMaxTradeDusdc.toFixed(2)}.`,
              'info',
            );
          }
          console.log(`[Scheduler] [ACTION] Opening range strategy. Quantity: ${(Number(chosenQuantity) / 1_000_000).toFixed(2)} units. Estimated cost: ${(Number(chosenFinalCost) / 1_000_000).toFixed(2)} USDC. Trade cap: ${this.config.strategyMaxTradeDusdc.toFixed(2)} USDC...`);
          
          const result = await this.axisAgent.openRangeStrategy({
            oracleId: targetOracle.oracleId,
            expiry,
            lowerStrike,
            higherStrike,
            quantity: chosenQuantity
          });

          const ticketIdStr = result.ticketId ?? 'unknown';
          console.log(`[Scheduler] [SUCCESS] Position opened. Ticket: ${ticketIdStr}. Digest: ${result.digest}`);
          this.addLog('SUCCESS', `Position opened! Ticket: ${ticketIdStr.slice(0, 8)}... Digest: ${result.digest.slice(0, 10)}...`, 'success');
          this.lastLoggedState = ''; // reset state logging
          this.lastLoggedRemainingMins = -1; // reset
        } else {
          console.log(`[Scheduler] [AI Decision] Standby - ${decision.reason}`);
          this.addLog('AI', `Decision: Standby. Reason: ${decision.reason}`, 'reasoning');
        }
        return;
      }

      // 3. Vault has no available liquidity
      if (this.lastLoggedState !== stateKey) {
        console.log('[Scheduler] Vault is idle. No liquidity available for strategy deployment. Awaiting deposits.');
        this.addLog('SYSTEM', 'Vault is idle. Awaiting user deposits.', 'info');
        this.lastLoggedState = stateKey;
      }
    } catch (err) {
      console.error('[Scheduler] Error during execution cycle:', err);
      this.addLog('SYSTEM', `Error: ${err instanceof Error ? err.message : String(err)}`, 'info');
    } finally {
      this.isProcessing = false;
    }
  }

  private async askAIForStrategy(
    underlyingAsset: string,
    spotPriceUSD: number,
    expiryDateStr: string,
    availableLiquidityDUSDC: number
  ): Promise<AIDecision> {
    const apiKey = this.config.openRouterApiKey;
    if (!apiKey) {
      console.log('[Scheduler] OPENROUTER_API_KEY is not configured. Falling back to default centered strategy.');
      const center = Math.round(spotPriceUSD / 1000) * 1000;
      return {
        shouldOpen: true,
        lowerStrikeUSD: center,
        higherStrikeUSD: center + 1000,
        reason: 'Fallback centered strategy (no API key).'
      };
    }

    const prompt = `You are a professional quantitative DeFi option trader managing an automated range option vault.
Market State:
- Asset: ${underlyingAsset}
- Current Spot Price: $${spotPriceUSD}
- Option Expiry: ${expiryDateStr}
- Vault Cash Available: $${availableLiquidityDUSDC} USDC

Strategy Guide:
- A Range Option pays out a premium if the asset price at expiry stays within the range [lowerStrike, higherStrike].
- We want to pick a strike range that has a high probability of containing the price at expiry (neutral or range-bound outlook).
- The strike price interval is $1000. So strikes MUST be multiples of $1000 (e.g. $67000, $68000, $69000).
- Lower strike must be less than higher strike.

Task:
Determine if the current market conditions are favorable for opening a range position. If yes, choose the optimal lower strike and higher strike (in USD).
Respond ONLY with a JSON object in this format (no markdown, no other text):
{
  "shouldOpen": true,
  "lowerStrikeUSD": 68000,
  "higherStrikeUSD": 69000,
  "reason": "Market is consolidating around 68.4k with declining volatility."
}`;

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://axis.predict',
          'X-Title': 'Axis Predict',
        },
        body: JSON.stringify({
          model: this.config.openRouterModel || 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an automated DeFi trading agent. You always respond with pure JSON.' },
            { role: 'user', content: prompt }
          ],
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = (await response.json()) as any;
      const content = data?.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from LLM');
      }

      return JSON.parse(content.trim()) as AIDecision;
    } catch (err) {
      console.error('[Scheduler] Error querying OpenRouter:', err);
      const center = Math.round(spotPriceUSD / 1000) * 1000;
      return {
        shouldOpen: true,
        lowerStrikeUSD: center,
        higherStrikeUSD: center + 1000,
        reason: 'Fallback centered strategy due to LLM error.'
      };
    }
  }
}
