import { NextResponse } from "next/server";
import { triageRequestSchema } from "@/lib/triage-schema";

// TODO: wire up — import once the AI call body lands
// import { anthropic } from "@ai-sdk/anthropic";
// import { generateObject } from "ai";
// import { triageSchema } from "@/lib/triage-schema";

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = triageRequestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { transcript, language } = parsed.data;

  // TODO: wire up
  // const { object } = await generateObject({
  //   model: anthropic("claude-sonnet-4-6"),
  //   schema: triageSchema,
  //   prompt: buildTriagePrompt(transcript, language),
  // });
  // return NextResponse.json(object);

  return NextResponse.json(
    {
      error: "not_implemented",
      received: { transcript_chars: transcript.length, language },
    },
    { status: 501 },
  );
}
