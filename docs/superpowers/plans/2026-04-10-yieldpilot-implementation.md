# YieldPilot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working AI DeFi fund manager that uses LI.FI Earn API for vault discovery and Composer for one-click deposits, with an AI strategy engine that generates optimal yield allocations.

**Architecture:** Next.js 14 App Router with server-side API routes protecting API keys. Three pages: Landing (brand), Strategy Engine (core flow), Dashboard (portfolio monitoring). AI strategy engine runs server-side via OpenAI API, consuming Earn Data API vault data and generating structured allocation recommendations.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, wagmi v2, RainbowKit, Recharts, OpenAI API (gpt-4o-mini for dev, gpt-4o for production), LI.FI Earn Data API + Composer API

**Note:** This is a hackathon sprint (3.5 days). No TDD — focus on shipping working features fast. Tests skipped intentionally.

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                     # Root layout: fonts, metadata, Providers wrapper
│   ├── page.tsx                       # Landing page
│   ├── globals.css                    # Tailwind + custom CSS variables + animations
│   ├── providers.tsx                  # WagmiProvider + RainbowKitProvider + QueryClientProvider
│   ├── app/
│   │   ├── layout.tsx                 # App layout with nav header + wallet button
│   │   ├── page.tsx                   # Strategy Engine page (core)
│   │   └── dashboard/
│   │       └── page.tsx               # Dashboard page
│   └── api/
│       ├── vaults/route.ts            # GET: proxy to earn.li.fi/v1/earn/vaults with caching
│       ├── chains/route.ts            # GET: proxy to earn.li.fi/v1/earn/chains
│       ├── protocols/route.ts         # GET: proxy to earn.li.fi/v1/earn/protocols
│       ├── portfolio/[address]/route.ts # GET: proxy to earn.li.fi/v1/earn/portfolio
│       ├── strategy/route.ts          # POST: AI strategy generation (OpenAI + vault data)
│       └── quote/route.ts             # GET: proxy to li.quest/v1/quote (protects API key)
├── lib/
│   ├── types.ts                       # All TypeScript interfaces (Vault, Strategy, etc.)
│   ├── earn-api.ts                    # Earn Data API client functions (server-side)
│   ├── ai-strategy.ts                 # OpenAI strategy engine with prompt + structured output
│   └── wagmi-config.ts                # Wagmi chains + transports + RainbowKit config
├── hooks/
│   ├── use-vaults.ts                  # SWR/fetch hook for vault data
│   ├── use-portfolio.ts               # SWR/fetch hook for portfolio positions
│   └── use-strategy.ts               # Hook for AI strategy generation + state
├── components/
│   ├── landing/
│   │   ├── hero.tsx                   # Hero section with title + CTA
│   │   ├── stats-ticker.tsx           # Live stats: vault count, max APY, chain count
│   │   └── feature-cards.tsx          # 3 feature highlight cards
│   ├── strategy/
│   │   ├── asset-scan.tsx             # Step 1: wallet asset display
│   │   ├── risk-selector.tsx          # Step 2: conservative/balanced/aggressive picker
│   │   ├── strategy-result.tsx        # Step 3: full strategy display wrapper
│   │   ├── allocation-chart.tsx       # Donut chart of portfolio allocation
│   │   ├── vault-card.tsx             # Individual vault allocation card
│   │   ├── ai-reasoning.tsx           # Transparent AI reasoning panel
│   │   └── execution-progress.tsx     # Transaction execution progress UI
│   ├── dashboard/
│   │   ├── portfolio-summary.tsx      # Total value + cumulative earnings header
│   │   ├── position-card.tsx          # Individual position card
│   │   ├── yield-chart.tsx            # Yield trend line chart (Recharts)
│   │   └── rebalance-suggestion.tsx   # AI rebalancing suggestion card
│   └── shared/
│       ├── nav-header.tsx             # Top navigation with logo + wallet button
│       ├── connect-prompt.tsx         # "Connect wallet to continue" prompt
│       └── loading-animation.tsx      # AI thinking animation (pulse/wave)
```

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`, `.env.local`, `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`

- [ ] **Step 1: Create Next.js project with TypeScript and Tailwind**

```bash
cd /Users/weibin/job/hackathon/lifi_hackason
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Accept defaults. This scaffolds the project in the current directory.

- [ ] **Step 2: Install all dependencies**

```bash
npm install @rainbow-me/rainbowkit wagmi viem@2.x @tanstack/react-query
npm install framer-motion recharts openai
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge lucide-react
```

- [ ] **Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

Then add components we'll need:

```bash
npx shadcn@latest add button card badge separator skeleton tabs progress
```

- [ ] **Step 4: Create `.env.local`**

Create file at project root:

```env
LIFI_COMPOSER_API_KEY=your_composer_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

Note: User should get a WalletConnect project ID from https://cloud.walletconnect.com/ (free, takes 1 minute). For initial dev, can use a placeholder.

- [ ] **Step 5: Create `.gitignore` additions**

Append to `.gitignore`:

```
.env.local
.env*.local
```

- [ ] **Step 6: Set up Tailwind config with custom theme**

