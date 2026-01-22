import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

type RawConfig = Record<string, unknown>;

interface GitHubCliConfig {
	defaultOwner?: string;
	defaultRepo?: string;
	output?: "text" | "json" | "table" | "md";
	quiet?: boolean;
	githubToken?: string;
	openaiApiKey?: string;
}

const CONFIG_FILE_NAME = ".github-cli.json";
const GLOBAL_CONFIG_DIR = join(homedir(), ".config", "github-cli");

function getRepoConfigPath(): string {
	return join(process.cwd(), CONFIG_FILE_NAME);
}

function getGlobalConfigPath(): string {
	return join(GLOBAL_CONFIG_DIR, CONFIG_FILE_NAME);
}

function readJson(path: string): RawConfig | null {
	if (!existsSync(path)) return null;
	try {
		return JSON.parse(readFileSync(path, "utf-8"));
	} catch {
		return null;
	}
}

function writeJson(path: string, data: RawConfig): void {
	try {
		writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
	} catch {
		throw new Error(`Failed to write config to ${path}`);
	}
}

export function loadConfig(): GitHubCliConfig {
	const env = process.env as Record<string, string | undefined>;
	const repoRaw = readJson(getRepoConfigPath()) || {};
	const globalRaw = readJson(getGlobalConfigPath()) || {};

	return {
		defaultOwner: repoRaw.defaultOwner ?? globalRaw.defaultOwner,
		defaultRepo: repoRaw.defaultRepo ?? globalRaw.defaultRepo,
		output: (repoRaw.output ?? globalRaw.output ?? "text") as GitHubCliConfig["output"],
		quiet: Boolean(repoRaw.quiet ?? globalRaw.quiet ?? false),
		githubToken: env.GITHUB_TOKEN ?? repoRaw.githubToken ?? globalRaw.githubToken,
		openaiApiKey: env.OPENAI_API_KEY ?? repoRaw.openaiApiKey ?? globalRaw.openaiApiKey,
	};
}

export function setConfig(key: keyof GitHubCliConfig, value: unknown, scope: "repo" | "global" = "repo"): void {
	const path = scope === "global" ? getGlobalConfigPath() : getRepoConfigPath();
	const existing = readJson(path) || {};
	existing[key] = value;
	writeJson(path, existing);
}

export function getConfig(key: keyof GitHubCliConfig): unknown {
	const cfg = loadConfig();
	return cfg[key];
}

export function listConfig(): GitHubCliConfig {
	return loadConfig();
}

export function ensureGlobalConfigDir(): void {
	const dir = GLOBAL_CONFIG_DIR;
	if (!existsSync(dir)) {
		writeFileSync(dir, "", "utf-8"); // placeholder; real mkdir can be added later
	}
}
