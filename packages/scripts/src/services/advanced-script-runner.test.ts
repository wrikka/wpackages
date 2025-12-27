import { describe, expect, it } from "vitest";
import type { Script } from "../types";
import { dryRunScript, formatScriptExecutionInfo, validateAdvancedScriptConfig } from "./advanced-script-runner";

describe("Advanced Script Runner", () => {
	describe("dryRunScript", () => {
		it("should create dry-run result", () => {
			const script: Script = {
				name: "build",
				command: "bun run build",
				cwd: "./src",
			};

			const result = dryRunScript(script);

			expect(result.name).toBe("build");
			expect(result.success).toBe(true);
			expect(result.output).toContain("[DRY RUN]");
			expect(result.output).toContain("bun run build");
			expect(result.output).toContain("./src");
		});

		it("should handle script without cwd", () => {
			const script: Script = {
				name: "test",
				command: "bun run test",
			};

			const result = dryRunScript(script);

			expect(result.name).toBe("test");
			expect(result.success).toBe(true);
			expect(result.output).toContain("[DRY RUN]");
			expect(result.output).not.toContain("in undefined");
		});
	});

	describe("validateAdvancedScriptConfig", () => {
		it("should validate correct configuration", () => {
			const script: Script = {
				name: "build",
				command: "bun run build",
				timeout: 5000,
				retries: 3,
				retryDelay: 1000,
			};

			const errors = validateAdvancedScriptConfig(script);
			expect(errors).toHaveLength(0);
		});

		it("should reject invalid timeout", () => {
			const script: Script = {
				name: "build",
				command: "bun run build",
				timeout: -1,
			};

			const errors = validateAdvancedScriptConfig(script);
			expect(errors).toHaveLength(1);
			expect(errors[0]).toContain("timeout");
		});

		it("should reject invalid retries", () => {
			const script: Script = {
				name: "build",
				command: "bun run build",
				retries: -1,
			};

			const errors = validateAdvancedScriptConfig(script);
			expect(errors).toHaveLength(1);
			expect(errors[0]).toContain("retries");
		});

		it("should reject invalid retryDelay", () => {
			const script: Script = {
				name: "build",
				command: "bun run build",
				retryDelay: -500,
			};

			const errors = validateAdvancedScriptConfig(script);
			expect(errors).toHaveLength(1);
			expect(errors[0]).toContain("retryDelay");
		});

		it("should detect multiple errors", () => {
			const script: Script = {
				name: "build",
				command: "bun run build",
				timeout: 0,
				retries: -1,
				retryDelay: -100,
			};

			const errors = validateAdvancedScriptConfig(script);
			expect(errors.length).toBeGreaterThan(1);
		});
	});

	describe("formatScriptExecutionInfo", () => {
		it("should format basic script info", () => {
			const script: Script = {
				name: "build",
				command: "bun run build",
			};

			const info = formatScriptExecutionInfo(script);

			expect(info).toContain("Script: build");
			expect(info).toContain("Command: bun run build");
		});

		it("should include all advanced options", () => {
			const script: Script = {
				name: "deploy",
				description: "Deploy to production",
				command: "bun run deploy",
				timeout: 30000,
				retries: 3,
				retryDelay: 2000,
				dryRun: true,
				continueOnError: true,
			};

			const info = formatScriptExecutionInfo(script);

			expect(info).toContain("Script: deploy");
			expect(info).toContain("Description: Deploy to production");
			expect(info).toContain("Command: bun run deploy");
			expect(info).toContain("Timeout: 30000ms");
			expect(info).toContain("Retries: 3");
			expect(info).toContain("Retry Delay: 2000ms");
			expect(info).toContain("Mode: DRY RUN");
			expect(info).toContain("Continue on Error: true");
		});

		it("should omit optional fields when not present", () => {
			const script: Script = {
				name: "build",
				command: "bun run build",
			};

			const info = formatScriptExecutionInfo(script);

			expect(info).not.toContain("Timeout:");
			expect(info).not.toContain("Retries:");
			expect(info).not.toContain("DRY RUN");
		});
	});
});
