"use client";

import React from "react";
import { TopbarData } from "../types";

interface DashboardTopbarProps {
  data: TopbarData;
  onOpenNav: () => void;
}

export default function DashboardTopbar({
  data,
  onOpenNav,
}: DashboardTopbarProps) {
  return (
    <header className="flex items-start justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenNav}
          className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[var(--axis-text-primary)] md:hidden"
          aria-label="Open navigation"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M4 7H20M4 12H20M4 17H20"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <div>
          <h1 className="font-display text-[2.1rem] leading-none tracking-[-0.05em] text-[var(--axis-text-primary)]">
            {data.title}
          </h1>
          <div className="mt-2 max-w-[40rem] text-sm leading-7 text-[var(--axis-text-muted)]">
            {data.description}
          </div>
        </div>
      </div>

      <button
        type="button"
        className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-medium transition-[transform,background-color,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          data.wallet.connected
            ? "border border-[rgba(46,124,246,0.26)] bg-[rgba(46,124,246,0.12)] text-[var(--axis-text-primary)]"
            : "bg-[var(--axis-text-primary)] text-[var(--axis-background)] hover:-translate-y-0.5 hover:bg-[var(--axis-primary)] hover:text-white hover:shadow-[0_16px_28px_rgba(46,124,246,0.22)]"
        }`}
      >
        {data.wallet.label}
      </button>
    </header>
  );
}
