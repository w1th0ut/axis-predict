import { decodeSuiPrivateKey, type Signer } from '@mysten/sui/cryptography';
import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { Secp256k1Keypair } from '@mysten/sui/keypairs/secp256k1';
import { Secp256r1Keypair } from '@mysten/sui/keypairs/secp256r1';

import type { AppConfig } from './config.js';

export type SupportedSigner = Signer;

export function createSuiClient(config: Pick<AppConfig, 'rpcUrl' | 'network'>) {
  return new SuiJsonRpcClient({ url: config.rpcUrl, network: config.network });
}

export function loadSigner(privateKey: string): SupportedSigner {
  if (privateKey.startsWith('suiprivkey')) {
    const decoded = decodeSuiPrivateKey(privateKey);
    if (decoded.scheme === 'ED25519') {
      return Ed25519Keypair.fromSecretKey(decoded.secretKey);
    }
    if (decoded.scheme === 'Secp256k1') {
      return Secp256k1Keypair.fromSecretKey(decoded.secretKey);
    }
    if (decoded.scheme === 'Secp256r1') {
      return Secp256r1Keypair.fromSecretKey(decoded.secretKey);
    }
    throw new Error(`Unsupported key scheme: ${decoded.scheme}`);
  }

  const normalized = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  return Ed25519Keypair.fromSecretKey(hexToBytes(normalized));
}

function hexToBytes(value: string) {
  const normalized = value.startsWith('0x') ? value.slice(2) : value;
  if (normalized.length % 2 !== 0) {
    throw new Error('Hex private key must have even length.');
  }

  const output = new Uint8Array(normalized.length / 2);
  for (let index = 0; index < normalized.length; index += 2) {
    output[index / 2] = Number.parseInt(normalized.slice(index, index + 2), 16);
  }
  return output;
}

export async function getMoveObjectFields(client: SuiJsonRpcClient, objectId: string) {
  const response = (await client.getObject({
    id: objectId,
    options: { showContent: true, showType: true, showOwner: true },
  } as never)) as any;

  const fields =
    response?.data?.content?.fields ??
    response?.data?.content ??
    response?.content?.fields ??
    response?.content ??
    response?.data?.json ??
    response?.object?.json;

  if (!fields || typeof fields !== 'object') {
    throw new Error(`Object ${objectId} did not return readable Move fields.`);
  }

  return fields as Record<string, unknown>;
}

export function unwrapTransactionResult(result: any) {
  return result?.Transaction ?? result?.FailedTransaction ?? result;
}

export function findObjectChangeId(result: any, typeNeedle: string, changeKind: string = 'created') {
  const tx = unwrapTransactionResult(result);
  const changes = tx?.objectChanges;
  if (!Array.isArray(changes)) return undefined;
  const match = changes.find(
    (change: any) =>
      change?.type === changeKind &&
      typeof change?.objectType === 'string' &&
      change.objectType.includes(typeNeedle),
  );
  return match?.objectId as string | undefined;
}

export function readNestedBigInt(value: unknown): bigint {
  if (typeof value === 'bigint') return value;
  if (typeof value === 'number') return BigInt(value);
  if (typeof value === 'string') return BigInt(value);
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if ('value' in record) return readNestedBigInt(record.value);
    if ('fields' in record) return readNestedBigInt(record.fields);
    if ('balance' in record) return readNestedBigInt(record.balance);
  }
  throw new Error(`Cannot parse bigint from value: ${JSON.stringify(value)}`);
}

export function readNestedId(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if ('id' in record) return readNestedId(record.id);
    if ('bytes' in record && typeof record.bytes === 'string') return record.bytes;
  }
  throw new Error(`Cannot parse object id from value: ${JSON.stringify(value)}`);
}

export function decodeU64(bytes: Uint8Array): bigint {
  let value = 0n;
  for (let index = 0; index < bytes.length; index += 1) {
    value += BigInt(bytes[index] ?? 0) << (BigInt(index) * 8n);
  }
  return value;
}

export function extractReturnBytes(devInspectResult: any) {
  const commands = devInspectResult?.results ?? devInspectResult?.commandResults;
  if (!Array.isArray(commands) || commands.length === 0) {
    throw new Error('Dev inspect did not return any command results.');
  }

  const last = commands[commands.length - 1];
  const returnValues = last?.returnValues;
  if (!Array.isArray(returnValues)) {
    throw new Error('Dev inspect command result did not include return values.');
  }

  return returnValues.map((value: any) => {
    if (value?.bcs instanceof Uint8Array) return value.bcs;
    if (Array.isArray(value?.bcs)) return Uint8Array.from(value.bcs);
    if (Array.isArray(value) && Array.isArray(value[0])) return Uint8Array.from(value[0]);
    if (Array.isArray(value)) return Uint8Array.from(value);
    throw new Error(`Unsupported return value shape: ${JSON.stringify(value)}`);
  });
}
