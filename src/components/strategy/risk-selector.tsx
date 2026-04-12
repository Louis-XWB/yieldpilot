"use client";

import { motion } from "framer-motion";
import { RiskLevel } from "@/lib/types";

const RISK_OPTIONS: {
  level: RiskLevel;
  icon: string;
  label: string;
  description: string;
  color: string;
  details: string[];
}[] = [
  {
    level: "conservative",
    icon: "🛡️",
    label: "Conservative",
    description: "Stability first. Blue-chip protocols, stablecoins only.",
    color: "border-positive/50 hover:border-positive",
    details: ["Stablecoin vaults only", "TVL > $10M", "Aave, Morpho, Spark", "3+ vaults, 2+ chains"],
  },
  {
    level: "balanced",
    icon: "⚖️",
    label: "Balanced",
    description: "Mix of stability and growth. Mainstream protocols.",
    color: "border-primary/50 hover:border-primary",
    details: ["Stablecoins + single-asset", "TVL > $1M", "All mainstream protocols", "2+ vaults diversification"],
  },
  {
    level: "aggressive",
    icon: "🚀",
    label: "Aggressive",
    description: "Maximum yield. Higher risk tolerance.",
    color: "border-warning/50 hover:border-warning",
    details: ["All vault types", "No TVL minimum", "All protocols", "Can concentrate positions"],
  },
];

export function RiskSelector({ selected, onSelect }: { selected: RiskLevel | null; onSelect: (level: RiskLevel) => void; }) {
  return (
    <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">2</span>
        Risk Profile
      </h3>

      <div className="grid md:grid-cols-3 gap-4">
        {RISK_OPTIONS.map((option) => {
          const isSelected = selected === option.level;
          return (
            <motion.button key={option.level} onClick={() => onSelect(option.level)}
              className={`p-5 rounded-xl border-2 text-left transition-all ${isSelected ? `${option.color} bg-card-bg shadow-lg` : "border-card-border hover:bg-card-bg/50"}`}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <div className="text-3xl mb-3">{option.icon}</div>
              <div className="font-semibold mb-1">{option.label}</div>
              <div className="text-text-secondary text-sm mb-3">{option.description}</div>
              <ul className="space-y-1">
                {option.details.map((d) => (
                  <li key={d} className="text-xs text-text-muted flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-text-muted" />
                    {d}
                  </li>
                ))}
              </ul>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
