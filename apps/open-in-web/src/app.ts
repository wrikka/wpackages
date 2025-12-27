import { text } from "@clack/prompts";
import { ERROR_MESSAGES } from "./constant";
import { openHtml } from "./cli/cli/open-html";
import { openMarkdown } from "./cli/cli/open-markdown";
import { openTs } from "./cli/cli/open-ts";

export async function openFile(filepath: string, openOptions: { autoOpen: boolean }) {
	const fileType = filepath.split(".").pop()?.toLowerCase();
	try {
		switch (fileType) {
			case "html":
				await openHtml(filepath, openOptions);
				break;
			case "md":
			case "markdown":
				await openMarkdown(filepath, openOptions);
				break;
			case "ts":
				await openTs(filepath, openOptions);
				break;
			default:
				console.error(ERROR_MESSAGES.unsupportedFileType(filepath, fileType ?? "unknown"));
		}
	} catch (err) {
		console.error(ERROR_MESSAGES.fileOpenError(filepath, err instanceof Error ? err.message : "Unknown error"));
	}
}

export async function main() {
	let filepaths = process.argv.slice(2);
	const openOptions = { autoOpen: true };

	if (filepaths.length === 0) {
		const interactiveFilepath = await text({
			message: "Enter file path (or multiple, space-separated)",
			placeholder: "examples-files/example.html",
			validate: (value) => {
				if (!value) return "File path is required";
			},
		});
		filepaths = typeof interactiveFilepath === "string" ? interactiveFilepath.split(" ") : [];
	} else {
		process.on("beforeExit", () => process.exit(0));
	}

	for (const filepath of filepaths) {
		if (filepath) {
			await openFile(filepath, openOptions);
		}
	}
}
