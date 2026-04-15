#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const EARN_API = "https://earn.li.fi";

const server = new McpServer({
  name: "yieldpilot",
  version: "1.0.0",
});

// Tool 1: Discover Vaults
server.tool(
  "discover_vaults",
  "Search and filter DeFi yield vaults across 20+ protocols and 17 chains. Returns vault name, protocol, APY (base + reward), TVL, chain, and tags.",
  {
    chainId: z.number().optional().describe("Filter by chain ID (e.g., 8453 for Base, 1 for Ethereum, 42161 for Arbitrum)"),
    minApy: z.number().optional().describe("Minimum total APY percentage (e.g., 5 for 5%)"),
    minTvl: z.number().optional().describe("Minimum TVL in USD (e.g., 1000000 for $1M)"),
    protocol: z.string().optional().describe("Filter by protocol name (e.g., 'morpho-v1', 'aave-v3', 'euler-v2', 'pendle')"),
    tags: z.string().optional().describe("Filter by tag (e.g., 'stablecoin', 'single')"),
    limit: z.number().optional().default(10).describe("Max number of results (default 10, max 50)"),
  },
  async ({ chainId, minApy, minTvl, protocol, tags, limit }) => {
    try {
      const params = new URLSearchParams();
      if (chainId) params.set("chainId", String(chainId));
      params.set("limit", "100");

      const res = await fetch(`${EARN_API}/v1/earn/vaults?${params}`);
      const data = await res.json();

      let vaults = data.data || [];

      // Apply filters
      if (minApy) vaults = vaults.filter((v: any) => v.analytics.apy.total >= minApy);
      if (minTvl) vaults = vaults.filter((v: any) => Number(v.analytics.tvl.usd) >= minTvl);
      if (protocol) vaults = vaults.filter((v: any) => v.protocol.name === protocol);
      if (tags) vaults = vaults.filter((v: any) => v.tags.includes(tags));

      // Only transactional vaults
      vaults = vaults.filter((v: any) => v.isTransactional);

      // Sort by APY descending
      vaults.sort((a: any, b: any) => b.analytics.apy.total - a.analytics.apy.total);

      // Limit results
      const maxLimit = Math.min(limit || 10, 50);
      vaults = vaults.slice(0, maxLimit);

      const results = vaults.map((v: any) => ({
        name: v.name,
        slug: v.slug,
        address: v.address,
        chain: v.network,
        chainId: v.chainId,
        protocol: v.protocol.name,
        apy: {
          total: v.analytics.apy.total,
          base: v.analytics.apy.base,
          reward: v.analytics.apy.reward,
        },
        apy30d: v.analytics.apy30d,
        tvl: `$${Number(v.analytics.tvl.usd).toLocaleString()}`,
        tags: v.tags,
        underlyingTokens: v.underlyingTokens.map((t: any) => t.symbol).join(", ") || "N/A",
      }));

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ total: data.total, showing: results.length, vaults: results }, null, 2),
        }],
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
        isError: true,
      };
    }
  }
);

