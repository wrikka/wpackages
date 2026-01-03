import { describe, expect, it } from "vitest";
import { createRunnerError, formatErrorMessage, isExitCodeError, isSignalError, isTimeoutError } from "./error";

describe("error utils", () => {
	describe("createRunnerError", () => {
		it("should create RunnerError with all properties", () => {
			const error = createRunnerError({
				command: "test command",
				exitCode: 1,
				stdout: "output",
				stderr: "error output",
				signal: null,
				timedOut: false,
				killed: false,
			});

			expect(error.name).toBe("RunnerError");
			expect(error.command).toBe("test command");
			expect(error.exitCode).toBe(1);
			expect(error.stdout).toBe("output");
			expect(error.stderr).toBe("error output");
			expect(error.signal).toBe(null);
			expect(error.timedOut).toBe(false);
			expect(error.killed).toBe(false);
		});

		it("should create RunnerError with custom message", () => {
			const error = createRunnerError({
				command: "test",
				exitCode: 1,
				stdout: "",
				stderr: "",
				signal: null,
				timedOut: false,
				killed: false,
				message: "Custom error message",
			});

			expect(error.message).toBe("Custom error message");
		});

		it("should create RunnerError with default message", () => {
			const error = createRunnerError({
				command: "test",
				exitCode: 1,
				stdout: "",
				stderr: "",
				signal: null,
				timedOut: false,
				killed: false,
			});

			expect(error.message).toBe("Command failed with exit code 1: test");
		});
	});

	describe("formatErrorMessage", () => {
		it("should format error message with all information", () => {
			const error = createRunnerError({
				command: "test command",
				exitCode: 1,
				stdout: "output",
				stderr: "error output",
				signal: null,
				timedOut: false,
				killed: false,
			});

			const formatted = formatErrorMessage(error);

			expect(formatted).toContain("Command: test command");
			expect(formatted).toContain("Exit code: 1");
			expect(formatted).toContain("Stderr:\nerror output");
			expect(formatted).toContain("Stdout:\noutput");
		});

		it("should format timeout error", () => {
			const error = createRunnerError({
				command: "test",
				exitCode: null,
				stdout: "",
				stderr: "",
				signal: "SIGTERM",
				timedOut: true,
				killed: true,
			});

			const formatted = formatErrorMessage(error);

			expect(formatted).toContain("Timed out: true");
			expect(formatted).toContain("Killed: true");
			expect(formatted).toContain("Signal: SIGTERM");
		});
	});

	describe("isTimeoutError", () => {
		it("should return true for timeout error", () => {
			const error = createRunnerError({
				command: "test",
				exitCode: null,
				stdout: "",
				stderr: "",
				signal: null,
				timedOut: true,
				killed: false,
			});

			expect(isTimeoutError(error)).toBe(true);
		});

		it("should return false for non-timeout error", () => {
			const error = createRunnerError({
				command: "test",
				exitCode: 1,
				stdout: "",
				stderr: "",
				signal: null,
				timedOut: false,
				killed: false,
			});

			expect(isTimeoutError(error)).toBe(false);
		});

		it("should return false for non-RunnerError", () => {
			const error = new Error("test");
			expect(isTimeoutError(error)).toBe(false);
		});
	});

	describe("isSignalError", () => {
		it("should return true for signal error", () => {
			const error = createRunnerError({
				command: "test",
				exitCode: null,
				stdout: "",
				stderr: "",
				signal: "SIGTERM",
				timedOut: false,
				killed: true,
			});

			expect(isSignalError(error)).toBe(true);
		});

		it("should return false for non-signal error", () => {
			const error = createRunnerError({
				command: "test",
				exitCode: 1,
				stdout: "",
				stderr: "",
				signal: null,
				timedOut: false,
				killed: false,
			});

			expect(isSignalError(error)).toBe(false);
		});
	});

	describe("isExitCodeError", () => {
		it("should return true for non-zero exit code", () => {
			const error = createRunnerError({
				command: "test",
				exitCode: 1,
				stdout: "",
				stderr: "",
				signal: null,
				timedOut: false,
				killed: false,
			});

			expect(isExitCodeError(error)).toBe(true);
		});

		it("should return false for zero exit code", () => {
			const error = createRunnerError({
				command: "test",
				exitCode: 0,
				stdout: "",
				stderr: "",
				signal: null,
				timedOut: false,
				killed: false,
			});

			expect(isExitCodeError(error)).toBe(false);
		});

		it("should return false for null exit code", () => {
			const error = createRunnerError({
				command: "test",
				exitCode: null,
				stdout: "",
				stderr: "",
				signal: "SIGTERM",
				timedOut: false,
				killed: true,
			});

			expect(isExitCodeError(error)).toBe(false);
		});
	});
});
