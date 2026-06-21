"use client";

import React, { ReactNode } from "react";

interface BorderGlowCardProps {
  children: ReactNode;
  className?: string;
}

export default function BorderGlowCard({
  children,
  className = "",
}: BorderGlowCardProps) {
  return (
    <article className={`group relative overflow-hidden rounded-[1.45rem] p-px ${className}`}>
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <div className="axis-border-glow absolute inset-0 rounded-[inherit]" />
        <div className="axis-border-glow-blur absolute inset-[-10px] rounded-[inherit]" />
      </div>
      <div className="relative m-px rounded-[calc(1.45rem-1px)] border border-[rgba(255,255,255,0.04)] bg-[rgba(10,12,15,0.92)] p-8">
        {children}
      </div>
    </article>
  );
}
