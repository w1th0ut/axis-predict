"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = [
    { href: "#strategy", label: "Strategy" },
    { href: "#integrations", label: "Integrations" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 28);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div
        className={`axis-nav-enter mx-auto flex items-center justify-between gap-4 transition-all duration-300 ease-out ${
          isScrolled ? "max-w-[73rem]" : "max-w-[90rem]"
        }`}
      >
        <div
          className={`flex w-full items-center justify-between gap-4 rounded-[1.35rem] border px-5 py-4 transition-[max-width,background-color,backdrop-filter,box-shadow,padding] duration-300 ease-out sm:px-6 lg:px-8 ${
            isScrolled
              ? "border border-[rgba(30,34,39,0.92)] bg-[rgba(12,14,17,0.92)] shadow-[0_14px_40px_rgba(0,0,0,0.28)] backdrop-blur-xl"
              : "border-transparent bg-[rgba(12,14,17,0.22)] shadow-none backdrop-blur-md"
          }`}
        >
        <a href="#" className="shrink-0 flex items-center">
          <Image
            src="/full-logo.png"
            alt="Axis Predict Logo"
            width={140}
            height={33}
            className="h-8 w-auto object-contain"
            priority
          />
        </a>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm text-[var(--axis-text-secondary)] transition-colors duration-150 hover:text-[var(--axis-text-primary)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center lg:flex">
          <a
            href="#launch"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--axis-text-primary)] px-5 text-sm font-medium text-[var(--axis-background)] transition-[transform,background-color,box-shadow] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_28px_rgba(255,255,255,0.12)]"
          >
            Launch App
          </a>
        </div>

        <button
          type="button"
          onClick={() => setIsMenuOpen((value) => !value)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-[6px] border border-[var(--axis-border)] bg-[rgba(18,20,23,0.72)] text-[var(--axis-text-primary)] lg:hidden"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {isMenuOpen ? (
              <path
                d="M6 6L18 18M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            ) : (
              <path
                d="M4 7H20M4 12H20M4 17H20"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            )}
          </svg>
        </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="mx-auto mt-2 max-w-[90rem] lg:hidden">
          <div className="grid gap-2 rounded-[1.35rem] border border-[rgba(255,255,255,0.08)] bg-[rgba(12,14,17,0.96)] px-5 py-4 backdrop-blur-xl sm:px-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="rounded-[6px] border border-transparent px-3 py-3 text-sm text-[var(--axis-text-secondary)] transition-colors duration-150 hover:border-[var(--axis-border)] hover:bg-[var(--axis-surface)] hover:text-[var(--axis-text-primary)]"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 grid gap-2">
              <a
                href="#launch"
                className="inline-flex min-h-11 items-center justify-center rounded-[999px] bg-[var(--axis-text-primary)] px-4 text-sm font-semibold text-[var(--axis-background)]"
                onClick={() => setIsMenuOpen(false)}
              >
                Launch App
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
