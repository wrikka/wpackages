import { spinner } from "@clack/prompts";

export const useGit = () => {
  const commitChanges = async (commitMessage: string, directory: string): Promise<void> => {
    const s = spinner();
    s.start("Committing changes...");

    try {
      await Bun.spawn(["git", "add", "."], { cwd: directory }).exited;
      await Bun.spawn(["git", "commit", "-m", commitMessage], { cwd: directory }).exited;
      s.stop("✅ Changes committed successfully");
    } catch (error) {
      s.stop("⚠️ Failed to commit changes");
      console.error(error instanceof Error ? error.message : String(error));
    }
  };

  return { commitChanges };
};
