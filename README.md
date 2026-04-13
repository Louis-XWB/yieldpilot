# YieldPilot — AI DeFi Fund Manager

> Your private AI fund manager for DeFi yield. Powered by [LI.FI](https://li.fi/) Earn.

**Live App:** https://yieldpilot-mu.vercel.app/

**Demo Video:** https://www.youtube.com/watch?v=F6ZplAliL4U

**Hackathon:** DeFi Mullet Hackathon #1 | **Track:** AI x Earn

[![YieldPilot Demo](https://img.youtube.com/vi/F6ZplAliL4U/hqdefault.jpg)](https://www.youtube.com/watch?v=F6ZplAliL4U)

---

## What is YieldPilot?

YieldPilot is an AI-powered DeFi fund manager that analyzes 672+ vaults across 20+ protocols and 17 chains, generates optimal yield strategies based on your risk profile, and executes deposits with one click via LI.FI Composer.

Users see a simple 3-step flow. The AI handles the complexity behind the scenes — analyzing APY trends, TVL, protocol risk, and diversification to build a portfolio tailored to your preferences.

## Features

- **AI Strategy Engine** — Analyzes vault data (APY, TVL, protocol, tags) and generates risk-adjusted portfolio allocations with transparent reasoning
- **Risk Profiles** — Conservative / Balanced / Aggressive with different filtering rules for TVL, protocols, diversification, and APY preferences
- **One-Click Execution** — LI.FI Composer handles swap + bridge + deposit in a single transaction
- **Portfolio Dashboard** — Real-time tracking of all yield positions across protocols and chains
- **Chain-Aware** — Prioritizes vaults on user's current chain to minimize cross-chain fees

## How It Works

```
1. Connect Wallet    → Auto-scan assets + existing DeFi positions
2. Select Risk       → Conservative / Balanced / Aggressive
3. Generate Strategy → AI analyzes 672+ vaults, outputs allocation plan
4. Execute           → Composer builds transactions, user signs once per vault
5. Monitor           → Dashboard tracks positions + AI suggests rebalancing
```

## LI.FI Earn API Integration

YieldPilot uses **all 7 LI.FI Earn endpoints**:

| Feature | Endpoint | Service |
|---------|----------|---------|
| Vault discovery + filtering | `GET /v1/earn/vaults` | Earn Data API |
| Vault detail | `GET /v1/earn/vaults/:network/:address` | Earn Data API |
| Supported chains | `GET /v1/earn/chains` | Earn Data API |
| Supported protocols | `GET /v1/earn/protocols` | Earn Data API |
| User positions | `GET /v1/earn/portfolio/:addr/positions` | Earn Data API |
| Build deposit tx | `GET /v1/quote` | Composer |
| Build redeem tx | `GET /v1/quote` | Composer |

## Tech Stack

- **Framework:** Next.js 14 (App Router, TypeScript)
- **AI:** OpenAI GPT-4o-mini (strategy engine)
- **DeFi:** LI.FI Earn Data API + LI.FI Composer
- **Wallet:** wagmi v2 + RainbowKit
- **UI:** Tailwind CSS + shadcn/ui + Framer Motion
- **Charts:** Recharts
- **Deploy:** Vercel

## Architecture

```
Frontend (Next.js 14)
├── Landing Page          — Brand page with live vault stats
├── Strategy Engine       — Asset scan → Risk select → AI strategy → Execute
└── Dashboard             — Portfolio monitoring + rebalance suggestions
        │
        ├── API Routes (server-side, protects API keys)
        │   ├── /api/vaults      → earn.li.fi (no auth)
        │   ├── /api/chains      → earn.li.fi (no auth)
        │   ├── /api/protocols   → earn.li.fi (no auth)
        │   ├── /api/portfolio   → earn.li.fi (no auth)
        │   ├── /api/strategy    → OpenAI + Earn Data API
        │   └── /api/quote       → li.quest (API key server-side)
        │
        ├── LI.FI Earn Data API (earn.li.fi)
        ├── LI.FI Composer (li.quest)
        └── OpenAI API
```

## Getting Started

```bash
# Clone
git clone https://github.com/Louis-XWB/yieldpilot.git
cd yieldpilot

# Install
npm install

# Configure
cp .env.example .env.local
# Edit .env.local with your API keys:
#   LIFI_COMPOSER_API_KEY=   (from https://portal.li.fi/)
#   OPENAI_API_KEY=          (from OpenAI)
#   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo

# Run
npm run dev
```

Open http://localhost:3000

## AI Strategy Engine

The AI doesn't just sort by APY. It applies risk-based filtering rules:

| Dimension | Conservative | Balanced | Aggressive |
|-----------|-------------|----------|------------|
| Tags | Stablecoin only | Stablecoin + single | All |
| Min TVL | $10M+ | $1M+ | No limit |
| Protocols | Aave, Morpho, Spark | Mainstream | All |
| Diversification | 3+ vaults, 2+ chains | 2+ vaults | Can concentrate |
| APY preference | Stability (30d avg) | Balanced | Highest first |

Every allocation includes:
- Per-vault reasoning ("why this vault")
- Risk factors and warnings
- Transparent AI analysis

---

Built for [DeFi Mullet Hackathon #1](https://lifi.notion.site/defi-mullet-hackathon-1-builder-edition) by [LI.FI](https://li.fi/)
