import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createGroup = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async () => {
    throw new Error("Groups are disabled in this simplified build.");
  },
});

export const getUserGroups = query({
  args: { userId: v.id("users") },
  handler: async () => {
    return [];
  },
});

export const getGroup = query({
  args: { groupId: v.string() },
  handler: async () => {
    return null;
  },
});

export const inviteMember = mutation({
  args: { groupId: v.string(), email: v.string(), invitedBy: v.string() },
  handler: async () => {
    throw new Error("Groups are disabled in this simplified build.");
  },
});

export const getPendingInvitations = query({
  args: { email: v.string() },
  handler: async () => {
    return [];
  },
});

export const acceptInvitation = mutation({
  args: { invitationId: v.string(), userId: v.string() },
  handler: async () => {
    throw new Error("Groups are disabled in this simplified build.");
  },
});

export const declineInvitation = mutation({
  args: { invitationId: v.string() },
  handler: async () => {
    throw new Error("Groups are disabled in this simplified build.");
  },
});
