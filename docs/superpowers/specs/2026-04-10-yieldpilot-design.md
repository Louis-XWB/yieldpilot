# YieldPilot — AI DeFi Fund Manager

**Track**: AI x Earn
**Hackathon**: DeFi Mullet Hackathon #1 (LI.FI)
**Deadline**: April 14, 2026

## Overview

YieldPilot is an AI-powered DeFi fund manager. Users connect their wallet, set a risk preference, and the AI analyzes 672+ vaults across 20+ protocols and 60+ chains to generate an optimal yield strategy — then executes it in one click via LI.FI Composer.

**One-line pitch**: Your private AI fund manager for DeFi yield.

## Judging Alignment

| Criteria (Weight) | How We Score |
|---|---|
| API Integration (35%) | Uses ALL Earn Data API endpoints (vaults, chains, protocols, portfolio) + Composer quote/execute. Pagination, filtering, full data utilization. |
| Innovation (25%) | AI strategy engine with risk modeling, portfolio theory, transparent reasoning — not a chatbot. |
| Product Completeness (20%) | 3 complete pages: Landing, Strategy Engine, Dashboard. Full flow from connect → analyze → execute → monitor. |
| Presentation (20%) | Bloomberg-meets-Vercel dark UI, smooth animations, professional financial aesthetic. |

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS + shadcn/ui + Framer Motion
- **Wallet**: wagmi v2 + RainbowKit
- **Charts**: Recharts
- **AI**: Claude API (claude-sonnet-4-6 for speed)
- **APIs**: LI.FI Earn Data API (earn.li.fi, no auth) + LI.FI Composer (li.quest, API key)

## Architecture

```
Frontend (Next.js 14)
├── Landing Page
├── Strategy Engine (core)
└── Dashboard
        │
        ├── API Routes (Next.js)
        │   ├── /api/strategy — calls Claude + Earn Data API, returns strategy
        │   ├── /api/vaults — proxy to Earn Data API
        │   └── /api/quote — proxy to Composer (protects API key)
        │
        ├── LI.FI Earn Data API (earn.li.fi, no auth)
        │   ├── GET /v1/earn/vaults — vault discovery
        │   ├── GET /v1/earn/vaults/:network/:address — vault detail
        │   ├── GET /v1/earn/chains — supported chains
        │   ├── GET /v1/earn/protocols — supported protocols
        │   └── GET /v1/earn/portfolio/:addr/positions — user positions
        │
        ├── LI.FI Composer (li.quest, API key required)
        │   └── GET /v1/quote — build transaction
        │
        └── Claude API
            └── Strategy generation with structured output
```

## Pages

### Page 1: Landing Page

Dark theme brand page. Single screen:
- Hero: "Your AI Fund Manager for DeFi Yield"
- Live stats ticker: total vaults, highest APY, supported chains count
- "Launch App" CTA button
- Brief feature highlights (3 cards: AI Strategy, One-Click Execute, Portfolio Monitor)

### Page 2: Strategy Engine (Core Page)

Three-step flow after wallet connection:

**Step 1 — Asset Scan**
- Auto-detect wallet balances (via wagmi)
- Fetch existing DeFi positions via `/v1/earn/portfolio/:addr/positions`
- Display: assets by chain, current yield positions

**Step 2 — Risk Profile**
- Three-tier selector: Conservative / Balanced / Aggressive
- Visual indicators showing what each means

**Step 3 — AI Strategy Generation**
- AI analyzes vault data + user context, generates portfolio allocation
- Display:
  - Portfolio allocation donut chart
  - Vault cards with: protocol, chain, APY breakdown (base + reward), TVL, risk score, AI reasoning
  - Transparent AI reasoning panel ("Why these vaults?")
  - Expected annualized return summary
  - Risk factors and warnings
- User can adjust allocations → AI recalculates
- "Execute Strategy" button → Composer builds transactions → sequential execution with progress bar

### Page 3: Dashboard

Post-deposit monitoring:
- Total portfolio value + cumulative earnings
- Position cards (real-time APY, current value per vault)
- Yield trend line chart
- AI rebalancing suggestions (when APY drops or better opportunities appear)
- One-click redeem per position

## AI Strategy Engine

### Input Data

