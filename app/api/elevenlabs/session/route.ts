import { NextResponse } from "next/server";

const ELEVENLABS_SIGNED_URL_ENDPOINT =
  "https://api.elevenlabs.io/v1/convai/conversation/get-signed-url";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId = process.env.ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    return NextResponse.json(
      { error: "missing_elevenlabs_config" },
      { status: 500 },
    );
  }

  const url = new URL(ELEVENLABS_SIGNED_URL_ENDPOINT);
  url.searchParams.set("agent_id", agentId);

  const response = await fetch(url, {
    headers: {
      "xi-api-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "signed_url_request_failed" },
      { status: 502 },
    );
  }

  const data = (await response.json()) as { signed_url?: unknown };

  if (typeof data.signed_url !== "string") {
    return NextResponse.json(
      { error: "invalid_signed_url_response" },
      { status: 502 },
    );
  }

  return NextResponse.json({ signedUrl: data.signed_url });
}
