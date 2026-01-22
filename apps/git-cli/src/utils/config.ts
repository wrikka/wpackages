import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

interface CommitAIConfig {
	enabled: boolean;
	provider: string;
	model?: string;
	apiKey?: string;
}

interface CommitConfig {
	template: string;
	conventionalCommits: boolean;
	types: string[];
	autoAddEmoji: boolean;
	requireScope: boolean;
	ai?: CommitAIConfig;
}

interface WGitConfig {
	commit: CommitConfig;
	log?: Record<string, unknown>;
	staging?: Record<string, unknown>;
	status?: Record<string, unknown>;
	general?: Record<string, unknown>;
}

export function loadConfig(): WGitConfig | null {
	const configPath = join(process.cwd(), ".wgit.json");

	if (!existsSync(configPath)) {
		return null;
	}

	try {
		const content = readFileSync(configPath, "utf-8");
		return JSON.parse(content) as WGitConfig;
	} catch {
		return null;
	}
}

export function getCommitConfig(): CommitConfig | null {
	const config = loadConfig();
	return config?.commit || null;
}

export function isAICommitEnabled(): boolean {
	const commitConfig = getCommitConfig();
	return commitConfig?.ai?.enabled || false;
}
