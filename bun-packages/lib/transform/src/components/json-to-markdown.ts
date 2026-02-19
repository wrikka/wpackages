import { JsonParser } from "../services/json";
import type { Transformer } from "../types";

/**
 * Transform JSON to Markdown table
 */
export const JsonToMarkdownTransformer: Transformer = {
	from: "json",
	to: "markdown",

	transform: (source: string, _options = {}): string => {
		const data = JsonParser.parse(source);

		if (Array.isArray(data) && data.length > 0) {
			// Convert array of objects to markdown table
			const keys = Object.keys(data[0]);
			let markdown = `| ${keys.join(" | ")} |\n`;
			markdown += `| ${keys.map(() => "---").join(" | ")} |\n`;

			for (const row of data) {
				const values = keys.map((key) => String(row[key] ?? ""));
				markdown += `| ${values.join(" | ")} |\n`;
			}

			return markdown;
		}

		// Convert object to markdown list
		if (typeof data === "object" && data !== null) {
			let markdown = "";
			for (const [key, value] of Object.entries(data)) {
				markdown += `- **${key}**: ${JSON.stringify(value)}\n`;
			}
			return markdown;
		}

		return `\`\`\`json\n${source}\n\`\`\``;
	},
};
