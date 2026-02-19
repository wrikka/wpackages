import { describe, it, expect, beforeEach, vi } from "vitest";
import {
	getConfig,
	updateConfig,
	resetConfig,
	getApiUrl,
	isFeatureEnabled,
} from "@/lib/config";

describe("Config Management", () => {
	beforeEach(() => {
		resetConfig();
		vi.stubEnv("VITE_API_BASE_URL", "https://test.api.com/v1");
		vi.stubEnv("VITE_FEATURE_PROACTIVE_AGENT", "true");
		vi.stubEnv("VITE_AI_MODEL", "gpt-4-turbo");
	});

	it("should return default config", () => {
		const config = getConfig();
		expect(config.api.baseUrl).toBe("https://test.api.com/v1");
		expect(config.features.proactiveAgent).toBe(true);
		expect(config.ai.defaultModel).toBe("gpt-4-turbo");
	});

	it("should update config", () => {
		updateConfig({
			ai: {
				defaultModel: "gpt-3.5-turbo",
				maxTokens: 2048,
				temperature: 0.5,
				streamResponse: false,
			},
		});
		const config = getConfig();
		expect(config.ai.defaultModel).toBe("gpt-3.5-turbo");
	});

	it("should reset config", () => {
		updateConfig({
			ai: {
				defaultModel: "custom-model",
				maxTokens: 1024,
				temperature: 0.3,
				streamResponse: true,
			},
		});
		resetConfig();
		const config = getConfig();
		expect(config.ai.defaultModel).toBe("gpt-4-turbo");
	});

	it("should get API URL", () => {
		const url = getApiUrl();
		expect(url).toBe("https://test.api.com/v1/chat/completions");
	});

	it("should check feature enabled", () => {
		expect(isFeatureEnabled("proactiveAgent")).toBe(true);
		expect(isFeatureEnabled("localAI")).toBe(false);
	});
});
