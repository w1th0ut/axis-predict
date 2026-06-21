import dotenv from 'dotenv';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { Transaction, UpgradePolicy } from '@mysten/sui/transactions';

import { assertDeployerKey, assertAxisRuntimeConfig, loadConfig } from '../config.js';
import { createSuiClient, loadSigner, unwrapTransactionResult } from '../sui.js';

dotenv.config();

interface BuildOutput {
  modules: string[];
  dependencies: string[];
  digest: number[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..', '..');
const repoRoot = path.resolve(backendRoot, '..', '..');
const movePackagePath = path.join(repoRoot, 'sc', 'defai_agent');

function buildMovePackageForUpgrade(): BuildOutput {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'axis-vault-upgrade-'));
  const tempPackagePath = path.join(tempRoot, 'defai_agent');
  fs.cpSync(movePackagePath, tempPackagePath, { recursive: true });

  const tempLock = path.join(tempPackagePath, 'Move.lock');
  if (fs.existsSync(tempLock)) {
    fs.rmSync(tempLock, { force: true });
  }

  try {
    const stdout = execFileSync('sui', ['move', 'build', '--dump-bytecode-as-base64', '--path', tempPackagePath], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    return JSON.parse(stdout) as BuildOutput;
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

async function main() {
  const config = loadConfig();
  assertDeployerKey(config);
  assertAxisRuntimeConfig(config);

  const client = createSuiClient(config);
  const deployer = loadSigner(config.deployerPrivateKey);

  const ownedObjects = await client.getOwnedObjects({
    owner: deployer.toSuiAddress(),
    options: {
      showType: true,
      showContent: true,
    },
  } as any);

  const upgradeCap = ownedObjects.data.find(
    (item: any) =>
      item?.data?.type === '0x2::package::UpgradeCap' &&
      item?.data?.content?.fields?.package === config.axisPackageId,
  );

  if (!upgradeCap?.data?.objectId) {
    throw new Error(`UpgradeCap for package ${config.axisPackageId} not found in deployer wallet.`);
  }

  const build = buildMovePackageForUpgrade();

  const tx = new Transaction();
  tx.setGasBudget(150_000_000);

  const upgradeTicket = tx.moveCall({
    target: '0x2::package::authorize_upgrade',
    arguments: [
      tx.object(upgradeCap.data.objectId),
      tx.pure.u8(UpgradePolicy.COMPATIBLE),
      tx.pure.vector('u8', build.digest),
    ],
  });

  const upgradeReceipt = tx.upgrade({
    modules: build.modules,
    dependencies: build.dependencies,
    package: config.axisPackageId,
    ticket: upgradeTicket,
  });

  tx.moveCall({
    target: '0x2::package::commit_upgrade',
    arguments: [tx.object(upgradeCap.data.objectId), upgradeReceipt],
  });

  const result = unwrapTransactionResult(
    await client.signAndExecuteTransaction({
      signer: deployer,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    } as never),
  );

  const newPackageId =
    result?.objectChanges?.find((change: any) => change?.type === 'published')?.packageId ?? null;

  console.log(
    JSON.stringify(
      {
        previousPackageId: config.axisPackageId,
        newPackageId,
        upgradeCapId: upgradeCap.data.objectId,
        digest: result.digest,
        status: result?.effects?.status ?? null,
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
