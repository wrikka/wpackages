export interface AppEnv {
	readonly port: number;
	readonly webhookPath: string;
	readonly webhookSecret: string;
	readonly githubAppId: string;
	readonly githubInstallationId: string;
	readonly githubPrivateKeyPemBase64: string;
	readonly policyPath?: string;
	readonly llmBaseUrl?: string;
	readonly llmApiKey?: string;
	readonly llmModel?: string;
}

const requireEnv = (env: NodeJS.ProcessEnv, key: string): string => {
	const v = env[key];
	if (!v) throw new Error(`Missing env: ${key}`);
	return v;
};

const optionalEnv = (env: NodeJS.ProcessEnv, key: string): string | undefined => {
	const v = env[key];
	return v && v.length > 0 ? v : undefined;
};

export const readEnv = (env: NodeJS.ProcessEnv): AppEnv => {
	const portStr = env["PORT"] ?? "3000";
	const port = Number(portStr);
	if (!Number.isFinite(port)) throw new Error(`Invalid PORT: ${portStr}`);

	return {
		port,
		webhookPath: env["WEBHOOK_PATH"] ?? "/webhook",
		webhookSecret: requireEnv(env, "WEBHOOK_SECRET"),
		githubAppId: requireEnv(env, "GITHUB_APP_ID"),
		githubInstallationId: requireEnv(env, "GITHUB_INSTALLATION_ID"),
		githubPrivateKeyPemBase64: requireEnv(env, "GITHUB_PRIVATE_KEY_PEM_BASE64"),
		policyPath: optionalEnv(env, "POLICY_PATH"),
		llmBaseUrl: optionalEnv(env, "LLM_BASE_URL"),
		llmApiKey: optionalEnv(env, "LLM_API_KEY"),
		llmModel: optionalEnv(env, "LLM_MODEL"),
	};
};
