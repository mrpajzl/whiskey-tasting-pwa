import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const normalize = (value: string) => value.trim().toLowerCase();

export const searchCatalog = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const q = normalize(args.query);
    if (q.length < 2) {
      return { distilleries: [], bottles: [] };
    }

    const distilleries = await ctx.db.query("distilleries").collect();
    const bottles = await ctx.db.query("catalogBottles").collect();

    return {
      distilleries: distilleries
        .filter((item) => item.nameLower.includes(q))
        .slice(0, 6),
      bottles: bottles
        .filter(
          (item) =>
            item.nameLower.includes(q) ||
            item.distilleryLower.includes(q)
        )
        .slice(0, 8),
    };
  },
});

export const learnFromBottle = mutation({
  args: {
    name: v.string(),
    distillery: v.optional(v.string()),
    category: v.optional(v.string()),
    region: v.optional(v.string()),
    age: v.optional(v.number()),
    abv: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const distilleryName = args.distillery?.trim();
    let distilleryId = undefined;

    if (distilleryName) {
      const distilleryLower = normalize(distilleryName);
      const existingDistillery = await ctx.db
        .query("distilleries")
        .withIndex("by_name_lower", (q) => q.eq("nameLower", distilleryLower))
        .first();

      distilleryId = existingDistillery?._id;

      if (!existingDistillery) {
        distilleryId = await ctx.db.insert("distilleries", {
          name: distilleryName,
          nameLower: distilleryLower,
          region: args.region,
          country: undefined,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      } else {
        await ctx.db.patch(existingDistillery._id, {
          region: args.region ?? existingDistillery.region,
          updatedAt: Date.now(),
        });
      }
    }

    const nameLower = normalize(args.name);
    const distilleryLower = normalize(args.distillery ?? "");

    const existingBottle = await ctx.db
      .query("catalogBottles")
      .withIndex("by_name_lower", (q) => q.eq("nameLower", nameLower))
      .collect();

    const matchedBottle = existingBottle.find(
      (item) => item.distilleryLower === distilleryLower
    );

    const payload = {
      name: args.name.trim(),
      nameLower,
      distillery: args.distillery?.trim(),
      distilleryLower,
      distilleryId,
      category: args.category,
      region: args.region,
      age: args.age,
      abv: args.abv,
      notes: args.notes,
      updatedAt: Date.now(),
    };

    if (matchedBottle) {
      await ctx.db.patch(matchedBottle._id, payload);
      return matchedBottle._id;
    }

    return await ctx.db.insert("catalogBottles", {
      ...payload,
      createdAt: Date.now(),
    });
  },
});
