import * as fs from "node:fs/promises";
import type { Generator, Suggestion } from "./schema";

async function getFileSuggestions(
	dir: string,
	wordToComplete: string,
): Promise<Suggestion[]> {
	try {
		const files = await fs.readdir(dir, { withFileTypes: true });
		return files
			.filter((file) => file.name.startsWith(wordToComplete))
			.map((file) => ({
				name: file.isDirectory() ? `${file.name}/` : file.name,
				type: file.isDirectory() ? "folder" : "file",
			}));
	} catch {
		// Ignore errors (e.g., permission denied)
		return [];
	}
}

export async function generateSuggestions(
	generator: Generator,
	wordToComplete: string,
): Promise<Suggestion[]> {
	if (generator.template === "filepaths") {
		return getFileSuggestions(".", wordToComplete);
	}
	// Add more generators here
	return [];
}
