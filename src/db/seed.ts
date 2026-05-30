import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hashSync } from "bcryptjs";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const PASSWORD = hashSync("claudex-demo-2026", 10);

const USERS = [
  {
    id: "user_theo",
    email: "t3_roasts@claudex.demo",
    display_name: "Theo",
    handle: "t3_roasts",
    avatar_seed: "theo",
    bio: "Blunt dev/product roasting, type-safe rage.",
    password_hash: PASSWORD,
  },
  {
    id: "user_vibeathy",
    email: "vibeathy@claudex.demo",
    display_name: "Andrej Vibeathy",
    handle: "vibeathy",
    avatar_seed: "andrej",
    bio: "Calm systems commentary, philosophical benchmark takes.",
    password_hash: PASSWORD,
  },
  {
    id: "user_samalin",
    email: "samalin@claudex.demo",
    display_name: "Sam Altlin",
    handle: "samalin",
    avatar_seed: "sam",
    bio: "Cryptic, short, future-compute energy.",
    password_hash: PASSWORD,
  },
  {
    id: "user_elongated",
    email: "elongated_musk@claudex.demo",
    display_name: "Elongated Musk",
    handle: "elongated_musk",
    avatar_seed: "elon",
    bio: "Ultra-short replies, meme-ish product takes.",
    password_hash: PASSWORD,
  },
  {
    id: "user_kache",
    email: "kache_money@claudex.demo",
    display_name: "Kache",
    handle: "kache_money",
    avatar_seed: "kache",
    bio: "Absurdly confident builder/startup take.",
    password_hash: PASSWORD,
  },
  {
    id: "user_tibo",
    email: "saint_reset@claudex.demo",
    display_name: "Tibo",
    handle: "saint_reset",
    avatar_seed: "tibo",
    bio: "Codex-positive, infra/product-builder energy.",
    password_hash: PASSWORD,
  },
  {
    id: "user_thariq",
    email: "trq_404@claudex.demo",
    display_name: "Thariq",
    handle: "trq_404",
    avatar_seed: "thariq",
    bio: "Claude Code defender, context-engineering confidence.",
    password_hash: PASSWORD,
  },
  {
    id: "user_yleking",
    email: "yle_king@claudex.demo",
    display_name: "Yann LeKing",
    handle: "yle_king",
    avatar_seed: "yann",
    bio: "Founder. Crown energy.",
    password_hash: PASSWORD,
  },
];

const TASKS = [
  {
    id: "task_auth_migration",
    author_id: "user_theo",
    title: "Migrate a Next.js dashboard from mock auth to real session auth without breaking server actions",
    description: `## The Challenge\n\nYou have a Next.js 15 dashboard that uses mock auth (hardcoded user objects, no real sessions). The task is to migrate to real session-based authentication using cookies and a Postgres session table.\n\n### Requirements\n\n- Replace all mock auth checks with real session lookups\n- Preserve all existing server actions (they currently reference the mock user)\n- Add login/logout flows\n- Ensure middleware protects all /dashboard routes\n- All existing tests must pass after migration\n\n### Constraints\n\n- No external auth libraries (no NextAuth, no Clerk, no Supabase Auth)\n- Must use HttpOnly cookies\n- Session expiry: 7 days\n- Must handle concurrent requests correctly`,
    difficulty: "hard",
    tags: ["auth", "nextjs", "migration", "server-actions"],
  },
  {
    id: "task_zustand_tanstack",
    author_id: "user_vibeathy",
    title: "Refactor a Zustand store to use server state with TanStack Query",
    description: `## The Challenge\n\nA React app uses Zustand for all state management, including server-fetched data. Refactor to use TanStack Query for server state while keeping Zustand for UI-only state.\n\n### Requirements\n\n- Identify which Zustand slices are server state vs UI state\n- Migrate server state to TanStack Query with proper cache keys\n- Preserve optimistic updates\n- Keep devtools middleware working\n- Zero regressions in existing behavior`,
    difficulty: "medium",
    tags: ["react", "state-management", "tanstack-query", "zustand"],
  },
  {
    id: "task_rate_limiting",
    author_id: "user_theo",
    title: "Add rate limiting to a Next.js API route without external dependencies",
    description: `## The Challenge\n\nImplement rate limiting for a Next.js API route using only built-in Node.js capabilities. No Redis, no Upstash, no external rate limiting services.\n\n### Requirements\n\n- Sliding window rate limit: 100 requests per minute per IP\n- Return proper 429 status with Retry-After header\n- Handle X-Forwarded-For for proxied requests\n- Must work in serverless environment (ephemeral state is acceptable)\n- Include bypass for authenticated admin users`,
    difficulty: "easy",
    tags: ["nextjs", "api", "rate-limiting", "security"],
  },
  {
    id: "task_rest_to_trpc",
    author_id: "user_kache",
    title: "Convert a REST API to tRPC with zero downtime",
    description: `## The Challenge\n\nMigrate 12 REST API endpoints to tRPC while maintaining backward compatibility. Both REST and tRPC should work simultaneously during migration.\n\n### Requirements\n\n- Set up tRPC router with proper input validation (Zod)\n- Create tRPC procedures for all 12 endpoints\n- Add adapter that serves both REST and tRPC\n- Migrate frontend calls incrementally\n- Type-safe end-to-end\n- Zero downtime during migration`,
    difficulty: "hard",
    tags: ["trpc", "rest", "migration", "typescript"],
  },
];

