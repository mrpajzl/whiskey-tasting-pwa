import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
    memberEmails: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      description: args.description,
      createdBy: args.userId,
      createdAt: Date.now(),
    });

    await ctx.db.insert("groupMembers", {
      groupId,
      userId: args.userId,
      role: "admin",
      joinedAt: Date.now(),
    });

    const emails = [...new Set((args.memberEmails ?? []).map((email) => email.trim().toLowerCase()).filter(Boolean))];

    for (const email of emails) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (user && user._id !== args.userId) {
        const existing = await ctx.db
          .query("groupMembers")
          .withIndex("by_group_and_user", (q) => q.eq("groupId", groupId).eq("userId", user._id))
          .first();

        if (!existing) {
          await ctx.db.insert("groupMembers", {
            groupId,
            userId: user._id,
            role: "member",
            joinedAt: Date.now(),
          });
        }
      }
    }

    return groupId;
  },
});

export const getUserGroups = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const memberships = await ctx.db
      .query("groupMembers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const groups = await Promise.all(
      memberships.map(async (membership) => {
        const group = await ctx.db.get(membership.groupId);
        if (!group) return null;

        const members = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", group._id))
          .collect();

        const memberUsers = await Promise.all(members.map((member) => ctx.db.get(member.userId)));

        return {
          ...group,
          role: membership.role,
          memberCount: members.length,
          members: memberUsers.filter(Boolean).map((member) => ({
            _id: member!._id,
            name: member!.name,
            email: member!.email,
          })),
        };
      })
    );

    return groups.filter(Boolean);
  },
});
