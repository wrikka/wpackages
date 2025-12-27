import { describe, expect, it } from "vitest";
import type { RunnerError } from "../types";
import { isErr, isOk } from "../types/result";
import {
	executeWithRetry,
	retryAll,
	retryAny,
	retryOnExitCodes,
	retryOnNetworkError,
	retryOnTimeout,
	retryUntil,
} from "./retry";

describe("retry utils", () => {
	describe("executeWithRetry", () => {
		it("should succeed on first attempt", async () => {
			const result = await executeWithRetry({
				command: process.platform === "win32" ? "cmd" : "echo",
				args: process.platform === "win32"
					? ["/c", "echo", "success"]
					: ["success"],
			});

			const okResult = result as typeof result & { value: { stdout: string } };
			expect(isOk(result)).toBe(true);
			expect(okResult.value.stdout).toContain("success");
		});

		it("should retry on failure", async () => {
			let attempts = 0;

			const result = await executeWithRetry(
				{
					command: process.platform === "win32" ? "cmd" : "sh",
					args: process.platform === "win32" ? ["/c", "exit 1"] : ["-c", "exit 1"],
					shell: true,
				},
				{
					retries: 2,
					retryDelay: 10,
					onRetry: () => {
						attempts++;
					},
				},
			);

			expect(isErr(result)).toBe(true);
			expect(attempts).toBe(2); // Should retry 2 times after initial attempt
		}, 5000);

		it("should respect shouldRetry predicate", async () => {
			let attempts = 0;

			const result = await executeWithRetry(
				{
					command: "exit",
					args: ["1"],
					shell: true,
				},
				{
					retries: 3,
					retryDelay: 10,
					shouldRetry: () => false, // Never retry
					onRetry: () => {
						attempts++;
					},
				},
			);

			expect(isErr(result)).toBe(true);
			expect(attempts).toBe(0); // Should not retry
		});

		it("should apply exponential backoff", async () => {
			const delays: number[] = [];
			const startTimes: number[] = [];

			await executeWithRetry(
				{
					command: "exit",
					args: ["1"],
					shell: true,
				},
				{
					retries: 2,
					retryDelay: 10,
					backoffFactor: 2,
					onRetry: () => {
						const now = Date.now();
						startTimes.push(now);
						if (startTimes.length > 1) {
							delays.push(now - startTimes[startTimes.length - 2]);
						}
					},
				},
			);

			// Delays should increase with backoff
			expect(delays.length).toBeGreaterThan(1);
			expect(delays[1]).toBeGreaterThan(delays[0]);
		}, 5000);
	});

	describe("retry predicates", () => {
		describe("retryOnTimeout", () => {
			it("should return true for timeout errors", () => {
				const error: RunnerError = {
					name: "RunnerError",
					command: "test",
					exitCode: null,
					stdout: "",
					stderr: "",
					signal: null,
					timedOut: true,
					killed: true,
					message: "Timeout",
				};

				expect(retryOnTimeout(error)).toBe(true);
			});

			it("should return false for non-timeout errors", () => {
				const error: RunnerError = {
					name: "RunnerError",
					command: "test",
					exitCode: 1,
					stdout: "",
					stderr: "",
					signal: null,
					timedOut: false,
					killed: false,
					message: "Error",
				};

				expect(retryOnTimeout(error)).toBe(false);
			});
		});

		describe("retryOnExitCodes", () => {
			it("should retry on specified exit codes", () => {
				const predicate = retryOnExitCodes([1, 2, 3]);

				const error1: Partial<RunnerError> = {
					name: "RunnerError",
					exitCode: 1,
					timedOut: false,
					killed: false,
				};

				const error2: Partial<RunnerError> = {
					name: "RunnerError",
					exitCode: 5,
					timedOut: false,
					killed: false,
				};

				expect(predicate(error1)).toBe(true);
				expect(predicate(error2)).toBe(false);
			});
		});

		describe("retryOnNetworkError", () => {
			it("should retry on common network exit codes", () => {
				const networkCodes = [6, 7, 28, 35, 56];

				for (const code of networkCodes) {
					const error: Partial<RunnerError> = { name: "RunnerError", exitCode: code };
					expect(retryOnNetworkError(error)).toBe(true);
				}
			});

			it("should not retry on non-network exit codes", () => {
				const error: Partial<RunnerError> = { name: "RunnerError", exitCode: 1 };
				expect(retryOnNetworkError(error)).toBe(false);
			});
		});

		describe("retryAll", () => {
			it("should require all predicates to be true", () => {
				const predicate = retryAll(
					(error) => error.exitCode === 1,
					(error) => error.stderr !== "",
				);

				const error1: Partial<RunnerError> = { name: "RunnerError", exitCode: 1, stderr: "error" };
				const error2: Partial<RunnerError> = { name: "RunnerError", exitCode: 1, stderr: "" };
				const error3: Partial<RunnerError> = { name: "RunnerError", exitCode: 2, stderr: "error" };

				expect(predicate(error1, 0)).toBe(true);
				expect(predicate(error2, 0)).toBe(false);
				expect(predicate(error3, 0)).toBe(false);
			});
		});

		describe("retryAny", () => {
			it("should require at least one predicate to be true", () => {
				const predicate = retryAny(
					(error) => error.exitCode === 1,
					(error) => error.timedOut,
				);

				const error1: Partial<RunnerError> = { name: "RunnerError", exitCode: 1, timedOut: false };
				const error2: Partial<RunnerError> = { name: "RunnerError", exitCode: 2, timedOut: true };
				const error3: Partial<RunnerError> = { name: "RunnerError", exitCode: 2, timedOut: false };

				expect(predicate(error1, 0)).toBe(true);
				expect(predicate(error2, 0)).toBe(true);
				expect(predicate(error3, 0)).toBe(false);
			});
		});

		describe("retryUntil", () => {
			it("should retry until max attempts", () => {
				const predicate = retryUntil(2);

				const error = {} as RunnerError;

				expect(predicate(error, 0)).toBe(true);
				expect(predicate(error, 1)).toBe(true);
				expect(predicate(error, 2)).toBe(false);
			});

			it("should combine with custom predicate", () => {
				const predicate = retryUntil(3, (error) => error.exitCode === 1);

				const error1: Partial<RunnerError> = { name: "RunnerError", exitCode: 1 };
				const error2: Partial<RunnerError> = { name: "RunnerError", exitCode: 2 };

				expect(predicate(error1, 0)).toBe(true);
				expect(predicate(error1, 3)).toBe(false);
				expect(predicate(error2, 0)).toBe(false);
			});
		});
	});
});
