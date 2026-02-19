import type { DocumentFormat } from "../types";

/**
 * Detect document format from content or filename
 */
const detectByFilename = (filename: string): DocumentFormat | null => {
	if (filename.endsWith(".md") || filename.endsWith(".markdown")) {
		return "markdown";
	}
	if (filename.endsWith(".ts") || filename.endsWith(".tsx") || filename.endsWith(".js") || filename.endsWith(".jsx")) {
		return "typescript";
	}
	if (filename.endsWith(".toml")) {
		return "toml";
	}
	if (filename.endsWith(".json")) {
		return "json";
	}
	return null;
};

const detectByContent = (content: string): DocumentFormat => {
	const trimmed = content.trim();

	// JSON detection with validation
	if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
		try {
			JSON.parse(trimmed);
			return "json";
		} catch {
			// Not valid JSON, continue to other checks
		}
	}

	// TOML detection
	if ((trimmed.includes("[") && trimmed.includes("]")) || /^\w+\s*=/.test(trimmed)) {
		return "toml";
	}

	// TypeScript/JavaScript detection
	if (/\b(function|const|let|var|class|interface|type|import|export)\b/.test(trimmed)) {
		return "typescript";
	}

	return "markdown";
};

/**
 * Detect document format from content or filename
 */
export const detectFormat = (
	input: string,
	filename?: string,
): DocumentFormat => {
	if (filename) {
		const fromFilename = detectByFilename(filename);
		if (fromFilename) {
			return fromFilename;
		}
	}

	const trimmed = input.trim();
	return detectByContent(trimmed);
};
