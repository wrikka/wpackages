import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const runGitCommand = (command: string, cwd: string): string => {
	try {
		return execSync(command, { cwd, stdio: "pipe" }).toString();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Git command failed: ${error.message}`);
		}
		throw error;
	}
};

export const GitService = {
	/**
	 * Check if directory is a git repository
	 */
	isRepository: (path: string): boolean => {
		return existsSync(join(path, ".git"));
	},

	/**
	 * Initialize git repository
	 */
	init: (path: string): void => {
		runGitCommand("git init", path);
	},

	/**
	 * Configure git user
	 */
	configureUser: (path: string, name: string, email: string): void => {
		runGitCommand(`git config --local user.name "${name}"`, path);
		runGitCommand(`git config --local user.email "${email}"`, path);
	},

	/**
	 * Add remote
	 */
	addRemote: (path: string, url: string): void => {
		runGitCommand(`git remote add origin ${url}`, path);
	},

	/**
	 * Stage all changes
	 */
	stageAll: (path: string): void => {
		runGitCommand("git add .", path);
	},

	/**
	 * Commit changes
	 */
	commit: (path: string, message: string): void => {
		try {
			runGitCommand(`git commit -m "${message}"`, path);
		} catch (error) {
			if (error instanceof Error && error.message.includes("nothing to commit")) {
				return;
			}
			throw error;
		}
	},

	/**
	 * Push to remote
	 */
	push: (path: string, branch: string): void => {
		runGitCommand(`git push -u origin ${branch}`, path);
	},

	/**
	 * Run git command
	 */
	run: runGitCommand,
};
