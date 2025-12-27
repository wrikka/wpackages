import { execSync } from "node:child_process";

/**
 * Run git command
 */
export const runGitCommand = (command: string, cwd: string): string => {
	try {
		return execSync(command, { cwd, stdio: "pipe" }).toString();
	} catch (error) {
		if (error instanceof Error) {
			throw new Error(`Git command failed: ${error.message}`);
		}
		throw error;
	}
};

/**
 * Build git commit message
 */
export const buildCommitMessage = (message: string): string => {
	return `git commit -m "${message}"`;
};

/**
 * Build git push command
 */
export const buildPushCommand = (branch: string): string => {
	return `git push -u origin ${branch}`;
};

/**
 * Build git remote add command
 */
export const buildRemoteCommand = (url: string): string => {
	return `git remote add origin ${url}`;
};

/**
 * Build git config command
 */
export const buildConfigCommand = (key: string, value: string): string => {
	return `git config --local ${key} "${value}"`;
};
