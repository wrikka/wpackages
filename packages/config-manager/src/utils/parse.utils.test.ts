import { describe, expect, it } from "vitest";
import { mergeEnvs, parseEnvContent, serializeEnv } from "./parse.utils";

describe("parse.utils", () => {
	describe("parseEnvContent", () => {
		it("should parse simple key=value", () => {
			const content = "API_KEY=secret123\nPORT=3000";
			const result = parseEnvContent(content);
			expect(result.API_KEY).toBe("secret123");
			expect(result.PORT).toBe("3000");
		});

		it("should skip empty lines and comments", () => {
			const content = "# Comment\nAPI_KEY=secret\n\n# Another comment\nPORT=3000";
			const result = parseEnvContent(content);
			expect(result.API_KEY).toBe("secret");
			expect(result.PORT).toBe("3000");
		});

		it("should handle quoted values", () => {
			const content = "MESSAGE=\"Hello World\"\nPATH='/usr/bin'";
			const result = parseEnvContent(content);
			expect(result.MESSAGE).toBe("Hello World");
			expect(result.PATH).toBe("/usr/bin");
		});

		it("should handle multi-line values", () => {
			const content = "MULTILINE=\"Line 1\nLine 2\nLine 3\"";
			const result = parseEnvContent(content);
			expect(result.MULTILINE).toContain("Line 1");
		});

		it("should remove inline comments", () => {
			const content = "API_KEY=secret123 # This is the API key";
			const result = parseEnvContent(content);
			expect(result.API_KEY).toBe("secret123");
		});

		it("should handle values with spaces", () => {
			const content = "KEY = value with spaces";
			const result = parseEnvContent(content);
			expect(result.KEY).toBe("value with spaces");
		});
	});

	describe("serializeEnv", () => {
		it("should serialize env to .env format", () => {
			const env = { API_KEY: "secret123", PORT: "3000" };
			const result = serializeEnv(env);
			expect(result).toContain("API_KEY=secret123");
			expect(result).toContain("PORT=3000");
		});

		it("should quote values with special characters", () => {
			const env = { MESSAGE: "Hello World", PATH: "/usr/bin" };
			const result = serializeEnv(env);
			expect(result).toContain("\"");
		});

		it("should escape special characters", () => {
			const env = { TEXT: "Line1\nLine2" };
			const result = serializeEnv(env);
			expect(result).toContain("\\n");
		});
	});

	describe("mergeEnvs", () => {
		it("should merge multiple envs", () => {
			const env1 = { A: "1", B: "2" };
			const env2 = { B: "3", C: "4" };
			const result = mergeEnvs(env1, env2);
			expect(result.A).toBe("1");
			expect(result.B).toBe("3");
			expect(result.C).toBe("4");
		});

		it("should handle empty envs", () => {
			const result = mergeEnvs({}, { A: "1" }, {});
			expect(result.A).toBe("1");
		});

		it("should preserve order (later wins)", () => {
			const env1 = { KEY: "value1" };
			const env2 = { KEY: "value2" };
			const env3 = { KEY: "value3" };
			const result = mergeEnvs(env1, env2, env3);
			expect(result.KEY).toBe("value3");
		});
	});
});
