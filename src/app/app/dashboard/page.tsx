"use client";

import { useAccount } from "wagmi";
import { usePortfolio } from "@/hooks/use-portfolio";
import { ConnectPrompt } from "@/components/shared/connect-prompt";
import { PortfolioSummary } from "@/components/dashboard/portfolio-summary";
import { PositionCard } from "@/components/dashboard/position-card";
import { YieldChart } from "@/components/dashboard/yield-chart";
import { RebalanceSuggestion } from "@/components/dashboard/rebalance-suggestion";

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { data: portfolio, isLoading } = usePortfolio(address);

  if (!isConnected) {
    return <ConnectPrompt />;
  }

  const positions = portfolio?.positions || [];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Portfolio Dashboard</h1>
        <p className="text-text-secondary">Track your yield positions across all protocols and chains.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <>
          <PortfolioSummary positions={positions} />
          {positions.length > 0 ? (
            <>
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
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">No Positions Yet</h3>
              <p className="text-text-secondary mb-6">Generate an AI strategy and execute it to see your positions here.</p>
              <a href="/app" className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-xl text-white font-semibold transition-all inline-block">
                Generate Strategy
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
