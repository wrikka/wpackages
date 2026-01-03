import * as p from "@clack/prompts";
import picocolors from "picocolors";
import { downloadFileFromUrl } from "./services/download-file";
import { downloadFromGithub } from "./services/download-github";
import { downloadJson } from "./services/download-json";

async function main() {
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
			await downloadFileFromUrl();
			break;
		case "github":
			await downloadFromGithub();
			break;
		case "json":
			await downloadJson();
			break;
	}

	p.outro("Download complete!");
}

main().catch(console.error);
