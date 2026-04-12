"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="w-20 h-20 rounded-full bg-card-bg border border-card-border flex items-center justify-center">
        <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">Connect Your Wallet</h2>
        <p className="text-text-secondary mb-6">Connect your wallet to scan your assets and generate an AI-powered yield strategy.</p>
        <ConnectButton />
      </div>
    </div>
  );
}
