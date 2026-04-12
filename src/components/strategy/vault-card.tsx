"use client";

import { motion } from "framer-motion";
import { Allocation } from "@/lib/types";

const PROTOCOL_COLORS: Record<string, string> = {
  "morpho-v1": "#2563EB",
  "aave-v3": "#B042FF",
  "euler-v2": "#1E3A5F",
  pendle: "#1CD8D2",
  spark: "#F7A600",
};

export function VaultCard({ allocation, index }: { allocation: Allocation; index: number }) {
  const protocolColor = PROTOCOL_COLORS[allocation.protocol] || "#6366F1";

  return (
    <motion.div className="glass-card p-5 hover:border-primary/30 transition-all"
      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-text-primary">{allocation.vault_name}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-md text-xs font-medium" style={{ background: `${protocolColor}20`, color: protocolColor }}>
              {allocation.protocol}
            </span>
            <span className="text-text-muted text-xs">{allocation.chain}</span>
            {allocation.underlying_token && (
              <span className="text-text-muted text-xs">· {allocation.underlying_token.symbol}</span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-positive">{allocation.apy_total.toFixed(2)}%</div>
          <div className="text-xs text-text-muted">APY</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 py-3 border-y border-card-border/50">
        <div>
          <div className="text-xs text-text-muted mb-1">Allocation</div>
          <div className="font-mono text-sm">{allocation.percentage}%</div>
        </div>
        <div>
          <div className="text-xs text-text-muted mb-1">Amount</div>
          <div className="font-mono text-sm">${allocation.amount_usd.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-xs text-text-muted mb-1">TVL</div>
          <div className="font-mono text-sm">${(allocation.tvl_usd / 1_000_000).toFixed(1)}M</div>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <span className="text-primary text-xs mt-0.5">AI:</span>
        <p className="text-xs text-text-secondary leading-relaxed">{allocation.reason}</p>
      </div>
    </motion.div>
  );
}
