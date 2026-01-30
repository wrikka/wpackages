import { parseArgs } from "./services/args.service";

export const runCodeSearchApp = async () => {
	const opts = parseArgs(process.argv.slice(2));

	const args: string[] = [];
	const subCommand = opts.replace ? "run" : "scan";
	args.push(subCommand);

	if (opts.pattern) {
		args.push("--pattern", opts.pattern);
	} else if (opts.rule) {
		args.push("--rule", opts.rule);
	} else {
		// parseArgs ensures one of pattern or rule is present
	}

	if (opts.replace) {
		args.push("--replace", opts.replace);
		// In check mode, we don't write files, we just want to see if there are changes.
		if (opts.write && !opts.check) {
			args.push("-U"); // alias for --update-all
		}
	}

	if (opts.output === "json") {
		args.push("--json");
	}

	args.push(...opts.paths);

	const proc = Bun.spawn(["sg", ...args], {
		stdout: "inherit",
		stderr: "inherit",
	});

	const exitCode = await proc.exited;

	if (opts.check && exitCode === 0) {
		// In check mode, ast-grep exits with 0 if there are changes to be made.
		// We want to exit with 1 to signal a failure in CI environments.
		// We need to capture stdout to check if it's empty or not.
		// This requires a more complex setup, for now we assume any 0 exit in check mode means changes.
		// A better check would be to see if sg printed any matches.
		// Let's re-spawn and capture output for check mode.

		const checkProc = Bun.spawn(["sg", ...args]);
		const textOutput = await new Response(checkProc.stdout).text();
		if (textOutput.trim().length > 0) {
			console.log("Changes detected in check mode.");
			process.exit(1);
		}
		process.exit(0);
	}

	if (exitCode !== 0) {
		process.exit(exitCode);
	}
};
