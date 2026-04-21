import { query } from "./_generated/server";

export const getUserDashboard = query({
  args: {},
  handler: async (ctx) => {
    const sessions = await ctx.db.query("tastingSessions").collect();
    const bottles = await ctx.db.query("bottles").collect();
    const ratings = await ctx.db.query("ratings").collect();

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + (rating.overall ?? rating.score ?? 0), 0) / ratings.length
        : null;

    return {
      totalGroups: 0,
      totalSessions: sessions.length,
      totalBottles: bottles.length,
      totalRatings: ratings.length,
      averageRating,
      upcomingSessions: [],
      recentRatings: [],
    };
  },
});
