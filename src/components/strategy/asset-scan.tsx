"use client";

import { useAccount, useBalance } from "wagmi";
import { usePortfolio } from "@/hooks/use-portfolio";
import { motion } from "framer-motion";
import { base, mainnet, arbitrum } from "wagmi/chains";

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  8453: "Base",
  42161: "Arbitrum",
  10: "Optimism",
  137: "Polygon",
};

export function AssetScan() {
  const { address } = useAccount();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio(address);

  const { data: ethBalance } = useBalance({ address, chainId: mainnet.id });
  const { data: baseBalance } = useBalance({ address, chainId: base.id });
  const { data: arbBalance } = useBalance({ address, chainId: arbitrum.id });

  const nativeBalances = [
    { chain: "Ethereum", symbol: "ETH", balance: ethBalance },
    { chain: "Base", symbol: "ETH", balance: baseBalance },
    { chain: "Arbitrum", symbol: "ETH", balance: arbBalance },
  ].filter((b) => b.balance && Number(b.balance.formatted) > 0);

  const existingPositions = portfolio?.positions || [];
  const totalPositionValue = existingPositions.reduce(
    (sum, p) => sum + Number(p.balanceUsd || 0),
    0
  );

  return (
    <motion.div className="glass-card p-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">1</span>
        Asset Scan
      </h3>

      <div className="mb-6">
        <h4 className="text-sm text-text-secondary mb-3">Wallet Balances</h4>
        {nativeBalances.length > 0 ? (
          <div className="space-y-2">
            {nativeBalances.map((b) => (
              <div key={b.chain} className="flex justify-between items-center py-2 px-3 rounded-lg bg-background/50">
                <span className="text-sm text-text-secondary">{b.chain}</span>
                <span className="font-mono text-sm">{Number(b.balance!.formatted).toFixed(4)} {b.symbol}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm">No balances detected on main chains</p>
        )}
      </div>

      <div>
        <h4 className="text-sm text-text-secondary mb-3">
          Existing Yield Positions
          {totalPositionValue > 0 && (
            <span className="ml-2 text-positive font-mono">${totalPositionValue.toFixed(2)}</span>
          )}
        </h4>
        {portfolioLoading ? (
          <div className="animate-pulse h-12 bg-card-bg rounded-lg" />
        ) : existingPositions.length > 0 ? (
          <div className="space-y-2">
            {existingPositions.map((p, i) => (
              <div key={i} className="flex justify-between items-center py-2 px-3 rounded-lg bg-background/50">
                <div>
                  <span className="text-sm">{p.asset.symbol}</span>
                  <span className="text-text-muted text-xs ml-2">{p.protocolName} · {CHAIN_NAMES[p.chainId] || `Chain ${p.chainId}`}</span>
                </div>
                <span className="font-mono text-sm text-positive">${Number(p.balanceUsd).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm">No existing yield positions found</p>
        )}
      </div>
    </motion.div>
  );
}
