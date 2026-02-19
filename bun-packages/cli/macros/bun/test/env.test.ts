import { beforeEach, describe, expect, it } from "vitest";
import { env } from "./mocks/env";

describe("env", () => {
	beforeEach(() => {
		delete process.env.TEST_VAR;
	});

	it("should return environment variable value", () => {
		process.env.TEST_VAR = "test-value";
		const value = env("TEST_VAR");
		expect(value).toBeDefined();
	});

	it("should use default value when env var is not set", () => {
		const value = env("TEST_VAR", "default-value");
		expect(value).toBeDefined();
	});

	it("should throw error when env var is not set and no default", () => {
		expect(() => env("TEST_VAR")).toThrow("Environment variable");
	});
});