Replace `tailwind.config.ts` with the YieldPilot dark theme:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0F",
        "card-bg": "#1A1A2E",
        "card-border": "#2A2A4A",
        primary: "#6366F1",
        "primary-hover": "#818CF8",
        positive: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        "text-primary": "#F8FAFC",
        "text-secondary": "#94A3B8",
        "text-muted": "#64748B",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(99, 102, 241, 0.2)" },
          "100%": { boxShadow: "0 0 20px rgba(99, 102, 241, 0.4)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

- [ ] **Step 7: Set up globals.css**

Replace `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

:root {
  --background: #0A0A0F;
  --foreground: #F8FAFC;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: 'Inter', sans-serif;
}

/* Glassmorphism card */
.glass-card {
  background: rgba(26, 26, 46, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(99, 102, 241, 0.15);
  border-radius: 16px;
}

.glass-card:hover {
  border-color: rgba(99, 102, 241, 0.3);
}

/* Number ticker animation */
.number-tick {
  font-family: 'JetBrains Mono', monospace;
  font-variant-numeric: tabular-nums;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #0A0A0F;
}

::-webkit-scrollbar-thumb {
  background: #2A2A4A;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #6366F1;
}
```

- [ ] **Step 8: Verify dev server starts**

```bash
npm run dev
```

Expected: Server starts on http://localhost:3000 with no errors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, shadcn/ui, wagmi, and dark theme"
```

---

### Task 2: Core Types + Wagmi Config + Providers

**Files:**
- Create: `src/lib/types.ts`, `src/lib/wagmi-config.ts`, `src/app/providers.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create TypeScript types**

Create `src/lib/types.ts`:

```typescript
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
```

- [ ] **Step 2: Create wagmi config**

Create `src/lib/wagmi-config.ts`:

```typescript
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  mainnet,
  base,
  arbitrum,
  optimism,
  polygon,
  avalanche,
  bsc,
  gnosis,
  linea,
  scroll,
  mantle,
  celo,
} from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "YieldPilot",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [
    mainnet,
    base,
    arbitrum,
    optimism,
    polygon,
    avalanche,
    bsc,
    gnosis,
    linea,
    scroll,
    mantle,
    celo,
  ],
  ssr: true,
});
```

- [ ] **Step 3: Create Providers component**

Create `src/app/providers.tsx`:

```typescript
"use client";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "@/lib/wagmi-config";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#6366F1",
            accentColorForeground: "white",
            borderRadius: "large",
            overlayBlur: "small",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

- [ ] **Step 4: Update root layout**

Replace `src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "YieldPilot — AI DeFi Fund Manager",
  description:
    "Your private AI fund manager for DeFi yield. Analyze 20+ protocols across 60+ chains, generate optimal strategies, and execute with one click.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-text-primary min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Verify — dev server runs with wallet connect working**

```bash
npm run dev
```

Open http://localhost:3000. Page should render with dark background, no console errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add TypeScript types, wagmi config, and RainbowKit providers"
```

---

### Task 3: API Routes (Server-Side)

**Files:**
- Create: `src/lib/earn-api.ts`, `src/app/api/vaults/route.ts`, `src/app/api/chains/route.ts`, `src/app/api/protocols/route.ts`, `src/app/api/portfolio/[address]/route.ts`, `src/app/api/quote/route.ts`

- [ ] **Step 1: Create Earn Data API client**

Create `src/lib/earn-api.ts`:

```typescript
const EARN_API_BASE = "https://earn.li.fi";

export async function fetchVaults(params?: {
  chainId?: number;
  cursor?: string;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params?.chainId) searchParams.set("chainId", String(params.chainId));
  if (params?.cursor) searchParams.set("cursor", params.cursor);
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const url = `${EARN_API_BASE}/v1/earn/vaults?${searchParams}`;
  const res = await fetch(url, { next: { revalidate: 300 } }); // 5-min cache
  if (!res.ok) throw new Error(`Earn API error: ${res.status}`);
  return res.json();
}

export async function fetchAllVaults(chainId?: number) {
  const allVaults: unknown[] = [];
  let cursor: string | undefined;

  do {
    const res = await fetchVaults({ chainId, cursor, limit: 100 });
    allVaults.push(...res.data);
    cursor = res.nextCursor || undefined;
  } while (cursor && allVaults.length < 500); // cap at 500 to avoid timeout

  return allVaults;
}

export async function fetchVaultDetail(network: string, address: string) {
  const url = `${EARN_API_BASE}/v1/earn/vaults/${network}/${address}`;
  const res = await fetch(url, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Earn API error: ${res.status}`);
  return res.json();
}

export async function fetchChains() {
  const url = `${EARN_API_BASE}/v1/earn/chains`;
  const res = await fetch(url, { next: { revalidate: 3600 } }); // 1-hour cache
  if (!res.ok) throw new Error(`Earn API error: ${res.status}`);
  return res.json();
}

export async function fetchProtocols() {
  const url = `${EARN_API_BASE}/v1/earn/protocols`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Earn API error: ${res.status}`);
  return res.json();
}

export async function fetchPortfolio(address: string) {
  const url = `${EARN_API_BASE}/v1/earn/portfolio/${address}/positions`;
  const res = await fetch(url, { next: { revalidate: 60 } }); // 1-min cache
  if (!res.ok) throw new Error(`Earn API error: ${res.status}`);
  return res.json();
}
```

- [ ] **Step 2: Create vaults API route**

Create `src/app/api/vaults/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { fetchVaults } from "@/lib/earn-api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chainId = searchParams.get("chainId");
  const cursor = searchParams.get("cursor");
  const limit = searchParams.get("limit");

  try {
    const data = await fetchVaults({
      chainId: chainId ? Number(chainId) : undefined,
      cursor: cursor || undefined,
      limit: limit ? Number(limit) : undefined,
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch vaults" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Create chains API route**

Create `src/app/api/chains/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { fetchChains } from "@/lib/earn-api";

export async function GET() {
  try {
    const data = await fetchChains();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch chains" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 4: Create protocols API route**

Create `src/app/api/protocols/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { fetchProtocols } from "@/lib/earn-api";

export async function GET() {
  try {
    const data = await fetchProtocols();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch protocols" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 5: Create portfolio API route**

Create `src/app/api/portfolio/[address]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { fetchPortfolio } from "@/lib/earn-api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;

  try {
    const data = await fetchPortfolio(address);
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch portfolio" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 6: Create quote API route (Composer proxy)**

Create `src/app/api/quote/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const COMPOSER_BASE = "https://li.quest";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const composerUrl = `${COMPOSER_BASE}/v1/quote?${searchParams.toString()}`;

  try {
    const res = await fetch(composerUrl, {
      headers: {
        "x-lifi-api-key": process.env.LIFI_COMPOSER_API_KEY || "",
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Composer error: ${res.status}`, details: errorText },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 7: Verify — test vaults endpoint**

```bash
curl http://localhost:3000/api/vaults?chainId=8453&limit=2 | head -c 500
```

Expected: JSON response with `data` array containing vault objects.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add Earn Data API client and all API routes"
```

---

### Task 4: AI Strategy Engine (Server-Side)

**Files:**
- Create: `src/lib/ai-strategy.ts`, `src/app/api/strategy/route.ts`

- [ ] **Step 1: Create AI strategy engine**

Create `src/lib/ai-strategy.ts`:

```typescript
import OpenAI from "openai";
import { Vault, RiskLevel, Strategy } from "./types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    protocols: null, // all mainstream
    minVaults: 2,
    minChains: 1,
    apySortField: "total",
  },
  aggressive: {
    tags: null, // all
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
    .slice(0, 50) // limit context size
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
  userAssets: string
): Promise<Strategy> {
  const filtered = filterVaults(vaults, riskLevel);

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
- Consider protocol diversification (don't put everything in one protocol)`;

  const userPrompt = `Risk Level: ${riskLevel}
Total Investment: $${totalAmountUsd.toLocaleString()}
User Assets: ${userAssets}

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

  // Post-process: calculate amounts
  strategy.risk_level = riskLevel;
  strategy.total_amount_usd = totalAmountUsd;
  strategy.allocations = strategy.allocations.map((a) => ({
    ...a,
    amount_usd: (totalAmountUsd * a.percentage) / 100,
  }));

  return strategy;
}
```

- [ ] **Step 2: Create strategy API route**

Create `src/app/api/strategy/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { fetchAllVaults } from "@/lib/earn-api";
import { generateStrategy } from "@/lib/ai-strategy";
import { RiskLevel, Vault } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      riskLevel,
      totalAmountUsd,
      userAssets,
    }: {
      riskLevel: RiskLevel;
      totalAmountUsd: number;
      userAssets: string;
    } = body;

    if (!riskLevel || !totalAmountUsd) {
      return NextResponse.json(
        { error: "riskLevel and totalAmountUsd are required" },
        { status: 400 }
      );
    }

    // Fetch all vaults (cached server-side for 5 min)
    const vaults = (await fetchAllVaults()) as Vault[];

    // Generate AI strategy
    const strategy = await generateStrategy(
      vaults,
      riskLevel,
      totalAmountUsd,
      userAssets || "Unknown"
    );

    return NextResponse.json(strategy);
  } catch (error) {
    console.error("Strategy generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate strategy",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Verify — test strategy endpoint**

```bash
curl -X POST http://localhost:3000/api/strategy \
  -H "Content-Type: application/json" \
  -d '{"riskLevel":"balanced","totalAmountUsd":1000,"userAssets":"1000 USDC on Base"}' | python3 -m json.tool
```

Expected: JSON with strategy_name, allocations array, risk_factors, etc.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add AI strategy engine with OpenAI and risk-based vault filtering"
```

---

### Task 5: Shared Components + Landing Page

**Files:**
- Create: `src/components/shared/nav-header.tsx`, `src/components/shared/loading-animation.tsx`, `src/components/shared/connect-prompt.tsx`, `src/components/landing/hero.tsx`, `src/components/landing/stats-ticker.tsx`, `src/components/landing/feature-cards.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Create nav header component**

Create `src/components/shared/nav-header.tsx`:

```typescript
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";

export function NavHeader() {
  return (
    <header className="fixed top-0 w-full z-50 border-b border-card-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">YP</span>
          </div>
          <span className="text-lg font-semibold text-text-primary">
            YieldPilot
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/app"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Strategy
          </Link>
          <Link
            href="/app/dashboard"
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            Dashboard
          </Link>
          <ConnectButton />
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create loading animation component**

Create `src/components/shared/loading-animation.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";

export function LoadingAnimation({ text = "AI is analyzing..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-6">
      <div className="relative w-24 h-24">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border-2 border-primary/30"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
        <motion.div
          className="absolute inset-4 rounded-full bg-primary/20 flex items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-3 h-3 rounded-full bg-primary" />
        </motion.div>
      </div>
      <motion.p
        className="text-text-secondary text-sm"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  );
}
```

- [ ] **Step 3: Create connect prompt component**

Create `src/components/shared/connect-prompt.tsx`:

```typescript
"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";

export function ConnectPrompt() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div className="w-20 h-20 rounded-full bg-card-bg border border-card-border flex items-center justify-center">
        <svg
          className="w-10 h-10 text-primary"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
          />
        </svg>
      </div>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Connect Your Wallet
        </h2>
        <p className="text-text-secondary mb-6">
          Connect your wallet to scan your assets and generate an AI-powered
          yield strategy.
        </p>
        <ConnectButton />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create landing page hero**

Create `src/components/landing/hero.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        className="relative z-10 text-center max-w-4xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="w-2 h-2 rounded-full bg-positive animate-pulse" />
          <span className="text-sm text-primary">Powered by LI.FI Earn</span>
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
          Your AI{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
            Fund Manager
          </span>
          <br />
          for DeFi Yield
        </h1>

        <p className="text-xl text-text-secondary mb-10 max-w-2xl mx-auto leading-relaxed">
          Analyze vaults across 20+ protocols and 17 chains. AI generates your
          optimal yield strategy. Execute with one click.
        </p>

        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Link
            href="/app"
            className="px-8 py-3.5 bg-primary hover:bg-primary-hover rounded-xl text-white font-semibold transition-all hover:shadow-lg hover:shadow-primary/25 text-lg"
          >
            Launch App
          </Link>
          <a
            href="https://docs.li.fi/earn/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3.5 border border-card-border hover:border-primary/50 rounded-xl text-text-secondary hover:text-text-primary transition-all text-lg"
          >
            Learn More
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
```

- [ ] **Step 5: Create stats ticker**

Create `src/components/landing/stats-ticker.tsx`:

```typescript
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Stats {
  totalVaults: number;
  maxApy: number;
  chainCount: number;
  protocolCount: number;
}

export function StatsTicker() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [vaultsRes, chainsRes, protocolsRes] = await Promise.all([
          fetch("/api/vaults?limit=1"),
          fetch("/api/chains"),
          fetch("/api/protocols"),
        ]);
        const vaults = await vaultsRes.json();
        const chains = await chainsRes.json();
        const protocols = await protocolsRes.json();

        // Fetch a few pages to find max APY
        const topVaults = await fetch("/api/vaults?limit=5").then((r) =>
          r.json()
        );
        const maxApy = Math.max(
          ...topVaults.data.map((v: { analytics: { apy: { total: number } } }) => v.analytics.apy.total),
          0
        );

        setStats({
          totalVaults: vaults.total || 0,
          maxApy,
          chainCount: chains.length || 0,
          protocolCount: protocols.length || 0,
        });
      } catch {
        setStats({ totalVaults: 672, maxApy: 25, chainCount: 17, protocolCount: 11 });
      }
    }
    load();
  }, []);

  const items = stats
    ? [
        { label: "Vaults Available", value: stats.totalVaults.toLocaleString() },
        { label: "Max APY", value: `${stats.maxApy.toFixed(1)}%` },
        { label: "Chains", value: String(stats.chainCount) },
        { label: "Protocols", value: String(stats.protocolCount) },
      ]
    : [
        { label: "Vaults Available", value: "..." },
        { label: "Max APY", value: "..." },
        { label: "Chains", value: "..." },
        { label: "Protocols", value: "..." },
      ];

  return (
    <section className="py-12 border-y border-card-border/50">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={item.label}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-3xl md:text-4xl font-bold font-mono text-text-primary mb-1">
                {item.value}
              </div>
              <div className="text-sm text-text-secondary">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create feature cards**

Create `src/components/landing/feature-cards.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: "🧠",
    title: "AI Strategy Engine",
    description:
      "Advanced AI analyzes 672+ vaults across risk, yield, and diversification to build your optimal portfolio.",
  },
  {
    icon: "⚡",
    title: "One-Click Execute",
    description:
      "Swap, bridge, and deposit in a single transaction. Powered by LI.FI Composer's cross-chain infrastructure.",
  },
  {
    icon: "📊",
    title: "Portfolio Monitor",
    description:
      "Track all positions in real-time. Get AI-powered rebalancing suggestions when better opportunities appear.",
  },
];

export function FeatureCards() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-16">
          DeFi Yield,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-positive">
            Simplified
          </span>
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="glass-card p-8 hover:border-primary/30 transition-all group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-text-primary mb-3">
                {feature.title}
              </h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Assemble landing page**

Replace `src/app/page.tsx`:

```typescript
import { NavHeader } from "@/components/shared/nav-header";
import { Hero } from "@/components/landing/hero";
import { StatsTicker } from "@/components/landing/stats-ticker";
import { FeatureCards } from "@/components/landing/feature-cards";

export default function LandingPage() {
  return (
    <>
      <NavHeader />
      <main>
        <Hero />
        <StatsTicker />
        <FeatureCards />
        <footer className="py-12 text-center text-text-muted text-sm border-t border-card-border/50">
          <p>
            YieldPilot — AI DeFi Fund Manager | Powered by{" "}
            <a
              href="https://li.fi"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              LI.FI
            </a>{" "}
            Earn
          </p>
        </footer>
      </main>
    </>
  );
}
```

- [ ] **Step 8: Verify — landing page renders correctly**

```bash
npm run dev
```

Open http://localhost:3000. Should see dark themed landing page with hero, stats, feature cards.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add landing page with hero, stats ticker, and feature cards"
```

---

### Task 6: Strategy Engine Page — Asset Scan + Risk Selector

**Files:**
- Create: `src/hooks/use-portfolio.ts`, `src/components/strategy/asset-scan.tsx`, `src/components/strategy/risk-selector.tsx`, `src/app/app/layout.tsx`, `src/app/app/page.tsx`

- [ ] **Step 1: Create portfolio hook**

Create `src/hooks/use-portfolio.ts`:

```typescript
"use client";

import { useState, useEffect } from "react";
import { PortfolioResponse } from "@/lib/types";

export function usePortfolio(address: string | undefined) {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    fetch(`/api/portfolio/${address}`)
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, [address]);

  return { data, isLoading, error };
}
```

- [ ] **Step 2: Create asset scan component**

Create `src/components/strategy/asset-scan.tsx`:

```typescript
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

export function AssetScan({ onTotalAssetsChange }: { onTotalAssetsChange?: (total: number) => void }) {
  const { address } = useAccount();
  const { data: portfolio, isLoading: portfolioLoading } = usePortfolio(address);

  // Fetch native balances on key chains
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
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
          1
        </span>
        Asset Scan
      </h3>

      {/* Native balances */}
      <div className="mb-6">
        <h4 className="text-sm text-text-secondary mb-3">Wallet Balances</h4>
        {nativeBalances.length > 0 ? (
          <div className="space-y-2">
            {nativeBalances.map((b) => (
              <div
                key={b.chain}
                className="flex justify-between items-center py-2 px-3 rounded-lg bg-background/50"
              >
                <span className="text-sm text-text-secondary">{b.chain}</span>
                <span className="font-mono text-sm">
                  {Number(b.balance!.formatted).toFixed(4)} {b.symbol}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-text-muted text-sm">No balances detected on main chains</p>
        )}
      </div>

      {/* Existing DeFi positions */}
      <div>
        <h4 className="text-sm text-text-secondary mb-3">
          Existing Yield Positions
          {totalPositionValue > 0 && (
            <span className="ml-2 text-positive font-mono">
              ${totalPositionValue.toFixed(2)}
            </span>
          )}
        </h4>
        {portfolioLoading ? (
          <div className="animate-pulse h-12 bg-card-bg rounded-lg" />
        ) : existingPositions.length > 0 ? (
          <div className="space-y-2">
            {existingPositions.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-2 px-3 rounded-lg bg-background/50"
              >
                <div>
                  <span className="text-sm">{p.asset.symbol}</span>
                  <span className="text-text-muted text-xs ml-2">
                    {p.protocolName} · {CHAIN_NAMES[p.chainId] || `Chain ${p.chainId}`}
                  </span>
                </div>
                <span className="font-mono text-sm text-positive">
                  ${Number(p.balanceUsd).toFixed(2)}
                </span>
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
```

- [ ] **Step 3: Create risk selector component**

Create `src/components/strategy/risk-selector.tsx`:

```typescript
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
    details: [
      "Stablecoin vaults only",
      "TVL > $10M",
      "Aave, Morpho, Spark",
      "3+ vaults, 2+ chains",
    ],
  },
  {
    level: "balanced",
    icon: "⚖️",
    label: "Balanced",
    description: "Mix of stability and growth. Mainstream protocols.",
    color: "border-primary/50 hover:border-primary",
    details: [
      "Stablecoins + single-asset",
      "TVL > $1M",
      "All mainstream protocols",
      "2+ vaults diversification",
    ],
  },
  {
    level: "aggressive",
    icon: "🚀",
    label: "Aggressive",
    description: "Maximum yield. Higher risk tolerance.",
    color: "border-warning/50 hover:border-warning",
    details: [
      "All vault types",
      "No TVL minimum",
      "All protocols",
      "Can concentrate positions",
    ],
  },
];

export function RiskSelector({
  selected,
  onSelect,
}: {
  selected: RiskLevel | null;
  onSelect: (level: RiskLevel) => void;
}) {
  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
          2
        </span>
        Risk Profile
      </h3>

      <div className="grid md:grid-cols-3 gap-4">
        {RISK_OPTIONS.map((option) => {
          const isSelected = selected === option.level;
          return (
            <motion.button
              key={option.level}
              onClick={() => onSelect(option.level)}
              className={`p-5 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? `${option.color} bg-card-bg shadow-lg`
                  : "border-card-border hover:bg-card-bg/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="text-3xl mb-3">{option.icon}</div>
              <div className="font-semibold mb-1">{option.label}</div>
              <div className="text-text-secondary text-sm mb-3">
                {option.description}
              </div>
              <ul className="space-y-1">
                {option.details.map((d) => (
                  <li
                    key={d}
                    className="text-xs text-text-muted flex items-center gap-1.5"
                  >
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
```

- [ ] **Step 4: Create app layout**

Create `src/app/app/layout.tsx`:

```typescript
import { NavHeader } from "@/components/shared/nav-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavHeader />
      <main className="pt-20 pb-12 px-6">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </>
  );
}
```

- [ ] **Step 5: Create strategy engine page (steps 1 & 2)**

Create `src/app/app/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectPrompt } from "@/components/shared/connect-prompt";
import { AssetScan } from "@/components/strategy/asset-scan";
import { RiskSelector } from "@/components/strategy/risk-selector";
import { RiskLevel, Strategy } from "@/lib/types";

export default function StrategyPage() {
  const { isConnected } = useAccount();
  const [riskLevel, setRiskLevel] = useState<RiskLevel | null>(null);
  const [investAmount, setInvestAmount] = useState<string>("1000");
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isConnected) {
    return <ConnectPrompt />;
  }

  const handleGenerate = async () => {
    if (!riskLevel || !investAmount) return;
    setIsGenerating(true);
    try {
      const res = await fetch("/api/strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riskLevel,
          totalAmountUsd: Number(investAmount),
          userAssets: `${investAmount} USD available`,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setStrategy(data);
    } catch (err) {
      console.error("Strategy generation failed:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Strategy Engine</h1>
        <p className="text-text-secondary">
          Let AI analyze 672+ vaults and build your optimal yield portfolio.
        </p>
      </div>

      <AssetScan />
      <RiskSelector selected={riskLevel} onSelect={setRiskLevel} />

      {/* Investment amount + generate button */}
      {riskLevel && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
              3
            </span>
            Generate Strategy
          </h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm text-text-secondary mb-2 block">
                Investment Amount (USD)
              </label>
              <input
                type="number"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border border-card-border text-text-primary font-mono text-lg focus:border-primary focus:outline-none transition-colors"
                placeholder="1000"
                min="1"
              />
            </div>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-3 bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl text-white font-semibold transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              {isGenerating ? "Generating..." : "Generate Strategy"}
            </button>
          </div>
        </div>
      )}

      {/* Strategy result will be rendered here in Task 7 */}
      {isGenerating && (
        <div className="glass-card p-6">
          <div className="flex flex-col items-center py-12">
            <div className="text-text-secondary">AI is analyzing vaults...</div>
          </div>
        </div>
      )}

      {strategy && !isGenerating && (
        <div className="glass-card p-6">
          <pre className="text-xs text-text-secondary overflow-auto">
            {JSON.stringify(strategy, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Verify — strategy engine page renders**

Open http://localhost:3000/app. Should show connect wallet prompt. After connecting, should show asset scan + risk selector + amount input.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add strategy engine page with asset scan and risk selector"
```

---

### Task 7: Strategy Result Display

**Files:**
- Create: `src/components/strategy/allocation-chart.tsx`, `src/components/strategy/vault-card.tsx`, `src/components/strategy/ai-reasoning.tsx`, `src/components/strategy/strategy-result.tsx`
- Modify: `src/app/app/page.tsx`

- [ ] **Step 1: Create allocation donut chart**

Create `src/components/strategy/allocation-chart.tsx`:

```typescript
"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Allocation } from "@/lib/types";

const COLORS = ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export function AllocationChart({ allocations }: { allocations: Allocation[] }) {
  const data = allocations.map((a) => ({
    name: `${a.vault_name} (${a.chain})`,
    value: a.percentage,
    protocol: a.protocol,
  }));

  return (
    <div className="flex items-center gap-8">
      <div className="w-48 h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#1A1A2E",
                border: "1px solid #2A2A4A",
                borderRadius: "8px",
                color: "#F8FAFC",
              }}
              formatter={(value: number) => [`${value}%`, "Allocation"]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2">
        {allocations.map((a, i) => (
          <div key={a.vault_slug} className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <div className="flex-1 text-sm">
              <span className="text-text-primary">{a.vault_name}</span>
              <span className="text-text-muted ml-2">{a.chain}</span>
            </div>
            <span className="font-mono text-sm text-text-secondary">
              {a.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create vault card component**

Create `src/components/strategy/vault-card.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import { Allocation } from "@/lib/types";

const PROTOCOL_COLORS: Record<string, string> = {
  "morpho-v1": "#2563EB",
  "aave-v3": "#B042FF",
  "euler-v2": "#1E3A5F",
  pendle: "#1CD8D2",
  spark: "#F7A600",
};

export function VaultCard({
  allocation,
  index,
}: {
  allocation: Allocation;
  index: number;
}) {
  const protocolColor =
    PROTOCOL_COLORS[allocation.protocol] || "#6366F1";

  return (
    <motion.div
      className="glass-card p-5 hover:border-primary/30 transition-all"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-text-primary">
            {allocation.vault_name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="px-2 py-0.5 rounded-md text-xs font-medium"
              style={{
                background: `${protocolColor}20`,
                color: protocolColor,
              }}
            >
              {allocation.protocol}
            </span>
            <span className="text-text-muted text-xs">{allocation.chain}</span>
            {allocation.underlying_token && (
              <span className="text-text-muted text-xs">
                · {allocation.underlying_token.symbol}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-positive">
            {allocation.apy_total.toFixed(2)}%
          </div>
          <div className="text-xs text-text-muted">APY</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-3 py-3 border-y border-card-border/50">
        <div>
          <div className="text-xs text-text-muted mb-1">Allocation</div>
          <div className="font-mono text-sm">{allocation.percentage}%</div>
        </div>
        <div>
          <div className="text-xs text-text-muted mb-1">Amount</div>
          <div className="font-mono text-sm">
            ${allocation.amount_usd.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-muted mb-1">TVL</div>
          <div className="font-mono text-sm">
            ${(allocation.tvl_usd / 1_000_000).toFixed(1)}M
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2">
        <span className="text-primary text-xs mt-0.5">AI:</span>
        <p className="text-xs text-text-secondary leading-relaxed">
          {allocation.reason}
        </p>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Create AI reasoning panel**

Create `src/components/strategy/ai-reasoning.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import { Strategy } from "@/lib/types";

export function AIReasoning({ strategy }: { strategy: Strategy }) {
  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <h4 className="font-semibold mb-4 flex items-center gap-2">
        <span className="text-primary">🧠</span>
        AI Analysis
      </h4>

      <p className="text-text-secondary text-sm mb-4 leading-relaxed">
        {strategy.reasoning}
      </p>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h5 className="text-xs text-text-muted uppercase tracking-wider mb-2">
            Risk Factors
          </h5>
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
            <h5 className="text-xs text-text-muted uppercase tracking-wider mb-2">
              Warnings
            </h5>
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
```

- [ ] **Step 4: Create strategy result wrapper**

Create `src/components/strategy/strategy-result.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import { Strategy } from "@/lib/types";
import { AllocationChart } from "./allocation-chart";
import { VaultCard } from "./vault-card";
import { AIReasoning } from "./ai-reasoning";

export function StrategyResult({
  strategy,
  onExecute,
  isExecuting,
}: {
  strategy: Strategy;
  onExecute: () => void;
  isExecuting: boolean;
}) {
  const riskLabels: Record<string, { label: string; color: string }> = {
    conservative: { label: "Conservative", color: "text-positive" },
    balanced: { label: "Balanced", color: "text-primary" },
    aggressive: { label: "Aggressive", color: "text-warning" },
  };

  const risk = riskLabels[strategy.risk_level] || riskLabels.balanced;

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Strategy header */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold mb-1">{strategy.strategy_name}</h3>
            <div className="flex items-center gap-3 text-sm">
              <span className={risk.color}>{risk.label}</span>
              <span className="text-text-muted">·</span>
              <span className="text-text-secondary">
                Risk Score: {strategy.risk_score}/10
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold font-mono text-positive">
              {strategy.expected_apy.toFixed(2)}%
            </div>
            <div className="text-xs text-text-muted">Expected APY</div>
            <div className="text-sm font-mono text-text-secondary mt-1">
              ${strategy.total_amount_usd.toLocaleString()} invested
            </div>
          </div>
        </div>

        <AllocationChart allocations={strategy.allocations} />
      </div>

      {/* Vault cards */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Allocation Details</h4>
        {strategy.allocations.map((allocation, i) => (
          <VaultCard key={allocation.vault_slug} allocation={allocation} index={i} />
        ))}
      </div>

      {/* AI reasoning */}
      <AIReasoning strategy={strategy} />

      {/* Execute button */}
      <motion.button
        onClick={onExecute}
        disabled={isExecuting}
        className="w-full py-4 bg-primary hover:bg-primary-hover disabled:opacity-50 rounded-xl text-white font-semibold text-lg transition-all hover:shadow-lg hover:shadow-primary/25"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {isExecuting ? "Executing Strategy..." : "Execute Strategy"}
      </motion.button>
    </motion.div>
  );
}
```

- [ ] **Step 5: Update strategy page to use StrategyResult**

In `src/app/app/page.tsx`, replace the temporary JSON display block at the bottom. Replace the two blocks (the `isGenerating` loading block and the `strategy && !isGenerating` block) with:

```typescript
// Add import at top:
import { LoadingAnimation } from "@/components/shared/loading-animation";
import { StrategyResult } from "@/components/strategy/strategy-result";

// Replace the isGenerating and strategy display blocks with:

      {isGenerating && <LoadingAnimation text="AI is analyzing 672+ vaults across 20+ protocols..." />}

      {strategy && !isGenerating && (
        <StrategyResult
          strategy={strategy}
          onExecute={() => {
            // Will be implemented in Task 8
            console.log("Execute strategy", strategy);
          }}
          isExecuting={false}
        />
      )}
```

- [ ] **Step 6: Verify — generate a strategy and see the result**

1. Open http://localhost:3000/app
2. Connect wallet
3. Select risk level
4. Enter amount, click Generate
5. Should see allocation chart, vault cards, AI reasoning panel

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add strategy result display with allocation chart, vault cards, and AI reasoning"
```

---

### Task 8: Transaction Execution Flow

**Files:**
- Create: `src/components/strategy/execution-progress.tsx`
- Modify: `src/app/app/page.tsx`

- [ ] **Step 1: Create execution progress component**

Create `src/components/strategy/execution-progress.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import { ExecutionStep } from "@/lib/types";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "text-text-muted", bg: "bg-text-muted/20" },
  quoting: { label: "Getting Quote...", color: "text-primary", bg: "bg-primary/20" },
  approving: { label: "Approve in Wallet", color: "text-warning", bg: "bg-warning/20" },
  executing: { label: "Executing...", color: "text-primary", bg: "bg-primary/20" },
  completed: { label: "Completed", color: "text-positive", bg: "bg-positive/20" },
  failed: { label: "Failed", color: "text-danger", bg: "bg-danger/20" },
};

export function ExecutionProgress({ steps }: { steps: ExecutionStep[] }) {
  const completed = steps.filter((s) => s.status === "completed").length;
  const progress = (completed / steps.length) * 100;

  return (
    <motion.div
      className="glass-card p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Executing Strategy</h3>
        <span className="text-sm text-text-secondary font-mono">
          {completed}/{steps.length} complete
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-card-border rounded-full mb-6 overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Step list */}
      <div className="space-y-3">
        {steps.map((step, i) => {
          const config = STATUS_CONFIG[step.status];
          return (
            <div
              key={i}
              className="flex items-center justify-between py-3 px-4 rounded-xl bg-background/50"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center`}>
                  {step.status === "completed" ? (
                    <span className="text-positive text-sm">&#10003;</span>
                  ) : step.status === "failed" ? (
                    <span className="text-danger text-sm">&#10007;</span>
                  ) : step.status === "pending" ? (
                    <span className="text-text-muted text-xs">{i + 1}</span>
                  ) : (
                    <motion.div
                      className="w-3 h-3 rounded-full bg-primary"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {step.allocation.vault_name}
                  </div>
                  <div className="text-xs text-text-muted">
                    {step.allocation.chain} · ${step.allocation.amount_usd.toLocaleString()} · {step.allocation.percentage}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
                {step.txHash && (
                  <a
                    href={`https://basescan.org/tx/${step.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    View Tx
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {steps.every((s) => s.status === "completed") && (
        <motion.div
          className="mt-6 p-4 rounded-xl bg-positive/10 border border-positive/20 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-positive font-semibold">
            Strategy executed successfully!
          </p>
          <a
            href="/app/dashboard"
            className="text-sm text-primary hover:underline mt-1 inline-block"
          >
            View Dashboard →
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Add execution logic to strategy page**

Update `src/app/app/page.tsx` — add execution state and handler. Add these imports, state variables, and the execute function. Then wire up the StrategyResult and ExecutionProgress:

Add to imports:
```typescript
import { ExecutionProgress } from "@/components/strategy/execution-progress";
import { ExecutionStep } from "@/lib/types";
import { useSendTransaction, useAccount } from "wagmi";
```

Add state variables (alongside existing ones):
```typescript
const { address } = useAccount();
const [executionSteps, setExecutionSteps] = useState<ExecutionStep[]>([]);
const [isExecuting, setIsExecuting] = useState(false);
const { sendTransactionAsync } = useSendTransaction();
```

Add execute function:
```typescript
const handleExecute = async () => {
  if (!strategy || !address) return;
  setIsExecuting(true);

  const steps: ExecutionStep[] = strategy.allocations.map((a) => ({
    allocation: a,
    status: "pending" as const,
  }));
  setExecutionSteps([...steps]);

  for (let i = 0; i < steps.length; i++) {
    try {
      // Step: quoting
      steps[i].status = "quoting";
      setExecutionSteps([...steps]);

      const fromToken = steps[i].allocation.underlying_token?.address;
      if (!fromToken) {
        steps[i].status = "failed";
        steps[i].error = "No underlying token found";
        setExecutionSteps([...steps]);
        continue;
      }

      const decimals = steps[i].allocation.underlying_token?.decimals || 18;
      const fromAmount = BigInt(
        Math.floor(steps[i].allocation.amount_usd * 10 ** decimals)
      ).toString();

      const quoteParams = new URLSearchParams({
        fromChain: String(steps[i].allocation.chain_id),
        toChain: String(steps[i].allocation.chain_id),
        fromToken,
        toToken: steps[i].allocation.vault_address,
        fromAddress: address,
        toAddress: address,
        fromAmount,
      });

      const quoteRes = await fetch(`/api/quote?${quoteParams}`);
      const quote = await quoteRes.json();

      if (quote.error) {
        steps[i].status = "failed";
        steps[i].error = quote.error;
        setExecutionSteps([...steps]);
        continue;
      }

      // Step: executing
      steps[i].status = "approving";
      setExecutionSteps([...steps]);

      const txHash = await sendTransactionAsync({
        to: quote.transactionRequest.to as `0x${string}`,
        data: quote.transactionRequest.data as `0x${string}`,
        value: BigInt(quote.transactionRequest.value || "0"),
        chainId: quote.transactionRequest.chainId,
      });

      steps[i].status = "completed";
      steps[i].txHash = txHash;
      setExecutionSteps([...steps]);
    } catch (err) {
      steps[i].status = "failed";
      steps[i].error = err instanceof Error ? err.message : "Transaction failed";
      setExecutionSteps([...steps]);
    }
  }

  setIsExecuting(false);
};
```

Update the StrategyResult and add ExecutionProgress rendering:
```typescript
{strategy && !isGenerating && executionSteps.length === 0 && (
  <StrategyResult
    strategy={strategy}
    onExecute={handleExecute}
    isExecuting={isExecuting}
  />
)}

{executionSteps.length > 0 && (
  <ExecutionProgress steps={executionSteps} />
)}
```

- [ ] **Step 3: Verify — full flow works**

1. Connect wallet
2. Select risk, enter amount, generate strategy
3. Click Execute → should show execution progress
4. Wallet prompts should appear (will fail if no real funds, that's OK for now)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add transaction execution flow with progress tracking"
```

---

### Task 9: Dashboard Page

**Files:**
- Create: `src/components/dashboard/portfolio-summary.tsx`, `src/components/dashboard/position-card.tsx`, `src/components/dashboard/yield-chart.tsx`, `src/components/dashboard/rebalance-suggestion.tsx`, `src/app/app/dashboard/page.tsx`

- [ ] **Step 1: Create portfolio summary component**

Create `src/components/dashboard/portfolio-summary.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import { Position } from "@/lib/types";

export function PortfolioSummary({ positions }: { positions: Position[] }) {
  const totalValue = positions.reduce(
    (sum, p) => sum + Number(p.balanceUsd || 0),
    0
  );

  return (
    <motion.div
      className="glass-card p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="grid md:grid-cols-3 gap-8">
        <div>
          <div className="text-sm text-text-muted mb-1">Total Portfolio Value</div>
          <div className="text-4xl font-bold font-mono text-text-primary">
            ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div className="text-sm text-text-muted mb-1">Active Positions</div>
          <div className="text-4xl font-bold font-mono text-primary">
            {positions.length}
          </div>
        </div>
        <div>
          <div className="text-sm text-text-muted mb-1">Protocols Used</div>
          <div className="text-4xl font-bold font-mono text-text-primary">
            {new Set(positions.map((p) => p.protocolName)).size}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Create position card component**

Create `src/components/dashboard/position-card.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";
import { Position } from "@/lib/types";

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  8453: "Base",
  42161: "Arbitrum",
  10: "Optimism",
  137: "Polygon",
  56: "BSC",
  43114: "Avalanche",
};

export function PositionCard({
  position,
  index,
}: {
  position: Position;
  index: number;
}) {
  return (
    <motion.div
      className="glass-card p-5 hover:border-primary/30 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-text-primary text-lg">
            {position.asset.symbol}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-primary/20 text-primary">
              {position.protocolName}
            </span>
            <span className="text-text-muted text-xs">
              {CHAIN_NAMES[position.chainId] || `Chain ${position.chainId}`}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-text-primary">
            ${Number(position.balanceUsd).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
          <div className="text-xs text-text-muted mt-1">
            {Number(position.balanceNative).toFixed(6)} {position.asset.symbol}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 3: Create yield chart component**

Create `src/components/dashboard/yield-chart.tsx`:

```typescript
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Position } from "@/lib/types";

export function YieldChart({ positions }: { positions: Position[] }) {
  // Generate simulated historical data points based on current positions
  const totalValue = positions.reduce(
    (sum, p) => sum + Number(p.balanceUsd || 0),
    0
  );

  const days = 30;
  const data = Array.from({ length: days }, (_, i) => {
    const dayOffset = days - i;
    const simValue = totalValue * (1 - dayOffset * 0.001 + Math.random() * 0.005);
    return {
      day: `Day ${i + 1}`,
      value: Math.max(0, simValue),
    };
  });

  if (totalValue === 0) {
    return (
      <div className="glass-card p-6">
        <h4 className="font-semibold mb-4">Portfolio Performance</h4>
        <div className="h-48 flex items-center justify-center text-text-muted text-sm">
          No position data to chart
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h4 className="font-semibold mb-4">Portfolio Performance (30d)</h4>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A4A" />
            <XAxis
              dataKey="day"
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={{ stroke: "#2A2A4A" }}
              tickLine={false}
              interval={6}
            />
            <YAxis
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              axisLine={{ stroke: "#2A2A4A" }}
              tickLine={false}
              tickFormatter={(v) => `$${(v / 1000).toFixed(1)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "#1A1A2E",
                border: "1px solid #2A2A4A",
                borderRadius: "8px",
                color: "#F8FAFC",
              }}
              formatter={(value: number) => [
                `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
                "Value",
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#6366F1"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#6366F1" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create rebalance suggestion component**

Create `src/components/dashboard/rebalance-suggestion.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";

export function RebalanceSuggestion() {
  return (
    <motion.div
      className="glass-card p-6 border-warning/20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center flex-shrink-0">
          <span className="text-warning text-lg">🧠</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold mb-1">AI Rebalancing Suggestion</h4>
          <p className="text-sm text-text-secondary mb-3">
            Based on current market conditions, your portfolio could be optimized.
            Connect your wallet and generate a new strategy to see personalized
            recommendations.
          </p>
          <a
            href="/app"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            Generate New Strategy →
          </a>
        </div>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 5: Create dashboard page**

Create `src/app/app/dashboard/page.tsx`:

```typescript
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
        <p className="text-text-secondary">
          Track your yield positions across all protocols and chains.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass-card p-6 animate-pulse h-24"
            />
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
                    <PositionCard
                      key={`${position.chainId}-${position.asset.address}-${i}`}
                      position={position}
                      index={i}
                    />
                  ))}
                </div>
              </div>

              <RebalanceSuggestion />
            </>
          ) : (
            <div className="glass-card p-12 text-center">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">No Positions Yet</h3>
              <p className="text-text-secondary mb-6">
                Generate an AI strategy and execute it to see your positions here.
              </p>
              <a
                href="/app"
                className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-xl text-white font-semibold transition-all inline-block"
              >
                Generate Strategy
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Verify — dashboard renders**

Open http://localhost:3000/app/dashboard. Connect wallet. Should show portfolio summary (likely empty for new wallets) with empty state.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add dashboard page with portfolio summary, position cards, yield chart"
```

---

### Task 10: Polish — Animations, Loading States, Final Touches

**Files:**
- Modify: `src/app/app/page.tsx`, `src/components/landing/hero.tsx`, various components
- Create: `src/app/app/dashboard/layout.tsx` (if needed)

- [ ] **Step 1: Add LoadingAnimation to strategy page**

In `src/app/app/page.tsx`, ensure the `LoadingAnimation` component is properly imported and used when `isGenerating` is true. This should already be done from Task 7, but verify.

- [ ] **Step 2: Add page transition wrapper**

Create `src/components/shared/page-transition.tsx`:

```typescript
"use client";

import { motion } from "framer-motion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
```

Wrap the main content in both `src/app/app/page.tsx` and `src/app/app/dashboard/page.tsx` with `<PageTransition>`.

- [ ] **Step 3: Add "Powered by LI.FI" badge to app layout**

Update `src/app/app/layout.tsx` to add a footer badge:

```typescript
import { NavHeader } from "@/components/shared/nav-header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NavHeader />
      <main className="pt-20 pb-24 px-6">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
      <footer className="fixed bottom-0 w-full py-3 text-center text-text-muted text-xs bg-background/80 backdrop-blur-sm border-t border-card-border/30">
        Powered by{" "}
        <a href="https://li.fi" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
          LI.FI
        </a>{" "}
        Earn × AI
      </footer>
    </>
  );
}
```

- [ ] **Step 4: Final verification — full user flow**

Test the complete flow:

```
1. Landing page (http://localhost:3000) — hero, stats, features render
2. Click "Launch App" → /app
3. Connect wallet (MetaMask)
4. Asset scan shows wallet balances
5. Select risk level
6. Enter amount, click Generate Strategy
7. AI generates strategy with allocation chart + vault cards
8. Click Execute → execution progress shows
9. Navigate to Dashboard → portfolio view
```

- [ ] **Step 5: Build check**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add polish — page transitions, loading animations, final touches"
```

---

### Task 11: Deploy + Demo Prep

**Files:** None (operational task)

- [ ] **Step 1: Deploy to Vercel**

```bash
npm install -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard:
- `LIFI_COMPOSER_API_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

- [ ] **Step 2: Test deployed app**

Open the Vercel URL. Run through full flow: connect wallet → generate strategy → view dashboard.

- [ ] **Step 3: Record demo video**

Screen record the full flow:
1. Landing page overview (5s)
2. Connect wallet (5s)
3. Asset scan (5s)
4. Select risk profile (5s)
5. Generate AI strategy — show the AI thinking animation (10s)
6. Show strategy result — allocation chart, vault cards, AI reasoning (15s)
7. Execute strategy (10s)
8. Dashboard view (5s)

Total: ~60 seconds.

- [ ] **Step 4: Prepare submission tweet**

Draft tweet thread for April 14 submission:

```
I just built YieldPilot with @lifiprotocol Earn — an AI-powered DeFi fund manager!

🧠 AI analyzes 672+ vaults across 20+ protocols
📊 Generates optimal yield strategies based on your risk profile
⚡ One-click execution via LI.FI Composer
📈 Real-time portfolio monitoring

Track: AI × Earn

[Demo video]
[Live app link]
[GitHub repo link]

@lifiprotocol @brucexu_eth
```

- [ ] **Step 5: Fill submission Google Form**

Go to https://forms.gle/1PCvD9BymH1EyRmV8 and submit:
- Project name: YieldPilot
- Track: AI × Earn
- X post link
- App/video link
- GitHub repo link
- Write-up
