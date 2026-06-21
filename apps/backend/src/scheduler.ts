import type { AppConfig } from './config.js';
import type { AxisAgentService } from './axis-agent-service.js';
import type { PredictApiClient } from './predict-api.js';

interface AIDecision {
  shouldOpen: boolean;
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
            const result = await this.axisAgent.settleRangeStrategy(ticketId);
            console.log(`[Scheduler] [SUCCESS] Settle transaction complete. Digest: ${result.digest}`);
            this.addLog('SUCCESS', `Settle complete! Returned cash to Vault. Digest: ${result.digest.slice(0, 10)}...`, 'success');
            this.lastLoggedState = ''; // reset state logging
            this.lastLoggedRemainingMins = -1; // reset
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

        const oracles = await this.predictApi.getOracleIds(this.config.predictObjectId);
        const activeOracles = oracles.filter((o: any) => o.status === 'active');

        if (activeOracles.length === 0) {
          console.warn('[Scheduler] No active oracles found on-chain. Cannot open strategy.');
          this.addLog('SYSTEM', 'No active oracles found on-chain. Cannot open strategy.', 'info');
          return;
        }

        const targetOracle = activeOracles[0];
        const state = await this.predictApi.getOracleState(targetOracle.oracle_id);
        const spotPriceUSD = Number(state.latest_price.spot) / 1_000_000_000;
        const expiryDateStr = new Date(Number(targetOracle.expiry)).toLocaleString();

        // Call AI
        const decision = await this.askAIForStrategy(
          targetOracle.underlying_asset,
          spotPriceUSD,
          expiryDateStr,
          Number(availableLiquidity) / 1_000_000
        );

        if (decision.shouldOpen) {
          console.log(`[Scheduler] [AI Decision] ${decision.reason}`);
          
          // Align strikes to $1000 intervals to prevent transaction failures
          const strikeInterval = 1000;
          let lowerStrikeUSD = Math.round(decision.lowerStrikeUSD / strikeInterval) * strikeInterval;
          let higherStrikeUSD = Math.round(decision.higherStrikeUSD / strikeInterval) * strikeInterval;

          if (lowerStrikeUSD === higherStrikeUSD) {
            higherStrikeUSD = lowerStrikeUSD + strikeInterval;
          }
          if (lowerStrikeUSD > higherStrikeUSD) {
            const temp = lowerStrikeUSD;
            lowerStrikeUSD = higherStrikeUSD;
            higherStrikeUSD = temp;
          }

          this.addLog('AI', `Decision: Open position. Strikes: $${lowerStrikeUSD} - $${higherStrikeUSD}. Reason: ${decision.reason}`, 'reasoning');

          const strikeMultiplier = 1_000_000_000n;
          const lowerStrike = BigInt(lowerStrikeUSD) * strikeMultiplier;
          const higherStrike = BigInt(higherStrikeUSD) * strikeMultiplier;
          const expiry = BigInt(targetOracle.expiry);

          // Dry-run/Preview to scale quantity dynamically
          console.log(`[Scheduler] Previewing strategy bounds: $${lowerStrikeUSD} - $${higherStrikeUSD}`);
          const preview = await this.axisAgent.previewRangeTrade({
            oracleId: targetOracle.oracle_id,
            expiry,
            lowerStrike,
            higherStrike,
            quantity: 1_000_000n // Base quantity of 1.0 units
          });

          const baseMintCost = BigInt(preview.mintCost);
          if (baseMintCost === 0n) {
            console.error('[Scheduler] Preview returned 0 cost. Invalid strikes or pricing. Skipping.');
            this.addLog('SYSTEM', 'Preview returned 0 cost. Invalid strikes or pricing.', 'info');
            return;
          }

          // Scale quantity to match 90% of available liquidity
          const maxQuantity = (availableLiquidity * 1_000_000n) / baseMintCost;
          let targetQuantity = (maxQuantity * 9n) / 10n;

          if (targetQuantity < 1_000_000n) {
            targetQuantity = 1_000_000n;
          }

          // Double check if we can afford the target quantity
          const finalCost = (baseMintCost * targetQuantity) / 1_000_000n;
          if (finalCost > availableLiquidity) {
            console.error(`[Scheduler] Cannot afford scaled strategy. Cost: ${(Number(finalCost) / 1_000_000).toFixed(2)} USDC, Available: ${(Number(availableLiquidity) / 1_000_000).toFixed(2)} USDC.`);
            this.addLog('SYSTEM', `Cannot afford scaled strategy. Cost: ${(Number(finalCost) / 1_000_000).toFixed(2)} USDC.`, 'info');
            return;
          }

          console.log(`[Scheduler] [ACTION] Opening range strategy. Quantity: ${(Number(targetQuantity) / 1_000_000).toFixed(2)} units. Estimated cost: ${(Number(finalCost) / 1_000_000).toFixed(2)} USDC...`);
          
          const result = await this.axisAgent.openRangeStrategy({
            oracleId: targetOracle.oracle_id,
            expiry,
            lowerStrike,
            higherStrike,
            quantity: targetQuantity
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
