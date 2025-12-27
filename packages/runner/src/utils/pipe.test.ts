import { describe, expect, it } from "vitest";
import { isOk } from "../types/result";
import { executePipe, pipe, pipeWithOptions } from "./pipe";

describe("pipe utils", () => {
	describe("executePipe", () => {
		it("should execute single command in pipe", async () => {
			const result = await executePipe({
				commands: [
					{
						command: process.platform === "win32" ? "cmd" : "echo",
						args: process.platform === "win32"
							? ["/c", "echo", "hello"]
							: ["hello"],
					},
				],
			});

			if (!isOk(result)) {
				throw new Error("Expected result to be ok");
			}
			expect(result.value.stdout).toContain("hello");
		});

		it("should pipe output between commands", async () => {
			const result = await executePipe({
				commands: [
					{
						command: process.platform === "win32" ? "cmd" : "echo",
						args: process.platform === "win32"
							? ["/c", "echo", "hello world"]
							: ["hello world"],
					},
					{
						command: process.platform === "win32" ? "findstr" : "grep",
						args: process.platform === "win32" ? ["world"] : ["world"],
					},
				],
			});

			if (!isOk(result)) {
				throw new Error("Expected result to be ok");
			}
			expect(result.value.stdout).toContain("world");
		});

		it("should fail fast on error", async () => {
			const result = await executePipe({
				commands: [
					{
						command: process.platform === "win32" ? "cmd" : "echo",
						args: process.platform === "win32" ? ["/c", "echo", "test"] : ["test"],
					},
					{
						command: process.platform === "win32" ? "cmd" : "false",
						args: process.platform === "win32" ? ["/c", "exit", "1"] : undefined,
						shell: !process.platform,
					},
					{
						command: process.platform === "win32" ? "cmd" : "echo",
						args: process.platform === "win32"
							? ["/c", "echo", "should not run"]
							: ["should not run"],
					},
				],
				failFast: true,
			});

			expect(isOk(result)).toBe(false);
		});

		it("should continue on error when failFast is false", async () => {
			const result = await executePipe({
				commands: [
					{
						command: process.platform === "win32" ? "cmd" : "echo",
						args: process.platform === "win32"
							? ["/c", "echo", "test1"]
							: ["test1"],
					},
					{
						command: process.platform === "win32" ? "cmd" : "false",
						args: process.platform === "win32" ? ["/c", "exit", "1"] : undefined,
						shell: process.platform !== "win32",
						rejectOnError: false,
					},
					{
						command: process.platform === "win32" ? "cmd" : "echo",
						args: process.platform === "win32"
							? ["/c", "echo", "test2"]
							: ["test2"],
					},
				],
				failFast: false,
			});

			if (!isOk(result)) {
				throw new Error("Expected result to be ok");
			}
			expect(isOk(result)).toBe(true);
		});

		it("should handle empty commands array", async () => {
			const result = await executePipe({
				commands: [],
			});

			if (isOk(result)) {
				throw new Error("Expected result to be error");
			}
			expect(isOk(result)).toBe(false);
		});

		it(
			"should handle pipe timeout",
			async () => {
				if (process.platform === "win32") {
					return;
				}
				const result = await executePipe({
					commands: [
						{
							command: "sleep",
							args: ["5"],
						},
					],
					timeout: 100,
				});

				const errResult = result as typeof result & { error: { timedOut: boolean } };
				expect(isOk(result)).toBe(false);
				expect(errResult.error.timedOut).toBe(true);
			},
			1000,
		);
	});

		describe("pipe", () => {
			it("should create pipe options", () => {
				const pipeOpts = pipe("cmd1", "cmd2");

				expect(pipeOpts.commands).toHaveLength(2);
				expect(pipeOpts.failFast).toBe(true);
			});
		});

	describe("pipeWithOptions", () => {
		it("should create pipe with custom options", () => {
			const pipeOpts = pipeWithOptions(
				[
					{
						command: "echo",
						args: ["hello"],
					},
				],
				{
					timeout: 5000,
					failFast: false,
				},
			);

			expect(pipeOpts.commands).toHaveLength(1);
			expect(pipeOpts.timeout).toBe(5000);
			expect(pipeOpts.failFast).toBe(false);
		});
	});
});
