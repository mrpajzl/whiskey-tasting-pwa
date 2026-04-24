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
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    if (args.groupId) {
      const membership = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_and_user", (q) => q.eq("groupId", args.groupId!).eq("userId", args.userId))
        .first();

      if (!membership) {
        throw new Error("Do této skupiny nepatříš.");
      }
    }

    return await ctx.db.insert("tastingSessions", {
      name: args.name,
      hostName: args.hostName,
      sessionDate: args.sessionDate,
      location: args.location,
      notes: args.notes,
      groupId: args.groupId,
      status: "active",
      createdBy: args.userId,
      createdAt: Date.now(),
    });
  },
});

export const listSessionsForUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const ownSessions = await ctx.db
      .query("tastingSessions")
      .withIndex("by_created_by", (q) => q.eq("createdBy", args.userId))
      .order("desc")
      .collect();

    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const groupSessionsNested = await Promise.all(
      memberships.map((membership) =>
        ctx.db
          .query("tastingSessions")
          .filter((q) => q.eq(q.field("groupId"), membership.groupId))
          .collect()
      )
    );

    const sessionMap = new Map<string, any>();
    [...ownSessions, ...groupSessionsNested.flat()].forEach((session) => {
      sessionMap.set(session._id, session);
    });

    const sessions = [...sessionMap.values()].sort((a, b) => b.sessionDate - a.sessionDate);

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

        const group = session.groupId ? await ctx.db.get(session.groupId) : null;
        const groupName = group && "name" in group ? group.name : undefined;

        return {
          ...session,
          groupName,
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

    const group = session.groupId ? await ctx.db.get(session.groupId) : null;
    const groupName = group && "name" in group ? group.name : undefined;

    return {
      ...session,
      groupName,
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

export const updateSession = mutation({
  args: {
    sessionId: v.id("tastingSessions"),
    userId: v.id("users"),
    name: v.string(),
    sessionDate: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    groupId: v.optional(v.id("groups")),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) throw new Error("Session nenalezena.");
    if (session.createdBy !== args.userId) {
      throw new Error("Upravovat session může jen autor.");
    }

    if (args.groupId) {
      const membership = await ctx.db
        .query("groupMembers")
        .withIndex("by_group_and_user", (q) => q.eq("groupId", args.groupId!).eq("userId", args.userId))
        .first();

      if (!membership) {
        throw new Error("Do této skupiny nepatříš.");
      }
    }

    await ctx.db.patch(args.sessionId, {
      name: args.name,
      sessionDate: args.sessionDate,
      location: args.location,
      notes: args.notes,
      groupId: args.groupId,
    });
  },
});
