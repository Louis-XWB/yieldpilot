"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectPrompt } from "@/components/shared/connect-prompt";
import { AssetScan } from "@/components/strategy/asset-scan";
import { RiskSelector } from "@/components/strategy/risk-selector";
import { LoadingAnimation } from "@/components/shared/loading-animation";
import { RiskLevel, Strategy } from "@/lib/types";

export default function StrategyPage() {
  const { isConnected } = useAccount();
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [investAmount, setInvestAmount] = useState<string>("1000");
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isConnected) {
    return <ConnectPrompt />;
  }

  const handleGenerate = async () => {
    if (!riskLevel || !investAmount) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riskLevel,
          totalAmountUsd: Number(investAmount),
          userAssets: `${investAmount} USD available`,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStrategy(data);
    } catch (err) {
      console.error("Strategy generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Strategy Engine</h1>
        <p className="text-text-secondary">Let AI analyze 672+ vaults and build your optimal yield portfolio.</p>
      </div>

      <AssetScan />
      <RiskSelector selected={riskLevel} onSelect={setRiskLevel} />

      {riskLevel && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">3</span>
            Generate Strategy
          </h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm text-text-secondary mb-2 block">Investment Amount (USD)</label>
              <input type="number" value={investAmount} onChange={(e) => setInvestAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-card-border text-text-primary font-mono text-lg focus:border-primary focus:outline-none transition-colors"
                placeholder="1000" min="1" />
            </div>
            <button onClick={handleGenerate} disabled={isGenerating}
              className="px-8 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl text-white font-semibold transition-all hover:shadow-lg hover:shadow-primary/25">
              {isGenerating ? "Generating..." : "Generate Strategy"}
            </button>
          </div>
        </div>
      )}

      {isGenerating && <LoadingAnimation text="AI is analyzing 672+ vaults across 20+ protocols..." />}

      {strategy && !isGenerating && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">Strategy Generated</h3>
          <pre className="text-xs text-text-secondary overflow-auto max-h-96">
            {JSON.stringify(strategy, null, 2)}
          </pre>
          <p className="text-text-muted text-sm mt-4">Strategy result display components will be added in the next task.</p>
        </div>
      )}
    </div>
  );
}
