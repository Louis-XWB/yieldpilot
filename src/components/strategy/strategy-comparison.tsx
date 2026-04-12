"use client";

import { motion } from "framer-motion";
import { Strategy } from "@/lib/types";

const RISK_STYLES = {
  conservative: { icon: "🛡️", label: "Conservative", color: "text-positive", border: "border-positive/30", bg: "bg-positive/5" },
  balanced: { icon: "⚖️", label: "Balanced", color: "text-primary", border: "border-primary/30", bg: "bg-primary/5" },
  aggressive: { icon: "🚀", label: "Aggressive", color: "text-warning", border: "border-warning/30", bg: "bg-warning/5" },
};

export function StrategyComparison({
  strategies,
  onSelect,
}: {
  strategies: { conservative: Strategy | null; balanced: Strategy | null; aggressive: Strategy | null };
  onSelect: (strategy: Strategy) => void;
}) {
  const levels = ["conservative", "balanced", "aggressive"] as const;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <span className="text-primary">⚡</span>
        Strategy Comparison
      </h3>
      <div className="grid md:grid-cols-3 gap-4">
        {levels.map((level, i) => {
          const strategy = strategies[level];
          const style = RISK_STYLES[level];

          if (!strategy) {
            return (
              <div key={level} className="glass-card p-6 animate-pulse">
                <div className="h-6 bg-card-border rounded w-1/2 mb-4" />
                <div className="h-10 bg-card-border rounded w-1/3 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-card-border rounded w-full" />
                  <div className="h-4 bg-card-border rounded w-2/3" />
                </div>
              </div>
            );
          }

          return (
            <motion.div
              key={level}
              className={`glass-card p-6 border ${style.border} ${style.bg} hover:border-primary/50 transition-all`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{style.icon}</span>
                <div>
                  <div className={`font-semibold ${style.color}`}>{style.label}</div>
                  <div className="text-xs text-text-muted">Risk: {strategy.risk_score}/10</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-3xl font-bold font-mono text-positive">
                  {strategy.expected_apy.toFixed(2)}%
                </div>
                <div className="text-xs text-text-muted">Expected APY</div>
              </div>

              <div className="space-y-2 mb-4 py-3 border-y border-card-border/50">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Vaults</span>
                  <span className="font-mono">{strategy.allocations.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Chains</span>
                  <span className="font-mono">
                    {new Set(strategy.allocations.map((a) => a.chain)).size}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Protocols</span>
                  <span className="font-mono">
                    {new Set(strategy.allocations.map((a) => a.protocol)).size}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 mb-4">
                {strategy.allocations.map((a) => (
                  <div key={a.vault_slug} className="flex justify-between text-xs">
                    <span className="text-text-secondary truncate mr-2">{a.vault_name}</span>
                    <span className="font-mono text-positive flex-shrink-0">{a.apy_total.toFixed(1)}%</span>
                  </div>
                ))}
              </div>

              {strategy.warnings.length > 0 && (
                <div className="text-xs text-warning mb-4">
                  ⚠ {strategy.warnings.length} warning{strategy.warnings.length > 1 ? "s" : ""}
                </div>
              )}

              <button
                onClick={() => onSelect(strategy)}
                className="w-full py-2.5 bg-primary hover:bg-primary-hover rounded-xl text-white font-semibold text-sm transition-all"
              >
                Select This Strategy
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
