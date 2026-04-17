import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import LeaderboardTable from "@/components/dashboard/LeaderboardTable";
import ImprovementTrendPanel from "@/components/dashboard/ImprovementTrendPanel";
import RecentResultsList from "@/components/dashboard/RecentResultsList";
import UserStatsPanel from "@/components/dashboard/UserStatsPanel";
import { authOptions } from "@/lib/authOptions";
import { leaderboardService } from "@/lib/services/leaderboardService";
import { resultService } from "@/lib/services/resultService";
import { userService } from "@/lib/services/userService";
import type { UserResultSummary } from "@/types/testLibrary";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth");
  }

  if (session.user.role === "PARENT") {
    redirect("/parent/dashboard");
  }

  const [userStats, userResultsResponse, leaderboard] = await Promise.all([
    userService.getUserStats(session.user.id),
    resultService.getUserResults(session.user.id, { days: 30, view: "summary" }),
    leaderboardService.getLeaderboard(),
  ]);
  const userResults = userResultsResponse.results as UserResultSummary[];

  return (
    <div className="min-h-screen bg-paper-bg pb-12">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <section className="workbook-panel-muted mb-6 overflow-hidden">
          <div className="border-b-4 border-ink-fg bg-paper-bg px-6 py-5">
            <div className="workbook-sticker bg-primary text-ink-fg">Student Dashboard</div>
            <h1 className="mt-4 font-display text-4xl font-black uppercase tracking-tight text-ink-fg md:text-5xl">
              Keep the whole workbook moving.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-ink-fg md:text-base">
              Check your latest score signals and keep review momentum visible without leaving the dashboard.
            </p>
          </div>
        </section>

        <div className="space-y-8">
          <UserStatsPanel userStats={userStats} userResults={userResults} />
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
            <ImprovementTrendPanel results={userResults} />
            <RecentResultsList results={userResults} />
          </div>
          <LeaderboardTable leaderboard={leaderboard} />
        </div>
      </main>
    </div>
  );
}
