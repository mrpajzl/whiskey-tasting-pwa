import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createSession = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    sessionDate: v.number(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if user is a member of the group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!membership) {
      throw new Error("You must be a member of the group to create a session");
    }

    return await ctx.db.insert("tastingSessions", {
      groupId: args.groupId,
      name: args.name,
      description: args.description,
      location: args.location,
      sessionDate: args.sessionDate,
      createdBy: args.userId,
      createdAt: Date.now(),
      status: "upcoming",
    });
  },
});

export const getGroupSessions = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("tastingSessions")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .order("desc")
      .collect();

    return await Promise.all(
      sessions.map(async (session) => {
        const creator = await ctx.db.get(session.createdBy);
        const bottlesCount = await ctx.db
          .query("bottles")
          .withIndex("by_session", (q) => q.eq("sessionId", session._id))
          .collect();

        return {
          ...session,
          creator,
          bottlesCount: bottlesCount.length,
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

    const bottles = await ctx.db
      .query("bottles")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    const bottlesWithRatings = await Promise.all(
      bottles.map(async (bottle) => {
        const ratings = await ctx.db
          .query("ratings")
          .withIndex("by_bottle", (q) => q.eq("bottleId", bottle._id))
          .collect();

        const avgRating =
          ratings.length > 0
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : null;

        return {
          ...bottle,
          ratingsCount: ratings.length,
          avgRating,
        };
      })
    );

    const creator = await ctx.db.get(session.createdBy);

    return {
      ...session,
      creator,
      bottles: bottlesWithRatings,
    };
  },
});

export const updateSessionStatus = mutation({
  args: {
    sessionId: v.id("tastingSessions"),
    status: v.union(
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, {
      status: args.status,
    });
  },
});
