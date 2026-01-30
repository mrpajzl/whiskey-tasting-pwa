import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const addBottle = mutation({
  args: {
    sessionId: v.id("tastingSessions"),
    name: v.string(),
    distillery: v.string(),
    age: v.optional(v.number()),
    type: v.string(),
    region: v.optional(v.string()),
    abv: v.optional(v.number()),
    caskType: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId, ...bottleData } = args;

    return await ctx.db.insert("bottles", {
      ...bottleData,
      addedBy: userId,
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

    const ratingsWithUsers = await Promise.all(
      ratings.map(async (rating) => {
        const user = await ctx.db.get(rating.userId);
        return {
          ...rating,
          user,
        };
      })
    );

    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
        : null;

    return {
      ...bottle,
      ratings: ratingsWithUsers,
      avgRating,
    };
  },
});

export const updateBottle = mutation({
  args: {
    bottleId: v.id("bottles"),
    name: v.optional(v.string()),
    distillery: v.optional(v.string()),
    age: v.optional(v.number()),
    type: v.optional(v.string()),
    region: v.optional(v.string()),
    abv: v.optional(v.number()),
    caskType: v.optional(v.string()),
    description: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { bottleId, ...updates } = args;
    await ctx.db.patch(bottleId, updates);
  },
});

export const deleteBottle = mutation({
  args: { bottleId: v.id("bottles") },
  handler: async (ctx, args) => {
    // Delete all ratings for this bottle
    const ratings = await ctx.db
      .query("ratings")
      .withIndex("by_bottle", (q) => q.eq("bottleId", args.bottleId))
      .collect();

    await Promise.all(ratings.map((rating) => ctx.db.delete(rating._id)));

    // Delete the bottle
    await ctx.db.delete(args.bottleId);
  },
});
