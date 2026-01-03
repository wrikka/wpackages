#!/usr/bin/env bun

import * as p from "@clack/prompts";
import cac from "cac";
import chalk from "chalk";
import { exec } from "node:child_process";
import * as shiki from "shiki";
import { analyzeProject } from "./app";
import type { FileInfo } from "./types";
import { version } from "../package.json";

async function runAnalysis(
	dir: string | symbol | undefined,
	options: { json?: boolean } = {},
) {
	if (typeof dir !== "string") {
		console.error("Invalid directory path.");
		process.exit(1);
	}
	try {
		const highlighter = await shiki.createHighlighter({
			themes: ["vitesse-dark"],
			langs: ["typescript"],
		});

		const fileInfos: FileInfo[] = await analyzeProject(dir);

		if (options.json) {
			console.log(JSON.stringify(fileInfos, null, 2));
			return;
		}

		const colorize = (lines: shiki.ThemedToken[][]) =>
			lines
				.map((line) =>
					line
						.map((token) => chalk.hex(token.color ?? "#FFFFFF")(token.content))
						.join(""),
				)
				.join("\n");

		for (const fileInfo of fileInfos) {
			if (fileInfo.variables.length === 0) continue;

			for (const variable of fileInfo.variables) {
				console.log(
					`\n${chalk.gray("📄")} ${chalk.underline(`${fileInfo.path}:${variable.line}`)}\n`,
				);

				const kindAndName = `${chalk.bold(variable.kind)} ${chalk.cyan.bold("➔")} ${chalk.bold(variable.name)}`;
				console.log(kindAndName);
				console.log(chalk.gray("─".repeat(50)));

				const tokens = await highlighter.codeToTokens(variable.code, {
					lang: "typescript",
					theme: "vitesse-dark",
				});
				const highlightedCode = colorize(tokens.tokens);
				console.log(highlightedCode);
			}
		}
	} catch (error) {
		console.error(
			error instanceof Error ? error.message : "An unknown error occurred.",
		);
		process.exit(1);
	}
}

async function main() {
	if (process.argv.length > 2) {
		// Argument Mode
		const cli = cac("check-type");

		cli
			.command(
				"type-safe [dir]",
				"Analyze and display type information for variables.",
			)
			.option("--json", "Output the result as JSON")
			.action((dir, options) => runAnalysis(dir || ".", options));

		cli.command("type-error", "Check for type errors using tsc.").action(() => {
			console.log("Running type check...");
			const child = exec("bun tsc --noEmit --pretty");

			child.stdout?.pipe(process.stdout);
			child.stderr?.pipe(process.stderr);

			child.on("exit", (code) => {
				if (code === 0) {
					console.log("✅ No type errors found.");
				} else {
					console.error(`❌ Type check failed with exit code ${code}`);
				}
				process.exit(code ?? 1);
			});
		});

		cli.help();
		cli.version(version);

		try {
			cli.parse();
		} catch (error) {
			console.error("Error parsing arguments:", error);
			process.exit(1);
		}
	} else {
		// Interactive Mode
		p.intro("check-type: Interactive Mode");
		const dir = await p.text({
			message: "Enter the project directory path to analyze",
			placeholder: "./",
			defaultValue: ".",
		});

		if (p.isCancel(dir)) {
			p.cancel("Operation cancelled.");
			process.exit(0);
		}

		const s = p.spinner();
		s.start("Analyzing project types...");
		await runAnalysis(dir); // Interactive mode doesn't support --json yet
		s.stop("Analysis complete.");

		p.outro("Done!");
	}
}

main().catch((err) => {
	console.error("An unexpected error occurred:", err);
	process.exit(1);
});
