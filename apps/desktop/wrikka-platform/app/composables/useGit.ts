import { invoke } from "@tauri-apps/api/core";

export type BranchSummary = { name: string; isHead: boolean };
export type CommitSummary = {
  id: string;
  summary: string;
  author: string;
  time: number;
};
export type GitStatusEntry = { path: string; status: string };
export type DiffFile = { path: string; diff: string };

export function useGit() {
  const branches = ref<BranchSummary[]>([]);
  const commits = ref<CommitSummary[]>([]);
  const status = ref<GitStatusEntry[]>([]);
  const diffs = ref<DiffFile[]>([]);

  const loadRepo = async (repoRoot: string): Promise<void> => {
    const [b, c, s, d] = await Promise.all([
      invoke<BranchSummary[]>("list_branches", { repoRoot }),
      invoke<CommitSummary[]>("list_commits", { repoRoot, limit: 50 }),
      invoke<GitStatusEntry[]>("git_status", { repoRoot }),
      invoke<DiffFile[]>("git_diff_head", { repoRoot }),
    ]);

    branches.value = b;
    commits.value = c;
    status.value = s;
    diffs.value = d;
  };

  return {
    branches,
    commits,
    status,
    diffs,
    loadRepo,
  };
}
