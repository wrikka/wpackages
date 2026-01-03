/**
 * Report exporter
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { TestReport } from "../../types";
import { generateHtmlReport } from "./html";
import { generateJsonReport } from "./json";
import { formatReport } from "./text";

export const exportReport = async (
	report: TestReport,
	format: "json" | "html" | "text" = "json",
	filename: string,
): Promise<void> => {
	let content: string;

	switch (format) {
		case "json":
			content = generateJsonReport(report);
			break;
		case "html":
			content = generateHtmlReport(report);
			break;
		case "text":
			content = formatReport(report);
			break;
	}

	await mkdir(dirname(filename), { recursive: true });
	await writeFile(filename, content, "utf8");
};
