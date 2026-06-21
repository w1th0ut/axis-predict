import { getJsonRpcFullnodeUrl } from '@mysten/sui/jsonRpc';

export type SuiNetwork = 'mainnet' | 'testnet' | 'devnet' | 'localnet';

export interface AppConfig {
  port: number;
  network: SuiNetwork;
  rpcUrl: string;
  predictServerUrl: string;
  clockObjectId: string;
  quoteAssetType: string;
  predictPackageId: string;
  predictObjectId: string;
  predictManagerId: string | undefined;
  axisPackageId: string | undefined;
  axisVaultId: string | undefined;
  axisAgentCapId: string | undefined;
  agentPrivateKey: string | undefined;
  deployerPrivateKey: string | undefined;
  openRouterApiKey: string | undefined;
  openRouterModel: string | undefined;
  autoStrategyEnabled: boolean;
  autoStrategyIntervalMs: number;
  strategyMaxTradeDusdc: number;
}

const DEFAULT_PREDICT_PACKAGE_ID =
  '0xf5ea2b3749c65d6e56507cc35388719aadb28f9cab873696a2f8687f5c785138';
const DEFAULT_PREDICT_OBJECT_ID =
  '0xc8736204d12f0a7277c86388a68bf8a194b0a14c5538ad13f22cbd8e2a38028a';
const DEFAULT_QUOTE_ASSET_TYPE =
  '0xe95040085976bfd54a1a07225cd46c8a2b4e8e2b6732f140a0fc49850ba73e1a::dusdc::DUSDC';
const DEFAULT_PREDICT_SERVER_URL = 'https://predict-server.testnet.mystenlabs.com';

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function parseNetwork(value: string | undefined): SuiNetwork {
  if (value === 'mainnet' || value === 'testnet' || value === 'devnet' || value === 'localnet') {
    return value;
  }
  return 'testnet';
}

function parsePort(value: string | undefined): number {
  if (!value) return 3001;
  const port = Number.parseInt(value, 10);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: ${value}`);
  }
  return port;
}

function parsePositiveNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Invalid positive numeric value: ${value}`);
  }
  return parsed;
}

export function loadConfig(): AppConfig {
  const network = parseNetwork(readEnv('SUI_NETWORK'));
  const rpcUrl = readEnv('SUI_RPC_URL') ?? getJsonRpcFullnodeUrl(network);

  return {
    port: parsePort(readEnv('PORT')),
    network,
    rpcUrl,
    predictServerUrl: readEnv('PREDICT_SERVER_URL') ?? DEFAULT_PREDICT_SERVER_URL,
    clockObjectId: readEnv('SUI_CLOCK_OBJECT_ID') ?? '0x6',
    quoteAssetType: readEnv('SUI_DUSDC_COIN_TYPE') ?? DEFAULT_QUOTE_ASSET_TYPE,
    predictPackageId: readEnv('DEEPBOOK_PREDICT_PACKAGE_ID') ?? DEFAULT_PREDICT_PACKAGE_ID,
    predictObjectId: readEnv('DEEPBOOK_PREDICT_OBJECT_ID') ?? DEFAULT_PREDICT_OBJECT_ID,
    predictManagerId: readEnv('DEEPBOOK_MANAGER_ID'),
    axisPackageId: readEnv('SUI_PACKAGE_ID'),
    axisVaultId: readEnv('SUI_VAULT_ID'),
    axisAgentCapId: readEnv('SUI_AGENT_CAP_ID'),
    agentPrivateKey: readEnv('AGENT_PRIVATE_KEY'),
    deployerPrivateKey: readEnv('DEPLOYER_PRIVATE_KEY'),
    openRouterApiKey: readEnv('OPENROUTER_API_KEY'),
    openRouterModel: readEnv('OPENROUTER_MODEL') ?? 'openai/gpt-4o-mini',
    autoStrategyEnabled: readEnv('AUTO_STRATEGY_ENABLED') !== 'false',
    autoStrategyIntervalMs: Number(readEnv('AUTO_STRATEGY_INTERVAL_MS') ?? '60000'),
    strategyMaxTradeDusdc: parsePositiveNumber(readEnv('STRATEGY_MAX_TRADE_DUSDC'), 10),
  };
}

export function assertAgentKey(config: AppConfig): asserts config is AppConfig & { agentPrivateKey: string } {
  if (!config.agentPrivateKey) {
    throw new Error('AGENT_PRIVATE_KEY is required for this action.');
  }
}

export function assertDeployerKey(
  config: AppConfig,
): asserts config is AppConfig & { deployerPrivateKey: string } {
  if (!config.deployerPrivateKey) {
    throw new Error('DEPLOYER_PRIVATE_KEY is required for deployment.');
  }
}

export function assertAxisRuntimeConfig(
  config: AppConfig,
): asserts config is AppConfig & { axisPackageId: string; axisVaultId: string; axisAgentCapId: string } {
  if (!config.axisPackageId || !config.axisVaultId || !config.axisAgentCapId) {
    throw new Error('SUI_PACKAGE_ID, SUI_VAULT_ID, and SUI_AGENT_CAP_ID must all be configured.');
  }
}

export function assertPredictManagerConfig(
  config: AppConfig,
): asserts config is AppConfig & { predictManagerId: string } {
  if (!config.predictManagerId) {
    throw new Error('DEEPBOOK_MANAGER_ID is required for strategy actions.');
  }
}
