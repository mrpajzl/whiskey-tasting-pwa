import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    passwordHash: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  groups: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdBy: v.id("users"),
    createdAt: v.number(),
  }).index("by_creator", ["createdBy"]),

  groupMembers: defineTable({
    groupId: v.id("groups"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_user", ["userId"])
    .index("by_group_and_user", ["groupId", "userId"]),

  invitations: defineTable({
    groupId: v.id("groups"),
    invitedBy: v.id("users"),
    email: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("declined")
    ),
    createdAt: v.number(),
  })
    .index("by_group", ["groupId"])
    .index("by_email", ["email"]),

  tastingSessions: defineTable({
    groupId: v.id("groups"),
    name: v.string(),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    sessionDate: v.number(),
    createdBy: v.id("users"),
    createdAt: v.number(),
    status: v.union(
      v.literal("upcoming"),
      v.literal("active"),
      v.literal("completed")
    ),
  })
    .index("by_group", ["groupId"])
    .index("by_status", ["status"]),

  bottles: defineTable({
    sessionId: v.id("tastingSessions"),
    name: v.string(),
    distillery: v.string(),
    age: v.optional(v.number()),
    type: v.string(),
    region: v.optional(v.string()),
    abv: v.optional(v.number()),
    caskType: v.optional(v.string()),
    description: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    addedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_user", ["addedBy"]),

  ratings: defineTable({
    bottleId: v.id("bottles"),
    userId: v.id("users"),
    sessionId: v.id("tastingSessions"),
    score: v.number(),
    nose: v.optional(v.string()),
    palate: v.optional(v.string()),
    finish: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_bottle", ["bottleId"])
    .index("by_user", ["userId"])
    .index("by_session", ["sessionId"])
    .index("by_bottle_and_user", ["bottleId", "userId"]),
});
