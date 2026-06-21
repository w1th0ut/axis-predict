"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { DashboardNavItem, DashboardView } from "../types";

const NAV_ICONS: Record<DashboardView, string> = {
  overview: "/overview.png",
  vault: "/vault.png",
  activity: "/activity.png",
};

interface DashboardSideNavProps {
  navItems: DashboardNavItem[];
  activeView: DashboardView;
  onSelect: (view: DashboardView) => void;
  mobileOpen: boolean;
  onClose: () => void;
}

export default function DashboardSideNav({
  navItems,
  activeView,
  onSelect,
  mobileOpen,
  onClose,
}: DashboardSideNavProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-[rgba(0,0,0,0.55)] backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[16rem] flex-col border-r border-[rgba(255,255,255,0.06)] bg-[rgba(9,10,12,0.96)] px-5 py-5 backdrop-blur-xl transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between md:block">
          <Link
            href="/"
            className="inline-flex"
            onClick={onClose}
            aria-label="Go to landing page"
          >
            <Image
              src="/full-logo.png"
              alt="Axis Predict"
              width={150}
              height={36}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-[10px] border border-[rgba(255,255,255,0.08)] text-[var(--axis-text-secondary)] md:hidden"
            aria-label="Close menu"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="mt-10 text-[0.7rem] font-mono uppercase tracking-[0.18em] text-[var(--axis-text-muted)]">
          Vault App
        </div>

        <nav className="mt-4 grid gap-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item.id);
                onClose();
              }}
              className={`group flex items-center gap-3 rounded-[1rem] px-3.5 py-3 text-sm transition-all duration-200 ${
                activeView === item.id
                  ? "bg-[rgba(46,124,246,0.14)] text-[var(--axis-text-primary)] shadow-[inset_0_0_0_1px_rgba(46,124,246,0.22)]"
                  : "text-[var(--axis-text-secondary)] hover:bg-[rgba(255,255,255,0.03)] hover:text-[var(--axis-text-primary)]"
              }`}
            >
              <Image
                src={NAV_ICONS[item.id]}
                alt=""
                width={18}
                height={18}
                className={`h-[1.05rem] w-[1.05rem] object-contain transition-[opacity,filter] duration-200 [filter:brightness(0)_invert(1)] ${
                  activeView === item.id ? "opacity-100" : "opacity-68 group-hover:opacity-90"
                }`}
                aria-hidden="true"
                unoptimized
              />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto flex items-center justify-between gap-3 px-2">
          <SocialLink href="https://github.com/w1th0ut/axis-predict" src="/github.png" alt="GitHub" />
          <SocialLink href="https://x.com" src="/x.png" alt="X" />
          <SocialLink href="https://discord.com" src="/discord.png" alt="Discord" />
        </div>
      </aside>
    </>
  );
}

function SocialLink({
  href,
  src,
  alt,
}: {
  href: string;
  src: string;
  alt: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-11 w-11 items-center justify-center opacity-80 transition-[transform,opacity] duration-200 hover:-translate-y-0.5 hover:opacity-100"
      aria-label={alt}
    >
      <Image
        src={src}
        alt={alt}
        width={30}
        height={30}
        className="block h-7 w-7 object-contain"
        unoptimized
      />
    </a>
  );
}
