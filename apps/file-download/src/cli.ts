#!/usr/bin/env bun
import * as p from "@clack/prompts";
import picocolors from "picocolors";
import { downloadFile } from "./services/download-file";
import { downloadGithubFile } from "./services/download-github";
import { downloadJsonFile } from "./services/download-json";
import { downloadRepository } from "./services/download-repo";
import { GithubOptionsSchema, JsonOptionsSchema, UrlOptionsSchema } from "./types";

async function handleFileDownload(
	serviceFn: (url: string, output: string) => Promise<{ success: boolean; error?: string }>,
	schema: any,
	urlMessage: string,
	outputMessage: string,
) {
	const options = await p.group(
		{
			url: () => p.text({ message: urlMessage }),
			output: () => p.text({ message: outputMessage }),
		},
		{
			onCancel: () => {
				p.cancel("Operation cancelled.");
				process.exit(0);
			},
		},
	);

	const parsedOptions = schema.safeParse(options);

	if (!parsedOptions.success) {
		p.cancel("Invalid input. Please check your entries.");
		return;
	}

	const s = p.spinner();
	s.start("Downloading...");

	const result = await serviceFn(parsedOptions.data.url, parsedOptions.data.output);

	if (result.success) {
		s.stop(`File saved as ${parsedOptions.data.output}`);
	} else {
		s.stop("Failed to download.", 500);
		p.note(result.error || "An unknown error occurred.");
	}
}

async function interactiveMode() {
	console.clear();
	p.intro(picocolors.inverse(" file-download "));

	const project = await p.group(
		{
			type: () =>
				p.select({
					message: "What do you want to download?",
					options: [
						{ value: "url", label: "File from URL" },
						{ value: "github", label: "GitHub File" },
						{ value: "json", label: "JSON from API" },
					],
				}),
		},
		{
			onCancel: () => {
				p.cancel("Operation cancelled.");
				process.exit(0);
			},
		},
	);

	switch (project.type) {
		case "url":
			await handleFileDownload(
				downloadFile,
				UrlOptionsSchema,
				"Enter the URL of the file:",
				"Enter the output filename:",
			);
			break;
		case "github":
			await handleFileDownload(
				downloadGithubFile,
				GithubOptionsSchema,
				"Enter the GitHub file URL:",
				"Enter the output filename:",
			);
			break;
		case "json":
			await handleFileDownload(
				downloadJsonFile,
				JsonOptionsSchema,
				"Enter the API URL for the JSON data:",
				"Enter the output filename (e.g., data.json):",
			);
			break;
	}

	p.outro("Download complete!");
}

async function cliMode() {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		await interactiveMode();
		return;
	}

	if (args.includes("--help") || args.includes("-h")) {
		console.log(`
Usage: wdownload <repository-url> [options]

Download GitHub repositories without git history

Arguments:
  repository-url     GitHub repository URL
  
Options:
  -o, --out-dir <dir>   Output directory
  -p, --path <path>     Specific path to download from the repository
  -h, --help           Display help for command

Examples:
  wdownload https://github.com/user/repo
  wdownload https://github.com/user/repo -o my-folder
  wdownload https://github.com/user/repo/tree/main/src -p src
        `);
		process.exit(0);
	}

	const repoUrl = args[0];
	if (!repoUrl) {
		console.error("Error: Repository URL is required");
		process.exit(1);
	}

	const options: { outDir?: string; path?: string } = {};

	for (let i = 1; i < args.length; i++) {
		if ((args[i] === "-o" || args[i] === "--out-dir") && i + 1 < args.length) {
			const outDir = args[i + 1];
			if (outDir) options.outDir = outDir;
			i++;
		} else if ((args[i] === "-p" || args[i] === "--path") && i + 1 < args.length) {
			const path = args[i + 1];
			if (path) options.path = path;
			i++;
		}
	}

	const s = p.spinner();
	s.start(`Downloading ${repoUrl}...`);

	const result = await downloadRepository(repoUrl, options);

	if (result.success) {
		s.stop(`Successfully downloaded to ${result.path}`);
		if (result.specificPath) {
			p.note(`Selected path: ${result.specificPath}`);
		}
	} else {
		s.stop("Failed to download repository.", 500);
		p.note(result.error || "An unknown error occurred.");
	}
}

cliMode().catch(console.error);
