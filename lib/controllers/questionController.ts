import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";

import { authOptions } from "@/lib/authOptions";
import { questionService } from "@/lib/services/questionService";

export const questionController = {
  async getQuestions(req: Request) {
    try {
      const { searchParams } = new URL(req.url);
      const testId = searchParams.get("testId");
      const questions = await questionService.getQuestions(testId);

      return NextResponse.json(
        { questions },
        {
          headers: {
            "Cache-Control": testId
              ? "private, max-age=60, stale-while-revalidate=300"
              : "no-store",
          },
        },
      );
    } catch (error: unknown) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to fetch questions" },
        { status: 500 },
      );
    }
  },

  async createQuestion(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const body = await req.json();

      try {
        const newQuestion = await questionService.createQuestion(body);
        return NextResponse.json({ question: newQuestion }, { status: 201 });
      } catch (error: unknown) {
        if (error instanceof ZodError) {
          return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        if (error instanceof Error && error.message === "Test not found") {
          return NextResponse.json({ error: "Test not found" }, { status: 404 });
        }
        throw error;
      }
    } catch (error: unknown) {
      console.error("POST /api/questions error:", error);
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Failed to create question" },
        { status: 500 },
      );
    }
  },
};
