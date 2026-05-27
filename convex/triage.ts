import { v } from "convex/values";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// Static defaults per tier — wait time and next-step are hospital policy, not
// LLM judgment. Keeps demo output consistent across runs.
const TIER_DEFAULTS: Record<
  "urgent" | "standard" | "self-care",
  { estimated_wait: string; suggested_next_step: string }
> = {
  urgent: {
    estimated_wait: "under 15 min",
    suggested_next_step: "send directly to the ER nurse",
  },
  standard: {
    estimated_wait: "~45 min",
    suggested_next_step:
      "register at the front desk for triage nurse evaluation",
  },
  "self-care": {
    estimated_wait: "walk-in clinic",
    suggested_next_step: "redirect to the walk-in clinic",
  },
};

// LLM only picks tier + writes summary. Static fields are added in code.
const classificationSchema = z.object({
  tier: z.enum(["urgent", "standard", "self-care"]),
  summary: z.array(z.string()).min(2).max(5),
});

const SYSTEM_PROMPT = `You are a clinical triage analyst at a hospital front desk. You read a transcript of a patient describing their symptoms — possibly in a non-English language — and classify the visit into one of three tiers.

Tier definitions:
- "urgent" — signs of life-threatening or rapidly worsening condition. Examples: chest pain, difficulty breathing, severe bleeding, signs of stroke (facial droop, slurred speech, one-sided weakness), signs of heart attack, head injury with confusion or loss of consciousness, suspected sepsis, severe abdominal pain with rigid abdomen, severe allergic reaction, suicidal ideation with intent or plan, severe burn, seizure.
- "standard" — significant but stable. Examples: moderate pain, persistent fever, ongoing infections, minor injuries, nausea/vomiting without dehydration, urinary symptoms, mild-to-moderate asthma, skin conditions needing assessment.
- "self-care" — minor concerns suitable for a walk-in clinic. Examples: mild cold/flu symptoms, minor cuts and scrapes, routine medication refills, mild aches, mild rashes.

Output rules:
- Pick exactly one tier.
- Write a 2–5 bullet "summary" in ENGLISH regardless of the transcript's language. Each bullet captures one detail: location/severity of pain, duration, key clinical signals, relevant medications or allergies. Be specific and concise — no fluff, no fillers.
- When in doubt between two tiers, escalate to the higher one. A patient flagged urgent who turns out to be fine is acceptable; a patient flagged self-care who is in crisis is not.
- Do not diagnose. Describe what the patient said.`;

export const classifyAndCreate = action({
  args: {
    transcript: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args): Promise<{ shortCode: string }> => {
    const { object } = await generateObject({
      model: openai("gpt-4.1-mini"),
      system: SYSTEM_PROMPT,
      schema: classificationSchema,
      prompt: `Transcript language: ${args.language}\n\nTranscript:\n${args.transcript}`,
    });

    console.log("[triage] classified", {
      tier: object.tier,
      language: args.language,
      transcriptChars: args.transcript.length,
    });

    const ai = {
      tier: object.tier,
      summary: object.summary,
      ...TIER_DEFAULTS[object.tier],
    };

    const { shortCode } = await ctx.runMutation(api.intakes.create, {
      transcript: args.transcript,
      language: args.language,
      ai,
    });

    return { shortCode };
  },
});
