import { writeFile } from "fs/promises";
import { glob } from "glob";
import { basename, join } from "path";

interface Metadata {
	gof_category: string;
	paradigm: string;
	style: string;
	usecase: string;
	suitability: string;
	environment: string;
}

async function generateReadme() {
	const patternFiles = await glob("src/components/**/*.ts", {
		ignore: ["**/*.test.ts", "**/*.usage.ts", "**/index.ts"],
	});

	const metadataList: Array<{ name: string; metadata: Metadata }> = [];

	for (const file of patternFiles) {
		const mod = await import(join(process.cwd(), file));
		if (mod.metadata) {
			metadataList.push({
				name: basename(file, ".ts"),
				metadata: mod.metadata,
			});
		}
	}

	let table = "| Pattern | Category | Paradigm | Style | Environment | Use Case |\n";
	table += "|---|---|---|---|---|---|\n";

	for (const { name, metadata } of metadataList.sort((a, b) => a.name.localeCompare(b.name))) {
		table += `| **${
			name.charAt(0).toUpperCase() + name.slice(1)
		}** | ${metadata.gof_category} | ${metadata.paradigm} | ${metadata.style} | ${metadata.environment} | ${
			metadata.usecase.split(".")[0]
		} |\n`;
	}

	// This is a placeholder for now. In a real scenario, we would read the README.md and replace a specific section.
	await writeFile("README_TABLE.md", table);
	console.log("README table generated successfully.");
}

generateReadme().catch(console.error);
