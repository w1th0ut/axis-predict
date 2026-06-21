"use client";

import React, { useState, useEffect } from "react";
import {
  useCurrentAccount,
  useCurrentClient,
  useDAppKit,
  CurrentAccountSigner,
} from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";
import {
  fetchBackendJson,
  getBackendUrl,
  isAbortError,
  isAxisShareCoinType,
} from "../backend";
import DashboardPanel from "./DashboardPanel";
import { VaultActionPanelData } from "../types";

export default function VaultActionPanel({
  data,
}: {
  data: VaultActionPanelData;
}) {
  const dAppKit = useDAppKit();
  const account = useCurrentAccount();
  const client = useCurrentClient();

  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">(
    data.activeTab,
  );
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const backendUrl = getBackendUrl();

  // Live on-chain balances
  const [dusdcBalance, setDusdcBalance] = useState<string>("0.00");
  const [pusdcBalance, setPusdcBalance] = useState<string>("0.00");
  const [pusdcRawBalance, setPusdcRawBalance] = useState<number>(0);
  const [sharePrice, setSharePrice] = useState<string>("1.000");
  const [shareCoinType, setShareCoinType] = useState<string | null>(null);

  // Fetch configs and vault exchange rate
  useEffect(() => {
    const fetchVaultData = async () => {
      const controller = new AbortController();
      try {
        const summary = await fetchBackendJson<any>("/vault/summary", {
          signal: controller.signal,
        });
        const accounted = Number(summary.totalAccountedValue);
        const shares = Number(summary.totalShares);
        const price = shares > 0 ? (accounted / shares).toFixed(3) : "1.000";
        setSharePrice(price);
      } catch (err) {
        if (isAbortError(err)) {
          return;
        }
        console.error("Failed to fetch vault state:", err);
      }

      return () => controller.abort();
    };

    let cancelLastFetch: (() => void) | void;
    const runFetch = async () => {
      cancelLastFetch = await fetchVaultData();
    };

    runFetch();
    const interval = setInterval(runFetch, 8000);
    return () => {
      cancelLastFetch?.();
      clearInterval(interval);
    };
  }, [backendUrl]);

  // Fetch user balances
  useEffect(() => {
    if (!account || !client) {
      setDusdcBalance("0.00");
      setPusdcBalance("0.00");
      setPusdcRawBalance(0);
      setShareCoinType(null);
      return;
    }

    const fetchUserBalances = async () => {
      const controller = new AbortController();
      try {
        const config = await fetchBackendJson<any>("/config/public", {
          signal: controller.signal,
        });

        // 1. Get user dUSDC balance
        const dusdcRes: any = await client.getBalance({
          owner: account.address,
          coinType: config.quoteAssetType,
        } as any);
        const totalDusdc = dusdcRes?.totalBalance && !isNaN(Number(dusdcRes.totalBalance))
          ? Number(dusdcRes.totalBalance)
          : 0;
        setDusdcBalance((totalDusdc / 1_000_000).toFixed(2));

        // 2. Get user pUSDC balance
        const allBalances: any[] = await client.getAllBalances({
          owner: account.address,
        } as any);
        const detectedShareBalance = allBalances.find((balance) =>
          isAxisShareCoinType(String(balance.coinType ?? "")),
        );
        setShareCoinType(detectedShareBalance?.coinType ?? null);
        const totalPusdc = allBalances
          .filter((balance) => isAxisShareCoinType(String(balance.coinType ?? "")))
          .reduce((sum, balance) => {
            const next = Number(balance.totalBalance);
            return sum + (isNaN(next) ? 0 : next);
          }, 0);
        setPusdcRawBalance(totalPusdc);
        setPusdcBalance((totalPusdc / 1_000_000_000).toFixed(2));
      } catch (err) {
        if (isAbortError(err)) {
          return;
        }
        console.error("Failed to fetch user balances:", err);
      }

      return () => controller.abort();
    };

    let cancelLastFetch: (() => void) | void;
    const runFetch = async () => {
      cancelLastFetch = await fetchUserBalances();
    };

    runFetch();
    const interval = setInterval(runFetch, 6000);
    return () => {
      cancelLastFetch?.();
      clearInterval(interval);
    };
  }, [account, client, backendUrl]);

  const handleAction = async () => {
    if (!account || !client) {
      setErrorMsg("Please connect your wallet first.");
      return;
    }

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setErrorMsg("Please enter a valid positive amount.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const config = await fetchBackendJson<any>("/config/public");

      const rawAmount = BigInt(
        Math.floor(val * (activeTab === "deposit" ? 1_000_000 : 1_000_000_000)),
      );
      const tx = new Transaction();
      tx.setGasBudget(50_000_000);

      if (activeTab === "deposit") {
        // Fetch user DUSDC coins
        const coinsRes = await (client as any).getCoins({
          owner: account.address,
          coinType: config.quoteAssetType,
        });

        if (coinsRes.data.length === 0) {
          throw new Error("No dUSDC coins found in your wallet.");
        }

        const totalUserBalance = coinsRes.data.reduce(
          (sum: bigint, c: any) => sum + BigInt(c.balance),
          BigInt(0),
        );
        if (totalUserBalance < rawAmount) {
          throw new Error("Insufficient dUSDC balance in wallet.");
        }

        const primaryCoin = coinsRes.data[0].coinObjectId;
        if (BigInt(coinsRes.data[0].balance) < rawAmount) {
          const toMerge = coinsRes.data.slice(1).map((c: any) => c.coinObjectId);
          if (toMerge.length > 0) {
            tx.mergeCoins(
              tx.object(primaryCoin),
              toMerge.map((id: any) => tx.object(id)),
            );
          }
        }

        const coinToDeposit = tx.splitCoins(tx.object(primaryCoin), [
          tx.pure.u64(rawAmount),
        ]);

        const sharesCoin = tx.moveCall({
          target: `${config.axisPackageId}::axis_vault::deposit`,
          typeArguments: [config.quoteAssetType],
          arguments: [tx.object(config.axisVaultId), coinToDeposit],
        });

        tx.transferObjects([sharesCoin], tx.pure.address(account.address));
      } else {
        // Withdraw PUSDC shares -> DUSDC
        const pusdcType = shareCoinType ?? `${config.axisPackageId}::pusdc::PUSDC`;
        const coinsRes = await (client as any).getCoins({
          owner: account.address,
          coinType: pusdcType,
        });

        if (coinsRes.data.length === 0) {
          throw new Error("No pUSDC share coins found in your wallet.");
        }

        const totalUserBalance = coinsRes.data.reduce(
          (sum: bigint, c: any) => sum + BigInt(c.balance),
          BigInt(0),
        );
        if (totalUserBalance < rawAmount) {
          throw new Error("Insufficient pUSDC balance in wallet.");
        }

        const primaryCoin = coinsRes.data[0].coinObjectId;
        if (BigInt(coinsRes.data[0].balance) < rawAmount) {
          const toMerge = coinsRes.data.slice(1).map((c: any) => c.coinObjectId);
          if (toMerge.length > 0) {
            tx.mergeCoins(
              tx.object(primaryCoin),
              toMerge.map((id: any) => tx.object(id)),
            );
          }
        }

        const sharesToBurn = tx.splitCoins(tx.object(primaryCoin), [
          tx.pure.u64(rawAmount),
        ]);

        const returnedCoin = tx.moveCall({
          target: `${config.axisPackageId}::axis_vault::withdraw`,
          typeArguments: [config.quoteAssetType],
          arguments: [tx.object(config.axisVaultId), sharesToBurn],
        });

        tx.transferObjects([returnedCoin], tx.pure.address(account.address));
      }

      console.log("Submitting transaction to wallet...");
      const signer = new CurrentAccountSigner(dAppKit as any);
      const result = await signer.signAndExecuteTransaction({
        transaction: tx,
      });

      console.log("Transaction execution result:", result);
      setSuccessMsg(
        activeTab === "deposit"
          ? `Successfully deposited ${val.toFixed(2)} dUSDC!`
          : `Successfully withdrew ${val.toFixed(2)} pUSDC!`,
      );
      setAmount("");
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  const currentAvailable = activeTab === "deposit" ? dusdcBalance : pusdcBalance;
  const currentAssetLabel = activeTab === "deposit" ? "dUSDC" : "pUSDC";
  const outputAssetLabel = activeTab === "deposit" ? "pUSDC" : "dUSDC";
  const estimatedOutput =
    activeTab === "deposit"
      ? (
          ((parseFloat(amount || "0") * 1_000_000) / parseFloat(sharePrice)) /
          1_000_000_000
        ).toFixed(4)
      : (
          ((parseFloat(amount || "0") * 1_000_000_000 * parseFloat(sharePrice)) /
            1_000_000) 
        ).toFixed(2);

  return (
    <DashboardPanel className="h-full min-h-[18rem] p-7 sm:p-8">
      <div className="flex h-full flex-col gap-6">
        <div className="flex gap-2 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-1">
          {(["deposit", "withdraw"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setAmount("");
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                activeTab === tab
                  ? "bg-[var(--axis-text-primary)] text-[var(--axis-background)]"
                  : "text-[var(--axis-text-secondary)] hover:text-[var(--axis-text-primary)]"
              }`}
            >
              {tab === "deposit" ? "Deposit" : "Withdraw"}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 text-sm text-[var(--axis-text-muted)]">
            <span>
              Available: {currentAvailable} {currentAssetLabel}
            </span>
            <button
              type="button"
              onClick={() => setAmount(currentAvailable)}
              className="text-[var(--axis-primary)] transition-colors hover:text-[#5b9cff]"
            >
              Max
            </button>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-[var(--axis-text-secondary)]">
              Amount
            </span>
            <div className="rounded-[1.05rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 py-4">
              <input
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                disabled={loading}
                className="w-full bg-transparent text-[1.4rem] font-medium text-[var(--axis-text-primary)] outline-none placeholder:text-[var(--axis-text-muted)]"
                placeholder={
                  activeTab === "deposit"
                    ? "Enter dUSDC amount"
                    : "Enter pUSDC amount"
                }
              />
            </div>
          </label>
        </div>

        <div className="rounded-[1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4">
          <div className="flex items-center justify-between gap-4 text-sm text-[var(--axis-text-secondary)]">
            <span>Estimated {outputAssetLabel} received</span>
            <span className="font-medium text-[var(--axis-text-primary)]">
              {isNaN(parseFloat(estimatedOutput)) ? "0.00" : estimatedOutput} {outputAssetLabel}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-sm text-[var(--axis-text-muted)]">
            <span>Share price</span>
            <span>{sharePrice} dUSDC</span>
          </div>
        </div>

        {errorMsg ? (
          <div className="rounded-[0.8rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-400">
            {errorMsg}
          </div>
        ) : null}

        {successMsg ? (
          <div className="rounded-[0.8rem] border border-green-500/20 bg-green-500/10 px-4 py-3 text-xs text-green-400">
            {successMsg}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleAction}
          disabled={loading}
          className="mt-auto inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--axis-primary)] px-5 text-sm font-medium text-white transition-[transform,box-shadow,background-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-[#4c93ff] hover:shadow-[0_18px_32px_rgba(46,124,246,0.28)] disabled:pointer-events-none disabled:opacity-50"
        >
          {loading
            ? "Processing..."
            : activeTab === "deposit"
              ? "Confirm Deposit"
              : "Withdraw"}
        </button>
      </div>
    </DashboardPanel>
  );
}
