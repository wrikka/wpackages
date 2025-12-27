#!/usr/bin/env node

import pc from "picocolors";
import { ReleaseOrchestrator } from "../release-orchestrator";
import type { ReleaseOptions, ReleaseType } from "../types/index";

const HELP_TEXT = `
${pc.bold(pc.cyan("release"))} - Modern release automation tool

${pc.bold("Usage:")}
  wrelease [type] [options]

${pc.bold("Release Types:")}
  major          Bump major version (1.0.0 → 2.0.0)
  minor          Bump minor version (1.0.0 → 1.1.0)
  patch          Bump patch version (1.0.0 → 1.0.1)
  premajor       Bump major prerelease (1.0.0 → 2.0.0-beta.0)
  preminor       Bump minor prerelease (1.0.0 → 1.1.0-beta.0)
  prepatch       Bump patch prerelease (1.0.0 → 1.0.1-beta.0)
  prerelease     Increment prerelease (1.0.0-beta.0 → 1.0.0-beta.1)

${pc.bold("Options:")}
  --version <version>    Explicit version (e.g., 1.2.3)
  --preid <id>          Prerelease identifier (beta, alpha, rc)
  --dry-run             Simulate release without changes
  --no-git              Skip git operations
  --no-changelog        Skip changelog generation
  --no-publish          Skip npm publish
  --message <msg>       Custom commit message (use {version} placeholder)
  --tag <prefix>        Tag prefix (default: v)
  --ci                  CI mode (non-interactive)
  -v, --verbose         Verbose output
  -s, --silent          Silent mode
  -h, --help            Show this help

${pc.bold("Examples:")}
  wrelease patch
  wrelease minor --dry-run
  wrelease prepatch --preid beta
  wrelease --version 1.2.3 --no-publish
  wrelease major --message "chore: release v{version}"

${pc.bold("Documentation:")}
  https://github.com/wrikka/wts/tree/main/apps/release
`;

interface CliArgs {
	type?: ReleaseType;
	version?: string;
	preid?: string;
	dryRun?: boolean;
	noGit?: boolean;
	noChangelog?: boolean;
	noPublish?: boolean;
	message?: string;
	tag?: string;
	ci?: boolean;
	verbose?: boolean;
	silent?: boolean;
	help?: boolean;
}

function parseArgs(args: string[]): CliArgs {
	const parsed: CliArgs = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		if (arg && (arg === "-h" || arg === "--help")) {
			parsed.help = true;
		} else if (arg === "-v" || arg === "--verbose") {
			parsed.verbose = true;
		} else if (arg === "-s" || arg === "--silent") {
			parsed.silent = true;
		} else if (arg === "--dry-run") {
			parsed.dryRun = true;
		} else if (arg === "--no-git") {
			parsed.noGit = true;
		} else if (arg === "--no-changelog") {
			parsed.noChangelog = true;
		} else if (arg === "--no-publish") {
			parsed.noPublish = true;
		} else if (arg === "--ci") {
			parsed.ci = true;
		} else if (arg === "--version" && args[i + 1]) {
			parsed.version = args[++i] ?? "";
		} else if (arg === "--preid" && args[i + 1]) {
			parsed.preid = args[++i] ?? "";
		} else if (arg === "--message" && args[i + 1]) {
			parsed.message = args[++i] ?? "";
		} else if (arg === "--tag" && args[i + 1]) {
			parsed.tag = args[++i] ?? "";
		} else if (
			arg
			&& !arg.startsWith("-")
			&& !parsed.type
			&& [
				"major",
				"minor",
				"patch",
				"premajor",
				"preminor",
				"prepatch",
				"prerelease",
			].includes(arg)
		) {
			parsed.type = arg as ReleaseType;
		}
	}

	return parsed;
}

async function interactiveMode(): Promise<ReleaseOptions> {
	try {
		// Dynamic import to avoid type errors during build
		// @ts-ignore - tui may not be available at build time
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const tui = await import("tui") as any;
		const { select, confirm, input } = tui;

		const type = await select({
			message: "Select release type:",
			options: [
				{ value: "patch", label: "Patch (1.0.0 → 1.0.1)" },
				{ value: "minor", label: "Minor (1.0.0 → 1.1.0)" },
				{ value: "major", label: "Major (1.0.0 → 2.0.0)" },
				{ value: "prepatch", label: "Prepatch (1.0.0 → 1.0.1-beta.0)" },
				{ value: "preminor", label: "Preminor (1.0.0 → 1.1.0-beta.0)" },
				{ value: "premajor", label: "Premajor (1.0.0 → 2.0.0-beta.0)" },
				{
					value: "prerelease",
					label: "Prerelease (1.0.0-beta.0 → 1.0.0-beta.1)",
				},
			],
		});

		let preid: string | undefined;
		if (type.startsWith("pre")) {
			preid = await input({
				message: "Prerelease identifier:",
				initialValue: "beta",
			});
		}

		const changelog = await confirm({
			message: "Generate changelog?",
			initialValue: true,
		});

		const publish = await confirm({
			message: "Publish to npm?",
			initialValue: true,
		});

		return {
			type: type as ReleaseType,
			preid: preid ?? undefined,
			noChangelog: !changelog,
			noPublish: !publish,
		};
	} catch (error) {
		if (process.env["DEBUG"]) {
			console.error(pc.red("Interactive mode error:"), error);
		}
		console.error(pc.red("Interactive mode failed, falling back to CLI mode"));
		throw new Error(
			"Please specify release type: wrelease [major|minor|patch]",
		);
	}
}

async function main() {
	const args = parseArgs(process.argv.slice(2));

	if (args.help) {
		console.log(HELP_TEXT);
		process.exit(0);
	}

	try {
		let options: ReleaseOptions;

		// Interactive mode if no type specified
		if (!args.type && !args.version && !args.ci) {
			options = await interactiveMode();
			// Merge with CLI args
			Object.assign(options, args);
		} else {
			if (!args.type && !args.version) {
				console.error(
					pc.red("Error: Release type or version must be specified"),
				);
				console.log(HELP_TEXT);
				process.exit(1);
			}
			options = args as ReleaseOptions;
		}

		const orchestrator = new ReleaseOrchestrator();
		const result = await orchestrator.release(options);

		if (result.success) {
			process.exit(0);
		} else {
			process.exit(1);
		}
	} catch (error) {
		if (!args.silent) {
			console.error(
				pc.red("\n❌ Release failed:"),
				error instanceof Error ? error.message : error,
			);
		}
		process.exit(1);
	}
}

main();
