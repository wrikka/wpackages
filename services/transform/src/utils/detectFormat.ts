import { patterns } from "@w/design-pattern";
import type { DocumentFormat } from "../types";

/**
 * Detect document format from content or filename
 */
const selectByFilename = patterns.behavioral.conditionalSelector.createSelector<string, DocumentFormat | null>(
    [
        { condition: (f: string) => f.endsWith(".md") || f.endsWith(".markdown"), result: "markdown" },
        { condition: (f: string) => f.endsWith(".ts") || f.endsWith(".tsx") || f.endsWith(".js") || f.endsWith(".jsx"), result: "typescript" },
        { condition: (f: string) => f.endsWith(".toml"), result: "toml" },
        { condition: (f: string) => f.endsWith(".json"), result: "json" },
    ],
    null
);

const selectByContent = patterns.behavioral.conditionalSelector.createSelector<string, DocumentFormat>(
    [
        {
            condition: (c: string) => (c.startsWith("{") && c.endsWith("}")) || (c.startsWith("[") && c.endsWith("]")),
            result: "json"
        },
        {
            condition: (c: string) => (c.includes("[") && c.includes("]")) || /^\w+\s*=/.test(c),
            result: "toml"
        },
        {
            condition: (c: string) => /\b(function|const|let|var|class|interface|type|import|export)\b/.test(c),
            result: "typescript"
        },
    ],
    "markdown" // Default format
);

/**
 * Detect document format from content or filename
 */
export const detectFormat = (
	input: string,
	filename?: string,
): DocumentFormat => {
	if (filename) {
		const fromFilename = selectByFilename(filename);
		if (fromFilename) {
			return fromFilename;
		}
	}

	const trimmed = input.trim();
	return selectByContent(trimmed);
};
