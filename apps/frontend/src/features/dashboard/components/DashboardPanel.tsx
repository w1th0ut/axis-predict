"use client";

import React from "react";

interface DashboardPanelProps {
  children: React.ReactNode;
  className?: string;
}

export default function DashboardPanel({
  children,
  className,
}: DashboardPanelProps) {
  return (
    <section
      className={`relative overflow-hidden rounded-[1.35rem] border border-[rgba(255,255,255,0.07)] bg-[linear-gradient(180deg,rgba(18,20,23,0.92),rgba(12,14,17,0.96))] ${className ?? ""}`.trim()}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(46,124,246,0.08),transparent_28%)]" />
      <div className="relative h-full">{children}</div>
    </section>
  );
}
