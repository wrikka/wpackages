import libCoverage from "istanbul-lib-coverage";
import libReport from "istanbul-lib-report";
import reports from "istanbul-reports";
import { existsSync } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import v8toIstanbul from "v8-to-istanbul";

export async function generateCoverageReport(coverageData: any[], cwd: string) {
	console.log("\nGenerating coverage report...");
	const coverageMap = libCoverage.createCoverageMap();

	for (const v8Report of coverageData) {
		const scriptPath = typeof v8Report.url === "string" && v8Report.url.startsWith("file:")
			? fileURLToPath(v8Report.url)
			: path.resolve(String(v8Report.url ?? ""));
		// Ensure the file exists, is within the project, and not in node_modules
		if (existsSync(scriptPath) && scriptPath.includes(cwd) && !scriptPath.includes("node_modules")) {
			try {
				const converter = v8toIstanbul(scriptPath, 0, {
					source: await fs.readFile(scriptPath, "utf-8"),
				});
				await converter.load();
				converter.applyCoverage(v8Report.functions);
				coverageMap.merge(converter.toIstanbul());
			} catch (error) {
				console.error(`Could not process coverage for ${scriptPath}:`, error);
			}
		}
	}

	const context = libReport.createContext({ dir: path.join(cwd, "coverage"), coverageMap });
	reports.create("text", {}).execute(context);
	reports.create("html", {}).execute(context);
	console.log("Coverage report generated in ./coverage");
}
