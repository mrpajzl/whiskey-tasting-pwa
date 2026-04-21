import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createSession = mutation({
  args: {
    name: v.string(),
    hostName: v.string(),
    sessionDate: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tastingSessions", {
      name: args.name,
      hostName: args.hostName,
      sessionDate: args.sessionDate,
      location: args.location,
      notes: args.notes,
      status: "active",
      createdBy: args.userId,
      createdAt: Date.now(),
    });
  },
});

export const listSessionsForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("tastingSessions")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.userId))
      .order("desc")
      .collect();

    return await Promise.all(
      sessions.map(async (session) => {
        const bottles = await ctx.db
          .query("bottles")
          .withIndex("by_session", (q) => q.eq("sessionId", session._id))
          .collect();

        const ratings = await ctx.db
          .query("ratings")
          .withIndex("by_session", (q) => q.eq("sessionId", session._id))
          .collect();

        return {
          ...session,
          bottleCount: bottles.length,
          ratingCount: ratings.length,
          averageOverall:
            ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + (rating.overall ?? rating.score ?? 0), 0) / ratings.length
              : null,
        };
      })
    );
  },
});

export const getSession = query({
  args: { sessionId: v.id("tastingSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return null;

    const bottles = (await ctx.db
      .query("bottles")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect()).sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.createdAt - b.createdAt);

    const bottlesWithRatings = await Promise.all(
      bottles.map(async (bottle) => {
        const ratings = await ctx.db
          .query("ratings")
          .withIndex("by_bottle", (q) => q.eq("bottleId", bottle._id))
          .collect();

        return {
          ...bottle,
          ratingCount: ratings.length,
          averageOverall:
            ratings.length > 0
              ? ratings.reduce((sum, rating) => sum + (rating.overall ?? rating.score ?? 0), 0) / ratings.length
              : null,
        };
      })
    );

    return {
      ...session,
      notes: session.notes ?? session.description,
      bottles: bottlesWithRatings,
    };
  },
});

export const updateSessionStatus = mutation({
  args: {
    sessionId: v.id("tastingSessions"),
    status: v.union(v.literal("draft"), v.literal("active"), v.literal("completed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, { status: args.status });
  },
});
