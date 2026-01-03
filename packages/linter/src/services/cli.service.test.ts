/**
 * Tests for CLI service
 */

import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import { makeCliService } from "./cli.service";
import type { Process } from "./cli.service";

describe("CliService", () => {
	it("should get command line arguments", async () => {
		const mockProcess: Process = {
			argv: ["node", "script.js", "--fix", "src/"],
			exit: () => {},
		};

		const service = makeCliService(mockProcess);
		const args = await Effect.runPromise(service.getArgs);

		expect(args).toEqual(["--fix", "src/"]);
	});

	it("should exclude first two argv elements", async () => {
		const mockProcess: Process = {
			argv: ["node", "wtslint", "file.ts"],
			exit: () => {},
		};

		const service = makeCliService(mockProcess);
		const args = await Effect.runPromise(service.getArgs);

		expect(args).toEqual(["file.ts"]);
		expect(args).not.toContain("node");
		expect(args).not.toContain("wtslint");
	});

	it("should handle empty arguments", async () => {
		const mockProcess: Process = {
			argv: ["node", "script.js"],
			exit: () => {},
		};

		const service = makeCliService(mockProcess);
		const args = await Effect.runPromise(service.getArgs);

		expect(args).toEqual([]);
	});

	it("should handle multiple flags and paths", async () => {
		const mockProcess: Process = {
			argv: ["node", "wtslint", "--fix", "--silent", "src/", "tests/"],
			exit: () => {},
		};

		const service = makeCliService(mockProcess);
		const args = await Effect.runPromise(service.getArgs);

		expect(args).toEqual(["--fix", "--silent", "src/", "tests/"]);
	});
});
