"use client";

import { motion } from "framer-motion";
import { Strategy } from "@/lib/types";
import { AllocationChart } from "./allocation-chart";
import { VaultCard } from "./vault-card";
import { AIReasoning } from "./ai-reasoning";

export function StrategyResult({ strategy, onExecute, isExecuting }: { strategy: Strategy; onExecute: () => void; isExecuting: boolean; }) {
  const riskLabels: Record<string, { label: string; color: string }> = {
    conservative: { label: "Conservative", color: "text-positive" },
    balanced: { label: "Balanced", color: "text-primary" },
    aggressive: { label: "Aggressive", color: "text-warning" },
  };

  const risk = riskLabels[strategy.risk_level] || riskLabels.balanced;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="glass-card p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">{strategy.strategy_name}</h3>
            <div className="flex items-center gap-3 text-sm">
              <span className={risk.color}>{risk.label}</span>
              <span className="text-text-muted">·</span>
              <span className="text-text-secondary">Risk Score: {strategy.risk_score}/10</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-positive">{strategy.expected_apy.toFixed(2)}%</div>
            <div className="text-xs text-text-muted">Expected APY</div>
            <div className="text-sm font-mono text-text-secondary mt-1">${strategy.total_amount_usd.toLocaleString()} invested</div>
          </div>
        </div>
        <AllocationChart allocations={strategy.allocations} />
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Allocation Details</h4>
        {strategy.allocations.map((allocation, i) => (
          <VaultCard key={allocation.vault_slug} allocation={allocation} index={i} />
        ))}
      </div>

      <AIReasoning strategy={strategy} />

      <motion.button onClick={onExecute} disabled={isExecuting}
        className="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl text-white font-semibold text-lg transition-all hover:shadow-lg hover:shadow-primary/25"
        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        {isExecuting ? "Executing Strategy..." : "Execute Strategy"}
      </motion.button>
    </motion.div>
  );
}
