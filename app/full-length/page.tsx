import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import FullLengthPageClient from "@/components/dashboard/FullLengthPageClient";
import { authOptions } from "@/lib/authOptions";
import { getPostAuthRedirectPath } from "@/lib/getPostAuthRedirectPath";

export default async function FullLengthPage() {
  const session = await getServerSession(authOptions);
  const redirectPath = getPostAuthRedirectPath(session?.user);

  if (redirectPath !== "/dashboard") {
    redirect(redirectPath);
  }

  return <FullLengthPageClient />;
}
