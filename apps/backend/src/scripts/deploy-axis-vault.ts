import dotenv from 'dotenv';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Transaction } from '@mysten/sui/transactions';

import {
  assertDeployerKey,
  loadConfig,
} from '../config.js';
import { createSuiClient, findObjectChangeId, loadSigner, unwrapTransactionResult } from '../sui.js';

dotenv.config();

interface BuildOutput {
  modules: string[];
  dependencies: string[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..', '..');
const repoRoot = path.resolve(backendRoot, '..', '..');
const movePackagePath = path.join(repoRoot, 'sc', 'defai_agent');

function buildMovePackage(): BuildOutput {
  const stdout = execFileSync(
    'sui',
    ['move', 'build', '--dump-bytecode-as-base64', '--path', movePackagePath],
    {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  return JSON.parse(stdout) as BuildOutput;
}

async function main() {
  const config = loadConfig();
  assertDeployerKey(config);

  const client = createSuiClient(config);
  const deployer = loadSigner(config.deployerPrivateKey);
  const build = buildMovePackage();

  const publishTx = new Transaction();
  publishTx.setGasBudget(150_000_000);
  const upgradeCap = publishTx.publish({
    modules: build.modules,
    dependencies: build.dependencies,
  });
  publishTx.transferObjects([upgradeCap], publishTx.pure.address(deployer.toSuiAddress()));

  const publishResult = unwrapTransactionResult(
    await client.signAndExecuteTransaction({
      signer: deployer,
      transaction: publishTx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    } as never),
  );

  const packageId =
    publishResult?.objectChanges?.find((change: any) => change?.type === 'published')?.packageId;
  const adminCapId = findObjectChangeId(publishResult, '::axis_vault::AdminCap');
  const treasuryCapId = findObjectChangeId(publishResult, '::coin::TreasuryCap<');

  if (!packageId || !adminCapId || !treasuryCapId) {
    throw new Error('Failed to discover package/admin/treasury ids from publish transaction.');
  }

  const agentRecipient = config.agentPrivateKey
    ? loadSigner(config.agentPrivateKey).toSuiAddress()
    : deployer.toSuiAddress();

  const initTx = new Transaction();
  initTx.setGasBudget(80_000_000);
  initTx.moveCall({
    target: `${packageId}::axis_vault::create_vault`,
    typeArguments: [config.quoteAssetType],
    arguments: [initTx.object(adminCapId), initTx.object(treasuryCapId)],
  });
  const agentCap = initTx.moveCall({
    target: `${packageId}::axis_vault::issue_agent_cap`,
    arguments: [initTx.object(adminCapId)],
  });
  initTx.transferObjects([agentCap], initTx.pure.address(agentRecipient));

  const initResult = unwrapTransactionResult(
    await client.signAndExecuteTransaction({
      signer: deployer,
      transaction: initTx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    } as never),
  );

  const vaultId = findObjectChangeId(initResult, '::axis_vault::Vault<');
  const agentCapId = findObjectChangeId(initResult, '::axis_vault::AgentCap');

  console.log(
    JSON.stringify(
      {
        network: config.network,
        packageId,
        adminCapId,
        treasuryCapId,
        vaultId,
        agentCapId,
        agentRecipient,
        publishDigest: publishResult.digest,
        initDigest: initResult.digest,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
