"use client";

import React from "react";

interface HeroVisualProps {
  waveOffset: number;
}

const CANOPY_PARTICLES = [
  { left: "58%", top: "12%", size: 10, opacity: 0.22 },
  { left: "62%", top: "10%", size: 12, opacity: 0.24 },
  { left: "68%", top: "14%", size: 8, opacity: 0.18 },
  { left: "74%", top: "16%", size: 10, opacity: 0.2 },
  { left: "81%", top: "18%", size: 8, opacity: 0.16 },
  { left: "64%", top: "26%", size: 9, opacity: 0.18 },
  { left: "71%", top: "28%", size: 11, opacity: 0.18 },
  { left: "79%", top: "31%", size: 9, opacity: 0.14 },
];

const GROUND_PARTICLES = [
  { left: "22%", top: "77%", size: 7, opacity: 0.1 },
  { left: "30%", top: "75%", size: 6, opacity: 0.12 },
  { left: "59%", top: "79%", size: 8, opacity: 0.12 },
  { left: "67%", top: "76%", size: 7, opacity: 0.1 },
  { left: "75%", top: "80%", size: 7, opacity: 0.08 },
];

export default function HeroVisual({ waveOffset }: HeroVisualProps) {
  const videoTranslate = 8 + waveOffset * 0.9;

  return (
    <div className="axis-intro axis-intro--visual pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[var(--axis-background)]" />

      <video
        className="absolute inset-y-0 right-0 h-full w-full scale-[1.06] object-cover opacity-70 md:w-[108%] lg:w-[114%]"
        style={{
          objectPosition: "76% center",
          transform: `translate3d(${videoTranslate}%, 0, 0) scale(1.06)`,
        }}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/hero-video.mp4" type="video/mp4" />
      </video>

      <div className="axis-grid absolute inset-0 opacity-45" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,9,10,0.98)_0%,rgba(8,9,10,0.92)_28%,rgba(8,9,10,0.52)_54%,rgba(8,9,10,0.14)_74%,rgba(8,9,10,0.28)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_26%,rgba(46,124,246,0.14),transparent_16%),radial-gradient(circle_at_78%_70%,rgba(46,124,246,0.12),transparent_24%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[26%] bg-[linear-gradient(180deg,rgba(8,9,10,0)_0%,rgba(18,20,23,0.28)_35%,rgba(46,124,246,0.12)_100%)]" />

      {CANOPY_PARTICLES.map((particle, index) => (
        <span
          key={`${particle.left}-${particle.top}-${index}`}
          className="axis-float absolute rounded-full bg-[var(--axis-primary)]"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            boxShadow: "0 0 28px rgba(46, 124, 246, 0.28)",
            animationDelay: `${index * 120}ms`,
          }}
        />
      ))}

      {GROUND_PARTICLES.map((particle, index) => (
        <span
          key={`${particle.left}-${particle.top}-${index}`}
          className="absolute rounded-full bg-[rgba(255,255,255,0.82)]"
          style={{
            left: particle.left,
            top: particle.top,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            boxShadow: "0 0 22px rgba(46, 124, 246, 0.18)",
          }}
        />
      ))}
    </div>
  );
}
