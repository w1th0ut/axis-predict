"use client";

import Image from "next/image";
import React from "react";
import ScrollReveal from "./ScrollReveal";

interface IntegrationItem {
  id: string;
  name: string;
  logoSrc: string;
  logoWidthClass: string;
}

const INTEGRATIONS: IntegrationItem[] = [
  {
    id: "sui",
    name: "Sui",
    logoSrc: "/sui.png",
    logoWidthClass: "w-16",
  },
  {
    id: "deepbook",
    name: "DeepBook Predict",
    logoSrc: "/deepbook.png",
    logoWidthClass: "w-40",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    logoSrc: "/openrouter.png",
    logoWidthClass: "w-14",
  },
  {
    id: "mystenlabs",
    name: "Mysten Labs",
    logoSrc: "/mystenlabs.png",
    logoWidthClass: "w-44",
  },
];

function IntegrationTile({ item }: { item: IntegrationItem }) {
  return (
    <article className="group relative overflow-hidden rounded-none border border-transparent bg-[rgba(10,12,15,0.92)]">
      <div className="absolute inset-0 translate-x-[-102%] bg-[linear-gradient(90deg,#1f65d9_0%,#2e7cf6_58%,#4b96ff_100%)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0" />
      <div className="relative flex min-h-[18rem] flex-col items-center justify-center gap-8 p-8 text-[var(--axis-text-primary)] transition-colors duration-300 group-hover:text-white">
        <div className={`relative flex min-h-14 items-center justify-center ${item.logoWidthClass}`}>
          <Image
            src={item.logoSrc}
            alt={`${item.name} logo`}
            width={220}
            height={96}
            className="h-auto w-full object-contain transition-[transform,filter,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        </div>
        <div className="text-center text-[1.1rem] text-[var(--axis-text-muted)] transition-colors duration-300 group-hover:text-white">
          {item.name}
        </div>
      </div>
    </article>
  );
}

export default function Integrations() {
  return (
    <section
      id="integrations"
      className="border-t border-[rgba(255,255,255,0.06)] bg-[var(--axis-background)]"
    >
      <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-6 lg:px-10 lg:py-24">
        <ScrollReveal className="mx-auto max-w-[24rem] text-center" variant="scale">
          <span className="font-mono text-[0.72rem] uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
            Integrations
          </span>
        </ScrollReveal>

        <div className="mt-12 grid overflow-hidden border border-[rgba(255,255,255,0.06)] md:grid-cols-2">
          {INTEGRATIONS.map((item, index) => (
            <ScrollReveal
              key={item.id}
              delay={index * 70}
              duration={720}
              variant={
                index % 3 === 0 ? "left" : index % 3 === 2 ? "right" : "rise"
              }
            >
              <IntegrationTile item={item} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
