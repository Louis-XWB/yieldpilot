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
