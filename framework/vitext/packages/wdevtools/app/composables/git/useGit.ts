interface GitStatus {
  branch: string;
  files: { status: string; path: string }[];
}

export const useGit = () => {
  const { data, error, refresh, pending } = useAsyncData<GitStatus>('git-status', () => $fetch('/api/git/status'));

  return { data, error, refresh, pending };
};
