"use client";

import { motion } from "framer-motion";

export function RebalanceSuggestion() {
  return (
    <motion.div className="glass-card p-6 border-warning/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
          <span className="text-warning text-lg">🧠</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">AI Rebalancing Suggestion</h4>
          <p className="text-sm text-text-secondary mb-3">
            Based on current market conditions, your portfolio could be optimized. Connect your wallet and generate a new strategy to see personalized recommendations.
          </p>
          <a href="/app" className="text-sm text-primary hover:underline inline-flex items-center gap-1">Generate New Strategy →</a>
        </div>
      </div>
    </motion.div>
  );
}
