#!/usr/bin/env bun
import { runE2EFromCli } from "../src/e2e/cli";
import { run } from "../src/services/runner/main";

const [, , command, ...rest] = process.argv;

if (command === "e2e") {
	const exitCode = await runE2EFromCli(rest);
	process.exit(exitCode);
}

run().catch(error => {
	console.error("An unexpected error occurred:", error);
	process.exit(1);
});
