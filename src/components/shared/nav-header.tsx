"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function NavHeader() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-card-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">YP</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">
            YieldPilot
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/app"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Strategy
          </Link>
          <Link
            href="/app/dashboard"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Dashboard
          </Link>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
