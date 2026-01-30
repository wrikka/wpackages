import { describe, expect, it } from "vitest";
import { parseArgs } from "./utils/args";

describe("env-manager args", () => {
	it("defaults to current directory and json output", () => {
		const opts = parseArgs([]);
		expect(opts.paths).toEqual(["."]);
		expect(opts.output).toBe("json");
	});

	it("parses env and output", () => {
		const opts = parseArgs(["--env", "production", "--output", "dotenv", "apps"]);
		expect(opts.environment).toBe("production");
		expect(opts.output).toBe("dotenv");
		expect(opts.paths).toEqual(["apps"]);
	});
});
