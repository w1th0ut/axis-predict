"use client";

import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import HeroCopy from "../components/HeroCopy";
import SviVisualizer from "../components/SviVisualizer";
import Metrics from "../components/Metrics";
import Methodology from "../components/Methodology";
import SecurityConsole from "../components/SecurityConsole";
import Integrations from "../components/Integrations";
import Footer from "../components/Footer";

export default function Home() {
  // Global simulated metrics state
  const [tvl, setTvl] = useState(12482904.50);
  const [totalHarvested, setTotalHarvested] = useState(341920.80);
  const [currentSuiPrice, setCurrentSuiPrice] = useState(1.8425);
  const [systemCycle, setSystemCycle] = useState(1);
  const [marketRegime, setMarketRegime] = useState<"low" | "high" | "outlier">("low");
  
  // Guardrail Simulation State
  const [simulationActive, setSimulationActive] = useState(false);
  const [simulationError, setSimulationError] = useState(false);

  // Smooth wave animation factor
  const [waveOffset, setWaveOffset] = useState(0);

  useEffect(() => {
    // Increment TVL and Harvested values slowly to show "live harvesting"
    const metricsInterval = setInterval(() => {
      setTvl((prev) => prev + (Math.random() * 2.5));
      setTotalHarvested((prev) => prev + (Math.random() * 0.4));
      setCurrentSuiPrice((prev) => {
        const delta = (Math.random() - 0.5) * 0.002;
        return parseFloat((prev + delta).toFixed(4));
      });
    }, 3000);

    // Continuous wave animation loop
    let step = 0;
    const waveInterval = setInterval(() => {
      step += 0.04;
      setWaveOffset(Math.sin(step));
    }, 80);

    // Cycle tick every 15 seconds
    const cycleInterval = setInterval(() => {
      setSystemCycle((prev) => (prev % 10) + 1);
    }, 15000);

    return () => {
      clearInterval(metricsInterval);
      clearInterval(waveInterval);
      clearInterval(cycleInterval);
    };
  }, []);

  // Handler to coordinate selected market regime and safety console simulation
  const handleRegimeChange = (regime: "low" | "high" | "outlier") => {
    setMarketRegime(regime);
    if (regime === "outlier") {
      setSimulationActive(true);
      setSimulationError(false);
      const timer = setTimeout(() => {
        setSimulationError(true);
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      setSimulationActive(false);
      setSimulationError(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090a] text-[#f3f4f6] font-sans selection:bg-[#2e7cf6]/30 selection:text-[#f3f4f6]">
      {/* BACKGROUND GRID MATRIX */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#111317_1px,transparent_1px),linear-gradient(to_bottom,#111317_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

      {/* MODULAR COMPONENTS */}
      <Navbar />

      {/* HERO SECTION CONTAINER */}
      <section className="mx-auto max-w-7xl px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        <div className="lg:col-span-7">
          <HeroCopy />
        </div>
        <div className="lg:col-span-5 w-full flex justify-center">
          <SviVisualizer 
            marketRegime={marketRegime}
            onRegimeChange={handleRegimeChange}
            waveOffset={waveOffset}
            currentSuiPrice={currentSuiPrice}
            systemCycle={systemCycle}
          />
        </div>
      </section>

      <Metrics tvl={tvl} totalHarvested={totalHarvested} />

      <Methodology />

      <SecurityConsole 
        marketRegime={marketRegime}
        onRegimeChange={handleRegimeChange}
        simulationActive={simulationActive}
        simulationError={simulationError}
        tvl={tvl}
      />

      <Integrations />

      <Footer />
    </div>
  );
}
