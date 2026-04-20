import { createClient } from "@supabase/supabase-js";

type CountMap = Record<string, number>;
type SupabaseAdminClient = any;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getArgValue(flag: string) {
  const exact = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  if (exact) {
    return exact.slice(flag.length + 1);
  }

  const index = process.argv.findIndex((arg) => arg === flag);
  if (index >= 0) {
    return process.argv[index + 1];
  }

  return undefined;
}

async function countRows(supabase: SupabaseAdminClient, table: string, column: string, userId: string) {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true }).eq(column, userId);
  if (error) {
    throw new Error(`Failed to count ${table}.${column}: ${error.message}`);
  }

  return count ?? 0;
}

async function listAllUsers(supabase: SupabaseAdminClient) {
  const users = [] as Array<{ id: string; email?: string | null }>;
  let page = 1;

  while (true) {
    const result = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (result.error) {
      throw new Error(`Failed to list auth users: ${result.error.message}`);
    }

    const batch = (result.data.users ?? []).map((user: { id: string; email?: string | null }) => ({ id: user.id, email: user.email }));
    users.push(...batch);

    if (batch.length < 1000) {
      break;
    }

    page += 1;
  }

  return users;
}

async function auditUserReferences(supabase: SupabaseAdminClient, userId: string): Promise<CountMap> {
  const counts = await Promise.all([
    countRows(supabase, "user_roles", "user_id", userId),
    countRows(supabase, "teacher_groups", "owner_user_id", userId),
    countRows(supabase, "group_memberships", "student_user_id", userId),
    countRows(supabase, "tests", "owner_user_id", userId),
    countRows(supabase, "tests", "created_by_user_id", userId),
    countRows(supabase, "test_attempts", "user_id", userId),
    countRows(supabase, "user_review_reasons", "user_id", userId),
    countRows(supabase, "user_settings", "user_id", userId),
    countRows(supabase, "user_streaks", "user_id", userId),
    countRows(supabase, "vocab_columns", "user_id", userId),
    countRows(supabase, "vocab_cards", "user_id", userId),
    countRows(supabase, "user_reports", "reporter_user_id", userId),
    countRows(supabase, "user_reports", "resolved_by_user_id", userId),
  ]);

  return {
    user_roles: counts[0],
    teacher_groups: counts[1],
    group_memberships: counts[2],
    tests_owned: counts[3],
    tests_created: counts[4],
    test_attempts: counts[5],
    user_review_reasons: counts[6],
    user_settings: counts[7],
    user_streaks: counts[8],
    vocab_columns: counts[9],
    vocab_cards: counts[10],
    user_reports_reporter: counts[11],
    user_reports_resolver: counts[12],
  };
}

async function main() {
  const email = getArgValue("--email")?.trim().toLowerCase();
  const explicitUserId = getArgValue("--user-id")?.trim();
  const dryRun = process.argv.includes("--dry-run");

  if (!email && !explicitUserId) {
    throw new Error("Usage: tsx scripts/users/purgeSupabaseUser.ts (--email=<user@example.com> | --user-id=<uuid>) [--dry-run]");
  }

  const supabase = createClient(getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"), getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const users = await listAllUsers(supabase);
  const authUser = explicitUserId
    ? users.find((user) => user.id === explicitUserId) ?? null
    : users.find((user) => user.email?.toLowerCase() === email) ?? null;

  const targetUserId = authUser?.id ?? explicitUserId ?? null;

  if (!targetUserId) {
    console.log(
      JSON.stringify(
        {
          email,
          userId: explicitUserId ?? null,
          foundAuthUser: false,
          message: "No auth user found for that identifier. If the user was already deleted, rerun with --user-id if you still need to scrub residual set-null references.",
        },
        null,
        2,
      ),
    );
    return;
  }

  const before = await auditUserReferences(supabase, targetUserId);

  if (dryRun) {
    console.log(JSON.stringify({ email: authUser?.email ?? email ?? null, userId: targetUserId, dryRun: true, before }, null, 2));
    return;
  }

  const deleteReportedRows = await supabase
    .from("user_reports")
    .delete()
    .or(`reporter_user_id.eq.${targetUserId},resolved_by_user_id.eq.${targetUserId}`);

  if (deleteReportedRows.error) {
    throw new Error(`Failed to delete user_reports rows: ${deleteReportedRows.error.message}`);
  }

  const nullOwnedTests = await supabase.from("tests").update({ owner_user_id: null }).eq("owner_user_id", targetUserId);
  if (nullOwnedTests.error) {
    throw new Error(`Failed to clear tests.owner_user_id: ${nullOwnedTests.error.message}`);
  }

  const nullCreatedTests = await supabase.from("tests").update({ created_by_user_id: null }).eq("created_by_user_id", targetUserId);
  if (nullCreatedTests.error) {
    throw new Error(`Failed to clear tests.created_by_user_id: ${nullCreatedTests.error.message}`);
  }

  if (authUser) {
    const deleteAuthUser = await supabase.auth.admin.deleteUser(authUser.id);
    if (deleteAuthUser.error) {
      throw new Error(`Failed to delete auth user: ${deleteAuthUser.error.message}`);
    }
  }

  const remainingUsers = await listAllUsers(supabase);
  const stillExists = remainingUsers.some((user) => user.id === targetUserId);
  const after = await auditUserReferences(supabase, targetUserId);

  console.log(
    JSON.stringify(
      {
        email: authUser?.email ?? email ?? null,
        userId: targetUserId,
        deletedAuthUser: !stillExists,
        before,
        after,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
