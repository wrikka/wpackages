import { describe, expect, it } from "vitest";
import type { ParsedEnv } from "../types/env";
import { expandEnv, expandValue, extractVariables, hasVariables } from "./expansion.utils";

describe("expansion.utils", () => {
	describe("expandValue", () => {
		it("should expand ${VAR} syntax", () => {
			const env: ParsedEnv = { API_KEY: "secret123" };
			const result = expandValue("Key: ${API_KEY}", env);
			expect(result).toBe("Key: secret123");
		});

		it("should expand $VAR syntax", () => {
			const env: ParsedEnv = { API_KEY: "secret123" };
			const result = expandValue("Key: $API_KEY", env);
			expect(result).toBe("Key: secret123");
		});

		it("should leave unknown variables unchanged", () => {
			const env: ParsedEnv = {};
			const result = expandValue("Key: ${UNKNOWN}", env);
			expect(result).toBe("Key: ${UNKNOWN}");
		});

		it("should handle multiple variables", () => {
			const env: ParsedEnv = { HOST: "localhost", PORT: "3000" };
			const result = expandValue("URL: ${HOST}:${PORT}", env);
			expect(result).toBe("URL: localhost:3000");
		});
	});

	describe("expandEnv", () => {
		it("should expand all variables in env", () => {
			const env: ParsedEnv = {
				BASE_URL: "http://localhost",
				API_URL: "${BASE_URL}/api",
				FULL_URL: "${API_URL}/v1",
			};
			const result = expandEnv(env);
			expect(result.BASE_URL).toBe("http://localhost");
			expect(result.API_URL).toBe("http://localhost/api");
			expect(result.FULL_URL).toBe("http://localhost/api/v1");
		});

		it("should handle circular references safely", () => {
			const env: ParsedEnv = {
				VAR_A: "${VAR_B}",
				VAR_B: "${VAR_A}",
			};
			const result = expandEnv(env);
			expect(result).toBeDefined();
		});

		it("should not modify env without variables", () => {
			const env: ParsedEnv = {
				API_KEY: "secret",
				PORT: "3000",
			};
			const result = expandEnv(env);
			expect(result).toEqual(env);
		});
	});

	describe("hasVariables", () => {
		it("should detect ${VAR} syntax", () => {
			expect(hasVariables("${API_KEY}")).toBe(true);
			expect(hasVariables("Test ${VAR} test")).toBe(true);
		});

		it("should detect $VAR syntax", () => {
			expect(hasVariables("$API_KEY")).toBe(true);
			expect(hasVariables("Test $VAR test")).toBe(true);
		});

		it("should return false for no variables", () => {
			expect(hasVariables("plain text")).toBe(false);
			expect(hasVariables("")).toBe(false);
		});
	});

	describe("extractVariables", () => {
		it("should extract ${VAR} variables", () => {
			const vars = extractVariables("${API_KEY} and ${PORT}");
			expect(vars).toContain("API_KEY");
			expect(vars).toContain("PORT");
		});

		it("should extract $VAR variables", () => {
			const vars = extractVariables("$API_KEY and $PORT");
			expect(vars).toContain("API_KEY");
			expect(vars).toContain("PORT");
		});

		it("should remove duplicates", () => {
			const vars = extractVariables("${API_KEY} $API_KEY ${API_KEY}");
			expect(vars.length).toBe(1);
			expect(vars[0]).toBe("API_KEY");
		});

		it("should return empty array for no variables", () => {
			const vars = extractVariables("plain text");
			expect(vars).toEqual([]);
		});
	});
});
