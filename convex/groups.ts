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

export const declineInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation || invitation.status !== "pending") {
      throw new Error("Invalid invitation");
    }

    await ctx.db.patch(args.invitationId, {
      status: "declined",
    });
  },
});

export const updateGroup = mutation({
  args: {
    groupId: v.id("groups"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Only admins can update group details");
    }

    const updates: any = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.groupId, updates);
  },
});

export const deleteGroup = mutation({
  args: {
    groupId: v.id("groups"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const membership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!membership || membership.role !== "admin") {
      throw new Error("Only admins can delete groups");
    }

    // Delete all group members
    const members = await ctx.db
      .query("groupMembers")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
    await Promise.all(members.map((m) => ctx.db.delete(m._id)));

    // Delete all invitations
    const invitations = await ctx.db
      .query("invitations")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();
    await Promise.all(invitations.map((i) => ctx.db.delete(i._id)));

    // Delete all sessions and their bottles/ratings
    const sessions = await ctx.db
      .query("tastingSessions")
      .withIndex("by_group", (q) => q.eq("groupId", args.groupId))
      .collect();

    for (const session of sessions) {
      const bottles = await ctx.db
        .query("bottles")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();

      for (const bottle of bottles) {
        const ratings = await ctx.db
          .query("ratings")
          .withIndex("by_bottle", (q) => q.eq("bottleId", bottle._id))
          .collect();
        await Promise.all(ratings.map((r) => ctx.db.delete(r._id)));
        await ctx.db.delete(bottle._id);
      }

      await ctx.db.delete(session._id);
    }

    // Finally delete the group
    await ctx.db.delete(args.groupId);
  },
});

export const removeMember = mutation({
  args: {
    groupId: v.id("groups"),
    membershipId: v.id("groupMembers"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const adminMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!adminMembership || adminMembership.role !== "admin") {
      throw new Error("Only admins can remove members");
    }

    const memberToRemove = await ctx.db.get(args.membershipId);
    if (!memberToRemove || memberToRemove.groupId !== args.groupId) {
      throw new Error("Invalid member");
    }

    await ctx.db.delete(args.membershipId);
  },
});

export const updateMemberRole = mutation({
  args: {
    groupId: v.id("groups"),
    membershipId: v.id("groupMembers"),
    role: v.union(v.literal("admin"), v.literal("member")),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const adminMembership = await ctx.db
      .query("groupMembers")
      .withIndex("by_group_and_user", (q) =>
        q.eq("groupId", args.groupId).eq("userId", args.userId)
      )
      .first();

    if (!adminMembership || adminMembership.role !== "admin") {
      throw new Error("Only admins can change member roles");
    }

    const memberToUpdate = await ctx.db.get(args.membershipId);
    if (!memberToUpdate || memberToUpdate.groupId !== args.groupId) {
      throw new Error("Invalid member");
    }

    await ctx.db.patch(args.membershipId, {
      role: args.role,
    });
  },
});
