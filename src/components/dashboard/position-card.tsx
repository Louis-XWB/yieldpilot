"use client";

import { motion } from "framer-motion";
import { Position } from "@/lib/types";

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum", 8453: "Base", 42161: "Arbitrum", 10: "Optimism", 137: "Polygon", 56: "BSC", 43114: "Avalanche",
};

export function PositionCard({ position, index }: { position: Position; index: number }) {
  return (
    <motion.div className="glass-card p-5 hover:border-primary/30 transition-all"
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-text-primary text-lg">{position.asset.symbol}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary/20 text-primary">{position.protocolName}</span>
            <span className="text-text-muted text-xs">{CHAIN_NAMES[position.chainId] || `Chain ${position.chainId}`}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-text-primary">
            ${Number(position.balanceUsd).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-text-muted mt-1">
            {Number(position.balanceNative).toFixed(6)} {position.asset.symbol}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
