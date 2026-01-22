import { loadConfig } from "./config";

export interface AuthStatus {
	github: "authenticated" | "missing-token" | "invalid-token" | "error";
	openai: "configured" | "missing-key" | "invalid-key" | "error";
	user?: string;
}

export async function checkAuth(): Promise<AuthStatus> {
	const cfg = loadConfig();
	const status: AuthStatus = {
		github: "missing-token",
		openai: "missing-key",
	};

	// GitHub token check
	if (cfg.githubToken) {
		try {
			// Simple validation: token should be non-empty and have reasonable format
			if (
				cfg.githubToken.startsWith("ghp_") || cfg.githubToken.startsWith("gho_") || cfg.githubToken.startsWith("ghu_")
			) {
				status.github = "authenticated";
				// Optionally fetch user info here if needed
			} else {
				status.github = "invalid-token";
			}
		} catch {
			status.github = "error";
		}
	}

	// OpenAI API key check
	if (cfg.openaiApiKey) {
		try {
			if (cfg.openaiApiKey.startsWith("sk-")) {
				status.openai = "configured";
			} else {
				status.openai = "invalid-key";
			}
		} catch {
			status.openai = "error";
		}
	}

	return status;
}

export function requireGitHubToken(): string {
	const cfg = loadConfig();
	if (!cfg.githubToken) {
		throw new Error(
			"GitHub token is required. Set GITHUB_TOKEN environment variable or configure with:\n"
				+ "  github-cli config set githubToken <token> --scope global\n"
				+ "Create a token at: https://github.com/settings/tokens",
		);
	}
	return cfg.githubToken;
}

export function requireOpenAIApiKey(): string {
	const cfg = loadConfig();
	if (!cfg.openaiApiKey) {
		throw new Error(
			"OpenAI API key is required for AI features. Set OPENAI_API_KEY environment variable or configure with:\n"
				+ "  github-cli config set openaiApiKey <key> --scope global\n"
				+ "Create an API key at: https://platform.openai.com/api-keys",
		);
	}
	return cfg.openaiApiKey;
}