```
1. User wallet assets (balances, chains)
2. User existing DeFi positions (from portfolio API)
3. User risk preference (conservative/balanced/aggressive)
4. Vault universe (from Earn Data API):
   - APY: base, reward, total, 1d/7d/30d trends
   - TVL (USD)
   - Protocol (morpho-v1, aave-v3, euler-v2, etc.)
   - Tags (stablecoin, single, multi, il-risk)
   - Chain
   - isTransactional flag
```

### Output (Structured JSON)

```json
{
  "strategy_name": "Steady Growth Portfolio",
  "risk_score": 3,
  "expected_apy": 6.2,
  "reasoning": "Based on your balanced risk preference, selected 3 high-TVL stablecoin vaults...",
  "allocations": [
    {
      "vault_slug": "8453-0xbeef...",
      "vault_name": "STEAKUSDC",
      "chain": "Base",
      "protocol": "morpho-v1",
      "percentage": 40,
      "apy_total": 3.77,
      "tvl_usd": 270595698,
      "reason": "Morpho USDC on Base — highest TVL, stable APY, blue-chip protocol"
    }
  ],
  "risk_factors": ["Diversified across 3 protocols", "Spread across 3 chains"],
  "warnings": ["wstETH allocation has price volatility risk"]
}
```

### Risk-Level Filtering Rules

| Dimension | Conservative | Balanced | Aggressive |
|---|---|---|---|
| Tags | stablecoin only | stablecoin + single | all |
| Min TVL | $10M+ | $1M+ | no limit |
| Protocols | Aave, Morpho, Spark only | mainstream | all |
| Diversification | >=3 vaults, >=2 chains | >=2 vaults | can concentrate |
| APY preference | Stability (use 30d avg) | balanced | highest first |

### Transparency

Every allocation shows:
- "Why this vault" — per-vault reasoning
- "Risk factors" — explicit risk disclosure
- "Warnings" — special attention items

## UI Design

### Color Palette

| Role | Color | Hex |
|---|---|---|
| Background (deep) | Near-black | #0A0A0F |
| Background (card) | Dark blue-gray | #1A1A2E |
| Primary accent | Indigo | #6366F1 |
| Positive/yield | Emerald | #10B981 |
| Warning/risk | Amber | #F59E0B |
| Text primary | White | #F8FAFC |
| Text secondary | Slate | #94A3B8 |

### Design Language

- Dark theme throughout
- Glassmorphism cards with subtle border glow
- Monospace font for numbers (terminal feel)
- Key data has pulse/breathing animations
- Framer Motion page transitions
- "AI thinking" particle/wave animation during strategy generation
- APY numbers with real-time tick effect

### Aesthetic Reference

Bloomberg Terminal data density + Vercel Dashboard design quality + subtle cyberpunk tech feel. Professional and refined, not flashy.

## LI.FI API Integration Map

| Feature | API Endpoint | Service |
|---|---|---|
| Vault discovery & filtering | GET /v1/earn/vaults | Earn Data API |
| Vault detail | GET /v1/earn/vaults/:network/:address | Earn Data API |
| Supported chains list | GET /v1/earn/chains | Earn Data API |
| Supported protocols list | GET /v1/earn/protocols | Earn Data API |
| User positions | GET /v1/earn/portfolio/:addr/positions | Earn Data API |
| Build deposit tx | GET /v1/quote | Composer |
| Build redeem tx | GET /v1/quote | Composer |

All 7 endpoints used. This maximizes the API Integration score (35%).

## Key Technical Decisions

1. **API keys server-side only** — Composer API key and Claude API key stay in Next.js API routes, never exposed to client
2. **Vault data caching** — Cache vault list for 5 minutes to avoid hitting 100 req/min rate limit
3. **Sequential execution** — When strategy has multiple vaults, execute Composer transactions one at a time with progress feedback
4. **Handle null APY** — apy7d and apy.reward can be null, always fallback
5. **TVL is string** — Parse analytics.tvl.usd from string to number
6. **Pagination** — Use nextCursor to fetch full vault universe for AI analysis
7. **isTransactional check** — Only include vaults where isTransactional === true

## Out of Scope (4-day constraint)

- No backend database (all state from wallet + API)
- No user accounts or auth
- No actual auto-rebalancing execution (show suggestions only)
- No historical performance tracking (show current state only)
- No mobile-responsive optimization (desktop-first)
