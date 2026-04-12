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
