import { TomlParser } from "../services/toml";
import type { Transformer } from "../types";

/**
 * Transform TOML to Markdown
 */
export const TomlToMarkdownTransformer: Transformer = {
	from: "toml",
	to: "markdown",

	transform: (source: string, _options = {}): string => {
		const data = TomlParser.parse(source);
		let markdown = "";

		for (const [key, value] of Object.entries(data)) {
			if (typeof value === "object" && value !== null) {
				markdown += `### ${key}\n\n`;
				for (const [subKey, subValue] of Object.entries(value)) {
					markdown += `- **${subKey}**: ${subValue}\n`;
				}
				markdown += "\n";
			} else {
				markdown += `- **${key}**: ${value}\n`;
			}
		}

		return markdown;
	},
};