const KEY_TASK_RUNS = [
  {
    id: "run_auth_codex",
    task_id: "task_auth_migration",
    agent_name: "Codex",
    agent_model: "GPT-5.5",
    result: "passed",
    explanation: "Correctly migrates auth, preserves server actions, and passes tests. Identified all mock auth references, replaced with session lookups, and maintained backward compatibility throughout the migration.",
    duration_ms: 47000,
    tokens_used: 12400,
    code_diff: null,
  },
  {
    id: "run_auth_claude",
    task_id: "task_auth_migration",
    agent_name: "Claude Code",
    agent_model: "Opus 4.8",
    result: "failed",
    explanation: "Breaks callback routing during the auth migration. The agent correctly identified the session table schema but introduced a circular redirect in the middleware when handling the /auth/callback route, causing an infinite loop on login.",
    duration_ms: 62000,
    tokens_used: 18700,
    code_diff: null,
  },
  {
    id: "run_auth_cursor",
    task_id: "task_auth_migration",
    agent_name: "Cursor",
    agent_model: "Composer 2.5",
    result: "partial",
    explanation: "Cleans up the UI but misses backend session validation. The Composer agent restyled the login page and added client-side auth state, but the server actions still reference the old mock user object. Tests fail on 3 of 7 server action endpoints.",
    duration_ms: 35000,
    tokens_used: 9200,
    code_diff: null,
  },
];

