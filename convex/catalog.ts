import { mutation, query, type MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { scotchBottles, scotchDistilleries } from "./catalogSeedData";
import type { Id } from "./_generated/dataModel";

const normalize = (value: string) => value.trim().toLowerCase();

const upsertDistillery = async (
  ctx: MutationCtx,
  distillery: { name: string; region?: string; country?: string }
) => {
  const name = distillery.name.trim();
  const nameLower = normalize(name);
  const existing = await ctx.db
    .query("distilleries")
    .withIndex("by_name_lower", (q) => q.eq("nameLower", nameLower))
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      region: distillery.region ?? existing.region,
      country: distillery.country ?? existing.country,
      updatedAt: Date.now(),
    });
    return existing._id;
  }

  return await ctx.db.insert("distilleries", {
    name,
    nameLower,
    region: distillery.region,
    country: distillery.country,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
};

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
      distilleryId = await upsertDistillery(ctx, {
        name: distilleryName,
        region: args.region,
      });
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

export const seedScotchCatalog = mutation({
  args: {
    reset: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.reset) {
      for (const distillery of await ctx.db.query("distilleries").collect()) {
        await ctx.db.delete(distillery._id);
      }
      for (const bottle of await ctx.db.query("catalogBottles").collect()) {
        await ctx.db.delete(bottle._id);
      }
    }

    const distilleryIds = new Map<string, Id<"distilleries">>();

    for (const distillery of scotchDistilleries) {
      const id = await upsertDistillery(ctx, distillery);
      distilleryIds.set(distillery.name, id);
    }

    let inserted = 0;
    let updated = 0;

    for (const bottle of scotchBottles) {
      const nameLower = normalize(bottle.name);
      const distilleryLower = normalize(bottle.distillery);
      const existingMatches = await ctx.db
        .query("catalogBottles")
        .withIndex("by_name_lower", (q) => q.eq("nameLower", nameLower))
        .collect();
      const existing = existingMatches.find(
        (item) => item.distilleryLower === distilleryLower
      );

      const payload = {
        name: bottle.name,
        nameLower,
        distillery: bottle.distillery,
        distilleryLower,
        distilleryId: distilleryIds.get(bottle.distillery),
        category: bottle.category,
        region: bottle.region,
        age: bottle.age,
        abv: bottle.abv,
        notes: bottle.notes
          ? `${bottle.notes} · Source: ${bottle.source}`
          : `Source: ${bottle.source}`,
        updatedAt: Date.now(),
      };

      if (existing) {
        await ctx.db.patch(existing._id, payload);
        updated += 1;
      } else {
        await ctx.db.insert("catalogBottles", {
          ...payload,
          createdAt: Date.now(),
        });
        inserted += 1;
      }
    }

    return {
      distilleries: scotchDistilleries.length,
      inserted,
      updated,
      totalBottles: scotchBottles.length,
    };
  },
});

export const catalogStats = query({
  args: {},
  handler: async (ctx) => ({
    distilleries: (await ctx.db.query("distilleries").collect()).length,
    bottles: (await ctx.db.query("catalogBottles").collect()).length,
  }),
});
