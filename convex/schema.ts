import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  tastingSessions: defineTable({
    name: v.string(),
    hostName: v.string(),
    sessionDate: v.number(),
    location: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("completed")
    ),
    createdBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_created_by", ["createdBy"])
    .index("by_session_date", ["sessionDate"]),

  bottles: defineTable({
    sessionId: v.id("tastingSessions"),
    name: v.string(),
    distillery: v.optional(v.string()),
    category: v.optional(v.string()),
    region: v.optional(v.string()),
    age: v.optional(v.number()),
    abv: v.optional(v.number()),
    notes: v.optional(v.string()),
    order: v.number(),
    addedBy: v.id("users"),
    createdAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_session_and_order", ["sessionId", "order"]),

  ratings: defineTable({
    sessionId: v.id("tastingSessions"),
    bottleId: v.id("bottles"),
    userId: v.id("users"),
    overall: v.number(),
    sweetness: v.number(),
    smoke: v.number(),
    fruit: v.number(),
    spice: v.number(),
    body: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_bottle", ["bottleId"])
    .index("by_bottle_and_user", ["bottleId", "userId"]),
});
