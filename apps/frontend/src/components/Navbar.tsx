"use client";

import React from "react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#1e2227] bg-[#08090a]/85 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5 group cursor-pointer">
          <div className="text-[#2e7cf6] transition-transform duration-300 group-hover:rotate-12">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 20h16M4 4v16M8 16l4-6 4 4 4-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="8" cy="16" r="1.5" fill="#08090a" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="10" r="1.5" fill="#08090a" stroke="currentColor" strokeWidth="2" />
              <circle cx="16" cy="14" r="1.5" fill="#08090a" stroke="currentColor" strokeWidth="2" />
            </svg>
          </div>
          <span className="font-semibold text-base tracking-tight bg-gradient-to-r from-white to-[#a3a3a3] bg-clip-text text-transparent">
            Axis Predict
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#9ca3af]">
          <a href="#features" className="relative py-1 hover:text-white transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#2e7cf6] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
            Strategy
          </a>
          <a href="#simulator" className="relative py-1 hover:text-white transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#2e7cf6] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
            Guardrails
          </a>
          <a href="#integrations" className="relative py-1 hover:text-white transition-colors duration-200 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1px] after:bg-[#2e7cf6] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300 after:origin-left">
            Integrations
          </a>
        </nav>

        <div>
          <button className="relative h-9 items-center justify-center rounded-sm bg-[#2e7cf6] hover:bg-[#1b62d1] px-5 text-xs font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(46,124,246,0.3)] active:scale-[0.98] inline-flex overflow-hidden">
            Launch App
          </button>
        </div>
      </div>
    </header>
  );
}