const HISTORICAL_RUNS = [
  {
    id: "run_zustand_codex",
    task_id: "task_zustand_tanstack",
    agent_name: "Codex",
    agent_model: "GPT-5.5",
    result: "partial",
    explanation: "Migrated most server state to TanStack Query but got confused by the devtools middleware configuration. Cache invalidation works but optimistic updates lost.",
    duration_ms: 38000,
    tokens_used: 11200,
    code_diff: null,
  },
  {
    id: "run_zustand_claude",
    task_id: "task_zustand_tanstack",
    agent_name: "Claude Code",
    agent_model: "Opus 4.8",
    result: "passed",
    explanation: "Clean separation of server and UI state. Preserved optimistic updates with proper mutation callbacks. Devtools middleware preserved for remaining Zustand slices.",
    duration_ms: 41000,
    tokens_used: 14300,
    code_diff: null,
  },
  {
    id: "run_zustand_cursor",
    task_id: "task_zustand_tanstack",
    agent_name: "Cursor",
    agent_model: "Composer 2.5",
    result: "failed",
    explanation: "Rewrote the entire store from scratch instead of migrating incrementally. The result is technically correct but produces a mass diff that's unreviewable. All devtools state lost.",
    duration_ms: 29000,
    tokens_used: 8100,
    code_diff: null,
  },
  {
    id: "run_rate_codex",
    task_id: "task_rate_limiting",
    agent_name: "Codex",
    agent_model: "GPT-5.5",
    result: "passed",
    explanation: "Implemented a clean sliding window using an in-memory Map with automatic cleanup. Proper 429 responses with Retry-After. Admin bypass via session check.",
    duration_ms: 22000,
    tokens_used: 6800,
    code_diff: null,
  },
  {
    id: "run_rate_claude",
    task_id: "task_rate_limiting",
    agent_name: "Claude Code",
    agent_model: "Opus 4.8",
    result: "passed",
    explanation: "Solid implementation with token bucket algorithm. Added proper X-Forwarded-For parsing with security considerations. Clean separation of rate limit logic from route handler.",
    duration_ms: 25000,
    tokens_used: 7900,
    code_diff: null,
  },
  {
    id: "run_rate_cursor",
    task_id: "task_rate_limiting",
    agent_name: "Cursor",
    agent_model: "Composer 2.5",
    result: "partial",
    explanation: "Rate limiting works but missing the admin bypass. Also hardcoded the limit to 60/min instead of the specified 100/min. X-Forwarded-For handling is incomplete.",
    duration_ms: 18000,
    tokens_used: 5400,
    code_diff: null,
  },
  {
    id: "run_trpc_codex",
    task_id: "task_rest_to_trpc",
    agent_name: "Codex",
    agent_model: "GPT-5.5",
    result: "partial",
    explanation: "Set up tRPC router and migrated 8 of 12 endpoints. Remaining 4 endpoints have complex file upload handling that wasn't addressed. REST compatibility layer works.",
    duration_ms: 55000,
    tokens_used: 16200,
    code_diff: null,
  },
  {
    id: "run_trpc_claude",
    task_id: "task_rest_to_trpc",
    agent_name: "Claude Code",
    agent_model: "Opus 4.8",
    result: "passed",
    explanation: "All 12 endpoints migrated with full Zod validation. REST adapter maintains backward compatibility. Frontend calls migrated with proper type inference. Zero downtime verified.",
    duration_ms: 68000,
    tokens_used: 21500,
    code_diff: null,
  },
  {
    id: "run_trpc_cursor",
    task_id: "task_rest_to_trpc",
    agent_name: "Cursor",
    agent_model: "Composer 2.5",
    result: "failed",
    explanation: "tRPC router set up correctly but the REST compatibility adapter is broken. All existing REST consumers get 404s. Frontend migration is incomplete — half the calls still use fetch.",
    duration_ms: 42000,
    tokens_used: 13100,
    code_diff: null,
  },
];

