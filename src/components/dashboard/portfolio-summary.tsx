"use client";

import { motion } from "framer-motion";
import { Position } from "@/lib/types";

export function PortfolioSummary({ positions }: { positions: Position[] }) {
  const totalValue = positions.reduce((sum, p) => sum + Number(p.balanceUsd || 0), 0);

  return (
    <motion.div className="glass-card p-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <div className="text-sm text-text-muted mb-1">Total Portfolio Value</div>
          <div className="text-4xl font-bold font-mono text-text-primary">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div className="text-sm text-text-muted mb-1">Active Positions</div>
          <div className="text-4xl font-bold font-mono text-primary">{positions.length}</div>
        </div>
        <div>
          <div className="text-sm text-text-muted mb-1">Protocols Used</div>
          <div className="text-4xl font-bold font-mono text-text-primary">
            {new Set(positions.map((p) => p.protocolName)).size}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
