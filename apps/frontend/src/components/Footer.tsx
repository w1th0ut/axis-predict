"use client";

import React from "react";

export default function Footer() {
  return (
    <footer className="border-t border-[#1e2227] bg-[#0c0d0f] relative z-10 text-xs">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-[#9ca3af] font-medium">
          <span className="text-white font-semibold">&copy; 2026 Axis Predict.</span>
          DeFAI Range Harvester.
        </div>
        <div className="flex gap-6 text-[#9ca3af] font-medium">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Security Audit</a>
        </div>
      </div>
    </footer>
  );
}
