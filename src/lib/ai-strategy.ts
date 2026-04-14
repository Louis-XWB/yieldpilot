import OpenAI from "openai";
import { Vault, RiskLevel, Strategy } from "./types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
});

const RISK_FILTERS: Record<
  RiskLevel,
  {
    tags: string[] | null;
    minTvl: number;
    protocols: string[] | null;
    minVaults: number;
    minChains: number;
    apySortField: "total" | "apy30d";
  }
> = {
  conservative: {
    tags: ["stablecoin"],
    minTvl: 10_000_000,
    protocols: ["aave-v3", "morpho-v1", "spark"],
    minVaults: 3,
    minChains: 2,
    apySortField: "apy30d",
  },
  balanced: {
    tags: ["stablecoin", "single"],
    minTvl: 1_000_000,
    protocols: null,
    minVaults: 2,
    minChains: 1,
    apySortField: "total",
  },
  aggressive: {
    tags: null,
    minTvl: 0,
    protocols: null,
    minVaults: 1,
    minChains: 1,
    apySortField: "total",
  },
};

function filterVaults(vaults: Vault[], riskLevel: RiskLevel): Vault[] {
  const filter = RISK_FILTERS[riskLevel];

  return vaults.filter((v) => {
    if (!v.isTransactional) return false;
    if (v.analytics.apy.total <= 0) return false;

    const tvl = Number(v.analytics.tvl.usd);
    if (tvl < filter.minTvl) return false;

    if (filter.tags && !v.tags.some((t) => filter.tags!.includes(t))) {
      return false;
    }

    if (
      filter.protocols &&
      !filter.protocols.includes(v.protocol.name)
    ) {
      return false;
    }

    return true;
  });
}

function prepareVaultSummary(vaults: Vault[]): string {
  return vaults
    .slice(0, 50)
    .map(
      (v) =>
        `- ${v.name} | ${v.protocol.name} | ${v.network} (${v.chainId}) | APY: ${v.analytics.apy.total.toFixed(2)}% (base: ${v.analytics.apy.base.toFixed(2)}%, reward: ${v.analytics.apy.reward ?? 0}%) | 30d APY: ${v.analytics.apy30d?.toFixed(2) ?? "N/A"}% | TVL: $${Number(v.analytics.tvl.usd).toLocaleString()} | Tags: ${v.tags.join(", ")} | Slug: ${v.slug} | Address: ${v.address} | Underlying: ${v.underlyingTokens.map((t) => `${t.symbol}(${t.address})`).join(", ") || "N/A"}`
    )
    .join("\n");
}

export async function generateStrategy(
  vaults: Vault[],
  riskLevel: RiskLevel,
  totalAmountUsd: number,
  userAssets: string,
  preferredChainId?: number
): Promise<Strategy> {
  let filtered = filterVaults(vaults, riskLevel);

  // If user has a preferred chain, filter to only that chain's vaults first
  // Fall back to all vaults if fewer than 3 options on preferred chain
  if (preferredChainId) {
    const chainVaults = filtered.filter((v) => v.chainId === preferredChainId);
    if (chainVaults.length >= 3) {
      filtered = chainVaults;
    }
  }

  const sortField = RISK_FILTERS[riskLevel].apySortField;
  const sorted = [...filtered].sort((a, b) => {
    if (sortField === "apy30d") {
      return (b.analytics.apy30d ?? 0) - (a.analytics.apy30d ?? 0);
    }
    return b.analytics.apy.total - a.analytics.apy.total;
  });

  const vaultSummary = prepareVaultSummary(sorted);
  const filter = RISK_FILTERS[riskLevel];

  const systemPrompt = `You are YieldPilot, an expert AI DeFi fund manager. You analyze vault data and create optimal yield strategies.

You MUST respond with ONLY valid JSON matching this exact schema:
{
  "strategy_name": string,
  "risk_score": number (1-10),
  "expected_apy": number,
  "reasoning": string (2-3 sentences explaining overall strategy),
  "allocations": [
    {
      "vault_slug": string (exact slug from vault data),
      "vault_name": string,
      "vault_address": string (exact address from vault data),
      "chain": string,
      "chain_id": number,
      "protocol": string,
      "percentage": number (allocation percentage, all must sum to 100),
      "apy_total": number,
      "apy_base": number,
      "apy_reward": number or null,
      "tvl_usd": number,
      "reason": string (1 sentence why this vault),
      "underlying_token": { "address": string, "symbol": string, "decimals": number } or null
    }
  ],
  "risk_factors": string[] (2-4 positive risk factors),
  "warnings": string[] (0-3 warnings)
}

Rules:
- Select ${filter.minVaults}-5 vaults for diversification
- Spread across at least ${filter.minChains} different chains
- All vault_slug and vault_address values MUST exactly match the provided vault data
- underlying_token MUST match the vault's underlyingTokens[0] if available, null otherwise
- Percentages must sum to exactly 100
- Higher allocation to higher TVL vaults (safer)
- For conservative: prioritize stability (30d APY consistency), blue-chip protocols
- For balanced: mix stability and growth
- For aggressive: prioritize highest total APY, acceptable to include smaller vaults
- Consider protocol diversification (don't put everything in one protocol)
- IMPORTANT: If the user has funds on a specific chain, STRONGLY prefer vaults on that same chain to avoid cross-chain fees. Only use other chains if the preferred chain lacks good options.`;

  const chainHint = preferredChainId
    ? `\nUser's funds are on chain ID ${preferredChainId}. STRONGLY prefer vaults on this chain to minimize fees.`
    : "";

  const userPrompt = `Risk Level: ${riskLevel}
Total Investment: $${totalAmountUsd.toLocaleString()}
User Assets: ${userAssets}${chainHint}

Available Vaults (pre-filtered for risk level):
${vaultSummary}

Generate the optimal yield strategy. Respond with JSON only, no markdown.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.3,
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  const cleaned = content.replace(/```json\n?|\n?```/g, "").trim();
  const strategy: Strategy = JSON.parse(cleaned);

  // Post-process: calculate amounts and set metadata
  strategy.risk_level = riskLevel;
  strategy.total_amount_usd = totalAmountUsd;
  strategy.allocations = strategy.allocations.map((a) => ({
    ...a,
    amount_usd: (totalAmountUsd * a.percentage) / 100,
  }));

  return strategy;
}