const PUBLISHED_POSTS = [
  {
    id: "post_zustand_pub",
    author_id: "user_vibeathy",
    task_id: "task_zustand_tanstack",
    body: "ran the zustand-to-tanstack migration benchmark. claude code nailed the cache invalidation. codex got confused by the devtools middleware. cursor rewrote the entire store from scratch — technically correct but mass diff. the migration is the product, not the rewrite.",
    agent_results: [
      { agent_name: "Codex", result: "partial", explanation: "Migrated most server state to TanStack Query but got confused by the devtools middleware configuration." },
      { agent_name: "Claude Code", result: "passed", explanation: "Clean separation of server and UI state. Preserved optimistic updates with proper mutation callbacks." },
      { agent_name: "Cursor", result: "failed", explanation: "Rewrote the entire store from scratch instead of migrating incrementally." },
    ],
    is_draft: false,
    published_at: new Date("2026-05-25T14:30:00Z"),
    created_at: new Date("2026-05-25T14:00:00Z"),
  },
  {
    id: "post_rate_limit_pub",
    author_id: "user_theo",
    task_id: "task_rate_limiting",
    body: "rate limiting without redis. both codex and claude code passed this one. cursor got the limit wrong (60/min instead of 100) and forgot the admin bypass. honestly impressed both big models handled the X-Forwarded-For edge cases.",
    agent_results: [
      { agent_name: "Codex", result: "passed", explanation: "Clean sliding window implementation with proper 429 responses." },
      { agent_name: "Claude Code", result: "passed", explanation: "Solid token bucket algorithm with security-aware header parsing." },
      { agent_name: "Cursor", result: "partial", explanation: "Rate limiting works but missing admin bypass and wrong limit." },
    ],
    is_draft: false,
    published_at: new Date("2026-05-26T10:15:00Z"),
    created_at: new Date("2026-05-26T10:00:00Z"),
  },
  {
    id: "post_trpc_pub",
    author_id: "user_kache",
    task_id: "task_rest_to_trpc",
    body: "rest to trpc migration. 12 endpoints. claude code went 12/12 with zero downtime. codex got 8/12 (file uploads remain unsolved). cursor broke all existing REST consumers. the gap between 'set up tRPC' and 'migrate without breaking production' is the entire benchmark.",
    agent_results: [
      { agent_name: "Codex", result: "partial", explanation: "Migrated 8 of 12 endpoints. File upload handling not addressed." },
      { agent_name: "Claude Code", result: "passed", explanation: "All 12 endpoints migrated with full Zod validation and backward compatibility." },
      { agent_name: "Cursor", result: "failed", explanation: "tRPC router correct but REST compatibility adapter broken." },
    ],
    is_draft: false,
    published_at: new Date("2026-05-27T16:45:00Z"),
    created_at: new Date("2026-05-27T16:30:00Z"),
  },
  {
    id: "post_rate_limit_2",
    author_id: "user_tibo",
    task_id: "task_rate_limiting",
    body: "re-ran theo's rate limiter benchmark with fresh codex limits. codex still passes clean. the sliding window implementation is textbook. claude code's token bucket approach is more elegant but both get the job done. cursor still can't count to 100.",
    agent_results: [
      { agent_name: "Codex", result: "passed", explanation: "Consistent clean implementation across multiple runs." },
      { agent_name: "Claude Code", result: "passed", explanation: "Token bucket approach holds up on re-run." },
      { agent_name: "Cursor", result: "partial", explanation: "Same issues persist on re-run." },
    ],
    is_draft: false,
    published_at: new Date("2026-05-28T09:20:00Z"),
    created_at: new Date("2026-05-28T09:10:00Z"),
  },
];

const DRAFT_POST = {
  id: "post_auth_migration_draft",
  author_id: "user_theo",
  task_id: "task_auth_migration",
  body: "ran the auth migration benchmark. Codex passed, Claude Code fumbled the callback, Cursor fixed the CSS and left the auth broken. painfully realistic.",
  agent_results: [
    { agent_name: "Codex", result: "passed", explanation: "Correctly migrates auth, preserves server actions, and passes tests." },
    { agent_name: "Claude Code", result: "failed", explanation: "Breaks callback routing during the auth migration." },
    { agent_name: "Cursor", result: "partial", explanation: "Cleans up the UI but misses backend session validation." },
  ],
  is_draft: true,
  published_at: null,
  created_at: new Date("2026-05-29T18:00:00Z"),
};

