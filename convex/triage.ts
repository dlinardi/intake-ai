import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

// TODO: wire up — uncomment when the OpenAI call body is implemented.
// OPENAI_API_KEY must be set on Convex (via `npx convex env set OPENAI_API_KEY <value>`),
// not just in Next's .env.local — Convex actions run on Convex's runtime.
// import { openai } from "@ai-sdk/openai";
// import { generateObject } from "ai";
// import { triageSchema } from "../lib/triage-schema";

export const classifyAndCreate = action({
  args: {
    transcript: v.string(),
    language: v.string(),
  },
  handler: async (ctx, args): Promise<{ shortCode: string }> => {
    // TODO: wire up — replace this placeholder with a real generateObject call.
    //
    // const { object } = await generateObject({
    //   model: openai("gpt-4.1-mini"), // or gpt-4o, gpt-4.1 — pick what's available
    //   schema: triageSchema,
    //   prompt: buildTriagePrompt(args.transcript, args.language),
    // });
    //
    // const ai = object;

    const ai = {
      tier: "standard" as const,
      summary: [
        `patient described symptoms in ${args.language}`,
        "raw transcript saved for clinician review",
        "no critical keywords detected by placeholder classifier",
      ],
      suggested_next_step:
        "register at the front desk for triage nurse evaluation",
      estimated_wait: "~45 min",
    };

    const { shortCode } = await ctx.runMutation(api.intakes.create, {
      transcript: args.transcript,
      language: args.language,
      ai,
    });

    return { shortCode };
  },
});
