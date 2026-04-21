import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addBottle = mutation({
  args: {
    sessionId: v.id("tastingSessions"),
    name: v.string(),
    distillery: v.optional(v.string()),
    category: v.optional(v.string()),
    region: v.optional(v.string()),
    age: v.optional(v.number()),
    abv: v.optional(v.number()),
    notes: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("bottles")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return await ctx.db.insert("bottles", {
      sessionId: args.sessionId,
      name: args.name,
      distillery: args.distillery,
      category: args.category,
      region: args.region,
      age: args.age,
      abv: args.abv,
      notes: args.notes,
      order: existing.length,
      addedBy: args.userId,
      createdAt: Date.now(),
    });
  },
});

export const getBottle = query({
  args: { bottleId: v.id("bottles") },
  handler: async (ctx, args) => {
    const bottle = await ctx.db.get(args.bottleId);
    if (!bottle) return null;

    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_bottle", (q) => q.eq("bottleId", args.bottleId))
      .collect();

    return {
      ...bottle,
      ratings,
      averageOverall:
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating.overall, 0) / ratings.length
          : null,
    };
  },
});
