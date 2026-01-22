import { writeFile } from "fs/promises";
import { glob } from "glob";
import { basename, join } from "path";
import { pathToFileURL } from "url";
import type { PatternMetadata } from "../src/types";

async function generateReadme() {
	const patternFiles = await glob(["src/patterns/**/*.ts", "src/paradigms/**/*.ts"], {
		ignore: ["**/*.test.ts", "**/*.usage.ts", "**/index.ts"],
	});

	const metadataList: Array<{
		file: string;
		name: string;
		category: string;
		metadata: PatternMetadata;
	}> = [];

	for (const file of patternFiles) {
		const absPath = join(process.cwd(), file);
		const mod = (await import(pathToFileURL(absPath).toString())) as {
			readonly metadata?: PatternMetadata;
		};
		if (!mod.metadata) {
			continue;
		}

		const normalized = absPath.replaceAll("\\\\", "/");
		const category = normalized.includes("/src/patterns/")
			? normalized.includes("/creational/")
				? "creational"
				: normalized.includes("/structural/")
				? "structural"
				: normalized.includes("/behavioral/")
				? "behavioral"
				: "other"
			: "paradigm";

		metadataList.push({
			file,
			name: mod.metadata.name || basename(file, ".ts"),
			category,
			metadata: mod.metadata,
		});
	}

	let table = "| Pattern | Category | Paradigm | Style | Environment | Use Case |\n";
	table += "|---|---|---|---|---|---|\n";

	for (const item of metadataList.sort((a, b) => a.name.localeCompare(b.name))) {
		const paradigm = item.category === "paradigm" ? "mixed" : "fp";
		const style = item.metadata.tags.includes("stateful") ? "stateful" : "functional";
		const environment = item.metadata.tags.includes("server")
			? "server"
			: item.metadata.tags.includes("client")
			? "client"
			: "both";
		const usecase = item.metadata.description.split(".")[0];

		table += `| **${item.name}** | ${item.category} | ${paradigm} | ${style} | ${environment} | ${usecase} |\n`;
	}

	// This is a placeholder for now. In a real scenario, we would read the README.md and replace a specific section.
	await writeFile("README_TABLE.md", table);
	console.log("README table generated successfully.");
}

generateReadme().catch(console.error);
