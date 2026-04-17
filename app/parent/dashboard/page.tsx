import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import ParentDashboardPageClient from "@/components/dashboard/ParentDashboardPageClient";
import { authOptions } from "@/lib/authOptions";
import { leaderboardService } from "@/lib/services/leaderboardService";
import { getParentDashboardData } from "@/lib/services/parentDashboardService";

export default async function ParentDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth");
  }

  if (session.user.role === "STUDENT") {
    redirect("/dashboard");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const [data, leaderboard] = await Promise.all([
    getParentDashboardData({ id: session.user.id, role: session.user.role }),
    leaderboardService.getLeaderboard(),
  ]);

  return <ParentDashboardPageClient initialData={data} initialLeaderboard={leaderboard} />;
}
