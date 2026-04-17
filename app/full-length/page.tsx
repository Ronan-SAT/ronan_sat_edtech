import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import FullLengthPageClient from "@/components/dashboard/FullLengthPageClient";
import { authOptions } from "@/lib/authOptions";
import { resultService } from "@/lib/services/resultService";
import type { UserResultSummary } from "@/types/testLibrary";

export default async function FullLengthPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth");
  }

  if (session.user.role === "PARENT") {
    redirect("/parent/dashboard");
  }

  const userResultsResponse = await resultService.getUserResults(session.user.id, {
    view: "summary",
  });

  return <FullLengthPageClient initialUserResults={userResultsResponse.results as UserResultSummary[]} />;
}
