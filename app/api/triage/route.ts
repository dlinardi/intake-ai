import { NextResponse } from "next/server";
import OpenAI from "openai";
import { triageSchema, triageRequestSchema } from "@/lib/triage-schema";

const client = new OpenAI(); // reads OPENAI_API_KEY from env automatically

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

  const completion = await client.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a triage nurse assistant. Given a patient intake conversation transcript, return a JSON object with exactly these fields:
- tier: one of "urgent", "standard", or "self-care"
- summary: array of 3-5 concise English bullet strings describing the patient's symptoms
- language: the language the patient spoke in
- estimated_wait: "<15 min" for urgent, "~45 min" for standard, "walk-in clinic" for self-care
- suggested_next_step: one sentence instruction for the front desk staff

Tier guide: urgent = severe or life-threatening, standard = needs evaluation soon, self-care = minor.
Always write the output in English regardless of the input language.`,
      },
      {
        role: "user",
        content: `Language spoken by patient: ${language}\n\nTranscript:\n${transcript}`,
      },
    ],
  });

  const raw = JSON.parse(completion.choices[0].message.content ?? "{}");
  const result = triageSchema.safeParse(raw);

  if (!result.success) {
    return NextResponse.json(
      { error: "invalid_ai_response", issues: result.error.issues },
      { status: 502 },
    );
  }

  return NextResponse.json(result.data);
}
