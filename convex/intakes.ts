import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { tierValidator, statusValidator, aiValidator } from "./schema";

type Tier = "urgent" | "standard" | "self-care";

const TIERS: readonly Tier[] = ["urgent", "standard", "self-care"];

// No 0/O/I/1 — confusion-free at a glance.
const SHORTCODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateShortCode(): string {
  let s = "";
  for (let i = 0; i < 4; i++) {
    s += SHORTCODE_ALPHABET[Math.floor(Math.random() * SHORTCODE_ALPHABET.length)];
  }
  return `PT-${s}`;
}

export function effectiveTier(intake: Doc<"intakes">): Tier {
  return (intake.override?.tier ?? intake.ai.tier) as Tier;
}

function tierPriority(t: Tier): number {
  return TIERS.indexOf(t);
}

export const create = mutation({
  args: {
    transcript: v.string(),
    language: v.string(),
    ai: aiValidator,
  },
  handler: async (ctx, args) => {
    let shortCode = generateShortCode();
    for (let i = 0; i < 5; i++) {
      const existing = await ctx.db
        .query("intakes")
        .withIndex("by_shortCode", (q) => q.eq("shortCode", shortCode))
        .first();
      if (!existing) break;
      shortCode = generateShortCode();
    }

    const id = await ctx.db.insert("intakes", {
      shortCode,
      transcript: args.transcript,
      language: args.language,
      ai: args.ai,
      status: "waiting",
    });

    return { id, shortCode };
  },
});

export const getByShortCode = query({
  args: { shortCode: v.string() },
  handler: async (ctx, args) => {
    const intake = await ctx.db
      .query("intakes")
      .withIndex("by_shortCode", (q) => q.eq("shortCode", args.shortCode))
      .first();

    if (!intake) return null;

    const waiting = await ctx.db
      .query("intakes")
      .withIndex("by_status", (q) => q.eq("status", "waiting"))
      .collect();

    const sorted = waiting.sort((a, b) => {
      const dt = tierPriority(effectiveTier(a)) - tierPriority(effectiveTier(b));
      return dt !== 0 ? dt : a._creationTime - b._creationTime;
    });

    const positionIndex = sorted.findIndex((i) => i._id === intake._id);
    const position = positionIndex === -1 ? null : positionIndex + 1;
    const ahead = positionIndex === -1 ? 0 : positionIndex;

    return {
      intake,
      position,
      ahead,
      effectiveTier: effectiveTier(intake),
    };
  },
});

export const listForAdmin = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("intakes").collect();
    return all
      .map((i) => ({ ...i, effectiveTier: effectiveTier(i) }))
      .sort((a, b) => {
        const aActive =
          a.status === "waiting" || a.status === "in-progress" ? 0 : 1;
        const bActive =
          b.status === "waiting" || b.status === "in-progress" ? 0 : 1;
        if (aActive !== bActive) return aActive - bActive;
        const dt =
          tierPriority(a.effectiveTier as Tier) -
          tierPriority(b.effectiveTier as Tier);
        if (dt !== 0) return dt;
        return a._creationTime - b._creationTime;
      });
  },
});

export const overrideIntake = mutation({
  args: {
    id: v.id("intakes"),
    tier: v.optional(tierValidator),
    note: v.optional(v.string()),
    by: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.id);
    if (!existing) throw new Error("intake_not_found");

    await ctx.db.patch(args.id, {
      override: {
        tier: args.tier,
        note: args.note,
        by: args.by,
        at: Date.now(),
      },
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("intakes"),
    status: statusValidator,
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
