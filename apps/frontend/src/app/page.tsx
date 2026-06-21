"use client";

import React, { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import Methodology from "../components/Methodology";
import Integrations from "../components/Integrations";
import PreFooterCta from "../components/PreFooterCta";
import Footer from "../components/Footer";
import {
  fetchBackendJson,
  isAbortError,
} from "../features/dashboard/backend";

interface VaultSummaryResponse {
  totalAccountedValue: string;
  cumulativeProfit: string;
}

export default function Home() {
  const [tvl, setTvl] = useState(0);
  const [totalHarvested, setTotalHarvested] = useState(0);
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    let disposed = false;

    const fetchVaultMetrics = async () => {
      const controller = new AbortController();
      try {
        const summary = await fetchBackendJson<VaultSummaryResponse>("/vault/summary", {
          signal: controller.signal,
        });

        if (!disposed) {
          setTvl(Number(summary.totalAccountedValue) / 1_000_000);
          setTotalHarvested(Number(summary.cumulativeProfit) / 1_000_000);
        }
      } catch (error) {
        if (!disposed && !isAbortError(error)) {
          console.error("Failed to fetch landing metrics:", error);
        }
      }

      return () => controller.abort();
    };

    let cancelLastFetch: (() => void) | void;
    const runFetch = async () => {
      cancelLastFetch = await fetchVaultMetrics();
    };

    runFetch();
    const metricsInterval = setInterval(runFetch, 8000);

    let step = 0;
    const waveInterval = setInterval(() => {
      step += 0.04;
      setWaveOffset(Math.sin(step));
    }, 80);

    return () => {
      disposed = true;
      cancelLastFetch?.();
      clearInterval(metricsInterval);
      clearInterval(waveInterval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--axis-background)] text-[var(--axis-text-primary)] selection:bg-[rgba(46,124,246,0.25)]">
      <Navbar />
      <HeroSection
        totalHarvested={totalHarvested}
        tvl={tvl}
        waveOffset={waveOffset}
      />
      <Methodology />
      <Integrations />
      <PreFooterCta />
      <Footer />
    </div>
  );
}
