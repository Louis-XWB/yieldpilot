"use client";

import { motion } from "framer-motion";
import { Strategy } from "@/lib/types";

export function AIReasoning({ strategy }: { strategy: Strategy }) {
  return (
    <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <span className="text-primary">🧠</span>
        AI Analysis
      </h4>
      <p className="text-text-secondary text-sm mb-4 leading-relaxed">{strategy.reasoning}</p>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-xs text-text-muted uppercase tracking-wider mb-2">Risk Factors</h5>
          <ul className="space-y-1.5">
            {strategy.risk_factors.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-positive mt-0.5">+</span>
                <span className="text-text-secondary">{f}</span>
              </li>
            ))}
          </ul>
        </div>
        {strategy.warnings.length > 0 && (
          <div>
            <h5 className="text-xs text-text-muted uppercase tracking-wider mb-2">Warnings</h5>
            <ul className="space-y-1.5">
              {strategy.warnings.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-warning mt-0.5">!</span>
                  <span className="text-text-secondary">{w}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}
