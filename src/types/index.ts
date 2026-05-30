export type AgentResult = {
  agent_name: string;
  result: "passed" | "failed" | "partial";
  explanation: string;
};

export type User = {
  id: string;
  email: string | null;
  display_name: string;
  handle: string;
  avatar_seed: string | null;
  bio: string | null;
  created_at: Date | null;
};

export type BenchmarkTask = {
  id: string;
  author_id: string | null;
  title: string;
  description: string;
  difficulty: string | null;
  tags: string[] | null;
  created_at: Date | null;
};

export type BenchmarkRun = {
  id: string;
  task_id: string | null;
  agent_name: string;
  agent_model: string | null;
  result: string;
  explanation: string;
  duration_ms: number | null;
  tokens_used: number | null;
  code_diff: string | null;
  created_at: Date | null;
};

export type FeedPost = {
  id: string;
  author_id: string | null;
  task_id: string | null;
  body: string;
  agent_results: AgentResult[];
  is_draft: boolean | null;
  published_at: Date | null;
  created_at: Date | null;
};

export type Comment = {
  id: string;
  post_id: string | null;
  author_id: string | null;
  body: string;
  created_at: Date | null;
};
