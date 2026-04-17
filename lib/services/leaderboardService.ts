import dbConnect from "@/lib/mongodb";
import Result from "@/lib/models/Result";
import type { LeaderboardEntry } from "@/types/testLibrary";

type CachedValue<T> = {
  value: T;
  expiresAt: number;
};

const LEADERBOARD_CACHE_TTL_MS = 60 * 1000;
const leaderboardCache = new Map<string, CachedValue<unknown>>();

export function clearLeaderboardCache() {
  leaderboardCache.clear();
}

export const leaderboardService = {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const cacheKey = "global";
    const cached = leaderboardCache.get(cacheKey) as CachedValue<LeaderboardEntry[]> | undefined;
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    await dbConnect();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const hallOfFame = await Result.aggregate<{ _id: unknown; name?: string; testsCompleted?: number; highestScore?: number }>([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
          score: { $gt: 1450 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $group: {
          _id: "$userId",
          name: { $first: "$userInfo.name" },
          testsCompleted: { $sum: 1 },
          highestScore: { $max: "$score" },
        },
      },
      {
        $sort: { testsCompleted: -1, highestScore: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    const normalizedLeaderboard = hallOfFame.map((entry) => ({
      _id: String(entry._id),
      name: entry.name ?? "Student",
      testsCompleted: entry.testsCompleted ?? 0,
      highestScore: entry.highestScore ?? 0,
    }));

    leaderboardCache.set(cacheKey, {
      value: normalizedLeaderboard,
      expiresAt: Date.now() + LEADERBOARD_CACHE_TTL_MS,
    });

    return normalizedLeaderboard;
  },
};
