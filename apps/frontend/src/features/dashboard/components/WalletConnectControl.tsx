"use client";

import Image from "next/image";
import React, { useState } from "react";
import {
  useCurrentAccount,
  useDAppKit,
  useWalletConnection,
  useWallets,
} from "@mysten/dapp-kit-react";

function formatAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function WalletConnectControl() {
  const account = useCurrentAccount();
  const connection = useWalletConnection();
  const wallets = useWallets();
  const dAppKit = useDAppKit();
  const [open, setOpen] = useState(false);
  const [pendingWalletName, setPendingWalletName] = useState<string | null>(null);

  const buttonLabel = account ? formatAddress(account.address) : "Connect Wallet";

  const handleConnect = async (walletIndex: number) => {
    const wallet = wallets[walletIndex];

    if (!wallet) {
      return;
    }

    try {
      setPendingWalletName(wallet.name);
      await dAppKit.connectWallet({ wallet });
      setOpen(false);
    } catch (error) {
      console.error("Wallet connection failed", error);
    } finally {
      setPendingWalletName(null);
    }
  };

  const handleDisconnect = async () => {
    try {
      await dAppKit.disconnectWallet();
      setOpen(false);
    } catch (error) {
      console.error("Wallet disconnect failed", error);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-[transform,background-color,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          account
            ? "border border-[rgba(46,124,246,0.26)] bg-[rgba(46,124,246,0.12)] text-[var(--axis-text-primary)] hover:-translate-y-0.5 hover:border-[rgba(92,162,255,0.45)] hover:bg-[rgba(46,124,246,0.18)]"
            : "bg-[var(--axis-text-primary)] text-[var(--axis-background)] hover:-translate-y-0.5 hover:bg-[var(--axis-primary)] hover:text-white hover:shadow-[0_16px_28px_rgba(46,124,246,0.22)]"
        }`}
      >
        {buttonLabel}
      </button>

      {open ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(2,4,8,0.72)] backdrop-blur-sm"
            aria-label="Close wallet modal"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-full max-w-[28rem] overflow-hidden rounded-[1.6rem] border border-[rgba(255,255,255,0.08)] bg-[linear-gradient(180deg,rgba(14,18,24,0.96),rgba(8,10,14,0.98))] shadow-[0_32px_70px_rgba(0,0,0,0.38)]">
            <div className="flex items-start justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] px-6 py-5">
              <div>
                <div className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
                  Sui Wallet
                </div>
                <div className="mt-3 text-[1.15rem] font-medium text-[var(--axis-text-primary)]">
                  {account ? "Wallet Connected" : "Connect a wallet"}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-[rgba(255,255,255,0.08)] text-[var(--axis-text-secondary)]"
                aria-label="Close"
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M6 6L18 18M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6">
              {account && connection.wallet ? (
                <div className="rounded-[1.2rem] border border-[rgba(46,124,246,0.18)] bg-[rgba(46,124,246,0.08)] p-4">
                  <div className="flex items-center gap-3">
                    <WalletIcon src={connection.wallet.icon} alt={connection.wallet.name} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-[var(--axis-text-primary)]">
                        {connection.wallet.name}
                      </div>
                      <div className="mt-1 overflow-hidden text-ellipsis whitespace-nowrap font-mono text-[0.82rem] text-[var(--axis-text-muted)]">
                        {account.address}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDisconnect}
                    className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] px-4 text-sm font-medium text-[var(--axis-text-primary)] transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.06)]"
                  >
                    Disconnect
                  </button>
                </div>
              ) : wallets.length > 0 ? (
                <div className="grid gap-3">
                  {wallets.map((wallet, index) => {
                    const isPending = pendingWalletName === wallet.name;

                    return (
                      <button
                        key={wallet.name}
                        type="button"
                        onClick={() => void handleConnect(index)}
                        disabled={Boolean(pendingWalletName)}
                        className="flex items-center gap-3 rounded-[1.1rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] px-4 py-3.5 text-left transition-[transform,background-color,border-color] duration-200 hover:-translate-y-0.5 hover:border-[rgba(46,124,246,0.24)] hover:bg-[rgba(46,124,246,0.06)] disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        <WalletIcon src={wallet.icon} alt={wallet.name} />
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-medium text-[var(--axis-text-primary)]">
                            {wallet.name}
                          </div>
                          <div className="mt-1 text-xs text-[var(--axis-text-muted)]">
                            {isPending
                              ? "Connecting..."
                              : wallet.accounts.length > 0
                                ? `${wallet.accounts.length} authorized account${wallet.accounts.length > 1 ? "s" : ""}`
                                : "Detected via Wallet Standard"}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[1.2rem] border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-4 text-sm leading-7 text-[var(--axis-text-secondary)]">
                  No compatible Sui wallet detected. Install a Wallet Standard compatible wallet like Slush, Phantom, Backpack, or another Sui wallet extension, then reload this page.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function WalletIcon({ src, alt }: { src?: string; alt: string }) {
  return src ? (
    <Image
      src={src}
      alt={alt}
      width={36}
      height={36}
      className="h-9 w-9 rounded-full object-cover"
      unoptimized
    />
  ) : (
    <div className="h-9 w-9 rounded-full bg-[rgba(255,255,255,0.06)]" />
  );
}
