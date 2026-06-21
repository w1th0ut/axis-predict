"use client";

import React from "react";

const NODES = [
  { left: "9%", top: "16%", size: 120, delay: "0s" },
  { left: "28%", top: "18%", size: 88, delay: "0.8s" },
  { left: "18%", top: "38%", size: 156, delay: "1.4s" },
  { left: "39%", top: "44%", size: 104, delay: "0.4s" },
  { left: "14%", top: "67%", size: 126, delay: "1.1s" },
  { left: "35%", top: "74%", size: 92, delay: "1.8s" },
  { left: "46%", top: "24%", size: 76, delay: "0.6s" },
];

export default function FerrofluidField() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(46,124,246,0.12),transparent_18%),radial-gradient(circle_at_26%_54%,rgba(46,124,246,0.1),transparent_22%),linear-gradient(180deg,rgba(10,12,15,0.16),rgba(10,12,15,0.78))]" />
      <div className="absolute inset-0 opacity-95 [filter:contrast(150)_blur(16px)]">
        {NODES.map((node, index) => (
          <span
            key={`${node.left}-${node.top}-${index}`}
            className="axis-ferrofluid-node absolute rounded-full bg-[rgba(52,118,230,0.86)]"
            style={{
              left: node.left,
              top: node.top,
              width: `${node.size}px`,
              height: `${node.size}px`,
              animationDelay: node.delay,
            }}
          />
        ))}
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(126,182,255,0.24),transparent_10%),radial-gradient(circle_at_34%_38%,rgba(126,182,255,0.18),transparent_10%),radial-gradient(circle_at_30%_68%,rgba(126,182,255,0.15),transparent_11%)] opacity-70 mix-blend-screen" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,12,15,0.16),rgba(10,12,15,0.58)_72%,rgba(10,12,15,0.9))]" />
    </div>
  );
}
