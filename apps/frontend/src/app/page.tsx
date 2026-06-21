"use client";

import React, { useEffect, useState } from "react";
import HeroSection from "../components/HeroSection";
import Navbar from "../components/Navbar";
import Methodology from "../components/Methodology";
import Integrations from "../components/Integrations";
import PreFooterCta from "../components/PreFooterCta";
import Footer from "../components/Footer";

export default function Home() {
  const [tvl, setTvl] = useState(12482904.50);
  const [totalHarvested, setTotalHarvested] = useState(341920.80);
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setTvl((prev) => prev + (Math.random() * 2.5));
      setTotalHarvested((prev) => prev + (Math.random() * 0.4));
    }, 3000);

    let step = 0;
    const waveInterval = setInterval(() => {
      step += 0.04;
      setWaveOffset(Math.sin(step));
    }, 80);
    return () => {
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
