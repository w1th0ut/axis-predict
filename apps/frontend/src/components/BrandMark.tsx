"use client";

import React from "react";

interface BrandMarkProps {
  compact?: boolean;
}

export default function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-[6px] border border-[var(--axis-border-strong)] bg-[var(--axis-surface)]">
        <svg
          className="h-5 w-5 text-[var(--axis-primary)]"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M4 18H20"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M5.5 18V6.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M8.5 14.5L12 10.5L15 12.5L18.5 7.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="8.5" cy="14.5" r="1.2" fill="currentColor" />
          <circle cx="12" cy="10.5" r="1.2" fill="currentColor" />
          <circle cx="15" cy="12.5" r="1.2" fill="currentColor" />
          <circle cx="18.5" cy="7.5" r="1.2" fill="currentColor" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className="text-[0.95rem] font-semibold tracking-[-0.02em] text-[var(--axis-text-primary)]">
          Axis Predict
        </span>
        {!compact ? (
          <span className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
            DeFAI Range Harvester
          </span>
        ) : null}
      </div>
    </div>
  );
}
