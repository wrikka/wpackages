import { normalizeBaseUrl } from "./validation-utils";

declare const process: {
  env: Record<string, string | undefined>;
};

export function bearer(apiKey: string | undefined): string | undefined {
  const key = apiKey?.trim();
  if (!key) return undefined;
  return `Bearer ${key}`;
}

export function getApiKeyFromEnv(envVarName: string): string | undefined {
  const key = process.env[envVarName];
  return key?.trim();
}

export function createAuthHeaders(apiKey: string | undefined, additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...additionalHeaders
  };

  const auth = bearer(apiKey);
  if (auth) {
    headers.authorization = auth;
  }

  return headers;
}

export interface AuthConfig {
  readonly apiKey?: string;
  readonly baseUrl?: string;
}

export function resolveAuthConfig(config: AuthConfig, envKey: string, defaultBaseUrl: string): {
  readonly apiKey: string;
  readonly baseUrl: string;
} {
  const apiKey = config.apiKey ?? getApiKeyFromEnv(envKey);
  const baseUrl = normalizeBaseUrl(config.baseUrl, defaultBaseUrl);

  if (!apiKey) {
    throw new Error(`API key is required. Set it in options or ${envKey} environment variable.`);
  }

  return { apiKey, baseUrl };
}
