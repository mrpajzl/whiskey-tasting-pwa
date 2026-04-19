import { query } from "./_generated/server";

export const getUserDashboard = query({
  args: {},
  handler: async (ctx) => {
    const groups = await ctx.db.query("groups").collect();
    const sessions = await ctx.db.query("tastingSessions").collect();
    const bottles = await ctx.db.query("bottles").collect();
    const ratings = await ctx.db.query("ratings").collect();

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating.score, 0) / ratings.length
        : null;

    const upcomingSessions = sessions
      .filter((session) => session.status !== "completed")
      .sort((a, b) => a.sessionDate - b.sessionDate)
      .slice(0, 3)
      .map((session) => ({
        ...session,
        bottleCount: bottles.filter((bottle) => bottle.sessionId === session._id).length,
      }));

    const recentRatings = ratings
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5)
      .map((rating) => {
        const bottle = bottles.find((item) => item._id === rating.bottleId);
        return {
          ...rating,
          bottleName: bottle?.name ?? "Unknown bottle",
          distillery: bottle?.distillery ?? "Unknown distillery",
        };
      });

    return {
      totalGroups: groups.length,
      totalSessions: sessions.length,
      totalBottles: bottles.length,
      totalRatings: ratings.length,
      averageRating,
      upcomingSessions,
      recentRatings,
    };
  },
});
