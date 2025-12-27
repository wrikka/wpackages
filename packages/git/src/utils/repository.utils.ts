import { exec } from "node:child_process";
import { stat } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";

/**
 * Checks if a directory is a Git repository by verifying the existence of the .git directory.
 * @param path The path to the directory to check.
 * @returns A promise that resolves to true if it's a Git repository, false otherwise.
 */
export async function isGitRepository(path: string): Promise<boolean> {
	try {
		const gitDir = join(path, ".git");
		const stats = await stat(gitDir);
		return stats.isDirectory();
	} catch {
		return false;
	}
}

/**
 * Gets the current branch name of a Git repository.
 * @param path The path to the Git repository.
 * @returns A promise that resolves to the current branch name, or null if not in a Git repository or on a detached HEAD.
 */
export async function getCurrentBranch(path: string): Promise<string | null> {
	const execAsync = promisify(exec);
	try {
		const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD", { cwd: path });
		const branchName = stdout.trim();
		return branchName === "HEAD" ? null : branchName;
	} catch {
		return null;
	}
}
