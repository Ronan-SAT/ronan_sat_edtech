import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";

import { authOptions } from "@/lib/authOptions";
import { resultService } from "@/lib/services/resultService";

function mapCreateResultError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Invalid result payload", details: error.flatten() },
      { status: 400 }
    );
  }

  const message = error instanceof Error ? error.message : "Failed to create result";

  if (message === "Unauthorized") {
    return NextResponse.json({ error: message }, { status: 401 });
  }

  if (message.includes("not found")) {
    return NextResponse.json({ error: message }, { status: 404 });
  }

  if (message.includes("Invalid") || message.includes("mismatch")) {
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ error: message }, { status: 500 });
}

export const resultController = {
  async createResult(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();
      const newResult = await resultService.createResult(session.user.id, body);

      return NextResponse.json({ result: newResult }, { status: 201 });
    } catch (error) {
      console.error("Error creating result:", error);
      return mapCreateResultError(error);
    }
  },

  async getUserResults(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const url = new URL(req.url);
      const daysQuery = url.searchParams.get("days");
      const days = daysQuery ? parseInt(daysQuery, 10) : undefined;
      const view = url.searchParams.get("view") === "summary" ? "summary" : "detail";

      const data = await resultService.getUserResults(session.user.id, { days, view });
      return NextResponse.json(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch results";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  },
};
