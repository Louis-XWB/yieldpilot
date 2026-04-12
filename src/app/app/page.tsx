"use client";

import { useState } from "react";
import { useAccount, useChainId, useSendTransaction } from "wagmi";
import { ConnectPrompt } from "@/components/shared/connect-prompt";
import { AssetScan } from "@/components/strategy/asset-scan";
import { RiskSelector } from "@/components/strategy/risk-selector";
import { LoadingAnimation } from "@/components/shared/loading-animation";
import { StrategyResult } from "@/components/strategy/strategy-result";
import { ExecutionProgress } from "@/components/strategy/execution-progress";
import { RiskLevel, Strategy, ExecutionStep } from "@/lib/types";
import { StrategyComparison } from "@/components/strategy/strategy-comparison";

export default function StrategyPage() {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [investAmount, setInvestAmount] = useState<string>("1000");
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonStrategies, setComparisonStrategies] = useState<{
    conservative: Strategy | null;
    balanced: Strategy | null;
    aggressive: Strategy | null;
  }>({ conservative: null, balanced: null, aggressive: null });
  const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const { sendTransactionAsync } = useSendTransaction();

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
          userAssets: `${investAmount} USD available on chain ${chainId}`,
          preferredChainId: chainId,
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

  const handleCompare = async () => {
    if (!investAmount) return;
    setIsComparing(true);
    setStrategy(null);
    setComparisonStrategies({ conservative: null, balanced: null, aggressive: null });

    const levels = ["conservative", "balanced", "aggressive"] as const;

    // Fetch all 3 in parallel
    const promises = levels.map(async (level) => {
      try {
        const res = await fetch("/api/strategy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            riskLevel: level,
            totalAmountUsd: Number(investAmount),
            userAssets: `${investAmount} USD available on chain ${chainId}`,
            preferredChainId: chainId,
          }),
        });
        const data = await res.json();
        if (data.error) return null;
        return data as Strategy;
      } catch {
        return null;
      }
    });

    const results = await Promise.all(promises);
    setComparisonStrategies({
      conservative: results[0],
      balanced: results[1],
      aggressive: results[2],
    });
    setIsComparing(false);
  };

  const handleSelectFromComparison = (selected: Strategy) => {
    setStrategy(selected);
    setRiskLevel(selected.risk_level);
    setComparisonStrategies({ conservative: null, balanced: null, aggressive: null });
  };

  const handleExecute = async () => {
    if (!strategy || !address) return;
    setIsExecuting(true);

    const steps: ExecutionStep[] = strategy.allocations.map((a) => ({
      allocation: a,
      status: "pending" as const,
    }));
    setExecutionSteps([...steps]);

    for (let i = 0; i < steps.length; i++) {
      try {
        steps[i].status = "quoting";
        setExecutionSteps([...steps]);

        const fromToken = steps[i].allocation.underlying_token?.address;
        if (!fromToken) {
          steps[i].status = "failed";
          steps[i].error = "No underlying token found";
          setExecutionSteps([...steps]);
          continue;
        }

        const decimals = steps[i].allocation.underlying_token?.decimals || 18;
        const fromAmount = BigInt(
          Math.floor(steps[i].allocation.amount_usd * 10 ** decimals)
        ).toString();

        const quoteParams = new URLSearchParams({
          fromChain: String(steps[i].allocation.chain_id),
          toChain: String(steps[i].allocation.chain_id),
          fromToken,
          toToken: steps[i].allocation.vault_address,
          fromAddress: address,
          toAddress: address,
          fromAmount,
        });

        const quoteRes = await fetch(`/api/quote?${quoteParams}`);
        const quote = await quoteRes.json();
        console.log("Quote response:", JSON.stringify(quote, null, 2));

        if (quote.error || !quote.transactionRequest) {
          steps[i].status = "failed";
          steps[i].error = quote.error || quote.message || "No transaction data returned";
          setExecutionSteps([...steps]);
          continue;
        }

        steps[i].status = "approving";
        setExecutionSteps([...steps]);

        const txRequest = quote.transactionRequest;
        console.log("Sending tx:", txRequest);

        const txHash = await sendTransactionAsync({
          to: txRequest.to as `0x${string}`,
          data: txRequest.data as `0x${string}`,
          value: BigInt(txRequest.value || "0"),
          chainId: Number(txRequest.chainId),
        });

        steps[i].status = "completed";
        steps[i].txHash = txHash;
        setExecutionSteps([...steps]);
      } catch (err) {
        steps[i].status = "failed";
        steps[i].error = err instanceof Error ? err.message : "Transaction failed";
        setExecutionSteps([...steps]);
      }
    }

    setIsExecuting(false);
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
            <div className="flex gap-3">
              <button onClick={handleGenerate} disabled={isGenerating || isComparing}
                className="px-8 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl text-white font-semibold transition-all hover:shadow-lg hover:shadow-primary/25">
                {isGenerating ? "Generating..." : "Generate Strategy"}
              </button>
              <button onClick={handleCompare} disabled={isGenerating || isComparing}
                className="px-8 py-3 border border-primary/50 hover:border-primary disabled:opacity-50 rounded-xl text-primary font-semibold transition-all">
                {isComparing ? "Comparing..." : "Compare All 3"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isGenerating && <LoadingAnimation text="AI is analyzing 672+ vaults across 20+ protocols..." />}

      {isComparing && <LoadingAnimation text="AI is comparing 3 risk strategies..." />}

      {comparisonStrategies.conservative && !isComparing && !strategy && (
        <StrategyComparison
          strategies={comparisonStrategies}
          onSelect={handleSelectFromComparison}
        />
      )}

      {strategy && !isGenerating && executionSteps.length === 0 && (
        <StrategyResult
          strategy={strategy}
          onExecute={handleExecute}
          isExecuting={isExecuting}
        />
      )}

      {executionSteps.length > 0 && (
        <ExecutionProgress steps={executionSteps} />
      )}
    </div>
  );
}
