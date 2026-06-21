import dotenv from 'dotenv';
import express from 'express';

import { AxisAgentService } from './axis-agent-service.js';
import { loadConfig } from './config.js';
import { PredictApiClient } from './predict-api.js';
import { createSuiClient } from './sui.js';
import { StrategyScheduler } from './scheduler.js';

dotenv.config();

const config = loadConfig();
const client = createSuiClient(config);
const predictApi = new PredictApiClient(config.predictServerUrl);
const axisAgent = new AxisAgentService(config, client, predictApi);

const scheduler = new StrategyScheduler(config, axisAgent, predictApi);
scheduler.start();

const app = express();
app.use(express.json());

// Enable CORS for frontend client
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }
  next();
});

function handleRoute(
  handler: (req: express.Request, res: express.Response) => Promise<void>,
) {
  return async (req: express.Request, res: express.Response) => {
    try {
      await handler(req, res);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      res.status(400).json({ error: message });
    }
  };
}

app.get('/', (_req, res) => {
  res.send('Axis Predict backend is running.');
});

app.get(
  '/health',
  handleRoute(async (_req, res) => {
    const chainIdentifier = await client.getChainIdentifier();
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      network: config.network,
      rpcUrl: config.rpcUrl,
      chainIdentifier,
      predictServerUrl: config.predictServerUrl,
      predictObjectId: config.predictObjectId,
      predictManagerId: config.predictManagerId ?? null,
      axisVaultId: config.axisVaultId ?? null,
      axisPackageId: config.axisPackageId ?? null,
      axisAgentCapId: config.axisAgentCapId ?? null,
      agentAddress: axisAgent.getAgentAddress(),
    });
  }),
);

app.get('/config/public', (_req, res) => {
  res.json({
    network: config.network,
    rpcUrl: config.rpcUrl,
    predictServerUrl: config.predictServerUrl,
    quoteAssetType: config.quoteAssetType,
    predictPackageId: config.predictPackageId,
    predictObjectId: config.predictObjectId,
    predictManagerId: config.predictManagerId ?? null,
    axisPackageId: config.axisPackageId ?? null,
    axisVaultId: config.axisVaultId ?? null,
    axisAgentCapId: config.axisAgentCapId ?? null,
    clockObjectId: config.clockObjectId,
    agentAddress: axisAgent.getAgentAddress(),
  });
});

app.get(
  '/vault/summary',
  handleRoute(async (_req, res) => {
    res.json(await axisAgent.getVaultSummary());
  }),
);

app.get(
  '/agent/status',
  handleRoute(async (_req, res) => {
    const status = await axisAgent.getManagerStatus();
    
    let activeStrategy = null;
    try {
      const ticketId = await axisAgent.getActiveTicketId();
      if (ticketId) {
        const ticket = await axisAgent.getStrategyTicketPublic(ticketId);
        activeStrategy = {
          ticketId: ticket.id,
          oracleId: ticket.oracleId,
          lowerStrike: ticket.lowerStrike.toString(),
          higherStrike: ticket.higherStrike.toString(),
          expiry: ticket.expiry.toString(),
          quantity: ticket.quantity.toString(),
          allocatedAmount: ticket.allocatedAmount.toString(),
        };
      }
    } catch (err) {
      console.error('Error fetching active strategy for status endpoint:', err);
    }

    res.json({
      ...status,
      activeStrategy,
      logs: scheduler.getLogs(),
    });
  }),
);

app.get(
  '/predict/oracles',
  handleRoute(async (_req, res) => {
    res.json(await predictApi.getOracleIds(config.predictObjectId));
  }),
);

app.get(
  '/predict/oracles/:oracleId/state',
  handleRoute(async (req, res) => {
    res.json(await predictApi.getOracleState(String(req.params.oracleId)));
  }),
);

app.get(
  '/predict/manager/summary',
  handleRoute(async (_req, res) => {
    if (!config.predictManagerId) {
      throw new Error('DEEPBOOK_MANAGER_ID is not configured.');
    }
    res.json(await predictApi.getManagerSummary(config.predictManagerId));
  }),
);

app.get(
  '/predict/manager/positions',
  handleRoute(async (_req, res) => {
    if (!config.predictManagerId) {
      throw new Error('DEEPBOOK_MANAGER_ID is not configured.');
    }
    res.json(await predictApi.getManagerPositionsSummary(config.predictManagerId));
  }),
);

app.post(
  '/predict/manager/create',
  handleRoute(async (_req, res) => {
    res.json(await axisAgent.createPredictManager());
  }),
);

app.post(
  '/strategy/range/preview',
  handleRoute(async (req, res) => {
    res.json(await axisAgent.previewRangeTrade(req.body));
  }),
);

app.post(
  '/strategy/range/open',
  handleRoute(async (req, res) => {
    res.json(await axisAgent.openRangeStrategy(req.body));
  }),
);

app.post(
  '/strategy/range/settle',
  handleRoute(async (req, res) => {
    const ticketId = req.body?.ticketId;
    if (!ticketId || typeof ticketId !== 'string') {
      throw new Error('ticketId is required.');
    }
    res.json(await axisAgent.settleRangeStrategy(ticketId));
  }),
);

app.listen(config.port, () => {
  console.log(`Backend listening on port ${config.port}`);
  console.log(`Network: ${config.network}`);
  console.log(`RPC: ${config.rpcUrl}`);
  console.log(`Predict: ${config.predictObjectId}`);
  console.log(`Agent: ${axisAgent.getAgentAddress() ?? 'not configured'}`);
});
