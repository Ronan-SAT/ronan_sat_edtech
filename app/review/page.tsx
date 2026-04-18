import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import ReviewPageClient from "@/components/review/ReviewPageClient";
import { authOptions } from "@/lib/authOptions";
import { getPostAuthRedirectPath } from "@/lib/getPostAuthRedirectPath";

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  const redirectPath = getPostAuthRedirectPath(session?.user);

  if (redirectPath !== "/dashboard") {
    redirect(redirectPath);
  }

  return <ReviewPageClient />;
}
