import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const tierValidator = v.union(
  v.literal("urgent"),
  v.literal("standard"),
  v.literal("self-care"),
);

export const statusValidator = v.union(
  v.literal("waiting"),
  v.literal("in-progress"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const aiValidator = v.object({
  tier: tierValidator,
  summary: v.array(v.string()),
  suggested_next_step: v.string(),
  estimated_wait: v.string(),
});

export default defineSchema({
  intakes: defineTable({
    shortCode: v.string(),
    transcript: v.string(),
    language: v.string(),
    ai: aiValidator,
    override: v.optional(
      v.object({
        tier: v.optional(tierValidator),
        note: v.optional(v.string()),
        by: v.string(),
        at: v.number(),
      }),
    ),
    status: statusValidator,
  })
    .index("by_shortCode", ["shortCode"])
    .index("by_status", ["status"]),
});
