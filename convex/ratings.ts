import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const clamp = (value: number) => {
  if (value < 0 || value > 5 || !Number.isInteger(value)) {
    throw new Error("Rating fields must be whole numbers from 0 to 5");
  }
  return value;
};

export const addOrUpdateRating = mutation({
  args: {
    bottleId: v.id("bottles"),
    userId: v.id("users"),
    sessionId: v.id("tastingSessions"),
    overall: v.number(),
    sweetness: v.number(),
    smoke: v.number(),
    fruit: v.number(),
    spice: v.number(),
    body: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    clamp(args.overall);
    clamp(args.sweetness);
    clamp(args.smoke);
    clamp(args.fruit);
    clamp(args.spice);
    clamp(args.body);

    const existingRating = await ctx.db
      .query("ratings")
      .withIndex("by_bottle_and_user", (q) =>
        q.eq("bottleId", args.bottleId).eq("userId", args.userId)
      )
      .first();

    const now = Date.now();

    if (existingRating) {
      await ctx.db.patch(existingRating._id, {
        overall: args.overall,
        sweetness: args.sweetness,
        smoke: args.smoke,
        fruit: args.fruit,
        spice: args.spice,
        body: args.body,
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
