import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addOrUpdateRating = mutation({
  args: {
    bottleId: v.id("bottles"),
    userId: v.id("users"),
    sessionId: v.id("tastingSessions"),
    score: v.number(),
    nose: v.optional(v.string()),
    palate: v.optional(v.string()),
    finish: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate score (0-10 with 0.5 increments)
    if (args.score < 0 || args.score > 10 || (args.score * 2) % 1 !== 0) {
      throw new Error("Score must be between 0 and 10 with 0.5 increments");
    }

    // Check if rating already exists
    const existingRating = await ctx.db
      .query("ratings")
      .withIndex("by_bottle_and_user", (q) =>
        q.eq("bottleId", args.bottleId).eq("userId", args.userId)
      )
      .first();

    const now = Date.now();

    if (existingRating) {
      await ctx.db.patch(existingRating._id, {
        score: args.score,
        nose: args.nose,
        palate: args.palate,
        finish: args.finish,
        notes: args.notes,
        updatedAt: now,
      });
      return existingRating._id;
    }

    return await ctx.db.insert("ratings", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const getUserRating = query({
  args: {
    bottleId: v.id("bottles"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("ratings")
      .withIndex("by_bottle_and_user", (q) =>
        q.eq("bottleId", args.bottleId).eq("userId", args.userId)
      )
      .first();
  },
});

export const getSessionRatings = query({
  args: { sessionId: v.id("tastingSessions") },
  handler: async (ctx, args) => {
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    return await Promise.all(
      ratings.map(async (rating) => {
        const user = await ctx.db.get(rating.userId);
        const bottle = await ctx.db.get(rating.bottleId);
        return {
          ...rating,
          user,
          bottle,
        };
      })
    );
  },
});

export const deleteRating = mutation({
  args: { ratingId: v.id("ratings") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.ratingId);
  },
});
