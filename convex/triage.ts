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

const SYSTEM_PROMPT = `You are a clinical triage analyst at a hospital front desk. You read a transcript of a multilingual voice intake — a patient describing why they are here, plus an agent's follow-up questions — and you produce a structured triage classification for the desk nurse.

The voice agent screens for these red flags up front; any of them in the transcript almost always means tier "urgent":
- chest pain (especially severe, crushing, radiating to arm/jaw)
- trouble breathing / shortness of breath
- signs of stroke: face drooping, arm weakness, slurred speech, sudden confusion
- heavy or uncontrolled bleeding
- fainting, loss of consciousness, seizure
- severe allergic reaction (anaphylaxis, swelling of face/throat)
- severe head injury, suspected heart attack, suicidal ideation with intent

If none of the red flags are present, the agent walks the patient through the OPQRST framework: Onset, Provocation/Palliation, Quality, Radiation, Severity (1–10), Time. Read the transcript through that lens.

Tier definitions:
- "urgent" — any red flag above, OR severity 8+/10 with rapid worsening, OR cluster of symptoms suggesting a serious condition (e.g. high fever + stiff neck + confusion → possible meningitis; persistent cough + breathing difficulty + multi-week duration → possible bacterial superinfection).
- "standard" — significant but stable. Moderate pain (4–7/10), persistent fever, ongoing infections, minor injuries, nausea/vomiting without dehydration, urinary symptoms, mild-to-moderate asthma, skin conditions needing assessment, anything where the patient is uncomfortable but not deteriorating.
- "self-care" — minor concerns suitable for a walk-in clinic. Mild cold/flu, minor cuts, routine refills, mild aches, mild rashes, severity ≤3/10 with no red flags.

Output rules:
- Pick exactly one tier.
- Write 3–5 summary bullets in ENGLISH, regardless of the transcript's language. The desk nurse reads these from 3 feet away on a tablet — every bullet must add clinical signal. Cover:
  • chief complaint (what brought them in)
  • duration and onset (when it started, sudden vs gradual)
  • severity and pattern (1–10 score if given, constant vs intermittent, what makes it better/worse)
  • red-flag findings or negative red-flag findings ("no chest pain reported")
  • relevant clinical context if mentioned (meds, allergies, prior episodes)
- If a key field is missing from the transcript, say so explicitly in a bullet (e.g. "severity not stated") rather than omitting it. The nurse needs to know what the agent didn't capture.
- When in doubt between two tiers, escalate to the higher one. A patient flagged urgent who turns out to be fine is acceptable; a patient flagged self-care who is in crisis is not.
- Do not diagnose. Describe what the patient said and what it clinically suggests, not what the diagnosis is.
- Lowercase, terse, clinical. No filler words ("the patient reports that..."). Lead with the finding.`;

// Graceful fallback when the LLM call fails — patient still enters the
// queue at standard tier with a clear "needs human review" summary so the
// desk nurse knows to read the raw transcript and override.
function fallbackClassification(language: string) {
  return {
    tier: "standard" as const,
    summary: [
      "ai classifier unavailable — manual review required",
      `transcript captured in ${language}; raw text saved for nurse review`,
      "default tier set to standard; override after reading transcript",
    ],
  };
}

export const classifyAndCreate = action({
  args: {
    transcript: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args): Promise<{ shortCode: string }> => {
    let classification: z.infer<typeof classificationSchema>;
    try {
      const { object } = await generateObject({
        model: openai("gpt-4.1-mini"),
        system: SYSTEM_PROMPT,
        schema: classificationSchema,
        prompt: `Transcript language: ${args.language}\n\nTranscript:\n${args.transcript}`,
      });
      classification = object;
      console.log("[triage] classified", {
        tier: object.tier,
        language: args.language,
        transcriptChars: args.transcript.length,
      });
    } catch (err) {
      console.error("[triage] llm_failure, falling back", err);
      classification = fallbackClassification(args.language);
    }

    const ai = {
      tier: classification.tier,
      summary: classification.summary,
      ...TIER_DEFAULTS[classification.tier],
    };

    const { shortCode } = await ctx.runMutation(api.intakes.create, {
      transcript: args.transcript,
      language: args.language,
      ai,
    });

    return { shortCode };
  },
});
