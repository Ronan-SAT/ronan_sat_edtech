import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import AdminDashboardClient from "@/components/admin/AdminDashboardClient";
import { authOptions } from "@/lib/authOptions";
import { testService } from "@/lib/services/testService";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const tests = await testService.getAdminTestOptions();

  return <AdminDashboardClient tests={tests} />;
}
