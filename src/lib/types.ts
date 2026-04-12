// === Earn Data API Types ===

export interface Vault {
  address: string;
  name: string;
  slug: string;
  chainId: number;
  network: string;
  description: string;
  protocol: {
    name: string;
    url: string;
  };
  underlyingTokens: {
    address: string;
    symbol: string;
    decimals: number;
  }[];
  lpTokens: unknown[];
  tags: string[];
  analytics: {
    apy: {
      base: number;
      total: number;
      reward: number | null;
    };
    apy1d: number | null;
    apy7d: number | null;
    apy30d: number | null;
    tvl: {
      usd: string; // NOTE: string, not number
    };
    updatedAt: string;
  };
  isTransactional: boolean;
  isRedeemable: boolean;
  depositPacks: { name: string; stepsType: string }[];
  redeemPacks: { name: string; stepsType: string }[];
}

export interface VaultsResponse {
  data: Vault[];
  nextCursor: string | null;
  total: number;
}

export interface Chain {
  chainId: number;
  name: string;
  networkCaip: string;
}

export interface Protocol {
  name: string;
  url: string;
}

export interface Position {
  chainId: number;
  protocolName: string;
  asset: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  };
  balanceUsd: string;
  balanceNative: string;
}

export interface PortfolioResponse {
  positions: Position[];
}

// === AI Strategy Types ===

export type RiskLevel = "conservative" | "balanced" | "aggressive";

export interface Allocation {
  vault_slug: string;
  vault_name: string;
  vault_address: string;
  chain: string;
  chain_id: number;
  protocol: string;
  percentage: number;
  amount_usd: number;
  apy_total: number;
  apy_base: number;
  apy_reward: number | null;
  tvl_usd: number;
  reason: string;
  underlying_token: {
    address: string;
    symbol: string;
    decimals: number;
  } | null;
}

export interface Strategy {
  strategy_name: string;
  risk_score: number;
  risk_level: RiskLevel;
  expected_apy: number;
  total_amount_usd: number;
  reasoning: string;
  allocations: Allocation[];
  risk_factors: string[];
  warnings: string[];
}

// === Composer Types ===

export interface QuoteRequest {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAddress: string;
  toAddress: string;
  fromAmount: string;
}

export interface QuoteResponse {
  transactionRequest: {
    to: string;
    data: string;
    value: string;
    gasLimit: string;
    gasPrice?: string;
    chainId: number;
  };
  estimate: {
    fromAmount: string;
    toAmount: string;
    approvalAddress?: string;
  };
  action: {
    fromToken: { address: string; symbol: string; decimals: number };
    toToken: { address: string; symbol: string; decimals: number };
  };
  [key: string]: unknown;
}

// === Execution Types ===

export interface ExecutionStep {
  allocation: Allocation;
  status: "pending" | "quoting" | "approving" | "executing" | "completed" | "failed";
  txHash?: string;
  error?: string;
}
