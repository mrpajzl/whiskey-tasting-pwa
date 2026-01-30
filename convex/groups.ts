import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const groupId = await ctx.db.insert("groups", {
      name: args.name,
      description: args.description,
      createdBy: args.userId,
      createdAt: Date.now(),
    });

    // Add creator as admin
    await ctx.db.insert("groupMembers", {
      groupId,
      userId: args.userId,
      role: "admin",
      joinedAt: Date.now(),
    });

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

        const memberCount = await ctx.db
          .query("groupMembers")
          .withIndex("by_group", (q) => q.eq("groupId", membership.groupId))
          .collect();

        return {
          ...group,
          role: membership.role,
          memberCount: memberCount.length,
        };
      })
    );

    return groups.filter((g) => g !== null);
  },
});

export const getGroup = query({
  args: { groupId: v.id("groups") },
  handler: async (ctx, args) => {
    const group = await ctx.db.get(args.groupId);
    if (!group) return null;

    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    const membersWithDetails = await Promise.all(
      members.map(async (member) => {
        const user = await ctx.db.get(member.userId);
        return {
          ...member,
          user,
        };
      })
    );

    return {
      ...group,
      members: membersWithDetails,
    };
  },
});

export const inviteToGroup = mutation({
  args: {
    groupId: v.id("groups"),
    email: v.string(),
    invitedBy: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Check if user is admin of the group
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.invitedBy)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Only admins can invite members");
    }

    // Check if invitation already exists
    const existingInvite = await ctx.db
      .query("invitations")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .filter((q) => q.eq(q.field("email"), args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvite) {
      throw new Error("Invitation already sent to this email");
    }

    return await ctx.db.insert("invitations", {
      groupId: args.groupId,
      invitedBy: args.invitedBy,
      email: args.email,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const getPendingInvitations = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return await Promise.all(
      invitations.map(async (invite) => {
        const group = await ctx.db.get(invite.groupId);
        const inviter = await ctx.db.get(invite.invitedBy);
        return {
          ...invite,
          group,
          inviter,
        };
      })
    );
  },
});

export const acceptInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.status !== "pending") {
      throw new Error("Invalid invitation");
    }

    // Check if already a member
    const existingMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", invitation.groupId).eq("userId", args.userId)
      )
      .first();

    if (existingMembership) {
      throw new Error("Already a member of this group");
    }

    // Add to group
    await ctx.db.insert("groupMembers", {
      groupId: invitation.groupId,
      userId: args.userId,
      role: "member",
      joinedAt: Date.now(),
    });

    // Update invitation status
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
    });

    return invitation.groupId;
  },
});
