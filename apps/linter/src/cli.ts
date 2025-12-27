#!/usr/bin/env node

import pc from "picocolors";
import { lint } from "./app";

const helpText = `
${pc.bold(pc.cyan("lint"))} - Advanced TypeScript/JavaScript Linter

${pc.bold("Usage:")}
  wtslint [paths...] [options]

${pc.bold("Options:")}
  --fix              Apply auto-fixes where possible
  --silent           Suppress output (exit code only)
  --help, -h         Show this help message
`;

const main = async () => {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.includes("-h")) {
		console.log(helpText);
		return;
	}

	const paths = args.filter((arg) => !arg.startsWith("--"));
	if (paths.length === 0) {
		console.error(pc.red("Error: No paths specified"));
		process.exit(1);
	}

	const result = await lint({
		paths,
		fix: args.includes("--fix"),
		silent: args.includes("--silent"),
	});

	if (result.isErr()) {
		console.error(pc.red("Fatal error:"), result.unwrapErr());
		process.exit(2);
	}

	const report = result.unwrap();
	if (report.errorCount > 0) {
		process.exit(1);
	}
};

main().catch((error) => {
	console.error(pc.red("Fatal error:"), error);
	process.exit(2);
});
