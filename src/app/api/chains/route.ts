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
