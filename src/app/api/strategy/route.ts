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
