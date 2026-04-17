import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/authOptions";
import { getParentDashboardData } from "@/lib/services/parentDashboardService";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await getParentDashboardData({
      id: session.user.id,
      role: session.user.role,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("GET /api/parent/dashboard error:", error);
    return NextResponse.json({ error: "Failed to load parent dashboard" }, { status: 500 });
  }
}
