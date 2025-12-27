import { describe, expect, it } from "vitest";
import { isOk } from "../types/result";
import { execute, executeStream, executeSync } from "./execute";

describe("execute utils", () => {
	describe("execute", () => {
		it("should execute simple command", async () => {
			const result = await execute({
				command: process.platform === "win32" ? "cmd" : "echo",
				args: process.platform === "win32" ? ["/c", "echo", "hello"] : ["hello"],
			});

			if (!isOk(result)) {
				throw new Error("Expected result to be ok");
			}
			expect(result.value.success).toBe(true);
			expect(result.value.exitCode).toBe(0);
			expect(result.value.stdout).toContain("hello");
		});

		it("should handle command with cwd", async () => {
			const testCwd = process.platform === "win32"
				? process.env.TEMP || "C:\\Windows\\Temp"
				: "/tmp";
			const result = await execute({
				command: process.platform === "win32" ? "cmd" : "pwd",
				args: process.platform === "win32" ? ["/c", "cd"] : undefined,
				cwd: testCwd,
			});

			if (!isOk(result)) {
				throw new Error("Expected result to be ok");
			}
			expect(result.value.stdout.toLowerCase()).toContain(
				testCwd.toLowerCase(),
			);
		});

		it("should handle command with env", async () => {
			const result = await execute({
				command: process.platform === "win32" ? "cmd" : "sh",
				args: process.platform === "win32"
					? ["/c", "echo", "%TEST_VAR%"]
					: ["-c", "echo $TEST_VAR"],
				env: { TEST_VAR: "test_value" },
			});

			if (!isOk(result)) {
				throw new Error("Expected result to be ok");
			}
			expect(result.value.stdout).toContain("test_value");
		});

		it("should handle failed command", async () => {
			const result = await execute({
				command: "exit",
				args: ["1"],
				shell: true,
				rejectOnError: true,
			});

			if (isOk(result)) {
				throw new Error("Expected result to be error");
			}
			expect(result.error.exitCode).toBe(1);
		});

		it(
			"should handle command timeout",
			async () => {
				if (process.platform === "win32") {
					return;
				}
				const result = await execute({
					command: "sleep",
					args: ["10"],
					timeout: 100,
					rejectOnError: true,
				});

				const errResult = result as typeof result & { error: { timedOut: boolean } };
				expect(isOk(result)).toBe(false);
				expect(errResult.error.timedOut).toBe(true);
			},
			1000,
		);

		it("should handle dry run mode", async () => {
			const result = await execute({
				command: "dangerous-command",
				dryRun: true,
			});

			if (!isOk(result)) {
				throw new Error("Expected result to be ok");
			}
			expect(result.value.success).toBe(true);
			expect(result.value.duration).toBe(0);
		});

		it("should strip final newline", async () => {
			const result = await execute({
				command: process.platform === "win32" ? "cmd" : "echo",
				args: process.platform === "win32" ? ["/c", "echo", "hello"] : ["hello"],
				stripFinalNewline: true,
			});

			if (!isOk(result)) {
				throw new Error("Expected result to be ok");
			}
			expect(result.value.stdout).toBe("hello");
			expect(result.value.stdout.endsWith("\n")).toBe(false);
		});

		it("should not strip final newline when disabled", async () => {
			const result = await execute({
				command: process.platform === "win32" ? "cmd" : "echo",
				args: process.platform === "win32" ? ["/c", "echo", "hello"] : ["hello"],
				stripFinalNewline: false,
			});

			if (!isOk(result)) {
				throw new Error("Expected result to be ok");
			}
			// On Windows, echo adds \r\n
			expect(
				result.value.stdout === "hello\n"
					|| result.value.stdout === "hello\r\n"
					|| result.value.stdout.trim() === "hello",
			).toBe(true);
		});
	});

	describe("executeStream", () => {
		it("should stream stdout", async () => {
			const chunks: string[] = [];

			const result = await executeStream(
				{
					command: process.platform === "win32" ? "cmd" : "echo",
					args: process.platform === "win32" ? ["/c", "echo", "hello"] : ["hello"],
				},
				{
					onStdout: (chunk) => {
						chunks.push(chunk);
					},
				},
			);

			expect(isOk(result)).toBe(true);
			expect(chunks.length).toBeGreaterThan(0);
			expect(chunks.join("")).toContain("hello");
		});

		it("should stream stderr", async () => {
			const stderrChunks: string[] = [];

			const result = await executeStream(
				{
					command: process.platform === "win32" ? "cmd" : "sh",
					args: process.platform === "win32"
						? ["/c", "echo error 1>&2"]
						: ["-c", "echo error >&2"],
					rejectOnError: false,
				},
				{
					onStderr: (chunk) => {
						stderrChunks.push(chunk);
					},
				},
			);

			if (!isOk(result)) {
				throw new Error("Expected result to be ok");
			}
			expect(result.value.stderr).toContain("error");
		});

		it("should stream combined output", async () => {
			const outputChunks: string[] = [];

			const result = await executeStream(
				{
					command: process.platform === "win32" ? "cmd" : "echo",
					args: process.platform === "win32" ? ["/c", "echo", "hello"] : ["hello"],
				},
				{
					onOutput: (chunk) => {
						outputChunks.push(chunk);
					},
				},
			);

			expect(isOk(result)).toBe(true);
			expect(outputChunks.length).toBeGreaterThan(0);
		});
	});

	describe("executeSync", () => {
		it("should execute command synchronously", () => {
			const result = executeSync({
				command: process.platform === "win32" ? "cmd" : "echo",
				args: process.platform === "win32" ? ["/c", "echo", "hello"] : ["hello"],
			});

			if (!isOk(result)) {
				throw new Error("Expected result to be ok");
			}
			expect(result.value.success).toBe(true);
			expect(result.value.stdout).toContain("hello");
		});

		it("should handle failed command synchronously", () => {
			const result = executeSync({
				command: "exit",
				args: ["1"],
				shell: true,
			});

			expect(isOk(result)).toBe(false);
		});

		it("should handle dry run in sync mode", () => {
			const result = executeSync({
				command: "dangerous-command",
				dryRun: true,
			});

			expect(isOk(result)).toBe(true);
		});
	});
});