const COMMENTS = [
  {
    id: "comment_1",
    post_id: "post_zustand_pub",
    author_id: "user_thariq",
    body: "claude code's approach here is textbook context engineering. it understood the migration boundary — you don't rewrite, you separate concerns. the devtools preservation is the tell.",
    created_at: new Date("2026-05-25T15:10:00Z"),
  },
  {
    id: "comment_2",
    post_id: "post_zustand_pub",
    author_id: "user_elongated",
    body: "Try Cursor.",
    created_at: new Date("2026-05-25T15:30:00Z"),
  },
  {
    id: "comment_3",
    post_id: "post_zustand_pub",
    author_id: "user_samalin",
    body: "interesting. much more compute soon.",
    created_at: new Date("2026-05-25T16:00:00Z"),
  },
  {
    id: "comment_4",
    post_id: "post_rate_limit_pub",
    author_id: "user_kache",
    body: "wrong rate limits are just evals with more distribution. cursor ships fast and patches later. that's the whole game.",
    created_at: new Date("2026-05-26T11:00:00Z"),
  },
  {
    id: "comment_5",
    post_id: "post_rate_limit_pub",
    author_id: "user_vibeathy",
    body: "the benchmark is not the result. the X-Forwarded-For handling is the benchmark. both models understood the security boundary. that's the signal.",
    created_at: new Date("2026-05-26T11:30:00Z"),
  },
  {
    id: "comment_6",
    post_id: "post_rate_limit_pub",
    author_id: "user_tibo",
    body: "we have reset everyone's Codex limits until morale improves. re-running this one myself.",
    created_at: new Date("2026-05-26T12:00:00Z"),
  },
  {
    id: "comment_7",
    post_id: "post_trpc_pub",
    author_id: "user_thariq",
    body: "12/12 with zero downtime. the backward-compatible REST adapter is the hardest part and claude code got it in one pass. context window advantage is real.",
    created_at: new Date("2026-05-27T17:15:00Z"),
  },
  {
    id: "comment_8",
    post_id: "post_trpc_pub",
    author_id: "user_samalin",
    body: "file uploads are a solved problem with enough compute.",
    created_at: new Date("2026-05-27T17:45:00Z"),
  },
  {
    id: "comment_9",
    post_id: "post_trpc_pub",
    author_id: "user_elongated",
    body: "cursor will fix this next week. probably.",
    created_at: new Date("2026-05-27T18:00:00Z"),
  },
  {
    id: "comment_10",
    post_id: "post_trpc_pub",
    author_id: "user_vibeathy",
    body: "the gap between 'set up the router' and 'migrate production' — that gap is the entire field of software engineering. well said.",
    created_at: new Date("2026-05-27T18:30:00Z"),
  },
  {
    id: "comment_11",
    post_id: "post_rate_limit_2",
    author_id: "user_theo",
    body: "appreciate the re-run. consistent results across runs is underrated in benchmarks. too many people run once and ship.",
    created_at: new Date("2026-05-28T10:00:00Z"),
  },
  {
    id: "comment_12",
    post_id: "post_rate_limit_2",
    author_id: "user_kache",
    body: "consistency is just vibes with a sample size. ship the benchmark, let the market decide.",
    created_at: new Date("2026-05-28T10:30:00Z"),
  },
];

async function seed() {
  console.log("Seeding Claudex database...");

  console.log("Inserting users...");
  for (const user of USERS) {
    await db
      .insert(schema.users)
      .values(user)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: { ...user },
      });
  }

  console.log("Inserting benchmark tasks...");
  for (const task of TASKS) {
    await db
      .insert(schema.benchmarkTasks)
      .values(task)
      .onConflictDoUpdate({
        target: schema.benchmarkTasks.id,
        set: { ...task },
      });
  }

  console.log("Inserting benchmark runs...");
  for (const run of [...KEY_TASK_RUNS, ...HISTORICAL_RUNS]) {
    await db
      .insert(schema.benchmarkRuns)
      .values(run)
      .onConflictDoUpdate({
        target: schema.benchmarkRuns.id,
        set: { ...run },
      });
  }

  console.log("Inserting published feed posts...");
  for (const post of PUBLISHED_POSTS) {
    await db
      .insert(schema.feedPosts)
      .values(post)
      .onConflictDoUpdate({
        target: schema.feedPosts.id,
        set: { ...post },
      });
  }

  console.log("Inserting draft post...");
  await db
    .insert(schema.feedPosts)
    .values(DRAFT_POST)
    .onConflictDoUpdate({
      target: schema.feedPosts.id,
      set: { ...DRAFT_POST },
    });

  console.log("Inserting comments...");
  for (const comment of COMMENTS) {
    await db
      .insert(schema.comments)
      .values(comment)
      .onConflictDoUpdate({
        target: schema.comments.id,
        set: { ...comment },
      });
  }

  console.log("Seed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
