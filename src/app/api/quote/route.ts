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
