import * as p from "@clack/prompts";
import axios from "axios";
import { writeFile } from "node:fs/promises";
import { JsonOptionsSchema } from "../types";

export async function downloadJson() {
	const options = await p.group(
		{
			url: () => p.text({ message: "Enter the API URL for the JSON data:" }),
			output: () =>
				p.text({ message: "Enter the output filename (e.g., data.json):" }),
		},
		{
			onCancel: () => {
				p.cancel("Operation cancelled.");
				process.exit(0);
			},
		},
	);

	const parsedOptions = JsonOptionsSchema.safeParse(options);

	if (!parsedOptions.success) {
		p.cancel("Invalid input. Please enter a valid URL and filename.");
		return;
	}

	const s = p.spinner();
	s.start("Downloading JSON data...");

	try {
		const response = await axios.get(parsedOptions.data.url, {
			responseType: "json",
		});
		await writeFile(
			parsedOptions.data.output,
			JSON.stringify(response.data, null, 2),
		);
		s.stop(`JSON data saved as ${parsedOptions.data.output}`);
	} catch (error) {
		s.stop("Failed to download JSON data.", 500);
		p.note(
			error instanceof Error ? error.message : "An unknown error occurred.",
		);
	}
}
