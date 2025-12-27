import { describe, expect, it } from "vitest";
import {
	buildCommand,
	buildPath,
	getLocalBinPath,
	normalizeOptions,
	parseCommand,
	parseEnv,
	stripFinalNewline,
} from "./parse";

describe("parse utils", () => {
	describe("parseCommand", () => {
		it("should parse simple command", () => {
			const result = parseCommand("echo hello");
			expect(result).toEqual({
				command: "echo",
				args: ["hello"],
			});
		});

		it("should parse command with multiple args", () => {
			const result = parseCommand("git commit -m message");
			expect(result).toEqual({
				command: "git",
				args: ["commit", "-m", "message"],
			});
		});

		it("should parse command with quoted args", () => {
			const result = parseCommand("echo \"hello world\"");
			expect(result).toEqual({
				command: "echo",
				args: ["hello world"],
			});
		});

		it("should parse command with single quotes", () => {
			const result = parseCommand("echo 'hello world'");
			expect(result).toEqual({
				command: "echo",
				args: ["hello world"],
			});
		});

		it("should parse array input", () => {
			const result = parseCommand(["echo", "hello", "world"]);
			expect(result).toEqual({
				command: "echo",
				args: ["hello", "world"],
			});
		});

		it("should handle empty string", () => {
			const result = parseCommand("");
			expect(result).toEqual({
				command: "",
				args: [],
			});
		});

		it("should handle command without args", () => {
			const result = parseCommand("echo");
			expect(result).toEqual({
				command: "echo",
				args: [],
			});
		});
	});

	describe("buildCommand", () => {
		it("should build command without args", () => {
			const result = buildCommand("echo");
			expect(result).toBe("echo");
		});

		it("should build command with args", () => {
			const result = buildCommand("echo", ["hello", "world"]);
			expect(result).toBe("echo hello world");
		});

		it("should escape args with spaces", () => {
			const result = buildCommand("echo", ["hello world"]);
			expect(result).toBe("echo \"hello world\"");
		});

		it("should escape args with quotes", () => {
			const result = buildCommand("echo", ["hello \"world\""]);
			expect(result).toBe("echo \"hello \\\"world\\\"\"");
		});

		it("should handle empty args array", () => {
			const result = buildCommand("echo", []);
			expect(result).toBe("echo");
		});
	});

	describe("parseEnv", () => {
		it("should return process.env when no env provided", () => {
			const result = parseEnv();
			expect(result).toEqual(process.env);
		});

		it("should merge custom env with process.env", () => {
			const result = parseEnv({ CUSTOM: "value" });
			expect(result).toMatchObject({
				...process.env,
				CUSTOM: "value",
			});
		});

		it("should override process.env values", () => {
			const result = parseEnv({ PATH: "/custom/path" });
			expect(result.PATH).toBe("/custom/path");
		});
	});

	describe("normalizeOptions", () => {
		it("should set default values", () => {
			const result = normalizeOptions({});
			expect(result.encoding).toBe("utf8");
			expect(result.stripFinalNewline).toBe(true);
			expect(result.preferLocal).toBe(true);
			expect(result.rejectOnError).toBe(true);
			expect(result.stdout).toBe("pipe");
			expect(result.stderr).toBe("pipe");
			expect(result.stdin).toBe("pipe");
			expect(result.verbose).toBe(false);
			expect(result.dryRun).toBe(false);
			expect(result.inheritStdio).toBe(false);
		});

		it("should preserve provided values", () => {
			const result = normalizeOptions({
				encoding: "base64",
				stripFinalNewline: false,
				preferLocal: false,
				verbose: true,
			});
			expect(result.encoding).toBe("base64");
			expect(result.stripFinalNewline).toBe(false);
			expect(result.preferLocal).toBe(false);
			expect(result.verbose).toBe(true);
		});
	});

	describe("stripFinalNewline", () => {
		it("should strip \\n", () => {
			expect(stripFinalNewline("hello\n")).toBe("hello");
		});

		it("should strip \\r\\n", () => {
			expect(stripFinalNewline("hello\r\n")).toBe("hello");
		});

		it("should not strip internal newlines", () => {
			expect(stripFinalNewline("hello\nworld\n")).toBe("hello\nworld");
		});

		it("should handle string without newline", () => {
			expect(stripFinalNewline("hello")).toBe("hello");
		});

		it("should handle empty string", () => {
			expect(stripFinalNewline("")).toBe("");
		});
	});

	describe("getLocalBinPath", () => {
		it("should return node_modules/.bin path", () => {
			const result = getLocalBinPath("/project");
			expect(result).toBe("/project/node_modules/.bin");
		});

		it("should use process.cwd() when no cwd provided", () => {
			const result = getLocalBinPath();
			expect(result).toContain("node_modules/.bin");
		});
	});

	describe("buildPath", () => {
		it("should return PATH when preferLocal is false", () => {
			const result = buildPath({ preferLocal: false });
			expect(result).toBe(process.env.PATH);
		});

		it("should prepend local bin path when preferLocal is true", () => {
			const result = buildPath({ preferLocal: true, cwd: "/project" });
			expect(result).toContain("/project/node_modules/.bin");
			expect(result).toContain(process.env.PATH);
		});

		it("should use custom localDir", () => {
			const result = buildPath({
				preferLocal: true,
				localDir: "/custom/bin",
			});
			expect(result).toContain("/custom/bin");
		});
	});
});
