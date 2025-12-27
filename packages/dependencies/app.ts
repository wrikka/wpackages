#!/usr/bin/env node

import { Effect } from "effect";
import { basename } from "node:path";
import { semantic } from "./src/lib/index";
import * as depManager from "./src/services/dependency-manager.service";

/**
 * Get command from CLI name
 */
function getCommandFromCliName(): string {
	const cliName = basename(process.argv[1] || "wdep");

	// Map CLI names to commands
	const commandMap: Record<string, string> = {
		wi: "install",
		wr: "run",
		wx: "exec",
		wu: "update",
		wun: "remove",
		wdep: "help",
	};

	return commandMap[cliName] || "help";
}

/**
 * Parse CLI arguments
 */
function parseArgs() {
	const args = process.argv.slice(2);
	const command = getCommandFromCliName();

	return {
		command: command === "help" && args[0] ? args[0] : command,
		args,
		cwd: process.cwd() || ".",
	};
}

/**
 * Show help message
 */
function showHelp() {
	console.log(`
${semantic.highlight("WTS Dependencies Manager")} - Universal package manager CLI

${semantic.info("Usage:")}
  wi [packages...]           Install dependencies
  wr <script> [args...]      Run script
  wx <command> [args...]     Execute command (npx/bunx equivalent)
  wu [packages...]           Update dependencies
  wun <packages...>          Remove dependencies

${semantic.info("Options:")}
  -D, --dev                  Add as dev dependency
  -E, --exact                Install exact version
  -g, --global               Install globally
  -i, --interactive          Interactive mode
  --frozen                   Use frozen lockfile
  --production               Production mode (no dev deps)

${semantic.info("Examples:")}
  ${semantic.muted("# Install all dependencies")}
  wi

  ${semantic.muted("# Add packages")}
  wi react vue svelte

  ${semantic.muted("# Add dev dependencies")}
  wi -D vitest typescript

  ${semantic.muted("# Run script")}
  wr dev

  ${semantic.muted("# Execute command")}
  wx taze -r

  ${semantic.muted("# Update all packages")}
  wu

  ${semantic.muted("# Update specific packages")}
  wu react vue

  ${semantic.muted("# Remove packages")}
  wun lodash
`);
}

/**
 * Parse options from args
 */
function parseOptions(args: string[]) {
	const options: {
		dev?: boolean;
		exact?: boolean;
		global?: boolean;
		interactive?: boolean;
		frozen?: boolean;
		production?: boolean;
		silent?: boolean;
	} = {};

	const filteredArgs: string[] = [];

	for (const arg of args) {
		if (arg === "-D" || arg === "--dev") {
			options.dev = true;
		} else if (arg === "-E" || arg === "--exact") {
			options.exact = true;
		} else if (arg === "-g" || arg === "--global") {
			options.global = true;
		} else if (arg === "-i" || arg === "--interactive") {
			options.interactive = true;
		} else if (arg === "--frozen") {
			options.frozen = true;
		} else if (arg === "--production") {
			options.production = true;
		} else if (arg === "--silent") {
			options.silent = true;
		} else {
			filteredArgs.push(arg);
		}
	}

	return { options, args: filteredArgs };
}

/**
 * Main CLI function
 */
async function main() {
	const { command, args, cwd } = parseArgs();

	// Show help
	if (command === "help" || args.includes("--help") || args.includes("-h")) {
		showHelp();
		process.exit(0);
	}

	// Parse options and args
	const { options, args: packages } = parseOptions(args);

	try {
		// Execute command
		const effect = (() => {
			switch (command) {
				case "install":
					if (packages.length === 0) {
						return depManager.install({ cwd, ...options });
					}
					return depManager.add(packages, {
						cwd,
						type: options.dev ? "devDependencies" : "dependencies",
						...options,
					});

				case "run": {
					if (packages.length === 0) {
						console.error(semantic.error("Error: Script name required"));
						process.exit(1);
					}
					const [script, ...scriptArgs] = packages;
					if (!script) {
						console.error(semantic.error("Error: Script name required"));
						process.exit(1);
					}
					return depManager.run(script, { cwd, args: scriptArgs, ...options });
				}

				case "exec": {
					if (packages.length === 0) {
						console.error(semantic.error("Error: Command required"));
						process.exit(1);
					}
					const [cmd, ...cmdArgs] = packages;
					if (!cmd) {
						console.error(semantic.error("Error: Command required"));
						process.exit(1);
					}
					return depManager.exec(cmd, cmdArgs, cwd, options.silent);
				}

				case "update":
					return depManager.update(packages.length > 0 ? packages : undefined, { cwd, ...options });

				case "remove":
					if (packages.length === 0) {
						console.error(semantic.error("Error: Package name(s) required"));
						process.exit(1);
					}
					return depManager.remove(packages, { cwd, ...options });

				default:
					console.error(semantic.error(`Error: Unknown command "${command}"`));
					showHelp();
					process.exit(1);
			}
		})();

		// Run effect
		await Effect.runPromise(effect);

		console.log(semantic.success("✓ Done"));
	} catch (error) {
		console.error(semantic.error(`✗ Error: ${error instanceof Error ? error.message : String(error)}`));
		process.exit(1);
	}
}

// Run CLI
main().catch((error) => {
	console.error(semantic.error(`Fatal error: ${error}`));
	process.exit(1);
});
