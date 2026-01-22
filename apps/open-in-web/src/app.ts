import { select, text } from "@clack/prompts";
import { Command } from "commander";
import fs from "fs";
import path from "path";
import { openMarkdown } from "./cli/cli/open-markdown";
import { ERROR_MESSAGES } from "./constant";
import { loadConfig } from "./services/config.service";
import { isUrl } from "./services/file.service";

interface CliOptions {
	port: string;
	css?: string;
	theme?: string;
	output?: string;
	toc?: boolean;
	mermaid?: boolean;
	math?: boolean;
	pdf?: string;
	plugins?: string;
}

async function openFile(
	filepath: string,
	options: {
		autoOpen: boolean;
		port: number;
		css?: string;
		theme?: string;
		output?: string;
		toc?: boolean;
		mermaid?: boolean;
		math?: boolean;
		pdf?: string;
		plugins?: string;
	},
) {
	const fileType = path.extname(filepath).slice(1).toLowerCase();
	try {
		switch (fileType) {
			case "md":
			case "markdown":
				await openMarkdown(filepath, options);
				break;
			default:
				console.error(ERROR_MESSAGES.unsupportedFileType(filepath, fileType ?? "unknown"));
				process.exit(1);
		}
	} catch (err) {
		console.error(ERROR_MESSAGES.fileOpenError(filepath, err instanceof Error ? err.message : "Unknown error"));
		process.exit(1);
	}
}

export async function main() {
	const program = new Command();

	program
		.name("open-in-web")
		.description("A tool to open Markdown files in a web browser with live reload.")
		.argument("[path]", "Path to the file or directory to open")
		.option("-p, --port <number>", "Port to run the server on", "3000")
		.option("-c, --css <path>", "Path to a custom CSS file")
		.option("-t, --theme <name>", "Code block theme name", "vitesse-dark")
		.option("-o, --output <path>", "Output path for the HTML file")
		.option("--toc", "Generate a table of contents")
		.option("--mermaid", "Enable Mermaid diagram rendering")
		.option("--math", "Enable MathJax rendering")
		.option("--pdf <path>", "Output path for the PDF file")
		.option("--plugins <names>", "Comma-separated list of markdown-it plugins to use")
		.action(async (filePath: string | undefined, cliOptions: CliOptions) => {
			const fileConfig = await loadConfig() || {};

			const options = {
				...fileConfig,
				...cliOptions,
			};

			const port = parseInt(options.port?.toString() || "3000", 10);
			if (isNaN(port)) {
				console.error("Error: Port must be a number.");
				process.exit(1);
			}

			const openOptions: {
				autoOpen: boolean;
				port: number;
				css?: string;
				theme?: string;
				output?: string;
				toc?: boolean;
				mermaid?: boolean;
				math?: boolean;
				pdf?: string;
				plugins?: string;
			} = {
				autoOpen: true,
				port: port,
			};

			if (options.css) openOptions.css = options.css;
			if (options.theme) openOptions.theme = options.theme;
			if (options.output) openOptions.output = options.output;
			if (options.toc) openOptions.toc = options.toc;
			if (options.mermaid) openOptions.mermaid = options.mermaid;
			if (options.math) openOptions.math = options.math;
			if (options.pdf) openOptions.pdf = options.pdf;
			if (options.plugins) openOptions.plugins = options.plugins;

			let finalPath = filePath;

			if (!finalPath) {
				const interactivePath = await text({
					message: "Enter file or directory path",
					placeholder: ".",
				});
				finalPath = interactivePath as string;
			}

			if (!isUrl(finalPath)) {
				if (!fs.existsSync(finalPath)) {
					console.error(`\n❌ Error: Path not found at ${finalPath}`);
					process.exit(1);
				}

				const stats = fs.statSync(finalPath);

				if (stats.isDirectory()) {
					const files = fs.readdirSync(finalPath).filter(f => f.endsWith(".md") || f.endsWith(".markdown"));
					if (files.length === 0) {
						console.log("\n📂 No markdown files found in this directory.");
						return;
					}
					const selectedFile = await select({
						message: "Select a markdown file to open",
						options: files.map(f => ({ value: path.join(finalPath!, f), label: f })),
					});
					finalPath = selectedFile as string;
				}
			}

			await openFile(finalPath, openOptions);

			// If not exporting, keep the process alive for the server
			if (!options.output && !options.pdf) {
				// Keep the process alive for the server
				await new Promise(() => {});
			} else {
				// Exit after export
				process.exit(0);
			}
		});

	await program.parseAsync(process.argv);
}