// Tool 2: Generate AI Strategy
server.tool(
  "generate_strategy",
  "Generate an AI-powered yield strategy. Analyzes vaults and creates an optimal portfolio allocation based on risk level. Requires OPENAI_API_KEY environment variable.",
  {
    riskLevel: z.enum(["conservative", "balanced", "aggressive"]).describe("Risk profile: conservative (stablecoins, high TVL), balanced (mixed), aggressive (max APY)"),
    totalAmountUsd: z.number().describe("Total investment amount in USD"),
    preferredChainId: z.number().optional().describe("Preferred chain ID to minimize cross-chain fees"),
  },
  async ({ riskLevel, totalAmountUsd, preferredChainId }) => {
    try {
      // Dynamically import to avoid loading OpenAI when not needed
      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
      });

      // Fetch vaults
      let allVaults: any[] = [];
      let cursor: string | undefined;
      do {
        const params = new URLSearchParams({ limit: "100" });
        if (cursor) params.set("cursor", cursor);
        const res = await fetch(`${EARN_API}/v1/earn/vaults?${params}`);
        const data = await res.json();
        allVaults.push(...data.data);
        cursor = data.nextCursor || undefined;
      } while (cursor && allVaults.length < 500);

      // Filter by risk level
      const riskFilters: Record<string, { tags: string[] | null; minTvl: number; protocols: string[] | null }> = {
        conservative: { tags: ["stablecoin"], minTvl: 10_000_000, protocols: ["aave-v3", "morpho-v1", "spark"] },
        balanced: { tags: ["stablecoin", "single"], minTvl: 1_000_000, protocols: null },
        aggressive: { tags: null, minTvl: 0, protocols: null },
      };

      const filter = riskFilters[riskLevel];
      let filtered = allVaults.filter((v) => {
        if (!v.isTransactional || v.analytics.apy.total <= 0) return false;
        if (Number(v.analytics.tvl.usd) < filter.minTvl) return false;
        if (filter.tags && !v.tags.some((t: string) => filter.tags!.includes(t))) return false;
        if (filter.protocols && !filter.protocols.includes(v.protocol.name)) return false;
        return true;
      });

      if (preferredChainId) {
        const chainVaults = filtered.filter((v) => v.chainId === preferredChainId);
        if (chainVaults.length >= 3) filtered = chainVaults;
      }

      filtered.sort((a, b) => b.analytics.apy.total - a.analytics.apy.total);
      const top = filtered.slice(0, 30);

      const vaultSummary = top.map((v) =>
        `${v.name} | ${v.protocol.name} | ${v.network}(${v.chainId}) | APY:${v.analytics.apy.total.toFixed(2)}% | TVL:$${Number(v.analytics.tvl.usd).toLocaleString()} | Tags:${v.tags.join(",")} | Slug:${v.slug} | Addr:${v.address} | Token:${v.underlyingTokens.map((t: any) => `${t.symbol}(${t.address})`).join(",") || "N/A"}`
      ).join("\n");

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are YieldPilot AI. Generate a yield strategy as JSON: {"strategy_name":string,"risk_score":number(1-10),"expected_apy":number,"reasoning":string,"allocations":[{"vault_slug":string,"vault_name":string,"chain":string,"protocol":string,"percentage":number,"apy_total":number,"tvl_usd":number,"reason":string}],"risk_factors":string[],"warnings":string[]}. Percentages must sum to 100. Select 3-5 vaults. Use exact slugs from data.`,
          },
          {
            role: "user",
            content: `Risk: ${riskLevel}\nAmount: $${totalAmountUsd}\n\nVaults:\n${vaultSummary}\n\nJSON only:`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const content = response.choices[0]?.message?.content || "";
      const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();

      return {
        content: [{ type: "text" as const, text: cleaned }],
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
        isError: true,
      };
    }
  }
);

// Tool 3: Check Portfolio
server.tool(
  "check_portfolio",
  "Check a wallet's DeFi yield positions across all supported protocols and chains via LI.FI Earn.",
  {
    walletAddress: z.string().describe("EVM wallet address (0x...)"),
  },
  async ({ walletAddress }) => {
    try {
      const res = await fetch(`${EARN_API}/v1/earn/portfolio/${walletAddress}/positions`);
      const data = await res.json();

      const positions = data.positions || [];

      if (positions.length === 0) {
        return {
          content: [{ type: "text" as const, text: `No DeFi yield positions found for ${walletAddress}` }],
        };
      }

      const totalValue = positions.reduce((sum: number, p: any) => sum + Number(p.balanceUsd || 0), 0);
      const protocols = [...new Set(positions.map((p: any) => p.protocolName))];

      const summary = {
        wallet: walletAddress,
        totalValueUsd: `$${totalValue.toFixed(2)}`,
        positionCount: positions.length,
        protocols,
        positions: positions.map((p: any) => ({
          protocol: p.protocolName,
          asset: p.asset.symbol,
          chainId: p.chainId,
          balanceUsd: `$${Number(p.balanceUsd).toFixed(2)}`,
          balanceNative: p.balanceNative,
        })),
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(summary, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : "Unknown error"}` }],
        isError: true,
      };
    }
  }
);

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("YieldPilot MCP Server running on stdio");
}

main().catch(console.error);
