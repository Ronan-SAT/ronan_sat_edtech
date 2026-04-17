import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import ReviewPageClient from "@/components/review/ReviewPageClient";
import { authOptions } from "@/lib/authOptions";
import { resultService } from "@/lib/services/resultService";
import type { ReviewResult } from "@/types/review";

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth");
  }

  if (session.user.role === "PARENT") {
    redirect("/parent/dashboard");
  }

  const resultsResponse = await resultService.getUserResults(session.user.id, {
    view: "detail",
  });

  return <ReviewPageClient initialResults={resultsResponse.results as ReviewResult[]} />;
}
