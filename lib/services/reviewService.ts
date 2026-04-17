import { API_PATHS } from "@/lib/apiPaths";
import api from "@/lib/axios";
import { readThroughClientCache } from "@/lib/clientCache";
import type { ReviewResult } from "@/types/review";

interface ReviewFetchOptions {
  forceRefresh?: boolean;
}

const REVIEW_RESULTS_CACHE_KEY = "review:results";

export async function fetchReviewResults(options?: ReviewFetchOptions) {
  return readThroughClientCache(
    REVIEW_RESULTS_CACHE_KEY,
    async () => {
      const res = await api.get(`${API_PATHS.RESULTS}?view=detail`);
      return (res.data.results || []) as ReviewResult[];
    },
    { forceRefresh: options?.forceRefresh },
  );
}

export async function fetchQuestionExplanation(questionId: string) {
  const explanationCacheKey = `review:explanation:${questionId}`;

  return readThroughClientCache(
    explanationCacheKey,
    async () => {
      const res = await api.get(API_PATHS.getQuestionExplanation(questionId));
      return (res.data.explanation || "") as string;
    },
    { ttlMs: 30 * 60 * 1000 },
  );
}
