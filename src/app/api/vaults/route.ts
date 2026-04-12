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
