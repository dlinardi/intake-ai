import { z } from "zod";

export const triageSchema = z.object({
  tier: z.enum(["urgent", "standard", "self-care"]),
  summary: z.array(z.string()).min(2).max(5),
  language: z.string(),
  suggested_next_step: z.string(),
  estimated_wait: z.string(),
});

export type Triage = z.infer<typeof triageSchema>;

export const triageRequestSchema = z.object({
  transcript: z.string().min(1),
  language: z.string().min(1),
});

export type TriageRequest = z.infer<typeof triageRequestSchema>;
