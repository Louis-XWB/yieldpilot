"use client";

import { useAccount } from "wagmi";
import { usePortfolio } from "@/hooks/use-portfolio";
import { ConnectPrompt } from "@/components/shared/connect-prompt";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { PositionCard } from "@/components/dashboard/position-card";
import { YieldChart } from "@/components/dashboard/yield-chart";
import { RebalanceSuggestion } from "@/components/dashboard/rebalance-suggestion";
import { Position } from "@/lib/types";

const SAMPLE_POSITIONS: Position[] = [
  {
    chainId: 8453,
    protocolName: "morpho",
    asset: { address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", name: "Morpho USDC Vault", symbol: "USDC", decimals: 6 },
    balanceUsd: "5240.82",
    balanceNative: "5240.820000",
  },
  {
    chainId: 42161,
    protocolName: "aave-v3",
    asset: { address: "0xaf88d065e77c8cc2239327c5edb3a432268e5831", name: "Aave USDC", symbol: "USDC", decimals: 6 },
    balanceUsd: "3180.50",
    balanceNative: "3180.500000",
  },
  {
    chainId: 1,
    protocolName: "euler-v2",
    asset: { address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", name: "Euler wstETH", symbol: "wstETH", decimals: 18 },
    balanceUsd: "2450.00",
    balanceNative: "1.250000",
  },
  {
    chainId: 8453,
    protocolName: "pendle",
    asset: { address: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913", name: "Pendle USDC PT", symbol: "USDC", decimals: 6 },
    balanceUsd: "1620.35",
    balanceNative: "1620.350000",
  },
];

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: portfolio, isLoading } = usePortfolio(address);

  if (!isConnected) {
    return <ConnectPrompt />;
  }

  const realPositions = portfolio?.positions || [];
  const isDemo = realPositions.length === 0;
  const positions = isDemo ? SAMPLE_POSITIONS : realPositions;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
        <p className="text-text-secondary">Track your yield positions across all protocols and chains.</p>
      </div>

      {isDemo && (
        <div className="px-4 py-3 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary flex items-center gap-2">
          <span>✨</span>
          <span>Showing sample portfolio data for demo purposes. Execute a strategy to see your real positions.</span>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          <PortfolioSummary positions={positions} />
          <YieldChart positions={positions} />
          <div>
            <h3 className="text-lg font-semibold mb-4">Active Positions</h3>
            <div className="space-y-4">
              {positions.map((position, i) => (
                <PositionCard key={`${position.chainId}-${position.asset.address}-${i}`} position={position} index={i} />
              ))}
            </div>
          </div>
          <RebalanceSuggestion />
        </>
      )}
    </div>
  );
}
