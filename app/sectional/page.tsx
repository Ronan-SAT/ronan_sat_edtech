import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import SectionalPageClient from "@/components/sectional/SectionalPageClient";
import { authOptions } from "@/lib/authOptions";
import { getPostAuthRedirectPath } from "@/lib/getPostAuthRedirectPath";

export default async function SectionalPage() {
  const session = await getServerSession(authOptions);
  const redirectPath = getPostAuthRedirectPath(session?.user);

  if (redirectPath !== "/dashboard") {
    redirect(redirectPath);
  }

  return <SectionalPageClient />;
}
