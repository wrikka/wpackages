import type { Transformer } from "../types";

/**
 * Transform TypeScript to Markdown (code block)
 */
export const TypeScriptToMarkdownTransformer: Transformer = {
	from: "typescript",
	to: "markdown",

	transform: (source: string, _options = {}): string => {
		// For now, just wrap the code in a Markdown code block
		return `\`\`\`typescript\n${source}\n\`\`\``;
	},
};
