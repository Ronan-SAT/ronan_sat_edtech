import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type LockedTestRow = {
  test_id: string;
  token: string;
};

function normalizeToken(token: string) {
  return token.trim();
}

export const testAccessService = {
  async getLockedTestIds(testIds: string[]) {
    const uniqueTestIds = Array.from(new Set(testIds.filter(Boolean)));

    if (uniqueTestIds.length === 0) {
      return new Set<string>();
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("locked_tests").select("test_id").in("test_id", uniqueTestIds);

    if (error) {
      throw new Error(error.message);
    }

    return new Set((data ?? []).map((row) => String(row.test_id)));
  },

  async getAccessStatus(testId: string) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase.from("locked_tests").select("test_id").eq("test_id", testId).maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return {
      testId,
      requiresToken: Boolean(data),
    };
  },

  async verifyToken({ testId, token }: { testId: string; token: string }) {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("locked_tests")
      .select("test_id, token")
      .eq("test_id", testId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return {
        testId,
        requiresToken: false,
        unlocked: true,
      };
    }

    const row = data as LockedTestRow;
    const unlocked = normalizeToken(row.token) === normalizeToken(token);

    return {
      testId,
      requiresToken: true,
      unlocked,
    };
  },
};
