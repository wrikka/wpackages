import { describe, expect, it } from "vitest";
import type { EnvSchema } from "../types/env";
import { castValue, validateEnv } from "./validate.utils";

describe("validate.utils", () => {
	describe("validateEnv", () => {
		it("should validate required fields", () => {
			const schema: EnvSchema<{ API_KEY: string }> = {
				API_KEY: { type: "string", required: true },
			};

			const result = validateEnv({}, schema);
			expect(result.valid).toBe(false);
			expect(result.errors.length).toBeGreaterThan(0);
		});

		it("should pass valid env", () => {
			const schema: EnvSchema<{ API_KEY: string; PORT: number }> = {
				API_KEY: { type: "string", required: true },
				PORT: { type: "number", required: false },
			};

			const result = validateEnv({ API_KEY: "secret123", PORT: "3000" }, schema);
			expect(result.valid).toBe(true);
		});

		it("should validate number type", () => {
			const schema: EnvSchema<{ PORT: number }> = {
				PORT: { type: "number", required: true },
			};

			const invalidResult = validateEnv({ PORT: "abc" }, schema);
			expect(invalidResult.valid).toBe(false);

			const validResult = validateEnv({ PORT: "3000" }, schema);
			expect(validResult.valid).toBe(true);
		});

		it("should validate boolean type", () => {
			const schema: EnvSchema<{ ENABLED: boolean }> = {
				ENABLED: { type: "boolean", required: true },
			};

			const validResult = validateEnv({ ENABLED: "true" }, schema);
			expect(validResult.valid).toBe(true);
		});

		it("should validate url type", () => {
			const schema: EnvSchema<{ API_URL: string }> = {
				API_URL: { type: "url", required: true },
			};

			const validResult = validateEnv(
				{ API_URL: "https://api.example.com" },
				schema,
			);
			expect(validResult.valid).toBe(true);
		});

		it("should validate email type", () => {
			const schema: EnvSchema<{ EMAIL: string }> = {
				EMAIL: { type: "email", required: true },
			};

			const validResult = validateEnv({ EMAIL: "user@example.com" }, schema);
			expect(validResult.valid).toBe(true);
		});

		it("should validate pattern", () => {
			const schema: EnvSchema<{ CODE: string }> = {
				CODE: {
					type: "string",
					required: true,
					pattern: /^[A-Z]{3}-\d{3}$/,
				},
			};

			const invalidResult = validateEnv({ CODE: "invalid" }, schema);
			expect(invalidResult.valid).toBe(false);

			const validResult = validateEnv({ CODE: "ABC-123" }, schema);
			expect(validResult.valid).toBe(true);
		});

		it("should validate choices", () => {
			const schema: EnvSchema<{ ENV: string }> = {
				ENV: {
					type: "string",
					required: true,
					choices: ["development", "production", "test"],
				},
			};

			const invalidResult = validateEnv({ ENV: "invalid" }, schema);
			expect(invalidResult.valid).toBe(false);

			const validResult = validateEnv({ ENV: "production" }, schema);
			expect(validResult.valid).toBe(true);
		});

		it("should handle custom validation", () => {
			const schema: EnvSchema<{ PORT: number }> = {
				PORT: {
					type: "number",
					required: true,
					validate: (value) => {
						const port = Number(value);
						return port >= 1024 && port <= 65535
							? true
							: "Port must be between 1024 and 65535";
					},
				},
			};

			const invalidResult = validateEnv({ PORT: "80" }, schema);
			expect(invalidResult.valid).toBe(false);

			const validResult = validateEnv({ PORT: "3000" }, schema);
			expect(validResult.valid).toBe(true);
		});
	});

	describe("castValue", () => {
		it("should cast to number", () => {
			expect(castValue("123", "number")).toBe(123);
			expect(castValue("3.14", "number")).toBe(3.14);
		});

		it("should cast to boolean", () => {
			expect(castValue("true", "boolean")).toBe(true);
			expect(castValue("false", "boolean")).toBe(false);
			expect(castValue("1", "boolean")).toBe(true);
			expect(castValue("0", "boolean")).toBe(false);
		});

		it("should cast to json", () => {
			const json = castValue("{\"key\":\"value\"}", "json");
			expect(json).toEqual({ key: "value" });
		});

		it("should cast to array", () => {
			const arr = castValue("a,b,c", "array");
			expect(arr).toEqual(["a", "b", "c"]);
		});

		it("should return string for string type", () => {
			expect(castValue("test", "string")).toBe("test");
		});
	});
});
